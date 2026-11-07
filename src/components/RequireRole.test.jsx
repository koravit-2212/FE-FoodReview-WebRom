import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import RequireRole from './RequireRole';

function AdminHome() { return <h1>หลังบ้าน</h1>; }
function LoginPage() { return <h1>หน้า Login</h1>; }

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<RequireRole role="admin"><AdminHome /></RequireRole>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => localStorage.clear());

test('Guest เข้าหลังบ้านไม่ได้ ถูกพาไปหน้า Login', () => {
  renderAt('/admin');

  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
});

test('Member เข้าหลังบ้านไม่ได้ ต้องเห็น 403', () => {
  localStorage.setItem('foodjubb.token', 'mock.1.abc');
  localStorage.setItem('foodjubb.member', JSON.stringify({ id: 1, displayName: 'Demo', role: 'member' }));

  renderAt('/admin');

  expect(screen.getByText('403')).toBeInTheDocument();
  expect(screen.queryByText('หลังบ้าน')).not.toBeInTheDocument();
});

test('Admin เข้าหลังบ้านได้', () => {
  localStorage.setItem('foodjubb.token', 'mock.2.abc');
  localStorage.setItem('foodjubb.member', JSON.stringify({ id: 2, displayName: 'Admin', role: 'admin' }));

  renderAt('/admin');

  expect(screen.getByRole('heading', { name: 'หลังบ้าน' })).toBeInTheDocument();
});
