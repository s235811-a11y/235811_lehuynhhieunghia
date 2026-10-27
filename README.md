# 235811_lehuynhhieunghia

## Thông tin sinh viên

- Họ và tên: Lê Huỳnh Hiếu Nghĩa
- MSSV: 235811
- Lớp: DH23TIN10

## Cấu trúc dự án

```text
.
├── backend/       # API Node.js và Express
├── frontend/      # Giao diện Vite
├── .gitignore
└── README.md
```

## Yêu cầu

- Node.js 20 trở lên và npm
- MongoDB Atlas cluster và connection string

## Chạy dự án ở môi trường phát triển

Mở hai terminal từ thư mục gốc.

Backend:

```bash
cd backend
npm install
cp .env.example .env
# Điền MONGODB_URI bằng connection string của MongoDB Atlas trong backend/.env
npm run dev
```

API chạy tại `http://localhost:5000`; kiểm tra trạng thái tại `/health`.
Không commit `backend/.env` hoặc chia sẻ connection string chứa thông tin xác thực.

### API nhân viên

- `GET /api/employees?search=An`: danh sách hoặc tìm theo mã nhân viên/họ tên
- `GET /api/employees/:id`: lấy theo MongoDB ID hoặc mã nhân viên
- `POST /api/employees`: thêm nhân viên (`employeeCode`, `fullName`, `email`)
- `PUT /api/employees/:id`: cập nhật nhân viên
- `DELETE /api/employees/:id`: xóa nhân viên

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal. Yêu cầu tới `/api` được proxy tới backend.

## Repository

[235811_lehuynhhieunghia](https://github.com/s235811-a11y/235811_lehuynhhieunghia) (Public)
