import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewList from './ReviewList';

const items = [
  { id: 1, rating: 5, text: 'รีวิวของฉันเอง อร่อยมาก', authorName: 'Demo', createdAt: '2026-11-01T12:30:00Z', photos: [], isMine: true },
  { id: 2, rating: 4, text: 'รีวิวของคนอื่น ก็อร่อย', authorName: 'มานี', createdAt: '2026-11-02T12:30:00Z', photos: [], isMine: false },
];

test('ปุ่มลบโชว์เฉพาะรีวิวของตัวเอง ไม่โชว์ในรีวิวของคนอื่น', () => {
  render(<ReviewList items={items} onDelete={jest.fn()} />);

  expect(screen.getAllByRole('button', { name: 'ลบรีวิวของฉัน' })).toHaveLength(1);
  expect(screen.getByText('รีวิวของคุณ')).toBeInTheDocument();
});

test('Guest (ไม่ส่ง onDelete) ไม่เห็นปุ่มลบเลย แม้ข้อมูลจะมี isMine', () => {
  render(<ReviewList items={items} />);

  expect(screen.queryByRole('button', { name: 'ลบรีวิวของฉัน' })).not.toBeInTheDocument();
});

test('กดลบต้องถามยืนยันก่อน แล้วเรียก onDelete ด้วยเลขของรีวิวนั้น', async () => {
  const user = userEvent.setup();
  const onDelete = jest.fn().mockResolvedValue();
  render(<ReviewList items={items} onDelete={onDelete} />);

  await user.click(screen.getByRole('button', { name: 'ลบรีวิวของฉัน' }));
  expect(onDelete).not.toHaveBeenCalled();                       // แค่กดครั้งแรก ยังไม่ลบ

  await user.click(screen.getByRole('button', { name: 'ยืนยันลบ' }));
  expect(onDelete).toHaveBeenCalledWith(1);
});

test('กดยกเลิกแล้วไม่ลบ', async () => {
  const user = userEvent.setup();
  const onDelete = jest.fn();
  render(<ReviewList items={items} onDelete={onDelete} />);

  await user.click(screen.getByRole('button', { name: 'ลบรีวิวของฉัน' }));
  await user.click(screen.getByRole('button', { name: 'ยกเลิก' }));

  expect(onDelete).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'ลบรีวิวของฉัน' })).toBeInTheDocument();
});

test('ถ้าลบไม่สำเร็จ (เช่น server ตอบ 403) ต้องโชว์ข้อความนั้น', async () => {
  const user = userEvent.setup();
  const onDelete = jest.fn().mockRejectedValue(new Error('ลบได้เฉพาะรีวิวของตัวเอง'));
  render(<ReviewList items={items} onDelete={onDelete} />);

  await user.click(screen.getByRole('button', { name: 'ลบรีวิวของฉัน' }));
  await user.click(screen.getByRole('button', { name: 'ยืนยันลบ' }));

  expect(await screen.findByText('ลบได้เฉพาะรีวิวของตัวเอง')).toBeInTheDocument();
});
