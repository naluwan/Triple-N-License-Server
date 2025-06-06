import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { CompanyType, FingerprintType } from '@/models/Company';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connect();

    const { companyId, deployKey, fingerprint } = await req.json();

    if (!companyId || !deployKey || !fingerprint) {
      return NextResponse.json({ status: 400, message: '缺少必要參數' });
    }

    const Company = mongoose.model<CompanyType>('Company');

    const company = await Company.findOne({ companyId, deployKey });

    if (!company || !company.active) {
      return NextResponse.json({ status: 403, message: '公司不存在或已停用' });
    }

    const target = company.fingerprints.find(
      (fp: FingerprintType) => fp.value === fingerprint,
    );

    if (!target) {
      return NextResponse.json({ status: 404, message: '該設備未註冊' });
    }

    if (target.status === 'revoked') {
      return NextResponse.json({ status: 403, message: '設備已被註銷' });
    }

    if (target.licenseType === 'subscription') {
      if (!target.expiryDate) {
        return NextResponse.json({ status: 403, message: '訂閱已過期' });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(target.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      if (expiry < today) {
        return NextResponse.json({ status: 403, message: '訂閱已過期' });
      }
    }

    return NextResponse.json({ status: 200, message: '授權成功' });
  } catch (err) {
    console.error('[VERIFY LICENSE]', err);
    return new NextResponse('內部發生錯誤', { status: 500 });
  }
}
