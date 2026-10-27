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

## Chạy dự án ở môi trường phát triển

Mở hai terminal từ thư mục gốc.

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API chạy tại `http://localhost:3000`; kiểm tra trạng thái tại `/api/health`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal. Yêu cầu tới `/api` được proxy tới backend.

## Repository

[235811_lehuynhhieunghia](https://github.com/s235811-a11y/235811_lehuynhhieunghia) (Public)
