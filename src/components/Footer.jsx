function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <p>FoodJubb เว็บรีวิวร้านอาหาร โปรเจกต์ประกอบวิชา Client Side Web Programming</p>
        <p className="text-xs">สร้างด้วย React + Tailwind CSS ต่อ API ด้วย fetch</p>
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-8 text-xs leading-relaxed text-slate-500 md:px-6">
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
      </div>
    </footer>
  );
}

export default Footer;
