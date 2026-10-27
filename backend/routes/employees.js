import express from 'express';
import mongoose from 'mongoose';
import Employee from '../models/Employee.js';

const router = express.Router();

const asyncHandler = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

const employeeQuery = (id) => {
  const filters = [{ employeeCode: id }];
  if (mongoose.isValidObjectId(id)) filters.unshift({ _id: id });
  return { $or: filters };
};

const requiredEmployeeFields = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  const employee = {
    employeeCode: body.employeeCode,
    fullName: body.fullName,
    email: body.email,
  };
  return Object.values(employee).every((value) => typeof value === 'string' && value.trim());
};

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const searchValue = request.query.search;
    if (searchValue !== undefined && typeof searchValue !== 'string') {
      return response.status(400).json({ error: 'Tham số search phải là chuỗi.' });
    }
    const search = searchValue?.trim();
    const escapedSearch = search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = search
      ? {
          $or: [
            { employeeCode: { $regex: escapedSearch, $options: 'i' } },
            { fullName: { $regex: escapedSearch, $options: 'i' } },
          ],
        }
      : {};
    const employees = await Employee.find(filter).sort({ employeeCode: 1 });
    response.json({ data: employees });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (request, response) => {
    const employee = await Employee.findOne(employeeQuery(request.params.id));
    if (!employee) return response.status(404).json({ error: 'Không tìm thấy nhân viên.' });
    return response.json({ data: employee });
  }),
);

router.post(
  '/',
  asyncHandler(async (request, response) => {
    if (!requiredEmployeeFields(request.body)) {
      return response.status(400).json({ error: 'Mã nhân viên, họ tên và email là bắt buộc.' });
    }
    const employee = await Employee.create(request.body);
    return response.status(201).json({ data: employee });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (request, response) => {
    if (!requiredEmployeeFields(request.body)) {
      return response.status(400).json({ error: 'Mã nhân viên, họ tên và email là bắt buộc.' });
    }
    const employee = await Employee.findOneAndUpdate(
      employeeQuery(request.params.id),
      {
        employeeCode: request.body.employeeCode,
        fullName: request.body.fullName,
        email: request.body.email,
      },
      { new: true, runValidators: true },
    );
    if (!employee) return response.status(404).json({ error: 'Không tìm thấy nhân viên.' });
    return response.json({ data: employee });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (request, response) => {
    const employee = await Employee.findOneAndDelete(employeeQuery(request.params.id));
    if (!employee) return response.status(404).json({ error: 'Không tìm thấy nhân viên.' });
    return response.json({ message: 'Đã xóa nhân viên.', data: employee });
  }),
);

export default router;