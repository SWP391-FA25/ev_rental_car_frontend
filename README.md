# EV Rental Project - Client

Frontend React sử dụng Vite, ESLint, Prettier.

## Cài đặt

```bash
npm install
# hoặc dùng pnpm nếu có
pnpm install
```

## Chạy phát triển

```bash
npm run dev
# hoặc
pnpm dev
```

## Build

```bash
npm run build
# hoặc
pnpm build
```

## Lint & Format

```bash
npm run lint         # Kiểm tra lint
npm run lint:fix     # Sửa lỗi lint tự động
npm run prettier     # Kiểm tra format
npm run prettier:fix # Format tự động
```

## Cấu trúc thư mục

- `src/`: Mã nguồn React
  - `views/`: Các trang giao diện
  - `hooks/`: Custom hooks
  - `lib/`: Thư viện dùng chung (API, endpoints, env)
  - `assets/`: Hình ảnh, icon
- `public/`: Tài nguyên tĩnh
- `.eslintrc`, `.prettierrc`: Cấu hình lint & format
- `vite.config.js`: Cấu hình Vite

## Công nghệ sử dụng

- React
- Vite
- ESLint & Prettier
