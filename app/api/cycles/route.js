// File: app/api/cycles/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const cycles = await prisma.cycle.findMany({
      include: { technician: true },
      orderBy: { createdAt: 'desc' },
    });

    let stats = {};
    if (session.user.role === 'APPROVER') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pendingCycles = await prisma.cycle.count({
        where: { status: 'SUBMITTED' },
      });
      const recentlyApproved = await prisma.cycle.count({
        where: { status: 'APPROVED', approvedAt: { gte: today } },
      });

      const timeLogsToday = await prisma.timeLog.findMany({
        where: { clockIn: { gte: today }, status: 'CLOCKED_OUT' },
      });

      const totalHours = timeLogsToday.reduce((acc, log) => {
        const duration = new Date(log.clockOut) - new Date(log.clockIn);
        return acc + duration / (1000 * 60 * 60);
      }, 0);

      stats = {
        pendingCycles,
        recentlyApproved,
        totalHoursToday: totalHours.toFixed(1),
      };
    }

    return NextResponse.json({ cycles, stats });
  } catch (error) {
    console.error('GET /api/cycles Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cycles' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getSession();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: 'Not authenticated or user ID is missing' },
      { status: 401 }
    );
  }

  try {
    const newCycle = await prisma.cycle.create({
      data: {
        technicianId: session.user.id,
        status: 'DRAFT',
        // --- CORRECTED LOGIC: Create 7 entries ---
        entries: {
          create: Array.from({ length: 7 }, (_, i) => ({ entryNumber: i + 1 })),
        },
      },
      include: { technician: true },
    });
    return NextResponse.json(newCycle);
  } catch (error) {
    console.error('POST /api/cycles Error:', error);
    return NextResponse.json(
      { error: 'Failed to create cycle' },
      { status: 500 }
    );
  }
}
