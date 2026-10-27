import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, 'Mã nhân viên là bắt buộc.'],
      trim: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc.'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ.'],
    },
  },
  { timestamps: true },
);

export default mongoose.model('Employee', employeeSchema);