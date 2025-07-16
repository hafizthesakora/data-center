// File: app/api/holidays/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getSession() {
  return await getServerSession(authOptions);
}

// GET all holidays
export async function GET() {
  try {
    const holidays = await prisma.holiday.findMany();
    return NextResponse.json(holidays);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch holidays' },
      { status: 500 }
    );
  }
}

// POST a new holiday
export async function POST(request) {
  const session = await getSession();
  if (session?.user?.role !== 'APPROVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { date } = await request.json();
    const newHoliday = await prisma.holiday.create({
      data: { date: new Date(date) },
    });
    return NextResponse.json(newHoliday);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add holiday' },
      { status: 500 }
    );
  }
}

// DELETE a holiday
export async function DELETE(request) {
  const session = await getSession();
  if (session?.user?.role !== 'APPROVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { date } = await request.json();
    await prisma.holiday.delete({
      where: { date: new Date(date) },
    });
    return NextResponse.json({ message: 'Holiday removed' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove holiday' },
      { status: 500 }
    );
  }
}
