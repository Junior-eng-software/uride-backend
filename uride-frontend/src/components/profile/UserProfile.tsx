// src/components/profile/UserProfile.tsx
import { useEffect, useState } from 'react';
import { api } from '../../api/axiosClient';
import { AxiosError } from 'axios';
import './UserProfile.css';

// [CORRECCIÓN] Importamos Link junto con useNavigate
import { useNavigate, Link } from 'react-router-dom';

// ── Interfaz INTACTA ───────────────────────────────────────────────────
interface UserProfileData {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    isVerified: boolean;
}

// ── Helper: genera iniciales para el avatar ────────────────────────────
const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
};

export default function UserProfile() {
    const navigate = useNavigate();

    // ── useState INTACTOS ──────────────────────────────────────────────
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── useEffect y api.get INTACTOS ───────────────────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/me');
                setProfile(response.data);
            } catch (err) {
                if (err instanceof AxiosError && err.response?.status === 401) {
                    setError('Sesión expirada o no autorizada. El escudo del backend rechazó la petición.');
                } else {
                    setError('Ocurrió un error al cargar tu perfil.');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // ── Handler de logout [MEJORADO PARA SPA] ──────────────────────────
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login'); // Usamos navigate en lugar de recargar la página entera
    };

    // ── Estados de carga y error rediseñados ───────────────────────────
    if (isLoading) {
        return (
            <div className="up-app-shell">
                <aside className="up-sidebar">
                    <div className="up-sidebar-logo">
                        <div className="up-sidebar-logo-icon">
                            <i className="ti ti-car" aria-hidden="true"></i>
                        </div>
                        <span className="up-sidebar-logo-text">U-Ride</span>
                    </div>
                </aside>
                <main className="up-main">
                    <div className="up-skeleton-wrapper">
                        <div className="up-skeleton up-skeleton--avatar"></div>
                        <div className="up-skeleton up-skeleton--line"></div>
                        <div className="up-skeleton up-skeleton--line-short"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="up-app-shell">
                <aside className="up-sidebar">
                    <div className="up-sidebar-logo">
                        <div className="up-sidebar-logo-icon">
                            <i className="ti ti-car" aria-hidden="true"></i>
                        </div>
                        <span className="up-sidebar-logo-text">U-Ride</span>
                    </div>
                </aside>
                <main className="up-main">
                    <div className="up-error-card">
                        <i className="ti ti-shield-off" aria-hidden="true"></i>
                        <h3>Acceso denegado</h3>
                        <p>{error}</p>
                        <button className="up-btn-logout" onClick={handleLogout}>
                            <i className="ti ti-login" aria-hidden="true"></i>
                            Volver al inicio de sesión
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    if (!profile) return null;

    // ── JSX rediseñado pixel-perfect ───────────────────────────────────
    return (
        <div className="up-app-shell">

            {/* ── Sidebar ── */}
            <aside className="up-sidebar">
                <div className="up-sidebar-logo">
                    <div className="up-sidebar-logo-icon">
                        <i className="ti ti-car" aria-hidden="true"></i>
                    </div>
                    <span className="up-sidebar-logo-text">U-Ride</span>
                </div>

                <nav className="up-sidebar-nav">
                    {/* [CORRECCIÓN] Cambiamos <a> por <Link> y href por to */}
                    <Link to="/dashboard" className="up-nav-item">
                        <i className="ti ti-layout-dashboard" aria-hidden="true"></i>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/profile" className="up-nav-item up-nav-item--active">
                        <i className="ti ti-user-circle" aria-hidden="true"></i>
                        <span>Mi Perfil</span>
                    </Link>
                    <Link to="/trips" className="up-nav-item">
                        <i className="ti ti-route" aria-hidden="true"></i>
                        <span>Mis Viajes</span>
                    </Link>
                    <Link to="/messages" className="up-nav-item">
                        <i className="ti ti-message-circle" aria-hidden="true"></i>
                        <span>Mensajes</span>
                    </Link>
                </nav>
            </aside>

            {/* ── Contenido principal ── */}
            <main className="up-main">

                {/* Header */}
                <header className="up-main-header">
                    <h1 className="up-main-title">Mi Perfil Universitario</h1>
                    <div className="up-header-user">
                        <div className="up-header-avatar">
                            {getInitials(profile.fullName)}
                        </div>
                        <span className="up-header-name">
                            {profile.fullName.split(' ')[0]} {profile.fullName.split(' ')[2] ?? profile.fullName.split(' ')[1] ?? ''}
                        </span>
                    </div>
                </header>

                {/* Área de contenido centrada */}
                <div className="up-content-area">
                    <div className="up-profile-card">

                        {/* Avatar */}
                        <div className="up-avatar-wrapper">
                            <div className="up-avatar">
                                {getInitials(profile.fullName)}
                            </div>
                            {profile.isVerified && (
                                <div className="up-avatar-badge" title="Cuenta verificada">
                                    <i className="ti ti-check" aria-hidden="true"></i>
                                </div>
                            )}
                        </div>

                        {/* Nombre y universidad */}
                        <h2 className="up-profile-name">{profile.fullName}</h2>
                        <p className="up-profile-university">
                            Universidad Técnica de Ambato (UTA)
                        </p>

                        {/* Badge de verificación */}
                        <div className={`up-verify-badge ${profile.isVerified ? 'up-verify-badge--ok' : 'up-verify-badge--pending'}`}>
                            <i className={`ti ${profile.isVerified ? 'ti-shield-check' : 'ti-shield-exclamation'}`} aria-hidden="true"></i>
                            {profile.isVerified ? 'Cuenta Verificada' : 'Verificación Pendiente'}
                        </div>

                        {/* Separador */}
                        <div className="up-card-divider"></div>

                        {/* Datos del perfil */}
                        <div className="up-profile-info">
                            <div className="up-info-row">
                                <div className="up-info-icon">
                                    <i className="ti ti-mail" aria-hidden="true"></i>
                                </div>
                                <div className="up-info-content">
                                    <span className="up-info-label">Correo</span>
                                    <span className="up-info-value">{profile.email}</span>
                                </div>
                            </div>

                            <div className="up-info-row">
                                <div className="up-info-icon">
                                    <i className="ti ti-phone" aria-hidden="true"></i>
                                </div>
                                <div className="up-info-content">
                                    <span className="up-info-label">Teléfono</span>
                                    <span className="up-info-value">
                                        {profile.phone ?? (
                                            <span className="up-info-empty">No registrado</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="up-info-row">
                                <div className="up-info-icon">
                                    <i className="ti ti-id-badge" aria-hidden="true"></i>
                                </div>
                                <div className="up-info-content">
                                    <span className="up-info-label">ID de cuenta</span>
                                    <span className="up-info-value up-info-value--mono">
                                        {profile.id.slice(0, 8).toUpperCase()}...
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="up-card-divider"></div>

                        {/* Acciones */}
                        <div className="up-card-actions">
                            {/* [CORRECCIÓN] Cambiamos <a> por <Link> */}
                            <Link to="/profile/edit" className="up-btn-edit">
                                <i className="ti ti-edit" aria-hidden="true"></i>
                                Editar Perfil
                            </Link>
                            <button className="up-btn-logout" onClick={handleLogout}>
                                <i className="ti ti-logout" aria-hidden="true"></i>
                                Cerrar Sesión
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}