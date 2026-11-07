import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminRestaurantForm from './pages/admin/AdminRestaurantForm';
import AdminReviews from './pages/admin/AdminReviews';
import AdminMembers from './pages/admin/AdminMembers';

function App() {
  return (
    // AuthProvider ครอบทั้งแอป ทุกหน้าข้างในจึงเรียก useAuth() ได้
    <AuthProvider>
      {/* พื้นหลังแดง + กรอบขาวมุมมนครอบทั้งเว็บ */}
      <div className="min-h-screen bg-red-600 p-3 md:p-8">
       <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* ส่วน Guest: ใครก็เข้าได้ */}
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            {/* ส่วน Member: ต้อง login */}
            <Route path="/me/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            {/* ส่วน Admin: ครอบทั้งกิ่งด้วย RequireRole ครั้งเดียว หน้าลูกทุกหน้าได้รับการป้องกันหมด */}
            <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
              <Route index element={<AdminDashboard />} />
              <Route path="restaurants" element={<AdminRestaurants />} />
              <Route path="restaurants/new" element={<AdminRestaurantForm />} />
              <Route path="restaurants/:id" element={<AdminRestaurantForm />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="members" element={<AdminMembers />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
       </div>
      </div>
    </AuthProvider>
  );
}

export default App;
