import RestaurantCard from './RestaurantCard';

// วาดรายการร้านตาม "สถานะ" 3 แบบ: loading | error | success (สำเร็จแต่ว่างเปล่าก็เป็น success)
function RestaurantGrid({ restaurants, status, error, onRetry, onWishlistChange, showHeart = true,
                          emptyText = 'ไม่พบร้านที่ค้นหา ลองคำอื่นหรือเปลี่ยนจังหวัดดู' }) {
  const gridClass = 'grid gap-5 md:grid-cols-2';

  if (status === 'loading') {
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 p-2">
            <div className="h-24 w-24 shrink-0 rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-medium text-red-700">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="mt-1 text-sm text-red-500">{error?.message}</p>
        {onRetry && (
          <button onClick={onRetry}
                  className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-100">
            ลองใหม่
          </button>
        )}
      </div>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return <p className="py-16 text-center text-slate-400">{emptyText}</p>;
  }

  return (
    <div className={gridClass}>
      {restaurants.map(r => (
        <RestaurantCard key={r.id} restaurant={r} showHeart={showHeart} onWishlistChange={onWishlistChange} />
      ))}
    </div>
  );
}

export default RestaurantGrid;
