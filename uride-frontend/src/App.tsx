import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/auth/RegisterForm';
import VerifyAccountForm from './components/auth/VerifyAccountForm';
import LoginForm from './components/auth/LoginForm';
import UserProfile from './components/profile/UserProfile';
import EditProfileForm from './components/profile/EditProfileForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import type { ReactNode } from 'react';

// 1. [CRÍTICO] Creamos un "Guardián" que lee el token en tiempo real
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuth = !!localStorage.getItem('accessToken');
  return isAuth ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ─── RUTAS PÚBLICAS ─── */}
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verify" element={<VerifyAccountForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />


        {/* ─── RUTAS PROTEGIDAS ─── */}
        {/* 2. Envolvemos nuestras pantallas privadas con el Guardián */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfileForm />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}