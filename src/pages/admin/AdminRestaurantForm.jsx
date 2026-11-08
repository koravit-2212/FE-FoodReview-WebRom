import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminRestaurant, createRestaurant, updateRestaurant, deleteRestaurant } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, btnPrimary, btnDanger, inputClass } from '../../components/admin/AdminStates';
import { CUISINES, PROVINCES } from '../../data/data';
import RestaurantImage from '../../components/RestaurantImage';

// ฟอร์มเดียวใช้ 2 โหมด: ไม่มี :id = เพิ่มร้านใหม่, มี :id = แก้ไข (โหลดค่าเดิมมาใส่ก่อน)
// ฟอร์มเช็กข้อมูลชั้นแรกให้ผู้ใช้เห็นเร็ว แต่ backend เช็กซ้ำทุกครั้ง เพราะฟอร์มนี้ข้ามได้ด้วย curl

const EMPTY = {
  name: '', nameTh: '', cuisines: '', province: '', district: '',
  description: '', address: '', phone: '', openingHours: '', menu: '',
  image: '', imageCredit: '', googleMapsLink: '', facebook: '',
};

// ประเภทอาหารในฟอร์มเป็นข้อความคั่นด้วยจุลภาค (ตัวแรกคือประเภทหลัก) แปลงเป็น array ตอนส่ง
const splitList = (text) => text.split(',').map(s => s.trim()).filter(Boolean);
const isHttp = (url) => /^https?:\/\//.test(url.trim());

// ตรวจชั้นแรกในเบราว์เซอร์ (กติกาเดียวกับที่ backend ตรวจ)
function validate(f) {
  const errs = {};
  if (!f.name.trim()) errs.name = 'ต้องมีชื่อร้าน';
  if (splitList(f.cuisines).length === 0) errs.cuisines = 'ต้องระบุประเภทอาหารอย่างน้อย 1 ประเภท';
  if (!PROVINCES.includes(f.province)) errs.province = 'ต้องเลือกจังหวัด';
  if (f.image && !isHttp(f.image)) errs.image = 'ต้องขึ้นต้นด้วย http:// หรือ https://';
  if (f.googleMapsLink && !isHttp(f.googleMapsLink)) errs.googleMapsLink = 'ต้องขึ้นต้นด้วย http:// หรือ https://';
  if (f.facebook && !isHttp(f.facebook)) errs.facebook = 'ต้องขึ้นต้นด้วย http:// หรือ https://';
  return errs;
}

// แปลงค่าจากฟอร์ม (string ทั้งหมด) เป็น JSON ที่ backend ต้องการ (ว่าง = null, cuisines = array)
function toPayload(f) {
  const nz = (s) => (s && s.trim() ? s.trim() : null);
  const cuisines = splitList(f.cuisines);
  return {
    name: f.name.trim(),
    nameTh: nz(f.nameTh),
    cuisine: cuisines[0],          // ประเภทหลักตัวเดียว ไว้ให้ backend รุ่นเก่าที่ยังไม่รู้จัก cuisines
    cuisines,
    province: f.province,
    district: nz(f.district),
    description: nz(f.description),
    address: nz(f.address),
    phone: nz(f.phone),
    openingHours: nz(f.openingHours),
    menu: nz(f.menu),
    image: nz(f.image),
    imageCredit: nz(f.imageCredit),
    googleMapsLink: nz(f.googleMapsLink),
    facebook: nz(f.facebook),
  };
}

