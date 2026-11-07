# API ที่หน้าเว็บ FoodJubb ต้องใช้ (ส่งให้ทีม Go)

ทีม: ______________________  หน้าเว็บ: FoodJubb (Guest / Member / Admin)

กติกา: ทุก endpoint ตอบเป็น JSON, ใส่ prefix `/api`, ใช้ชื่อ field แบบ camelCase
โครงตารางฐานข้อมูลอยู่ที่ [db-schema.md](db-schema.md)

## ผู้ใช้ 3 แบบ

- **Guest** (ไม่ login): ดูร้าน ค้นหา กรอง และอ่านรีวิวได้ ไม่ต้องมี token
- **Member** (login แล้ว): เขียนรีวิว เพิ่ม/ลบ/ดูร้านที่อยากไปกิน ต้องแนบ header `Authorization: Bearer <token>`
- **Admin** (member ที่ `role = "admin"`): ใช้ `/api/admin/*` ถ้าเป็น member ตอบ 403 `{ "error": "เฉพาะ admin เท่านั้น" }` ถ้าไม่มี token ตอบ 401 `{ "error": "กรุณาเข้าสู่ระบบก่อน" }`

## รายการ endpoint

| # | Method | Path | สิทธิ์ | ใช้ทำอะไร |
|---|--------|------|--------|-----------|
| 1 | GET | /api/restaurants | Guest | รายการร้าน หน้า Home และ Restaurants (ค้นหา กรอง เรียง แบ่งหน้า) |
| 2 | GET | /api/restaurants/{id} | Guest | รายละเอียดร้าน หน้า RestaurantDetail |
| 3 | GET | /api/restaurants/{id}/reviews | Guest | รีวิวของร้าน |
| 4 | POST | /api/restaurants/{id}/reviews | Member | เขียนรีวิว |
| 5 | GET | /api/wishlist | Member | หน้า "ร้านที่อยากไปกิน" |
| 6 | POST | /api/wishlist | Member | กดหัวใจ เพิ่มร้านที่อยากไปกิน |
| 7 | DELETE | /api/wishlist/{restaurantId} | Member | กดหัวใจอีกครั้ง เอาร้านออกจากรายการ |
| 8 | POST | /api/auth/register | Guest | สมัครสมาชิก |
| 9 | POST | /api/auth/login | Guest | เข้าสู่ระบบ |
| 10 | GET | /api/me | Member | ข้อมูลสมาชิกที่ถือ token |
| 11 | GET | /api/admin/stats | Admin | ตัวเลขภาพรวม Dashboard |
| 12 | GET | /api/admin/members | Admin | รายชื่อสมาชิก |
| 13 | PUT | /api/admin/members/{id}/role | Admin | เลื่อน/ลดบทบาท |
| 14 | GET | /api/admin/restaurants/{id} | Admin | ร้านสำหรับฟอร์มแก้ไข + `impact` |
| 15 | POST | /api/admin/restaurants | Admin | เพิ่มร้าน |
| 16 | PUT | /api/admin/restaurants/{id} | Admin | แก้ไขร้าน |
| 17 | DELETE | /api/admin/restaurants/{id} | Admin | ลบร้าน (รีวิวและ wishlist ของร้านถูกลบตาม) |
| 18 | GET | /api/admin/reviews | Admin | รีวิวทุกร้าน |
| 19 | DELETE | /api/admin/reviews/{id} | Admin | ลบรีวิว แล้วคำนวณ rating และ reviewCount ของร้านใหม่ |

## #1 GET /api/restaurants

Query parameter ใช้ร่วมกันได้ทั้งหมด เช่น `/api/restaurants?q=ข้าวซอย&province=เชียงใหม่&sort=rating`

- `q` ค้นหาจากชื่อร้าน (ไทย/อังกฤษ) หรือชื่อเมนู
- `province` ชื่อจังหวัดแบบเต็ม เช่น `กรุงเทพมหานคร`, `เชียงใหม่` (ไม่ส่ง = ทุกจังหวัด)
- `cuisine` ประเภทอาหาร เช่น ไทย, ญี่ปุ่น, อิตาเลียน, คาเฟ่
- `sort` ค่าที่รับ: `rating` (คะแนนสูงสุดก่อน), `newest` (ใหม่สุดก่อน)
- `page` และ `limit` สำหรับแบ่งหน้า (ค่าเริ่มต้น page=1, limit=20)

