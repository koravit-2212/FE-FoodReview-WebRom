import { cuisinesText, fullAddress, safeUrl } from './format';

test('fullAddress ไม่ต่อจังหวัดซ้ำถ้าที่อยู่มีชื่อจังหวัดอยู่แล้ว', () => {
  expect(fullAddress({ address: '1/1 หมู่ 7 จังหวัดสระบุรี 18160', province: 'สระบุรี' }))
    .toBe('1/1 หมู่ 7 จังหวัดสระบุรี 18160');
  expect(fullAddress({ address: '123 ถนนสุขุมวิท', province: 'กรุงเทพมหานคร' }))
    .toBe('123 ถนนสุขุมวิท กรุงเทพมหานคร');
  expect(fullAddress({ address: null, province: 'ภูเก็ต' })).toBe('ภูเก็ต');
});

test('cuisinesText ต่อประเภททั้งหมด และยังรองรับข้อมูลเก่าที่มี cuisine ตัวเดียว', () => {
  expect(cuisinesText({ cuisines: ['ไทย', 'ของหวาน', 'กาแฟ', 'ไอศกรีม'] })).toBe('ไทย · ของหวาน · กาแฟ');
  expect(cuisinesText({ cuisines: ['ไทย', 'ของหวาน', 'กาแฟ'] }, 2)).toBe('ไทย · ของหวาน');
  expect(cuisinesText({ cuisine: 'ญี่ปุ่น' })).toBe('ญี่ปุ่น');
});

test('safeUrl ยอมรับเฉพาะ http และ https', () => {
  expect(safeUrl('https://www.facebook.com/x')).toBe('https://www.facebook.com/x');
  expect(safeUrl('javascript:alert(1)')).toBeNull();
  expect(safeUrl('www.facebook.com/x')).toBeNull();
  expect(safeUrl(null)).toBeNull();
});
