// ฟังก์ชันเล็ก ๆ ที่หลายหน้าใช้ซ้ำ

export const dateTH = (iso) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

// ร้านที่ยังไม่มีรูปจะโชว์ emoji ตามประเภทอาหารแทน
const EMOJI = { 'ไทย': '🍛', 'ญี่ปุ่น': '🍜', 'อิตาเลียน': '🍝', 'คาเฟ่': '☕', 'จีน': '🥟', 'ปิ้งย่าง': '🍖', 'อาหารทะเล': '🦐' };
export const cuisineEmoji = (cuisine) => EMOJI[cuisine] ?? '🍽️';

// คะแนน 4.5 -> '4.5' ร้านที่ยังไม่มีรีวิวโชว์ 'ยังไม่มีรีวิว'
export const ratingText = (rating, reviewCount) =>
  reviewCount > 0 ? `⭐ ${Number(rating).toFixed(1)} (${reviewCount})` : 'ยังไม่มีรีวิว';
