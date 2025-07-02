import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    // --- ADDED CHECK ---
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      // Return a specific error message if user exists
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      ); // 409 Conflict
    }
    // --- END ADDED CHECK ---

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
      },
    });

    // Don't send back the hashed password
    const { hashedPassword: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return NextResponse.json(
      { error: 'An internal error occurred' },
      { status: 500 }
    );
  }
}
