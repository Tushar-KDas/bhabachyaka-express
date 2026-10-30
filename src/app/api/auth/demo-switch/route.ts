import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    const roleEmailMap: Record<string, string> = {
      SUPER_ADMIN: 'superadmin@bhabachyaka.com',
      OPERATOR_OWNER: 'owner@bhabachyaka.com',
      TRANSPORT_MANAGER: 'manager@bhabachyaka.com',
      COUNTER_AGENT: 'counter@bhabachyaka.com',
      BOARDING_STAFF: 'boarding@bhabachyaka.com',
      ACCOUNTANT: 'accountant@bhabachyaka.com',
      CUSTOMER: 'customer@bhabachyaka.com',
    };

    const targetEmail = roleEmailMap[role] || 'customer@bhabachyaka.com';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return NextResponse.json({ error: `User with role ${role} not found` }, { status: 404 });
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      phone: user.phone,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    });

    response.cookies.set('be_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Demo switch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
