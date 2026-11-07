// Backend จำลองของ FoodHub: ทำตัวเหมือน API ของทีม Go ทุกประการ (path, JSON, status code)
// แต่เก็บข้อมูลในหน่วยความจำ ปิดแล้วหาย  รัน:  npm run mock   (พอร์ต 4000)
// สัญญาทั้งหมดอยู่ใน docs/restaurant-api-spec.md

const express = require('express');
const cors = require('cors');

const PROVINCES = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"];

const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'https://foodhub-restaurant-review.vercel.app',     // เปลี่ยนเป็นโดเมน Vercel ของทีมเรา
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());                           // แปลง body ที่เป็น JSON ให้เป็น object (req.body)

// log ทุก request จะได้เห็นหน้าห้องว่าหน้าเว็บยิงอะไรมา
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});

// ---------- "ฐานข้อมูล" ในหน่วยความจำ ----------
const now = Date.now();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

const db = {
  members: [
    { id: 1, email: 'demo@foodhub.test', password: '1234', displayName: 'Demo', role: 'member', createdAt: daysAgo(30) },
    { id: 2, email: 'admin@foodhub.test', password: '1234', displayName: 'Admin', role: 'admin', createdAt: daysAgo(60) },
  ],
  tokens: new Map(),                               // token -> memberId
  restaurants: [
    { id: 1, name: 'Ramen Taishoken', nameTh: 'ราเมนไทโชเคน', cuisine: 'ญี่ปุ่น', district: 'สุขุมวิท', province: 'กรุงเทพมหานคร',
      description: 'ราเมนน้ำซุปเข้มข้น เส้นเหนียวนุ่ม', address: '123 ถนนสุขุมวิท', phone: '02-123-4567',
      openingHours: '10:00-21:00', menu: ['ราเมนทงคตสึ', 'เกี๊ยวซ่า', 'ข้าวหน้าหมูชาชู'], createdAt: daysAgo(40) },
    { id: 2, name: 'Baan Khao Soi', nameTh: 'บ้านข้าวซอย', cuisine: 'ไทย', district: 'นิมมานเหมินท์', province: 'เชียงใหม่',
      description: 'ข้าวซอยไก่เส้นนุ่ม น้ำแกงหอมกะทิ พร้อมเครื่องเคียงครบ', address: '45 ถนนนิมมานเหมินท์ ต.สุเทพ อ.เมือง', phone: '02-222-1111',
      openingHours: '09:00-17:00', menu: ['ข้าวซอยไก่', 'ไส้อั่ว', 'น้ำพริกหนุ่ม'], createdAt: daysAgo(35) },
    { id: 3, name: 'Trattoria Roma', nameTh: 'ทราตโตเรีย โรม่า', cuisine: 'อิตาเลียน', district: 'สีลม', province: 'กรุงเทพมหานคร',
      description: 'พาสต้าทำสดและพิซซ่าหน้าบางอบเตาฟืน', address: '88 ถนนสีลม', phone: '02-333-2222',
      openingHours: '11:00-22:00', menu: ['คาร์โบนาร่า', 'พิซซ่ามาร์เกอริต้า', 'ทิรามิสุ'], createdAt: daysAgo(30) },
    { id: 4, name: 'Brew & Bloom', nameTh: 'บรูว์ แอนด์ บลูม', cuisine: 'คาเฟ่', district: 'ทองหล่อ', province: 'กรุงเทพมหานคร',
      description: 'คาเฟ่กาแฟสเปเชียลตี้ ขนมอบใหม่ทุกวัน', address: '12 ซอยทองหล่อ 10', phone: '02-444-3333',
      openingHours: '08:00-19:00', menu: ['ลาเต้', 'ครัวซองต์อัลมอนด์', 'ชีสเค้กบลูเบอร์รี่'], createdAt: daysAgo(25) },
    { id: 5, name: 'Sushi Kaiten Ko', nameTh: 'ซูชิไคเต็นโกะ', cuisine: 'ญี่ปุ่น', district: 'พระราม 9', province: 'กรุงเทพมหานคร',
      description: 'ซูชิสายพานปลาสดส่งตรงจากตลาด', address: '300 ถนนพระราม 9', phone: '02-555-4444',
      openingHours: '11:00-22:00', menu: ['ซูชิแซลมอน', 'ไข่หวาน', 'ซาชิมิรวม'], createdAt: daysAgo(22) },
    { id: 6, name: 'Pad Thai Pratu Phi', nameTh: 'ผัดไทยประตูผี', cuisine: 'ไทย', district: 'เสาชิงช้า', province: 'กรุงเทพมหานคร',
      description: 'ผัดไทยกุ้งสดเตาถ่านสูตรเก่าแก่', address: '9 ถนนมหาไชย', phone: '02-666-5555',
      openingHours: '16:00-23:00', menu: ['ผัดไทยกุ้งสด', 'หอยทอด'], createdAt: daysAgo(20) },
    { id: 7, name: 'Dragon Dumpling', nameTh: 'ดราก้อน ดัมพลิง', cuisine: 'จีน', district: 'เยาวราช', province: 'กรุงเทพมหานคร',
      description: 'เสี่ยวหลงเปาและติ่มซำทำสดทุกเช้า', address: '77 ถนนเยาวราช', phone: '02-777-6666',
      openingHours: '07:00-15:00', menu: ['เสี่ยวหลงเปา', 'ฮะเก๋า', 'ขนมจีบ'], createdAt: daysAgo(18) },
    { id: 8, name: 'Smoky Grill House', nameTh: 'สโมคกี้ กริลล์ เฮาส์', cuisine: 'ปิ้งย่าง', district: 'ในเมือง', province: 'ขอนแก่น',
      description: 'เนื้อย่างเตาถ่าน ซอสสูตรพิเศษ', address: '55 ถนนศรีจันทร์ อ.เมือง', phone: '02-888-7777',
      openingHours: '17:00-24:00', menu: ['สเต๊กริบอาย', 'สันคอหมูย่าง', 'ปีกไก่ย่าง'], createdAt: daysAgo(15) },
    { id: 9, name: 'Talay Seafood Pier', nameTh: 'ทะเล ซีฟู้ด เพียร์', cuisine: 'อาหารทะเล', district: 'ป่าตอง', province: 'ภูเก็ต',
      description: 'ซีฟู้ดสดจากทะเล นั่งทานริมหาด', address: '1 ถนนทวีวงศ์ อ.กะทู้', phone: '02-999-8888',
      openingHours: '11:00-23:00', menu: ['กุ้งเผา', 'ปูผัดผงกะหรี่', 'ปลากะพงนึ่งมะนาว'], createdAt: daysAgo(12) },
    { id: 10, name: 'Moon Dessert Cafe', nameTh: 'มูน เดสเสิร์ต คาเฟ่', cuisine: 'คาเฟ่', district: 'ช้างเผือก', province: 'เชียงใหม่',
      description: 'ขนมหวานและบิงซูหลากรส', address: '21 ถนนช้างเผือก อ.เมือง', phone: '02-101-1010',
      openingHours: '10:00-20:00', menu: ['บิงซูสตรอว์เบอร์รี่', 'ชานมไข่มุก'], createdAt: daysAgo(9) },
    { id: 11, name: 'Som Tam Nua', nameTh: 'ส้มตำนัว', cuisine: 'ไทย', district: 'สยาม', province: 'กรุงเทพมหานคร',
      description: 'ส้มตำรสจัดจ้าน ไก่ย่างหอม ๆ', address: '3 ซอยสยามสแควร์ 5', phone: '02-111-2020',
      openingHours: '10:00-21:00', menu: ['ส้มตำไทย', 'ไก่ย่าง', 'ลาบหมู'], createdAt: daysAgo(6) },
    { id: 12, name: 'Pasta Lab', nameTh: 'พาสต้า แล็บ', cuisine: 'อิตาเลียน', district: 'บางแสน', province: 'ชลบุรี',
      description: 'พาสต้าจานด่วนราคาเป็นกันเอง', address: '16 ถนนบางแสนสาย 2 อ.เมือง', phone: '02-121-3030',
      openingHours: '11:00-21:00', menu: ['สปาเก็ตตี้ขี้เมา', 'ครีมเห็ด'], createdAt: daysAgo(2) },
  ],
  reviews: [],                                     // { id, restaurantId, memberId, rating, text, authorName, createdAt }
  wishlist: [],                                    // { memberId, restaurantId, addedAt }
};
let nextMemberId = 3;
let nextRestaurantId = 13;
let nextReviewId = 1;

