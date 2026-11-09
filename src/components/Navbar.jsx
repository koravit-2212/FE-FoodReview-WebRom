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
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <SearchIcon className="h-8 w-8 text-red-600 sm:h-9 sm:w-9" />
          <span className="text-lg text-slate-700 sm:text-xl">
            foodjubb<span className="text-red-600">.com</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:ml-auto md:justify-end">
          <NavLink to="/" end className={linkClass}>หน้าแรก</NavLink>
          <NavLink to="/restaurants" className={linkClass}>ร้านอาหาร</NavLink>
          {isLoggedIn && <NavLink to="/me/wishlist" className={linkClass}>อยากไปกิน</NavLink>}
          <NavLink to="/about" className={linkClass}>เกี่ยวกับ</NavLink>
          {isAdmin && <NavLink to="/admin" className={linkClass}>หลังบ้าน</NavLink>}
          {isLoggedIn ? (
            <>
              <span className="text-xs text-slate-500 sm:text-sm">สวัสดี {member?.displayName}</span>
              <button onClick={handleLogout} className="text-xs text-slate-600 hover:text-red-600 sm:text-sm">ออกจากระบบ</button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-xs text-slate-600 hover:text-red-600 sm:text-sm">สมัครสมาชิก</Link>
              <Link to="/login" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 sm:px-4 sm:text-sm">
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
