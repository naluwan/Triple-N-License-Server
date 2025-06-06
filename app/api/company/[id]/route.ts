import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import mongoose from 'mongoose';
import Company, { FingerprintType, UpdateCompanyType } from '@/models/Company';

type UpdateFingerprint = Omit<FingerprintType, 'registeredAt'>;
import { authenticateToken } from '@/lib/authMiddleware';
import { z } from 'zod';

const fingerprintSchema = z.object({
  value: z.string().min(1),
  licenseType: z.enum(['subscription', 'lifetime']).optional(),
  expiryDate: z.string().optional().nullable(),
  status: z.enum(['active', 'revoked']).optional(),
});

const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    companyId: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    deployKey: z.string().min(1).optional(),
    fingerprints: z.array(fingerprintSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '缺少更新資料',
  });

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    await connect();

    const authHeader = req.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return NextResponse.json({ status: 401, message: '請先登入' });

    const user = await authenticateToken(token);
    if (!user) return NextResponse.json({ status: 403, message: 'Token已過期' });

    const company = await Company.findById(params.id);
    if (!company) {
      return NextResponse.json({ status: 404, message: '公司不存在' });
    }

    return NextResponse.json({ status: 200, company });
  } catch (error) {
    console.error('[GET COMPANY]', error);
    return NextResponse.json(
      { status: 500, message: '伺服器發生錯誤，請稍後再試' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    await connect();

    const authHeader = req.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return NextResponse.json({ status: 401, message: '請先登入' });

    const user = await authenticateToken(token);
    if (!user) return NextResponse.json({ status: 403, message: 'Token已過期' });

    const body = await req.json();
    const parseResult = updateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ status: 400, message: parseResult.error.message });
    }

    const { name, companyId, email, phone, address, deployKey, fingerprints } =
      parseResult.data;

    const updateData: Partial<Omit<UpdateCompanyType, 'fingerprints'>> & {
      fingerprints?: UpdateFingerprint[];
    } = {};
    if (name) updateData.name = name;
    if (companyId) updateData.companyId = companyId;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (deployKey) updateData.deployKey = deployKey;

    if (Array.isArray(fingerprints)) {
      for (const fp of fingerprints) {
        if (!fp.value) {
          return NextResponse.json({
            status: 400,
            message: '每個設備都需包含「設備ID」',
          });
        }
        if (fp.licenseType === 'subscription' && !fp.expiryDate) {
          return NextResponse.json({
            status: 400,
            message: '訂閱制需設定「到期日期」',
          });
        }
      }
      updateData.fingerprints = fingerprints.map((fp) => ({
        value: fp.value,
        licenseType: fp.licenseType || 'lifetime',
        expiryDate: fp.expiryDate || null,
        status: fp.status || 'active',
      }));
    }

    updateData.updatedAt = new Date();
    updateData.updatedBy = new mongoose.Types.ObjectId(
      user._id,
    );

    const updatedCompany = await Company.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    if (!updatedCompany) {
      return NextResponse.json({ status: 404, message: '公司不存在' });
    }

    return NextResponse.json({
      status: 200,
      message: '公司資料已更新',
      company: updatedCompany,
    });
  } catch (error) {
    console.error('[UPDATE COMPANY]', error);
    return NextResponse.json(
      { status: 500, message: '伺服器發生錯誤，請稍後再試' },
      { status: 500 },
    );
  }
}