// รีวิวตั้งต้น ให้หน้าเว็บมีของโชว์ตั้งแต่เปิดครั้งแรก
[
  [1, 5, 'น้ำซุปเข้มข้นมาก เส้นเหนียวนุ่ม คุ้มราคา', 'สมชาย', 5],
  [1, 4, 'อร่อย แต่คนเยอะต้องรอคิวนานหน่อย', 'มานี', 12],
  [2, 5, 'ข้าวซอยหอมกะทิ เครื่องเคียงครบ ราคาไม่แพง', 'สมหญิง', 8],
  [3, 4, 'พาสต้าเส้นสด รสชาติดี บรรยากาศน่านั่ง', 'ปีติ', 10],
  [4, 5, 'กาแฟหอมมาก ครัวซองต์กรอบนอกนุ่มใน', 'ชูใจ', 3],
  [5, 4, 'ปลาสดดี ซูชิชิ้นใหญ่ ราคายอมรับได้', 'วีระ', 7],
  [7, 5, 'เสี่ยวหลงเปาน้ำซุปเยอะ ร้อนกำลังดี', 'มานะ', 4],
].forEach(([restaurantId, rating, text, authorName, d]) => {
  db.reviews.push({ id: nextReviewId++, restaurantId, memberId: 0, rating, text, authorName, createdAt: daysAgo(d) });
});

