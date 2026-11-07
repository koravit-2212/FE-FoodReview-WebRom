function About() {
  const rows = [
    ['Guest (ยังไม่ login)', 'ดูรายการร้าน ค้นหา กรอง เรียงลำดับ และอ่านรีวิวได้'],
    ['Member (สมัครสมาชิก)', 'ทำได้ทุกอย่างของ Guest และเขียนรีวิว ให้คะแนน เก็บร้านที่อยากไปกิน'],
    ['Admin (ผู้ดูแล)', 'จัดการร้านอาหาร ลบรีวิวที่ไม่เหมาะสม และกำหนดบทบาทสมาชิกในหลังบ้าน'],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">เกี่ยวกับ FoodJubb</h1>
      <p className="mt-3 leading-relaxed text-slate-600">
        FoodJubb เป็นเว็บรีวิวร้านอาหาร สร้างด้วย React และ Tailwind CSS ดึงข้อมูลจาก Backend ผ่าน fetch (JSON)
        โครงสร้างโปรเจกต์ทำตามแบบ MovieHub ของวิชา Client Side Web Programming
      </p>
      <h2 className="mt-8 text-lg font-semibold text-slate-900">ผู้ใช้ 3 แบบ</h2>
      <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {rows.map(([who, what]) => (
          <li key={who} className="px-4 py-3">
            <p className="font-medium text-slate-900">{who}</p>
            <p className="text-sm text-slate-600">{what}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default About;