ถ้าแนบ `Authorization` มาด้วย ให้ตอบ `isWishlisted` ของสมาชิกคนนั้น ถ้าไม่แนบตอบ `false` (หน้าเว็บใช้แสดงหัวใจบนการ์ด)
ไม่มีระดับราคา (ตัดออกแล้ว)

```json
{
  "results": [
    {
      "id": 1,
      "name": "Ramen Taishoken",
      "nameTh": "ราเมนไทโชเคน",
      "cuisine": "ญี่ปุ่น",
      "province": "กรุงเทพมหานคร",
      "district": "สุขุมวิท",
      "address": "123 ถนนสุขุมวิท",
      "rating": 4.5,
      "reviewCount": 128,
      "image": "https://example.com/images/ramen-taishoken.jpg",
      "isWishlisted": false
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

## #2 GET /api/restaurants/{id}

ใช้ field ชุดเดียวกับรายการ เพิ่ม `description`, `phone`, `openingHours`, `menu` (array ชื่อเมนู), `images` (array URL) ถ้าไม่พบ id ตอบ 404 `{ "error": "ไม่พบร้านอาหาร" }`
ถ้าแนบ `Authorization` ตอบ `isWishlisted` ของสมาชิกคนนั้น

```json
{
  "id": 1,
  "name": "Ramen Taishoken",
  "nameTh": "ราเมนไทโชเคน",
  "cuisine": "ญี่ปุ่น",
  "province": "กรุงเทพมหานคร",
  "district": "สุขุมวิท",
  "address": "123 ถนนสุขุมวิท",
  "description": "ราเมนน้ำซุปเข้มข้น เส้นเหนียวนุ่ม",
  "phone": "02-123-4567",
  "openingHours": "10:00-21:00",
  "menu": ["ราเมนทงคตสึ", "เกี๊ยวซ่า"],
  "rating": 4.5,
  "reviewCount": 128,
  "images": ["https://example.com/images/ramen-taishoken.jpg"],
  "isWishlisted": true
}
```

## #3 GET /api/restaurants/{id}/reviews

รับ `page`, `limit` เหมือน #1 เรียงใหม่สุดก่อน

```json
{
  "results": [
    { "id": 1, "rating": 5, "text": "น้ำซุปเข้มข้นมาก เส้นเหนียวนุ่ม คุ้มราคา", "authorName": "สมชาย", "createdAt": "2026-11-01T12:30:00Z" }
  ],
  "page": 1, "limit": 20, "total": 1
}
```

## #4 POST /api/restaurants/{id}/reviews (Member)

body: `{ "rating": 5, "text": "...", "authorName": "สมชาย" }` (หน้าเว็บส่ง `authorName` จาก displayName ของสมาชิก)
ตอบ 201 พร้อม `{ "id": 1, "rating": 5, "text": "...", "authorName": "สมชาย", "createdAt": "2026-11-07T10:00:00Z" }`

กฎตรวจข้อมูล (ตอบ 400 พร้อม `{ "error": "ข้อความ" }` ตรวจตามลำดับนี้):

- text สั้นกว่า 10 ตัวอักษร: `{ "error": "รีวิวสั้นเกินไป" }`
- rating ไม่ใช่จำนวนเต็ม 1-5: `{ "error": "คะแนนต้องอยู่ระหว่าง 1 ถึง 5" }`
- authorName ว่าง: `{ "error": "กรุณาใส่ชื่อ" }`
- ไม่พบร้าน: 404 `{ "error": "ไม่พบร้านอาหาร" }`
- สมาชิกคนนี้รีวิวร้านนี้ไปแล้ว: 409 `{ "error": "คุณรีวิวร้านนี้ไปแล้ว" }`

หลังบันทึกแล้ว backend ต้องอัปเดต `rating` (ค่าเฉลี่ย ปัด 1 ตำแหน่ง) และ `reviewCount` ของร้านด้วย (ใน DB ทำด้วย trigger ดู db-schema.md)

## #5-#7 ร้านที่อยากไปกิน (Member ผูกกับบัญชีด้วย token)

**GET /api/wishlist** เรียงเพิ่มล่าสุดก่อน

```json
{
  "results": [
    {
      "restaurantId": 1,
      "name": "Ramen Taishoken",
      "nameTh": "ราเมนไทโชเคน",
      "cuisine": "ญี่ปุ่น",
      "province": "กรุงเทพมหานคร",
      "district": "สุขุมวิท",
      "address": "123 ถนนสุขุมวิท",
      "rating": 4.5,
      "reviewCount": 128,
      "image": "https://example.com/images/ramen-taishoken.jpg",
      "addedAt": "2026-11-07T10:00:00Z"
    }
  ],
  "total": 1
}
```

**POST /api/wishlist** body `{ "restaurantId": 1 }` ตอบ 201 พร้อม `{ "restaurantId": 1, "addedAt": "..." }`

- ไม่พบร้าน: 404 `{ "error": "ไม่พบร้านอาหาร" }`
- เพิ่มร้านนี้ไปแล้ว: ตอบ 200 พร้อมข้อมูลเดิม (ไม่ error เพื่อให้กดซ้ำได้ไม่พัง)

**DELETE /api/wishlist/{restaurantId}** ตอบ 204 ไม่มี body ถ้าร้านนั้นไม่ได้อยู่ในรายการก็ตอบ 204 เหมือนกัน

ถ้าไม่มี token ทั้ง 3 ตัวตอบ 401

## #8-#10 สมาชิก

- `POST /api/auth/register` body `{ email, password, displayName }` ตอบ 201 พร้อม member / 400 กรอกไม่ครบ (รหัสผ่านอย่างน้อย 4 ตัว) / 409 อีเมลซ้ำ
- `POST /api/auth/login` body `{ email, password }` ตอบ `{ "token": "...", "member": { "id", "email", "displayName", "role", "createdAt" } }` / 401 `{ "error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }` (ข้อความเดียวกันทั้งอีเมลผิดและรหัสผิด)
- `GET /api/me` ตอบ member ของ token นี้

## #11-#19 หลังบ้าน (Admin)

- `GET /api/admin/stats` ตอบ `{ restaurants, reviews, members, admins, wishlistItems, topRated: [{ id, name, cuisine, rating, reviewCount }], latestReviews: [{ id, restaurantName, authorName, rating, text }], newestMembers: [member] }` (topRated และ latestReviews สูงสุด 5 รายการ)
- `GET /api/admin/members` ตอบ `{ "results": [member] }`
- `PUT /api/admin/members/{id}/role` body `{ "role": "admin" | "member" }` ตอบ member ที่อัปเดตแล้ว เปลี่ยนบทบาทตัวเองไม่ได้ (400)
- `GET /api/admin/restaurants/{id}` ตอบรายละเอียดร้านแบบ #2 เพิ่ม `impact: { reviews, wishlist }`
- `POST` / `PUT /api/admin/restaurants[/{id}]` body: `{ name, nameTh, cuisine, province, district, description, address, phone, openingHours, image, menu: [] }`
  - ต้องมี `name`, `cuisine` และ `province` (ชื่อจังหวัดต้องตรงกับตาราง provinces) ถ้าไม่ครบตอบ 400 `{ "error": "..." }`
  - `image` ต้องขึ้นต้นด้วย http:// หรือ https:// ถ้ามี
  - ตอบร้านพร้อม `impact` (POST ตอบ 201)
- `DELETE /api/admin/restaurants/{id}` ตอบ 204
- `GET /api/admin/reviews` ตอบ `{ "results": [{ id, restaurantId, restaurantName, rating, text, authorName, createdAt }] }` ใหม่สุดก่อน
- `DELETE /api/admin/reviews/{id}` ตอบ 204 ไม่พบตอบ 404 `{ "error": "ไม่พบรีวิว" }`

## เรื่องที่ต้องตกลงกัน

- CORS: ตอนพัฒนา หน้าเว็บอยู่ที่ http://localhost:3000 และโดเมน Vercel ของทีม ขอให้ backend อนุญาต 2 origin นี้ พร้อม header `Authorization`, `Content-Type` และ method `PUT`, `DELETE`
- Error: ทุก error ตอบ JSON รูปแบบเดียวกัน `{ "error": "ข้อความ" }`
- id ใช้เลขที่ backend สร้างเอง (auto increment) ใช้ให้เหมือนกันทุก endpoint
- รูปภาพ: เก็บเป็น URL ก่อน ถ้าจะให้ผู้ใช้อัปโหลดรูป ต้องคุยเพิ่มว่าจะเก็บรูปที่ไหน
- รายชื่อจังหวัด: 77 จังหวัด ชื่อเดียวกับค่าคงที่ `PROVINCES` ใน `src/data/data.js` (ใช้ `กรุงเทพมหานคร` ไม่ใช่ `กรุงเทพฯ`)