// คำนวณ rating (ค่าเฉลี่ย) และ reviewCount ของร้านใหม่จากรีวิวที่มีอยู่ เรียกทุกครั้งที่รีวิวเพิ่ม/ลด
function recalc(restaurantId) {
  const r = db.restaurants.find(x => x.id === restaurantId);
  if (!r) return;
  const list = db.reviews.filter(v => v.restaurantId === restaurantId);
  r.reviewCount = list.length;
  r.rating = list.length ? Math.round(list.reduce((s, v) => s + v.rating, 0) / list.length * 10) / 10 : 0;
}
db.restaurants.forEach(r => recalc(r.id));

const publicMember = (m) => ({ id: m.id, email: m.email, displayName: m.displayName, role: m.role, createdAt: m.createdAt });
const findRestaurant = (id) => db.restaurants.find(r => r.id === Number(id));

// รูปร่างของร้านในรายการ (สัญญา GET /api/restaurants)
const toListItem = (r, memberId) => ({
  id: r.id, name: r.name, nameTh: r.nameTh, cuisine: r.cuisine, province: r.province, district: r.district, address: r.address,
  rating: r.rating, reviewCount: r.reviewCount, image: r.image ?? null,
  isWishlisted: Boolean(memberId && db.wishlist.some(w => w.memberId === memberId && w.restaurantId === r.id)),
});
// รูปร่างของร้านในหน้ารายละเอียด (สัญญา GET /api/restaurants/{id})
const toDetail = (r, memberId) => ({
  ...toListItem(r, memberId),
  description: r.description, phone: r.phone, openingHours: r.openingHours,
  menu: r.menu ?? [], images: r.image ? [r.image] : [],
});

// ---------- middleware ----------
const memberFromHeader = (req) => {
  const header = req.headers.authorization || '';            // "Bearer mock.1.xxxx"
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const memberId = db.tokens.get(token);
  return memberId ? db.members.find(m => m.id === memberId) : null;   // รู้ว่าใครจาก token ไม่รับจาก body
};

// endpoint สาธารณะที่ถ้ามี token จะตอบ isWishlisted ให้ด้วย (ไม่มี token ก็ใช้ได้ = Guest)
function optionalAuth(req, res, next) {
  req.member = memberFromHeader(req);
  next();
}
// ต้อง login (สมาชิก)
function requireAuth(req, res, next) {
  req.member = memberFromHeader(req);
  if (!req.member) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });
  next();
}
// ต้องเป็น admin: login แล้วแต่เป็น member ตอบ 403
function requireAdmin(req, res, next) {
  req.member = memberFromHeader(req);
  if (!req.member) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });
  if (req.member.role !== 'admin') return res.status(403).json({ error: 'เฉพาะ admin เท่านั้น' });
  next();
}

