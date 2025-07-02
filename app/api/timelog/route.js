// File: app/api/timelog/route.js

import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

import prisma from '@/lib/prisma';

async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * @description Handles GET request to fetch time log data based on user role.
 * - Approvers get all logs.
 * - Technicians get their own latest log.
 */
export async function GET(request) {
  const session = await getSession();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    if (session.user.role === 'APPROVER') {
      // Approvers get all time logs from all technicians
      const allLogs = await prisma.timeLog.findMany({
        include: {
          technician: {
            select: { name: true }, // Only select the name to avoid sending sensitive user data
          },
        },
        orderBy: { clockIn: 'desc' },
      });
      return NextResponse.json(allLogs);
    } else {
      // Technicians get only their own latest log
      const latestLog = await prisma.timeLog.findFirst({
        where: { technicianId: session.user.id },
        orderBy: { clockIn: 'desc' },
      });
      return NextResponse.json(latestLog);
    }
  } catch (error) {
    console.error('GET /api/timelog Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time log' },
      { status: 500 }
    );
  }
}

/**
 * @description Handles POST request to clock a user IN.
 */
export async function POST(request) {
  const session = await getSession();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const existingLog = await prisma.timeLog.findFirst({
      where: {
        technicianId: session.user.id,
        status: 'CLOCKED_IN',
      },
    });

    if (existingLog) {
      return NextResponse.json(
        { error: 'User is already clocked in.' },
        { status: 409 }
      );
    }

    const newLog = await prisma.timeLog.create({
      data: {
        technicianId: session.user.id,
        status: 'CLOCKED_IN',
        clockIn: new Date(),
      },
    });
    return NextResponse.json(newLog);
  } catch (error) {
    console.error('POST /api/timelog Error:', error);
    return NextResponse.json({ error: 'Failed to clock in' }, { status: 500 });
  }
}

/**
 * @description Handles PUT request to clock a user OUT.
 */
export async function PUT(request) {
  const session = await getSession();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const logToClockOut = await prisma.timeLog.findFirst({
      where: {
        technicianId: session.user.id,
        status: 'CLOCKED_IN',
      },
      orderBy: { clockIn: 'desc' },
    });

    if (!logToClockOut) {
      return NextResponse.json(
        { error: 'No active clock-in session found to clock out.' },
        { status: 404 }
      );
    }

    const updatedLog = await prisma.timeLog.update({
      where: { id: logToClockOut.id },
      data: {
        status: 'CLOCKED_OUT',
        clockOut: new Date(),
      },
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('PUT /api/timelog Error:', error);
    return NextResponse.json({ error: 'Failed to clock out' }, { status: 500 });
  }
}
