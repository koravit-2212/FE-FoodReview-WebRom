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
        จัดทำเพื่อโปรเจค รายวิชา Client Side Web Programming และ Server Side Web Programming
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

      <h2 className="mt-8 text-lg font-semibold text-slate-900">แหล่งข้อมูล</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        ที่มาข้อมูล: การท่องเที่ยวแห่งประเทศไทย (ททท.), ชุดข้อมูลร้านอาหาร (restaurant.json), TAT Data Catalog,
        {' '}
        <a
          href="https://datacatalog.tat.or.th/dataset/6d8193a1-7187-4625-a22d-504ab69b427d"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline underline-offset-2"
        >
          https://datacatalog.tat.or.th/dataset/6d8193a1-7187-4625-a22d-504ab69b427d
        </a>
        {' '}
        สืบค้นเมื่อ 8 พฤศจิกายน 2569 คัดเลือกและจัดรูปแบบข้อมูลโดยผู้จัดทำ
      </p>
    </div>
  );
}

export default About;