// แบ่งหน้าให้ list ใด ๆ: page เริ่มที่ 1, limit ค่าเริ่มต้น 20
function paginate(list, query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { results: list.slice((page - 1) * limit, page * limit), page, limit, total: list.length };
}

// ---------- ร้านอาหาร (สาธารณะ) ----------
app.get('/api/restaurants', optionalAuth, (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  const cuisine = (req.query.cuisine || '').trim();
  const province = (req.query.province || '').trim();

  let list = db.restaurants.filter(r =>
    (!q || r.name.toLowerCase().includes(q) || (r.nameTh || '').toLowerCase().includes(q) ||
      (r.menu || []).some(m => m.toLowerCase().includes(q))) &&
    (!cuisine || r.cuisine === cuisine) &&
    (!province || r.province === province)
  );

  if (req.query.sort === 'newest') list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (req.query.sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  const out = paginate(list, req.query);
  out.results = out.results.map(r => toListItem(r, req.member?.id));
  res.json(out);
});

app.get('/api/restaurants/:id', optionalAuth, (req, res) => {
  const r = findRestaurant(req.params.id);
  if (!r) return res.status(404).json({ error: 'ไม่พบร้านอาหาร' });
  res.json(toDetail(r, req.member?.id));
});

// ---------- สมาชิก ----------
app.post('/api/auth/register', (req, res) => {
  const { email = '', password = '', displayName = '' } = req.body || {};
  if (!email.includes('@') || password.length < 4 || !displayName.trim()) {
    return res.status(400).json({ error: 'กรอกอีเมล รหัสผ่าน (4 ตัวขึ้นไป) และชื่อที่แสดงให้ครบ' });
  }
  if (db.members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'อีเมลนี้ถูกใช้แล้ว' });          // Go: unique index ชน (23505)
  }
  const member = { id: nextMemberId++, email: email.toLowerCase(), password, displayName: displayName.trim(), role: 'member', createdAt: new Date().toISOString() };
  db.members.push(member);                         // Go จริงเก็บ bcrypt hash ไม่เก็บรหัสผ่านตรง ๆ แบบนี้
  res.status(201).json(publicMember(member));
});

app.post('/api/auth/login', (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const member = db.members.find(m => m.email === email.toLowerCase());
  if (!member || member.password !== password) {
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });   // ข้อความเดียวกันทั้ง 2 กรณี
  }
  const token = `mock.${member.id}.${Math.random().toString(36).slice(2)}`;
  db.tokens.set(token, member.id);
  res.json({ token, member: publicMember(member) });
});

app.get('/api/me', requireAuth, (req, res) => res.json(publicMember(req.member)));

// ---------- รีวิว ----------
app.get('/api/restaurants/:id/reviews', (req, res) => {
  const restaurantId = Number(req.params.id);
  if (!findRestaurant(restaurantId)) return res.status(404).json({ error: 'ไม่พบร้านอาหาร' });
  const list = db.reviews
    .filter(r => r.restaurantId === restaurantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(r => ({ id: r.id, rating: r.rating, text: r.text, authorName: r.authorName, createdAt: r.createdAt }));
  res.json(paginate(list, req.query));
});

// เฉพาะสมาชิก (Guest อ่านได้อย่างเดียว) กฎตรวจข้อมูลตาม spec ทุกข้อ
app.post('/api/restaurants/:id/reviews', requireAuth, (req, res) => {
  const restaurantId = Number(req.params.id);
  if (!findRestaurant(restaurantId)) return res.status(404).json({ error: 'ไม่พบร้านอาหาร' });
  const { rating, authorName = '' } = req.body || {};
  const text = (req.body?.text || '').trim();
  if (text.length < 10) return res.status(400).json({ error: 'รีวิวสั้นเกินไป' });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'คะแนนต้องอยู่ระหว่าง 1 ถึง 5' });
  if (!authorName.trim()) return res.status(400).json({ error: 'กรุณาใส่ชื่อ' });
  if (db.reviews.some(r => r.memberId === req.member.id && r.restaurantId === restaurantId)) {
    return res.status(409).json({ error: 'คุณรีวิวร้านนี้ไปแล้ว' });
  }
  const review = { id: nextReviewId++, restaurantId, memberId: req.member.id, rating, text, authorName: authorName.trim(), createdAt: new Date().toISOString() };
  db.reviews.push(review);
  recalc(restaurantId);                            // อัปเดต rating (ค่าเฉลี่ย) และ reviewCount ของร้าน
  res.status(201).json({ id: review.id, rating, text, authorName: review.authorName, createdAt: review.createdAt });
});

