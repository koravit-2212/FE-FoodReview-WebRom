import { useState } from 'react';

// ฟอร์มรีวิว state 4 ตัว (rating, text, error, status)
// ไม่จำลอง server เอง: รับฟังก์ชัน onSubmit({ rating, text }) จากแม่ ซึ่งจะไปยิง POST จริง
function ReviewForm({ restaurantName, onSubmit }) {
  const [rating, setRating] = useState(0);            // 0 = ยังไม่เลือก
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');     // 'typing' | 'submitting' | 'success'

  if (status === 'success') {
    return <p className="rounded-lg bg-red-50 p-4 text-red-700">ขอบคุณสำหรับรีวิว {restaurantName} 🎉</p>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit({ rating, text });             // แม่เป็นคนรู้ว่าจะส่งไปที่ไหน ฟอร์มไม่ต้องรู้
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);                                // ข้อความ 400 / 401 / 409 จาก server
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-slate-900">เขียนรีวิว {restaurantName}</h3>
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-500">ให้คะแนน</span>
        {[1, 2, 3, 4, 5].map(n => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} ดาว`}
                  className={'h-8 w-8 rounded-lg border text-sm ' +
                    (rating === n ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-red-50')}>
            {n}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
                disabled={status === 'submitting'} rows={3}
                placeholder="กินแล้วรู้สึกอย่างไร (อย่างน้อย 10 ตัวอักษร)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:bg-slate-50" />
      <div className="flex items-center gap-3">
        <button type="submit"
                disabled={rating === 0 || text.trim().length === 0 || status === 'submitting'}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-300">
          {status === 'submitting' ? 'กำลังส่ง...' : 'ส่งรีวิว'}
        </button>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    </form>
  );
}

export default ReviewForm;
