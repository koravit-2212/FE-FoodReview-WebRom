import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from './ReviewForm';

test('ยังไม่เลือกคะแนนและไม่พิมพ์อะไร ปุ่มส่งต้องกดไม่ได้', () => {
  render(<ReviewForm restaurantName="Ramen Taishoken" onSubmit={jest.fn()} />);

  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeDisabled();
});

test('เลือกคะแนน พิมพ์ แล้วกดส่ง ต้องเรียก onSubmit ด้วย rating กับ text แล้วขึ้นข้อความขอบคุณ', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockResolvedValue();          // แม่ปลอม: รับแล้วบอกว่าสำเร็จ
  render(<ReviewForm restaurantName="Ramen Taishoken" onSubmit={onSubmit} />);

  await user.click(screen.getByRole('button', { name: '5 ดาว' }));
  await user.type(screen.getByPlaceholderText(/กินแล้วรู้สึกอย่างไร/), 'น้ำซุปเข้มข้นมาก เส้นเหนียวนุ่ม');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(onSubmit).toHaveBeenCalledWith({ rating: 5, text: 'น้ำซุปเข้มข้นมาก เส้นเหนียวนุ่ม', photos: [] });   // ไม่แนบรูป = photos ว่าง
  expect(await screen.findByText(/ขอบคุณสำหรับรีวิว Ramen Taishoken/)).toBeInTheDocument();
});

test('ถ้า onSubmit โยน Error ต้องโชว์ข้อความนั้น และฟอร์มยังอยู่ให้แก้ต่อ', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockRejectedValue(new Error('รีวิวสั้นเกินไป'));   // แม่ปลอม: server ตอบ 400
  render(<ReviewForm restaurantName="Ramen Taishoken" onSubmit={onSubmit} />);

  await user.click(screen.getByRole('button', { name: '3 ดาว' }));
  await user.type(screen.getByPlaceholderText(/กินแล้วรู้สึกอย่างไร/), 'สั้นไป');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(await screen.findByText('รีวิวสั้นเกินไป')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeInTheDocument();   // ไม่ได้ไปหน้าขอบคุณ
  expect(screen.queryByText(/ขอบคุณสำหรับรีวิว/)).not.toBeInTheDocument();
});

test('มีปุ่มถ่ายรูปและเลือกรูป โดยช่องเปิดกล้องมี capture และช่องเลือกรูปเลือกได้หลายไฟล์', () => {
  render(<ReviewForm restaurantName="Ramen Taishoken" onSubmit={jest.fn()} />);

  expect(screen.getByRole('button', { name: /ถ่ายรูป/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /เลือกรูป/ })).toBeEnabled();
  expect(screen.getByText(/0\/3/)).toBeInTheDocument();
  expect(screen.getByTestId('camera-input')).toHaveAttribute('capture', 'environment');
  expect(screen.getByTestId('gallery-input')).toHaveAttribute('multiple');
});
