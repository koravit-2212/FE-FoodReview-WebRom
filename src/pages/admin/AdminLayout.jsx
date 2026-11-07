import { NavLink, Outlet } from 'react-router-dom';

const tabClass = ({ isActive }) =>
  'rounded-full px-4 py-1.5 text-sm transition ' +
  (isActive ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-red-50');

function AdminLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
        <h1 className="mr-2 text-xl font-semibold text-slate-900">หลังบ้าน FoodHub</h1>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/admin" end className={tabClass}>ภาพรวม</NavLink>
          <NavLink to="/admin/restaurants" className={tabClass}>ร้านอาหาร</NavLink>
          <NavLink to="/admin/reviews" className={tabClass}>รีวิว</NavLink>
          <NavLink to="/admin/members" className={tabClass}>สมาชิก</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

export default AdminLayout;
