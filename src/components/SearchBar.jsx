import { PROVINCES } from '../data/data';
import { PinIcon, SearchIcon } from './Icons';

// แถบค้นหาสีขาวมุมมน: เลือกจังหวัด | พิมพ์ชื่อร้านหรือเมนู | ปุ่มค้นหาสีแดง (ใช้ทั้งหน้าแรกและหน้าร้านทั้งหมด)
// เป็น controlled component: ค่าอยู่ที่แม่ แม่ส่ง onProvince / onQuery / onSubmit มา
function SearchBar({ province, query, onProvince, onQuery, onSubmit }) {
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.();
  }

  return (
    <form onSubmit={handleSubmit} role="search"
          className="flex w-full overflow-hidden rounded-xl bg-white shadow-lg">
      <label className="flex shrink-0 items-center gap-2 border-r border-slate-200 pl-4 pr-2 text-slate-700">
        <PinIcon className="h-5 w-5 text-red-600" />
        <select value={province} onChange={(e) => onProvince(e.target.value)} aria-label="จังหวัด"
                className="w-28 bg-transparent py-3.5 text-sm focus:outline-none sm:w-40 sm:text-base">
          <option value="all">ทุกจังหวัด</option>
          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <input value={query} onChange={(e) => onQuery(e.target.value)}
             placeholder="ชื่อร้านหรือเมนู เช่น ราเมน"
             className="min-w-0 flex-1 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:text-base" />
      <button type="submit" aria-label="ค้นหา" className="grid w-14 shrink-0 place-items-center bg-red-600 text-white hover:bg-red-700">
        <SearchIcon className="h-6 w-6" />
      </button>
    </form>
  );
}

export default SearchBar;
