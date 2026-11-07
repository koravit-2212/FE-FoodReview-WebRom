import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminStats } from '../../api/backend';
import { ErrorBox, Loading } from '../../components/admin/AdminStates';
import { dateTH, ratingText } from '../../utils/format';

// การ์ดตัวเลข 1 ใบ
function StatCard({ label, value, to }) {
  const body = (
    <>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </>
  );
  const cls = 'rounded-xl border border-slate-200 bg-white p-4';
  return to ? <Link to={to} className={cls + ' block hover:border-red-300'}>{body}</Link> : <div className={cls}>{body}</div>;
}

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getAdminStats(token);           // ยิงครั้งเดียว ได้ทุกตัวเลขของหน้านี้
        if (!ignore) { setStats(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="ร้านอาหาร" value={stats.restaurants} to="/admin/restaurants" />
        <StatCard label="รีวิว" value={stats.reviews} to="/admin/reviews" />
        <StatCard label="สมาชิก" value={stats.members} to="/admin/members" />
        <StatCard label="admin" value={stats.admins} />
        <StatCard label="อยากไปกิน" value={stats.wishlistItems} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">ร้านที่คะแนนสูงสุด</h2>
          <p className="text-xs text-slate-400">คะแนนเฉลี่ยจากรีวิวของสมาชิก</p>
          {stats.topRated.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีรีวิว</p>
          ) : (
            <ol className="mt-3 divide-y divide-slate-100">
              {stats.topRated.map((r, i) => (
                <li key={r.id} className="flex items-center gap-3 py-2">
                  <span className="w-5 text-sm text-slate-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/restaurants/${r.id}`} className="block truncate text-sm font-medium text-slate-900 hover:text-red-600">{r.name}</Link>
                    <p className="truncate text-xs text-slate-500">{r.cuisine}</p>
                  </div>
                  <span className="text-sm text-slate-600">{ratingText(r.rating, r.reviewCount)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">รีวิวล่าสุด</h2>
          {stats.latestReviews.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีรีวิว</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {stats.latestReviews.map(r => (
                <li key={r.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium text-slate-900">{r.restaurantName}</span>
                    <span className="text-xs text-slate-400">⭐ {r.rating}/5</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{r.authorName}: {r.text}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/reviews" className="mt-3 inline-block text-sm text-red-600 hover:underline">ดูรีวิวทั้งหมด</Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
          <h2 className="font-semibold text-slate-900">สมาชิกใหม่ล่าสุด</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {stats.newestMembers.map(m => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{m.displayName}</p>
                  <p className="truncate text-xs text-slate-500">{m.email}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {m.role === 'admin' && <span className="mr-2 rounded-full bg-red-100 px-2 py-0.5 text-red-700">admin</span>}
                  {dateTH(m.createdAt)}
                </div>
              </li>
            ))}
          </ul>
          <Link to="/admin/members" className="mt-3 inline-block text-sm text-red-600 hover:underline">ดูสมาชิกทั้งหมด</Link>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
