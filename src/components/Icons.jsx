// ไอคอน SVG เล็ก ๆ ใช้ซ้ำ (ไม่ต้องลงไลบรารี)
export function SearchIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" />
    </svg>
  );
}

export function PinIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function HeartIcon({ filled, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-9-9.2C2 8 4 5.5 6.8 5.5c1.8 0 3.2 1 5.2 3 2-2 3.4-3 5.2-3C20 5.5 22 8 21 11.3c-1.5 4.6-9 9.2-9 9.2Z" />
    </svg>
  );
}
