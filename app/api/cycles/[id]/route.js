// File: app/api/cycles/[id]/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @description Handles GET requests to fetch a SINGLE cycle by its ID.
 * This is the route that populates the Cycle Detail page.
 */
export async function GET(request) {
  // --- NEW, MORE ROBUST FIX ---
  // Manually parsing the ID from the request URL to bypass the params issue.
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1]; // The ID is the last part of the path

  if (!id) {
    return NextResponse.json(
      { error: 'Cycle ID could not be determined from URL' },
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
    // It's helpful to log the specific ID that caused the error
    console.error(`GET /api/cycles/${id} Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch cycle details' },
      { status: 500 }
    );
  }
}

/**
 * @description Handles PUT requests to UPDATE a single cycle (e.g., change its status).
 */
export async function PUT(request) {
  // --- APPLYING THE SAME ROBUST FIX ---
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];

  const body = await request.json();
  const { status } = body;

  let updateData = { status };
  if (status === 'SUBMITTED') {
    updateData.submittedAt = new Date();
  } else if (status === 'APPROVED') {
    updateData.approvedAt = new Date();
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
