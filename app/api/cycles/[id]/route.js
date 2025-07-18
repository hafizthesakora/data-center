// File: app/api/cycles/[id]/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// --- HELPER FUNCTION TO GET THE SESSION ---
async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * @description Handles GET requests to fetch a SINGLE cycle by its ID.
 */
export async function GET(request, context) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'Cycle ID is required' },
      { status: 400 }
    );
  }

  try {
    const cycle = await prisma.cycle.findUnique({
      where: { id },
      include: {
        entries: true,
        technician: true,
      },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }

    return NextResponse.json(cycle);
  } catch (error) {
    console.error(`GET /api/cycles/${id} Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch cycle details' },
      { status: 500 }
    );
  }
}

/**
 * @description Handles PUT requests to UPDATE a single cycle's status.
 */
export async function PUT(request, context) {
  const { id } = context.params;
  const body = await request.json();
  const { status, rejectionComment } = body;

  let updateData = { status };

  if (status === 'SUBMITTED') {
    updateData.submittedAt = new Date();
    updateData.rejectionComment = null;
  } else if (status === 'APPROVED') {
    updateData.approvedAt = new Date();
  } else if (status === 'REJECTED') {
    updateData.rejectionComment = rejectionComment;
  }

  try {
    const updatedCycle = await prisma.cycle.update({
      where: { id },
      data: updateData,
      include: { entries: true, technician: true },
    });
    return NextResponse.json(updatedCycle);
  } catch (error) {
    console.error(`PUT /api/cycles/${id} Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update cycle' },
      { status: 500 }
    );
  }
}

/**
 * @description Handles DELETE requests to remove a cycle and its entries.
 * Restricted to Approvers only.
 */
export async function DELETE(request, context) {
  // This call will now work correctly
  const session = await getSession();
  if (session?.user?.role !== 'APPROVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'Cycle ID is required' },
      { status: 400 }
    );
  }

  try {
    // Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      // First, delete all entries associated with the cycle
      prisma.entry.deleteMany({
        where: { cycleId: id },
      }),
      // Then, delete the cycle itself
      prisma.cycle.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      message: 'Cycle and associated entries deleted successfully',
    });
  } catch (error) {
    console.error(`DELETE /api/cycles/${id} Error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete cycle' },
      { status: 500 }
    );
  }
}
