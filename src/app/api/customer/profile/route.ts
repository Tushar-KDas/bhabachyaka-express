import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ authenticated: false, profile: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ authenticated: true, profile: user });
  } catch (error) {
    console.error('Customer profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const data = await request.json();
    const { name, phone } = data;

    if (session?.id) {
      const updateData: any = {};
      if (name) updateData.name = name.trim();
      if (phone) updateData.phone = phone.trim();

      const updatedUser = await prisma.user.update({
        where: { id: session.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      });

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // Demo/guest mode fallback
    return NextResponse.json({
      success: true,
      user: {
        name: name || 'Md. Al Amin',
        phone: phone || '01799887766',
        email: 'customer@bhabachyaka.com',
      },
    });
  } catch (error) {
    console.error('Customer profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
