import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Company, { FingerprintType } from '@/models/Company';

interface CreateCompanyPayload {
  name: string;
  companyId: string;
  email: string;
  phone: string;
  address: string;
  deployKey: string;
  fingerprints: FingerprintType[];
}

import { authenticateToken } from '@/lib/authMiddleware';
import Employee from '@/models/Employee';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await connect();

    const authHeader = req.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return NextResponse.json({ status: 401, message: '請先登入' });

    const user = await authenticateToken(token);
    if (!user) return NextResponse.json({ status: 403, message: 'Token已過期' });

    const { name, companyId, email, phone, address, deployKey, fingerprints } =
      (await req.json()) as CreateCompanyPayload;

    // 驗證必填欄位
    if (
      !name ||
      !companyId ||
      !email ||
      !phone ||
      !address ||
      !deployKey ||
      !Array.isArray(fingerprints) ||
      fingerprints.length === 0
    ) {
      return NextResponse.json({ status: 400, message: '所有欄位皆為必填，請完整填寫' });
    }

    // 驗證 fingerprints 結構
    for (const fp of fingerprints) {
      if (!fp.value || !fp.licenseType) {
        return NextResponse.json({
          status: 400,
          message: '每個設備都需包含「設備ID」與「授權類型」',
        });
      }
      if (fp.licenseType === 'subscription' && !fp.expiryDate) {
        return NextResponse.json({
          status: 400,
          message: '訂閱制需設定「到期日期」',
        });
      }
    }

    const existingCompany = await Company.findOne({ companyId });
    if (existingCompany) {
      return NextResponse.json({ status: 400, message: '公司已存在' });
    }

    const processedFingerprints = fingerprints.map((fp) => ({
      value: fp.value,
      licenseType: fp.licenseType,
      expiryDate: fp.expiryDate || null,
      status: 'active',
    }));

    const newCompany = new Company({
      name,
      companyId,
      email,
      phone,
      address,
      deployKey,
      fingerprints: processedFingerprints,
      createdBy: user._id,
      createdAt: new Date(),
    });

    await newCompany.save();

    return NextResponse.json({ status: 200, message: '公司授權成功' });
  } catch (error) {
    console.error('[CREATE COMPANY]', error);
    return new NextResponse('內部發生錯誤', { status: 500 });
  }
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    await connect();

    const authHeader = req.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return NextResponse.json({ status: 401, message: '請先登入' });

    const user = await authenticateToken(token);
    if (!user) return NextResponse.json({ status: 403, message: 'Token已過期' });

    const companies = await Company.find()
      .populate({ path: 'updatedBy', select: 'name', model: Employee })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      status: 200,
      companies,
    });
  } catch (error) {
    console.error('[GET COMPANY]', error);
    return NextResponse.json(
      {
        status: 500,
        message: '伺服器發生錯誤，請稍後再試',
      },
      { status: 500 },
    );
  }
}
