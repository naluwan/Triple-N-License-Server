import jwt from 'jsonwebtoken';
import Employee, { EmployeeType } from '@/models/Employee';
import connect from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const authenticateToken = async (token: string): Promise<EmployeeType | null> => {
  try {
    await connect();
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = (await Employee.findById(decoded.id).select(
      '-password',
    )) as EmployeeType | null;
    return user; // 找到員工資訊就回傳
  } catch (err) {
    console.error('Token verification failed:', err);
    return null; // 驗證失敗返回null
  }
};
