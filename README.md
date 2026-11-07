# 🍽️ FoodJubb: เว็บรีวิวร้านอาหาร

React 19 + React Router 6 + Tailwind CSS 3 ต่อ API ด้วย `fetch` (JSON) โครงสร้างและวิธีเขียนเหมือน MovieHub ทุกอย่าง
(`apiFetch` ตัวเดียวใน `src/api/backend.js`, `useState` + `useEffect` โหลดข้อมูลด้วย status `loading | error | success`, `AuthContext`, `ProtectedRoute`, `RequireRole`, mock backend ด้วย Express)

## ผู้ใช้ 3 แบบ

| แบบ | เข้าได้ | ทำอะไรได้ |
|---|---|---|
| Guest (ไม่ login) | `/`, `/restaurants`, `/restaurants/:id`, `/login`, `/register`, `/about` | ดูร้าน ค้นหา (ชื่อร้าน/เมนู) กรองจังหวัดและประเภทอาหาร เรียงลำดับ อ่านรีวิว (กดหัวใจแล้วจะถูกพาไป login) |
| Member (login แล้ว) | ทุกอย่างของ Guest + `/me/wishlist` | เขียนรีวิวพร้อมคะแนน 1-5, กดหัวใจบนการ์ดหรือหน้าร้านเพื่อเพิ่ม/ลบร้านที่อยากไปกิน, ดูรายการที่หน้า "อยากไปกิน" |
| Admin (role = admin) | ทุกอย่างของ Member + `/admin/*` | Dashboard, เพิ่ม/แก้ไข/ลบร้าน, ลบรีวิว, เลื่อน/ลดบทบาทสมาชิก |

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env      # ปล่อย REACT_APP_API_URL ว่างไว้ = ใช้ mock ในเครื่อง
npm run mock              # เทอร์มินัลที่ 1: backend จำลองที่พอร์ต 4000
npm start                 # เทอร์มินัลที่ 2: หน้าเว็บที่พอร์ต 3000
```

บัญชีทดลอง (mock): สมาชิก `demo@foodjubb.test` / `1234`, ผู้ดูแล `admin@foodjubb.test` / `1234`
ข้อมูลใน mock เก็บในหน่วยความจำ ปิดแล้วหาย

> ต้องเปิด mock backend ก่อนล็อกอินเสมอ: รัน `npm run mock` ใน terminal แรก แล้วเปิด `npm start` ใน terminal ที่สอง

## โครงสร้างไฟล์

```
mock/server.js                    backend จำลอง (ทำตัวเหมือน Go: path, JSON, status code)
docs/restaurant-api-spec.md       สัญญา API ที่จะส่งให้ทีม Go
docs/db-schema.md                 ออกแบบ schema ฐานข้อมูล (ER diagram, คำอธิบายตาราง, SQL ตัวอย่าง)
docs/db/schema.sql                สร้างตาราง PostgreSQL + seed จังหวัด 77 จังหวัด
src/
  api/backend.js                  apiFetch + ฟังก์ชันเรียก API ทุกตัว
  auth/AuthContext.jsx            login / register / logout, token, isAdmin
  components/                     Navbar, Footer, SearchBar, WishlistButton (หัวใจ), RestaurantCard/Grid, ReviewForm/List, RestaurantActions,
                                  ProtectedRoute (Member), RequireRole (Admin), admin/AdminStates
  pages/                          Home, Restaurants, RestaurantDetail, Login, Register, Wishlist, About, NotFound
  pages/admin/                    AdminLayout, AdminDashboard, AdminRestaurants, AdminRestaurantForm, AdminReviews, AdminMembers
  data/data.js                    ประเภทอาหาร จังหวัด 77 จังหวัด ตัวเลือกเรียง
  utils/format.js                 ฟอร์แมตวันที่ คะแนน emoji ประเภทอาหาร
```

## เปลี่ยนรูปพื้นหลังหน้าแรก

วางรูปอาหารที่ต้องการไว้ที่ `public/hero.jpg` (แนวนอน กว้างอย่างน้อย 1600 px) ถ้าไม่มีไฟล์นี้จะเห็นพื้นหลังไล่สีเข้มแทน

## ทดสอบ

```bash
npm test -- --watchAll=false
```

## ต่อ Backend จริง (Go)

ตั้ง `REACT_APP_API_URL=https://api.ทีมเรา.xyz` ใน `.env` และใน Environment Variables ของ Vercel แล้วรัน/Deploy ใหม่
ต้องให้ Go ทำตาม `docs/restaurant-api-spec.md` และอนุญาต CORS ให้ `http://localhost:3000` กับโดเมน Vercel
(header `Authorization`, method `PUT` และ `DELETE`)
ในไฟล์ `mock/server.js` ให้แก้ `allowedOrigins` เป็นโดเมน Vercel ของทีม

## Deploy ขึ้น Vercel

1. push โค้ดขึ้น GitHub (ตรวจว่า `git status` ไม่มีไฟล์ `.env`)
2. Vercel: Add New Project เลือก repo
3. Environment Variables เพิ่ม `REACT_APP_API_URL`
4. Deploy (`vercel.json` ทำให้ refresh หน้าใน ๆ แล้วไม่ 404)
