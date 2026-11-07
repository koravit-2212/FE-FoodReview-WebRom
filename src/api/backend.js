// ชั้นกลางสำหรับคุยกับ Backend ของทีม (วันนี้คือ mock ที่พอร์ต 4000 ต่อไปคือ Go)
// โครงเดียวกับ moviehub: apiFetch ตัวเดียวที่ fetch จริง ทุกฟังก์ชันด้านล่างเรียกผ่านตัวนี้
// endpoint และ JSON ตามสัญญาใน docs/restaurant-api-spec.md

// '' = origin เดียวกับหน้าเว็บ CRA จะ proxy /api ไปที่ http://localhost:4000 ให้ (ตั้งใน package.json)
// ตอนต่อ Go จริง ตั้ง REACT_APP_API_URL=https://api.ทีมเรา.xyz ใน .env และบน Vercel
const BASE = process.env.REACT_APP_API_URL || '';

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };   // 1) บอก server ว่า body เป็น JSON
  if (token) headers.Authorization = `Bearer ${token}`;      //    และแนบบัตรผ่านถ้ามี

  const res = await fetch(BASE + path, {                     // 2) ยิงจริง
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,           //    object ต้องแปลงเป็นข้อความก่อนส่ง
  });

  if (res.status === 204) return null;                       // 3) ลบสำเร็จ ไม่มี body ให้อ่าน

  const data = await res.json()                              //    อ่านคำตอบเป็น JSON
    .catch(() => ({ error: 'server ไม่ได้ตอบเป็น JSON' }));
  if (!res.ok) {                                             // 4) 400 / 401 / 403 / 404 / 409 มาลงตรงนี้
    const err = new Error(data.error?.message ?? data.error ?? `server ตอบกลับ ${res.status}`);
    err.status = res.status;                                 //    แนบเลขไว้ให้หน้าเว็บใช้ต่อ
    throw err;
  }
  return data;
}

// แปลง { q: 'ราเมน', cuisine: '', page: 1 } เป็น '?q=ราเมน&page=1' (ข้ามค่าว่าง)
function toQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v != null && v !== 'all') sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ---------- สมาชิก ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });   // ได้ { token, member }
}
export function getMe(token) {
  return apiFetch('/api/me', { token });
}

// ---------- ร้านอาหาร (สาธารณะ: Guest ดูได้) ----------
// params: { q, province, cuisine, sort, page, limit } ได้ { results, page, limit, total }
// ถ้าส่ง token มาด้วย backend จะตอบ isWishlisted ของสมาชิกคนนั้นในแต่ละร้านให้ (ใช้ทำหัวใจบนการ์ด)
export function getRestaurants(params, token) {
  return apiFetch('/api/restaurants' + toQuery(params), { token });
}
// ถ้าส่ง token มาด้วย backend จะตอบ isWishlisted ของสมาชิกคนนั้นให้
export function getRestaurant(id, token) {
  return apiFetch(`/api/restaurants/${id}`, { token });
}

// ---------- รีวิว ----------
export function getReviews(restaurantId, params) {
  return apiFetch(`/api/restaurants/${restaurantId}/reviews` + toQuery(params));          // ได้ { results, page, limit, total }
}
// fields = { rating, text, authorName } 201 ได้รีวิวที่บันทึกแล้ว
export function postReview(restaurantId, fields, token) {
  return apiFetch(`/api/restaurants/${restaurantId}/reviews`, { method: 'POST', body: fields, token });
}

// ---------- ร้านที่อยากไปกิน (เฉพาะสมาชิก) ----------
export function getWishlist(token) {
  return apiFetch('/api/wishlist', { token });                                           // ได้ { results, total }
}
export function addToWishlist(restaurantId, token) {
  return apiFetch('/api/wishlist', { method: 'POST', body: { restaurantId: Number(restaurantId) }, token });
}
export function removeFromWishlist(restaurantId, token) {
  return apiFetch(`/api/wishlist/${restaurantId}`, { method: 'DELETE', token });         // 204 ได้ null
}

// ---------- หลังบ้าน (ทุกตัวต้องแนบ token ของ admin ถ้าเป็น member ตอบ 403) ----------
export function getAdminStats(token) {
  return apiFetch('/api/admin/stats', { token });
}
export async function getAdminMembers(token) {
  const data = await apiFetch('/api/admin/members', { token });
  return data.results;
}
export function setMemberRole(memberId, role, token) {
  return apiFetch(`/api/admin/members/${memberId}/role`, { method: 'PUT', body: { role }, token });
}
export function getAdminRestaurant(id, token) {
  return apiFetch(`/api/admin/restaurants/${id}`, { token });                            // มี impact ว่าลบแล้วอะไรหายบ้าง
}
export function createRestaurant(fields, token) {
  return apiFetch('/api/admin/restaurants', { method: 'POST', body: fields, token });
}
export function updateRestaurant(id, fields, token) {
  return apiFetch(`/api/admin/restaurants/${id}`, { method: 'PUT', body: fields, token });
}
export function deleteRestaurant(id, token) {
  return apiFetch(`/api/admin/restaurants/${id}`, { method: 'DELETE', token });          // 204 ได้ null
}
export async function getAdminReviews(token) {
  const data = await apiFetch('/api/admin/reviews', { token });
  return data.results;
}
export function deleteReview(reviewId, token) {
  return apiFetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE', token });         // 204 ได้ null
}
