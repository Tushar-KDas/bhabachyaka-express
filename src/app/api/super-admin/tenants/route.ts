import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, nameBn, code, contactEmail, contactPhone, domain, planCode = 'GROWTH', adminName, adminPassword } = await request.json();

    if (!name || !code || !contactEmail) {
      return NextResponse.json({ error: 'Name, code, and contact email are required' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.tenant.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: 'An operator with this code already exists' }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { code: planCode } });
    if (!plan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
    }

    const newTenant = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name,
          nameBn: nameBn || name,
          code: cleanCode,
          domain: domain || `${cleanCode.toLowerCase()}.com`,
          contactEmail,
          contactPhone,
          status: 'ACTIVE',
        },
      });

      // 2. Assign Subscription
      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });

      // 3. Create Initial Company Admin User
      const passwordHash = await hashPassword(adminPassword || 'password123');
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: adminName || `${name} Admin`,
          email: contactEmail.toLowerCase().trim(),
          phone: contactPhone,
          passwordHash,
          role: 'OPERATOR_OWNER',
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          action: 'ONBOARD_BUS_COMPANY',
          entityType: 'TENANT',
          entityId: tenant.id,
          details: JSON.stringify({ code: cleanCode, plan: plan.code }),
        },
      });

      return tenant;
    });

    return NextResponse.json({ success: true, tenant: newTenant });
  } catch (error) {
    console.error('Onboard tenant error:', error);
    return NextResponse.json({ error: 'Failed to onboard bus company' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { tenantId, status } = await request.json();

    if (!tenantId || !status) {
      return NextResponse.json({ error: 'Tenant ID and status are required' }, { status: 400 });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'UPDATE_TENANT_STATUS',
        entityType: 'TENANT',
        entityId: tenantId,
        details: JSON.stringify({ newStatus: status }),
      },
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (error) {
    console.error('Update tenant error:', error);
    return NextResponse.json({ error: 'Failed to update tenant status' }, { status: 500 });
  }
}
