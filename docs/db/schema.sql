-- FoodHub: สร้างตารางทั้งหมด (PostgreSQL 14+) รันครั้งเดียว: psql "$DATABASE_URL" -f docs/db/schema.sql
-- คำอธิบายและ ER diagram อยู่ใน docs/db-schema.md

BEGIN;

-- ---------- ข้อมูลอ้างอิง ----------
CREATE TABLE provinces (
  id        smallserial PRIMARY KEY,
  name_th   varchar(60) NOT NULL UNIQUE
);

CREATE TABLE cuisines (
  id        smallserial PRIMARY KEY,
  name      varchar(60) NOT NULL UNIQUE
);

-- ---------- สมาชิก ----------
CREATE TABLE members (
  id             bigserial PRIMARY KEY,
  email          varchar(255) NOT NULL,
  password_hash  varchar(100) NOT NULL,                       -- bcrypt ห้ามเก็บรหัสผ่านตรง ๆ
  display_name   varchar(60)  NOT NULL,
  role           varchar(10)  NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at     timestamptz  NOT NULL DEFAULT now(),
  updated_at     timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX members_email_uk ON members (lower(email));    -- อีเมลซ้ำไม่ได้ ไม่สนตัวพิมพ์

-- ---------- ร้านอาหาร ----------
CREATE TABLE restaurants (
  id             bigserial PRIMARY KEY,
  name           varchar(150) NOT NULL,
  name_th        varchar(150),
  cuisine_id     smallint     NOT NULL REFERENCES cuisines (id),
  province_id    smallint     NOT NULL REFERENCES provinces (id),
  district       varchar(80),
  address        varchar(255),
  description    text,
  phone          varchar(30),
  opening_hours  varchar(60),
  image_url      varchar(500),
  rating         numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),   -- ค่าเฉลี่ยจาก reviews (trigger ด้านล่างอัปเดตให้)
  review_count   integer      NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at     timestamptz  NOT NULL DEFAULT now(),
  updated_at     timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX restaurants_province_idx ON restaurants (province_id);       -- กรองตามจังหวัด
CREATE INDEX restaurants_cuisine_idx  ON restaurants (cuisine_id);        -- กรองตามประเภท
CREATE INDEX restaurants_rating_idx   ON restaurants (rating DESC, review_count DESC);   -- sort=rating
CREATE INDEX restaurants_created_idx  ON restaurants (created_at DESC);   -- sort=newest

-- เมนูแนะนำของร้าน (ใช้ค้นหา q และโชว์ในหน้ารายละเอียด)
CREATE TABLE restaurant_menu_items (
  restaurant_id  bigint       NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  position       smallint     NOT NULL,
  name           varchar(120) NOT NULL,
  PRIMARY KEY (restaurant_id, position)
);
CREATE INDEX menu_items_name_idx ON restaurant_menu_items (lower(name));

-- ---------- รีวิว ----------
CREATE TABLE reviews (
  id             bigserial PRIMARY KEY,
  restaurant_id  bigint      NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  member_id      bigint      NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  rating         smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text           text        NOT NULL CHECK (char_length(btrim(text)) >= 10),
  author_name    varchar(60) NOT NULL CHECK (char_length(btrim(author_name)) >= 1),   -- เก็บชื่อตอนรีวิว ตรงกับ authorName ใน API
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, restaurant_id)                                       -- รีวิวร้านเดียวกันได้คนละครั้ง (ซ้ำ = 409)
);
CREATE INDEX reviews_restaurant_idx ON reviews (restaurant_id, created_at DESC);

-- ---------- ร้านที่อยากไปกิน ----------
CREATE TABLE wishlist_items (
  member_id      bigint      NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  restaurant_id  bigint      NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  added_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, restaurant_id)                                  -- กดซ้ำไม่เพิ่มแถว (INSERT ... ON CONFLICT DO NOTHING)
);
CREATE INDEX wishlist_member_idx ON wishlist_items (member_id, added_at DESC);