// ---------- ร้านที่อยากไปกิน (เฉพาะสมาชิก แยกรายการด้วย token) ----------
app.get('/api/wishlist', requireAuth, (req, res) => {
  const results = db.wishlist
    .filter(w => w.memberId === req.member.id)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .map(w => {
      const r = findRestaurant(w.restaurantId);
      return { restaurantId: r.id, name: r.name, nameTh: r.nameTh, cuisine: r.cuisine, province: r.province,
               district: r.district, address: r.address, rating: r.rating, reviewCount: r.reviewCount, image: r.image ?? null, addedAt: w.addedAt };
    });
  res.json({ results, total: results.length });
});

app.post('/api/wishlist', requireAuth, (req, res) => {
  const restaurantId = Number(req.body?.restaurantId);
  if (!findRestaurant(restaurantId)) return res.status(404).json({ error: 'ไม่พบร้านอาหาร' });
  const existing = db.wishlist.find(w => w.memberId === req.member.id && w.restaurantId === restaurantId);
  if (existing) return res.status(200).json({ restaurantId, addedAt: existing.addedAt });   // กดซ้ำไม่ error
  const item = { memberId: req.member.id, restaurantId, addedAt: new Date().toISOString() };
  db.wishlist.push(item);
  res.status(201).json({ restaurantId, addedAt: item.addedAt });
});

app.delete('/api/wishlist/:restaurantId', requireAuth, (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  db.wishlist = db.wishlist.filter(w => !(w.memberId === req.member.id && w.restaurantId === restaurantId));
  res.status(204).end();                           // ไม่อยู่ในรายการก็ 204 เหมือนกัน
});

// ---------- หลังบ้าน (admin เท่านั้น) ----------
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const byRating = [...db.restaurants].filter(r => r.reviewCount > 0)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 5)
    .map(r => ({ id: r.id, name: r.name, cuisine: r.cuisine, rating: r.rating, reviewCount: r.reviewCount }));
  const latestReviews = [...db.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
    .map(r => ({ id: r.id, restaurantName: findRestaurant(r.restaurantId)?.name ?? '-', authorName: r.authorName, rating: r.rating, text: r.text }));
  const newestMembers = [...db.members].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(publicMember);
  res.json({
    restaurants: db.restaurants.length,
    reviews: db.reviews.length,
    members: db.members.length,
    admins: db.members.filter(m => m.role === 'admin').length,
    wishlistItems: db.wishlist.length,
    topRated: byRating, latestReviews, newestMembers,
  });
});

app.get('/api/admin/members', requireAdmin, (req, res) => {
  res.json({ results: db.members.map(publicMember) });
});

app.put('/api/admin/members/:id/role', requireAdmin, (req, res) => {
  const target = db.members.find(m => m.id === Number(req.params.id));
  if (!target) return res.status(404).json({ error: 'ไม่พบสมาชิก' });
  if (target.id === req.member.id) return res.status(400).json({ error: 'เปลี่ยนบทบาทของตัวเองไม่ได้' });
  const role = req.body?.role;
  if (role !== 'admin' && role !== 'member') return res.status(400).json({ error: 'role ต้องเป็น admin หรือ member' });
  target.role = role;
  res.json(publicMember(target));
});

