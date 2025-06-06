import mongoose, { Document } from 'mongoose';

// 個別設備授權資訊
export interface FingerprintType {
  value: string;
  registeredAt: string;
  expiryDate: string | null;
  licenseType: 'subscription' | 'lifetime';
  status: 'active' | 'revoked';
  revokedReason?: string;
}

// 公司資訊
export interface CompanyType extends Document {
  _id: string;
  name: string;
  companyId: string;
  email: string;
  phone: string;
  address: string;
  deployKey: string;
  active: boolean;
  fingerprints: FingerprintType[];
  updatedAt: Date;
  updatedBy: { _id: mongoose.Schema.Types.ObjectId; name: string };
}

// 用來寫入資料時的公司類型
export interface UpdateCompanyType {
  name: string;
  companyId: string;
  email: string;
  phone: string;
  address: string;
  deployKey: string;
  active: boolean;
  fingerprints: FingerprintType[];
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId;
}

// 單一 fingerprint schema
const FingerprintSchema = new mongoose.Schema<FingerprintType>({
  value: { type: String, required: true },
  registeredAt: { type: String, default: () => new Date().toLocaleDateString() },
  expiryDate: { type: String, default: null },
  licenseType: {
    type: String,
    enum: ['subscription', 'lifetime'],
    required: true,
    default: 'lifetime',
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active',
  },
  revokedReason: { type: String, default: '' },
});

// 公司 schema
const CompanySchema = new mongoose.Schema<CompanyType>(
  {
    name: { type: String, required: true },
    companyId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    deployKey: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    active: { type: Boolean, default: true },
    fingerprints: { type: [FingerprintSchema], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true },
);

export default mongoose.models.Company ||
  mongoose.model<CompanyType>('Company', CompanySchema);
