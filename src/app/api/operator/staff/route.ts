import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Seed list of default counters if not present
const DEFAULT_COUNTERS_SEED = [
  { name: 'Sayedabad Central Terminal', nameBn: 'সায়েদাবাদ কেন্দ্রীয় টার্মিনাল', code: 'SYD-01', city: 'Dhaka', location: 'Sayedabad Intercity Terminal, Dhaka', phone: '01710-123456' },
  { name: 'Gabtoli Central Counter', nameBn: 'গাবতলী ইন্টারসিটি কাউন্টার', code: 'GBT-01', city: 'Dhaka', location: 'Gate No. 2, Gabtoli Terminal, Mirpur, Dhaka', phone: '01710-123457' },
  { name: 'Arambagh VIP Counter', nameBn: 'আরামবাগ ভিআইপি কাউন্টার', code: 'ARM-01', city: 'Dhaka', location: 'Arambagh Bus Stand, Motijheel, Dhaka', phone: '01710-123450' },
  { name: 'Dampara Main Counter', nameBn: 'চট্টগ্রাম দামপাড়া প্রধান কাউন্টার', code: 'DMP-01', city: 'Chattogram', location: 'WASA Mor, Dampara, Chattogram', phone: '01710-123458' },
  { name: 'Kolatoli Beach Counter', nameBn: 'কক্সবাজার কলাতলী বিচ কাউন্টার', code: 'COX-01', city: "Cox's Bazar", location: 'Kolatoli Circle, Hotel-Motel Zone, Cox’s Bazar', phone: '01710-123459' },
  { name: 'Kadamtali Central Counter', nameBn: 'সিলেট কদমতলী কেন্দ্রীয় কাউন্টার', code: 'SYL-01', city: 'Sylhet', location: 'Kadamtali Bus Terminal, South Surma, Sylhet', phone: '01710-123460' },
  { name: 'Shiroil Bus Terminal Counter', nameBn: 'রাজশাহী শিরোইল টার্মিনাল কাউন্টার', code: 'RAJ-01', city: 'Rajshahi', location: 'Shiroil Bus Terminal, Rajshahi', phone: '01710-123461' },
  { name: 'Sonadanga Central Counter', nameBn: 'খুলনা সোনাডাঙ্গা কেন্দ্রীয় কাউন্টার', code: 'KHU-01', city: 'Khulna', location: 'Sonadanga Bus Terminal, Khulna', phone: '01710-123462' },
  { name: 'Nathullabad Terminal Counter', nameBn: 'বরিশাল নথুল্লাবাদ টার্মিনাল কাউন্টার', code: 'BAR-01', city: 'Barishal', location: 'Nathullabad Central Bus Terminal, Barishal', phone: '01710-123463' },
  { name: 'Kamarpara Coach Stand', nameBn: 'রংপুর কামারপাড়া কোচ কাউন্টার', code: 'RAN-01', city: 'Rangpur', location: 'Kamarpara Dhaka Stand, Rangpur', phone: '01710-123464' },
  { name: 'Charmatha Terminal Counter', nameBn: 'বগুড়া চারমাথা টার্মিনাল কাউন্টার', code: 'BOG-01', city: 'Bogura', location: 'Charmatha Central Bus Terminal, Bogura', phone: '01710-123465' },
  { name: 'Bandarban Sadar Counter', nameBn: 'বান্দরবান প্রধান বাস কাউন্টার', code: 'BAN-01', city: 'Bandarban', location: 'Main Bus Terminal, Bandarban Sadar', phone: '01710-123466' },
];

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const defaultTenant = await prisma.tenant.findFirst({ where: { code: 'BHABACHYAKA' } });
    const tenantId = session?.tenantId || defaultTenant?.id;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Auto-ensure default counters exist if database has few
    const existingCountersCount = await prisma.counter.count({ where: { tenantId } });
    if (existingCountersCount < 6) {
      for (const dc of DEFAULT_COUNTERS_SEED) {
        const found = await prisma.counter.findFirst({ where: { tenantId, code: dc.code } });
        if (!found) {
          await prisma.counter.create({
            data: {
              tenantId,
              name: dc.name,
              nameBn: dc.nameBn,
              code: dc.code,
              city: dc.city,
              location: dc.location,
              phone: dc.phone,
              isActive: true,
            },
          });
        }
      }
    }

    // 1. Fetch all assigned staff / counter agents
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ['COUNTER_AGENT', 'COUNTER_MANAGER', 'TRANSPORT_MANAGER', 'BOARDING_STAFF', 'OPERATOR_OWNER'] },
      },
      include: {
        counterAssignments: {
          include: { counter: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch all registered users (who can be chosen to become counter agents)
    const registeredUsers = await prisma.user.findMany({
      where: {
        role: { in: ['CUSTOMER', 'COUNTER_AGENT', 'COUNTER_MANAGER', 'BOARDING_STAFF'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        counterAssignments: {
          include: { counter: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Fetch all active counters
    const counters = await prisma.counter.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      staff: staffUsers,
      registeredUsers,
      counters,
    });
  } catch (error) {
    console.error('Staff list error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff & registered users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const defaultTenant = await prisma.tenant.findFirst({ where: { code: 'BHABACHYAKA' } });
    const tenantId = session?.tenantId || defaultTenant?.id;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action = 'CREATE_NEW', userId, counterId, role = 'COUNTER_AGENT' } = body;

    // --------------------------------------------------------------------
    // OPTION A: ASSIGN AN EXISTING REGISTERED USER AS COUNTER AGENT
    // --------------------------------------------------------------------
    if (action === 'ASSIGN_REGISTERED') {
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return NextResponse.json({ error: 'Registered user not found' }, { status: 404 });
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        // 1. Upgrade role to COUNTER_AGENT (or selected role)
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            role,
            tenantId,
            isActive: true,
          },
        });

        // 2. Clear old assignments and set new counter assignment
        await tx.staffAssignment.deleteMany({
          where: { userId },
        });

        if (counterId) {
          await tx.staffAssignment.create({
            data: {
              userId,
              counterId,
              role,
              isActive: true,
            },
          });
        }

        return user;
      });

      return NextResponse.json({
        success: true,
        message: 'User assigned as counter agent successfully',
        user: updatedUser,
      });
    }

    // --------------------------------------------------------------------
    // OPTION B: CREATE A BRAND NEW COUNTER AGENT ACCOUNT
    // --------------------------------------------------------------------
    const { name, email, phone, password = 'password123' } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      // If user exists, upgrade them!
      const upgradedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: existing.id },
          data: {
            role,
            tenantId,
            isActive: true,
            phone: phone || existing.phone,
          },
        });

        await tx.staffAssignment.deleteMany({
          where: { userId: existing.id },
        });

        if (counterId) {
          await tx.staffAssignment.create({
            data: {
              userId: existing.id,
              counterId,
              role,
              isActive: true,
            },
          });
        }

        return user;
      });

      return NextResponse.json({
        success: true,
        message: 'Existing user upgraded to counter agent',
        user: upgradedUser,
      });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId,
          name,
          email: cleanEmail,
          phone,
          role,
          passwordHash,
          isActive: true,
        },
      });

      if (counterId) {
        await tx.staffAssignment.create({
          data: {
            userId: user.id,
            counterId,
            role,
            isActive: true,
          },
        });
      }

      return user;
    });

    return NextResponse.json({ success: true, message: 'New counter agent created successfully', user: newUser });
  } catch (error) {
    console.error('Add/Assign staff error:', error);
    return NextResponse.json({ error: 'Failed to process counter agent request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, counterId, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Toggle active status
    if (action === 'TOGGLE_STATUS') {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !!isActive },
      });
      return NextResponse.json({ success: true, user });
    }

    // Change counter assignment
    if (action === 'CHANGE_COUNTER') {
      await prisma.staffAssignment.deleteMany({
        where: { userId },
      });

      if (counterId) {
        await prisma.staffAssignment.create({
          data: {
            userId,
            counterId,
            role: 'COUNTER_AGENT',
            isActive: true,
          },
        });
      }

      return NextResponse.json({ success: true, message: 'Counter assignment updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update agent error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Demote user back to CUSTOMER and delete their staff assignments
    await prisma.$transaction(async (tx) => {
      await tx.staffAssignment.deleteMany({
        where: { userId },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          role: 'CUSTOMER',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Counter agent role revoked, user reverted to Customer status',
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    return NextResponse.json({ error: 'Failed to revoke agent role' }, { status: 500 });
  }
}