function AdminRestaurantForm() {
  const { id } = useParams();                       // undefined = โหมดเพิ่ม
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [impact, setImpact] = useState(null);       // จำนวนรีวิว/wishlist ที่จะหายถ้าลบ
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready');   // 'loading' | 'ready' | 'error'
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});         // error รายช่องจากการเช็กในเบราว์เซอร์
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // โหมดแก้ไข: โหลดค่าเดิมของร้านมาใส่ฟอร์ม
  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const r = await getAdminRestaurant(id, token);
        if (ignore) return;
        setForm({
          name: r.name ?? '', nameTh: r.nameTh ?? '',
          cuisines: (r.cuisines?.length ? r.cuisines : [r.cuisine].filter(Boolean)).join(', '),
          province: r.province ?? '', district: r.district ?? '',
          description: r.description ?? '', address: r.address ?? '', phone: r.phone ?? '',
          openingHours: r.openingHours ?? '',
          menu: Array.isArray(r.menu) ? r.menu.join(', ') : (r.menu ?? ''),
          image: r.images?.[0] ?? '', imageCredit: r.imageCredit ?? '',
          googleMapsLink: r.googleMapsLink ?? '', facebook: r.facebook ?? '',
        });
        setImpact(r.impact);
        setStatus('ready');
      } catch (err) {
        if (!ignore) { setLoadError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, isEdit, token]);

  // ช่องเดียวเปลี่ยน ก็สร้าง object ใหม่ที่ก็อปของเดิมแล้วทับช่องนั้น (ไม่แก้ state ตรง ๆ)
  function set(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value });
      setSaved(false);
    };
  }

  // กดปุ่มประเภทเพื่อเพิ่ม/เอาออกจากรายการ
  function toggleCuisine(name) {
    const list = splitList(form.cuisines);
    const next = list.includes(name) ? list.filter(c => c !== name) : [...list, name];
    setForm({ ...form, cuisines: next.join(', ') });
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;      // ยังไม่ยิง server ถ้าชั้นแรกไม่ผ่าน

    setSaving(true);
    setServerError(null);
    try {
      if (isEdit) {
        const r = await updateRestaurant(id, toPayload(form), token);
        setImpact(r.impact);
        setSaved(true);
      } else {
        const r = await createRestaurant(toPayload(form), token);
        navigate(`/admin/restaurants/${r.id}`, { replace: true });   // เพิ่มเสร็จ ไปต่อที่หน้าแก้ไขของร้านนั้น
      }
    } catch (err) {
      setServerError(err.message);                 // 400 ช่องไหนผิด ข้อความมาจาก backend
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteRestaurant(id, token);
      navigate('/admin/restaurants', { replace: true });
    } catch (err) {
      setServerError(err.message);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={loadError} />;

  const label = 'block text-sm font-medium text-slate-700';
  const fieldErr = (k) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{isEdit ? `แก้ไขร้าน #${id}` : 'เพิ่มร้านใหม่'}</h2>
        <Link to="/admin/restaurants" className="text-sm text-red-600 hover:underline">กลับรายการ</Link>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-6 md:grid-cols-[1fr_220px]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>ชื่อร้าน *</label>
              <input value={form.name} onChange={set('name')} className={inputClass} />
              {fieldErr('name')}
            </div>
            <div>
              <label className={label}>ชื่อไทย</label>
              <input value={form.nameTh} onChange={set('nameTh')} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={label}>ประเภทอาหาร * (คั่นด้วยจุลภาค ตัวแรกคือประเภทหลัก)</label>
              <input value={form.cuisines} onChange={set('cuisines')} placeholder="เช่น ไทย, ของหวาน" className={inputClass} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CUISINES.map(c => {
                  const on = splitList(form.cuisines).includes(c);
                  return (
                    <button type="button" key={c} onClick={() => toggleCuisine(c)}
                            className={'rounded-full border px-2.5 py-0.5 text-xs ' +
                              (on ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-red-50')}>
                      {c}
                    </button>
                  );
                })}
              </div>
              {fieldErr('cuisines')}
            </div>
            <div>
              <label className={label}>จังหวัด *</label>
              <select value={form.province} onChange={set('province')} className={inputClass}>
                <option value="">เลือกจังหวัด</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {fieldErr('province')}
            </div>
            <div>
              <label className={label}>ย่าน</label>
              <input value={form.district} onChange={set('district')} className={inputClass} />
            </div>
            <div>
              <label className={label}>เบอร์โทร</label>
              <input value={form.phone} onChange={set('phone')} className={inputClass} />
            </div>
            <div>
              <label className={label}>เวลาเปิด</label>
              <input value={form.openingHours} onChange={set('openingHours')} placeholder="เช่น 10:00-21:00" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={label}>ที่อยู่</label>
            <input value={form.address} onChange={set('address')} className={inputClass} />
          </div>
          <div>
            <label className={label}>คำอธิบาย</label>
            <textarea value={form.description} onChange={set('description')} rows={3} className={inputClass} />
          </div>
          <div>
            <label className={label}>เมนูแนะนำ</label>
            <input value={form.menu} onChange={set('menu')} placeholder="เช่น ราเมน เกี๊ยวซ่า" className={inputClass} />
          </div>
          <div>
            <label className={label}>รูปภาพ (URL)</label>
            <input value={form.image} onChange={set('image')} placeholder="https://..." className={inputClass} />
            {fieldErr('image')}
          </div>
          <div>
            <label className={label}>ที่มาของรูป (เครดิต)</label>
            <input value={form.imageCredit} onChange={set('imageCredit')} className={inputClass} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>ลิงก์ Google Maps</label>
              <input value={form.googleMapsLink} onChange={set('googleMapsLink')} placeholder="https://..." className={inputClass} />
              {fieldErr('googleMapsLink')}
            </div>
            <div>
              <label className={label}>ลิงก์ Facebook</label>
              <input value={form.facebook} onChange={set('facebook')} placeholder="https://..." className={inputClass} />
              {fieldErr('facebook')}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มร้าน'}
            </button>
            {isEdit && (
              <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>ลบร้านนี้</button>
            )}
            {saved && <span className="text-sm text-red-600">บันทึกแล้ว</span>}
            {serverError && <span className="text-sm text-red-600">{serverError}</span>}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <RestaurantImage src={form.image.trim().startsWith('http') ? form.image.trim() : null} alt="ตัวอย่างรูปร้าน"
                             cuisine={splitList(form.cuisines)[0]} className="aspect-[4/3] w-full object-cover" />
            <p className="p-2 text-center text-xs text-slate-400">ตัวอย่างรูปร้าน</p>
          </div>
          {impact && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <p className="font-medium text-slate-900">ข้อมูลที่ผูกกับร้านนี้</p>
              <ul className="mt-1 space-y-0.5">
                <li>รีวิว {impact.reviews}</li>
                <li>อยากไปกิน {impact.wishlist}</li>
              </ul>
            </div>
          )}
        </aside>
      </form>

      <ConfirmBox open={confirmDelete} title={`ลบ "${form.name}" ?`} confirmText="ลบถาวร"
                  busy={deleting} onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)}>
        {impact && (impact.reviews + impact.wishlist > 0) ? (
          <p>รีวิว {impact.reviews} รายการ และรายการอยากไปกิน {impact.wishlist} รายการของสมาชิกจะถูกลบตามไปด้วย ย้อนกลับไม่ได้</p>
        ) : (
          <p>ยังไม่มีสมาชิกคนไหนรีวิวหรือเก็บร้านนี้ไว้ ลบได้โดยไม่กระทบใคร</p>
        )}
      </ConfirmBox>
    </div>
  );
}

export default AdminRestaurantForm;
