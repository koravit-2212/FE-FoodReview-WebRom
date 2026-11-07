import { apiFetch, login, postReview, getRestaurants } from './backend';

// ตัวช่วยสร้าง "คำตอบปลอม" ของ fetch: ใส่แค่ status กับ body ที่อยากให้ server ตอบ
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,          // fetch ของจริงคำนวณ ok แบบนี้
    status,
    json: () => Promise.resolve(body),         // res.json() คืน Promise เสมอ
  };
}

beforeEach(() => {
  // แทน fetch ของเบราว์เซอร์ด้วยฟังก์ชันปลอมที่เราควบคุมคำตอบได้ และจดทุกครั้งที่ถูกเรียก
  global.fetch = jest.fn();
});

test('GET ธรรมดา: ไม่มี body ไม่มี Authorization และคืน object ที่แปลงแล้ว', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { results: [{ id: 1 }] }));

  const data = await apiFetch('/api/restaurants');

  expect(data).toEqual({ results: [{ id: 1 }] });
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/restaurants');
  expect(options.method).toBe('GET');
  expect(options.body).toBeUndefined();
  expect(options.headers.Authorization).toBeUndefined();
});

test('getRestaurants ต้องต่อ query string และข้ามค่าว่างกับ all', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { results: [], page: 1, limit: 8, total: 0 }));

  await getRestaurants({ q: 'ราเมน', cuisine: 'all', province: 'เชียงใหม่', sort: 'rating', page: 1, limit: 8 });

  const [url] = fetch.mock.calls[0];
  expect(url).toContain('/api/restaurants?');
  expect(url).toContain('province=' + encodeURIComponent('เชียงใหม่'));
  expect(url).toContain('sort=rating');
  expect(url).not.toContain('cuisine');
});

test('มี token ต้องแนบ Authorization แบบ Bearer และ body ต้องเป็นข้อความ JSON', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { id: 7 }));
  const fields = { rating: 5, text: 'น้ำซุปเข้มข้นมาก เส้นเหนียวนุ่ม', authorName: 'สมชาย' };

  await postReview(1, fields, 'abc123');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/restaurants/1/reviews');
  expect(options.method).toBe('POST');
  expect(options.headers.Authorization).toBe('Bearer abc123');
  expect(options.headers['Content-Type']).toBe('application/json');
  expect(options.body).toBe(JSON.stringify(fields));
});

test('204 คืน null โดยไม่เรียก res.json()', async () => {
  const res = fakeResponse(204, null);
  res.json = jest.fn();                                   // ถ้าถูกเรียกแปลว่าโค้ดผิด
  fetch.mockResolvedValue(res);

  const data = await apiFetch('/api/wishlist/1', { method: 'DELETE', token: 'abc' });

  expect(data).toBeNull();
  expect(res.json).not.toHaveBeenCalled();
});

test('ไม่ใช่ 2xx ต้องโยน Error ที่มีข้อความจาก server และเลข status', async () => {
  fetch.mockResolvedValue(fakeResponse(401, { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }));

  await expect(login('a@b.c', 'wrong')).rejects.toThrow('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

  const err = await login('a@b.c', 'wrong').catch(e => e);
  expect(err.status).toBe(401);
});

test('server ตอบมาไม่ใช่ JSON (เช่น ลืมรัน mock) ต้องได้ข้อความที่เข้าใจได้ ไม่ใช่ SyntaxError', async () => {
  fetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.reject(new SyntaxError('Unexpected token <')) });

  await expect(apiFetch('/api/restaurants')).rejects.toThrow('server ไม่ได้ตอบเป็น JSON');
});
