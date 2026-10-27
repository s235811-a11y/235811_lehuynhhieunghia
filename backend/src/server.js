import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import employeesRouter from '../routes/employees.js';

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(express.json());

app.get(['/health', '/api/health'], (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use('/api/employees', employeesRouter);

app.use((_request, response) => {
  response.status(404).json({ error: 'Không tìm thấy endpoint.' });
});

app.use((error, _request, response, _next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'JSON không hợp lệ.' });
  }
  if (error.code === 11000) {
    return response.status(409).json({ error: 'Mã nhân viên đã tồn tại.' });
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return response.status(400).json({ error: error.message });
  }

  console.error(error);
  return response.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Thiếu biến môi trường MONGODB_URI. Hãy cấu hình backend/.env.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error(`Không thể khởi động backend: ${error.message}`);
  process.exitCode = 1;
});