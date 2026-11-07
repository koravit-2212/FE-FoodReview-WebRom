import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Login() {
  const [email, setEmail] = useState('demo@foodjubb.test');   // บัญชีทดลองของ mock
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');             // 'typing' | 'submitting'
  const location = useLocation();
  const { login } = useAuth();                                // ดึงฟังก์ชัน login() จาก context
  const navigate = useNavigate();                             // ใช้สำหรับเปลี่ยนหน้า
  const from = location.state?.from || '/';                   // ProtectedRoute ส่งมาบอกว่าเดิมจะไปไหน

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await login(email, password);                // POST /api/auth/login + จำ token
      navigate(from);                              // กลับไปหน้าที่ตั้งใจจะไปตอนแรก
    } catch (err) {
      setError(err.message);                       // ข้อความ 401 จาก server
      setStatus('typing');
    }
  }

  const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100';

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-semibold text-slate-900">เข้าสู่ระบบ</h1>
      <p className="mt-1 text-sm text-slate-500">
        ทดลองด้วย demo@foodjubb.test / 1234 (สมาชิก) หรือ admin@foodjubb.test / 1234 (ผู้ดูแล) หรือสมัครใหม่
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" required className={input} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" required className={input} />
        <button type="submit" disabled={status === 'submitting'}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-300">
          {status === 'submitting' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <p className="mt-6 text-sm text-slate-500">
        ยังไม่มีบัญชี? <Link to="/register" className="text-red-600 hover:underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}

export default Login;
