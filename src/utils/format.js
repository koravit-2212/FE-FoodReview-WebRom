// ฟังก์ชันเล็ก ๆ ที่หลายหน้าใช้ซ้ำ

export const dateTH = (iso) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

// ร้านที่ยังไม่มีรูป (หรือรูปโหลดไม่ขึ้น) จะโชว์ emoji ตามประเภทอาหารหลักแทน
const EMOJI = {
  'ไทย': '🍛', 'กาแฟ': '☕', 'ของหวาน': '🍰', 'เบเกอรี่/คาเฟ่': '🥐', 'ฟาสต์ฟู้ด/ของทานเล่น': '🍟',
  'อีสาน': '🥗', 'เอเชียนฟิวชัน': '🥢', 'อาหารทะเล': '🦐', 'อเมริกัน': '🍔', 'ยุโรป': '🥩',
  'ไอศกรีม': '🍨', 'ก๋วยเตี๋ยว': '🍜', 'ญี่ปุ่น': '🍣', 'อาหารเหนือ': '🌶️', 'อิตาเลียน': '🍝',
  'อาหารมุสลิม': '🍢', 'จีน': '🥟', 'ฝรั่งเศส/บิสโทร': '🥖', 'ฮาลาล': '🍗', 'บาร์บีคิว': '🍖', 'เวียดนาม': '🍲',
};
export const cuisineEmoji = (cuisine) => EMOJI[cuisine] ?? '🍽️';

// ประเภททั้งหมดของร้านเป็นข้อความเดียว เช่น "ไทย · ของหวาน" (รองรับข้อมูลเก่าที่มีแค่ cuisine ตัวเดียว)
export const cuisinesText = (restaurant, max = 3) => {
  const list = restaurant.cuisines?.length ? restaurant.cuisines : [restaurant.cuisine].filter(Boolean);
  return list.slice(0, max).join(' · ');
};

// ที่อยู่เต็ม: ที่อยู่ในข้อมูลบางร้านมีชื่อจังหวัดอยู่แล้ว จึงต่อจังหวัดเฉพาะเมื่อยังไม่มี
export const fullAddress = (restaurant) => {
  const address = (restaurant.address || '').trim();
  const province = restaurant.province || '';
  if (!province || address.includes(province)) return address || province;
  return `${address} ${province}`.trim();
};

// คะแนน 4.5 -> '⭐ 4.5 (128)' ร้านที่ยังไม่มีรีวิวโชว์ 'ยังไม่มีรีวิว'
export const ratingText = (rating, reviewCount) =>
  reviewCount > 0 ? `⭐ ${Number(rating).toFixed(1)} (${reviewCount})` : 'ยังไม่มีรีวิว';

// ลิงก์ที่จะเอาไปใส่ href ต้องขึ้นต้นด้วย http(s) เท่านั้น (กัน javascript: ที่หลุดมาจากข้อมูล)
export const safeUrl = (url) => (typeof url === 'string' && /^https?:\/\//.test(url) ? url : null);