-- ---------- คำนวณ rating / review_count ของร้านใหม่ทุกครั้งที่รีวิวเพิ่ม แก้ หรือลบ ----------
CREATE FUNCTION refresh_restaurant_rating() RETURNS trigger AS $$
DECLARE rid bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN rid := OLD.restaurant_id; ELSE rid := NEW.restaurant_id; END IF;
  UPDATE restaurants r
     SET rating       = COALESCE((SELECT round(avg(v.rating)::numeric, 1) FROM reviews v WHERE v.restaurant_id = rid), 0),
         review_count = (SELECT count(*) FROM reviews v WHERE v.restaurant_id = rid),
         updated_at   = now()
   WHERE r.id = rid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_refresh_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION refresh_restaurant_rating();

-- ---------- seed ข้อมูลอ้างอิง ----------
INSERT INTO provinces (name_th) VALUES
  ('กรุงเทพมหานคร'),
  ('กระบี่'),
  ('กาญจนบุรี'),
  ('กาฬสินธุ์'),
  ('กำแพงเพชร'),
  ('ขอนแก่น'),
  ('จันทบุรี'),
  ('ฉะเชิงเทรา'),
  ('ชลบุรี'),
  ('ชัยนาท'),
  ('ชัยภูมิ'),
  ('ชุมพร'),
  ('เชียงราย'),
  ('เชียงใหม่'),
  ('ตรัง'),
  ('ตราด'),
  ('ตาก'),
  ('นครนายก'),
  ('นครปฐม'),
  ('นครพนม'),
  ('นครราชสีมา'),
  ('นครศรีธรรมราช'),
  ('นครสวรรค์'),
  ('นนทบุรี'),
  ('นราธิวาส'),
  ('น่าน'),
  ('บึงกาฬ'),
  ('บุรีรัมย์'),
  ('ปทุมธานี'),
  ('ประจวบคีรีขันธ์'),
  ('ปราจีนบุรี'),
  ('ปัตตานี'),
  ('พระนครศรีอยุธยา'),
  ('พะเยา'),
  ('พังงา'),
  ('พัทลุง'),
  ('พิจิตร'),
  ('พิษณุโลก'),
  ('เพชรบุรี'),
  ('เพชรบูรณ์'),
  ('แพร่'),
  ('ภูเก็ต'),
  ('มหาสารคาม'),
  ('มุกดาหาร'),
  ('แม่ฮ่องสอน'),
  ('ยโสธร'),
  ('ยะลา'),
  ('ร้อยเอ็ด'),
  ('ระนอง'),
  ('ระยอง'),
  ('ราชบุรี'),
  ('ลพบุรี'),
  ('ลำปาง'),
  ('ลำพูน'),
  ('เลย'),
  ('ศรีสะเกษ'),
  ('สกลนคร'),
  ('สงขลา'),
  ('สตูล'),
  ('สมุทรปราการ'),
  ('สมุทรสงคราม'),
  ('สมุทรสาคร'),
  ('สระแก้ว'),
  ('สระบุรี'),
  ('สิงห์บุรี'),
  ('สุโขทัย'),
  ('สุพรรณบุรี'),
  ('สุราษฎร์ธานี'),
  ('สุรินทร์'),
  ('หนองคาย'),
  ('หนองบัวลำภู'),
  ('อ่างทอง'),
  ('อำนาจเจริญ'),
  ('อุดรธานี'),
  ('อุตรดิตถ์'),
  ('อุทัยธานี'),
  ('อุบลราชธานี');

INSERT INTO cuisines (name) VALUES
  ('ไทย'),
  ('ญี่ปุ่น'),
  ('อิตาเลียน'),
  ('คาเฟ่'),
  ('จีน'),
  ('ปิ้งย่าง'),
  ('อาหารทะเล');

COMMIT;
