import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { SearchIcon } from './Icons';

const linkClass = ({ isActive }) =>
  'text-sm transition ' + (isActive ? 'font-medium text-red-600' : 'text-slate-600 hover:text-red-600');

function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();  // Navbar รู้สถานะ login ได้โดยไม่ต้องรับ props จากใคร
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-5 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <SearchIcon className="h-9 w-9 text-red-600" />
          <span className="text-xl text-slate-700">
            foodjubb<span className="text-red-600">.com</span>
          </span>
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
          <NavLink to="/" end className={linkClass}>หน้าแรก</NavLink>
          <NavLink to="/restaurants" className={linkClass}>ร้านอาหาร</NavLink>
          {/* เมนูเฉพาะสมาชิก: Guest ไม่เห็น */}
          {isLoggedIn && <NavLink to="/me/wishlist" className={linkClass}>อยากไปกิน</NavLink>}
          <NavLink to="/about" className={linkClass}>เกี่ยวกับ</NavLink>
          {isAdmin && <NavLink to="/admin" className={linkClass}>หลังบ้าน</NavLink>}
          {isLoggedIn ? (
            <>
              <span className="text-sm text-slate-500">สวัสดี {member?.displayName}</span>
              <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-red-600">ออกจากระบบ</button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-sm text-slate-600 hover:text-red-600">สมัครสมาชิก</Link>
              <Link to="/login" className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700">
                เข้าสู่ระบบ
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
