import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '@/lib/authMiddleware';

connect();

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await connect();

    const authHeader = req.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return NextResponse.json({ status: 401, message: '請先登入' });

    const user = await authenticateToken(token);
    if (!user) return NextResponse.json({ status: 403, message: 'Token已過期' });

    const formData = await req.formData();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const id = formData.get('id') as string;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !id 
    ) {
      return NextResponse.json({ status: 400, message: '所有欄位都是必填的' });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return NextResponse.json({ status: 400, message: '信箱已存在' });
    }

    const hashedPassword = await bcrypt.hash('tripleN1234', 10);

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      id,
      isLock: false,
      updatedBy: user._id,
    });

    await newEmployee.save();

    return NextResponse.json({ message: '員工創建成功', status: 201 });
  } catch (error) {
    console.error('[REGISTER EMPLOYEE]', error);
    return new NextResponse('內部發生錯誤', { status: 500 });
  }
}
