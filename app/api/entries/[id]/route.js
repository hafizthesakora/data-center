// File: app/api/entries/[id]/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @description Handles GET requests to fetch a SINGLE entry by its ID.
 */
export async function GET(request) {
  // --- ROBUST FIX: Manually parsing the ID from the request URL ---
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];

  if (!id) {
    return NextResponse.json(
      { error: 'Entry ID could not be determined from URL' },
      { status: 400 }
    );
  }

  try {
    const entry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error(`GET /api/entries/${id} Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch entry details' },
      { status: 500 }
    );
  }
}

/**
 * @description Handles PUT requests to UPDATE a single entry with form data.
 */
export async function PUT(request) {
  // --- Applying the same robust fix here ---
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];

  if (!id) {
    return NextResponse.json(
      { error: 'Entry ID could not be determined from URL' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'Form data is missing' },
        { status: 400 }
      );
    }

    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: {
        data, // The entire object of 16 forms
        isCompleted: true,
      },
    });
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error(`PUT /api/entries/${id} Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}
