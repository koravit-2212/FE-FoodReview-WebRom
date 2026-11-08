import { useEffect, useState } from 'react';
import { cuisineEmoji } from '../utils/format';

// รูปร้าน: ถ้าไม่มีรูป หรือรูปโหลดไม่ขึ้น (ลิงก์หมดอายุ/ถูกลบ) จะโชว์ emoji ตามประเภทอาหารแทน ไม่ให้เป็นไอคอนรูปแตก
// className ใช้กำหนดขนาด ใช้ทั้งกับรูปจริงและกล่อง emoji
function RestaurantImage({ src, alt, cuisine, className = '', emojiClass = 'text-4xl' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);   // เปลี่ยนร้านแล้วลองโหลดใหม่

  if (!src || failed) {
    return (
      <div className={`grid place-items-center bg-red-50 ${emojiClass} ${className}`} role="img" aria-label={alt}>
        {cuisineEmoji(cuisine)}
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer"
         onError={() => setFailed(true)} className={className} />
  );
}

export default RestaurantImage;
