import mongoose, { Document } from 'mongoose';

export interface EmployeeType extends Document {
  _id: string;
  name: string;
  id: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  isLock: boolean;
  dateEmployed: Date;
  updatedAt: Date;
  updatedBy: { _id: mongoose.Schema.Types.ObjectId; name: string };
}

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  isLock: { type: Boolean, default: false },
  dateEmployed: { type: Date, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
});

EmployeeSchema.set('timestamps', true);

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