// ตรวจข้อมูลร้านจากฟอร์มหลังบ้าน (กติกาเดียวกับ validate ฝั่งเบราว์เซอร์ แต่ข้ามฟอร์มด้วย curl ไม่ได้)
function parseRestaurant(body = {}) {
  const name = (body.name || '').trim();
  const cuisine = (body.cuisine || '').trim();
  if (!name) return { error: 'ต้องมีชื่อร้าน' };
  if (!cuisine) return { error: 'ต้องระบุประเภทอาหาร' };
  if (!PROVINCES.includes(body.province)) return { error: 'ต้องเลือกจังหวัดให้ถูกต้อง' };
  if (body.image && !/^https?:\/\//.test(body.image)) return { error: 'รูปภาพต้องเป็น URL ที่ขึ้นต้นด้วย http:// หรือ https://' };
  const nz = (s) => (typeof s === 'string' && s.trim() ? s.trim() : null);
  return { value: {
    name, nameTh: nz(body.nameTh), cuisine, province: body.province, district: nz(body.district),
    description: nz(body.description), address: nz(body.address), phone: nz(body.phone),
    openingHours: nz(body.openingHours), image: nz(body.image),
    menu: Array.isArray(body.menu) ? body.menu.map(String).map(s => s.trim()).filter(Boolean) : [],
  } };
}

const impactOf = (restaurantId) => ({
  reviews: db.reviews.filter(r => r.restaurantId === restaurantId).length,
  wishlist: db.wishlist.filter(w => w.restaurantId === restaurantId).length,
});

app.get('/api/admin/restaurants/:id', requireAdmin, (req, res) => {
  const r = findRestaurant(req.params.id);
  if (!r) return res.status(404).json({ error: 'ไม่พบร้านอาหาร' });
  res.json({ ...toDetail(r), impact: impactOf(r.id) });
});

app.post('/api/admin/restaurants', requireAdmin, (req, res) => {
  const { value, error } = parseRestaurant(req.body);
  if (error) return res.status(400).json({ error });
  const r = { id: nextRestaurantId++, ...value, rating: 0, reviewCount: 0, createdAt: new Date().toISOString() };
  db.restaurants.push(r);
  res.status(201).json({ ...toDetail(r), impact: impactOf(r.id) });
});

app.put('/api/admin/restaurants/:id', requireAdmin, (req, res) => {
  const r = findRestaurant(req.params.id);
  if (!r) return res.status(404).json({ error: 'ไม่พบร้านอาหาร' });
  const { value, error } = parseRestaurant(req.body);
  if (error) return res.status(400).json({ error });
  Object.assign(r, value);
  res.json({ ...toDetail(r), impact: impactOf(r.id) });
});

app.delete('/api/admin/restaurants/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!findRestaurant(id)) return res.status(404).json({ error: 'ไม่พบร้านอาหาร' });
  db.restaurants = db.restaurants.filter(r => r.id !== id);
  db.reviews = db.reviews.filter(r => r.restaurantId !== id);          // ลบตามไปด้วย (ON DELETE CASCADE)
  db.wishlist = db.wishlist.filter(w => w.restaurantId !== id);
  res.status(204).end();
});

app.get('/api/admin/reviews', requireAdmin, (req, res) => {
  const results = [...db.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(r => ({ id: r.id, restaurantId: r.restaurantId, restaurantName: findRestaurant(r.restaurantId)?.name ?? '-',
                 rating: r.rating, text: r.text, authorName: r.authorName, createdAt: r.createdAt }));
  res.json({ results });
});

app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const review = db.reviews.find(r => r.id === Number(req.params.id));
  if (!review) return res.status(404).json({ error: 'ไม่พบรีวิว' });
  db.reviews = db.reviews.filter(r => r.id !== review.id);
  recalc(review.restaurantId);                                         // คำนวณคะแนนเฉลี่ยของร้านใหม่
  res.status(204).end();
});

app.use('/api', (req, res) => res.status(404).json({ error: `ไม่มี endpoint ${req.method} ${req.originalUrl}` }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FoodHub mock backend พร้อมที่ http://localhost:${PORT}`);
  console.log('สมาชิกทดลอง: demo@foodhub.test / 1234    ผู้ดูแล: admin@foodhub.test / 1234   (ข้อมูลทั้งหมดหายเมื่อปิด)');
});
