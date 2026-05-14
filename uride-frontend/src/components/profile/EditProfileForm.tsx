// src/components/profile/EditProfileForm.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axiosClient';
import { AxiosError } from 'axios';
import './EditProfileForm.css';

import { useNavigate, Link } from 'react-router-dom';

// ── Schema Zod INTACTO ─────────────────────────────────────────────────
const editProfileSchema = z.object({
    fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string()
        .email('Formato inválido')
        .endsWith('@uta.edu.ec', 'Recuerda usar tu dominio institucional (@uta.edu.ec)'),
    phone: z.string().optional()
});

type EditProfileData = z.infer<typeof editProfileSchema>;

// ── Helper: iniciales para el avatar ──────────────────────────────────
const getInitials = (name: string): string => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0]?.slice(0, 2).toUpperCase() ?? 'U';
};

export default function EditProfileForm() {
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ── Estado adicional solo para UI (nombre cargado para el avatar) ──
    const [loadedName, setLoadedName] = useState('');

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditProfileData>({
        resolver: zodResolver(editProfileSchema)
    });

    // ── useEffect INTACTO ──────────────────────────────────────────────
    useEffect(() => {
        api.get('/users/me')
            .then(res => {
                setValue('fullName', res.data.fullName);
                setValue('email', res.data.email);
                setValue('phone', res.data.phone || '');
                setLoadedName(res.data.fullName);
            })
            .catch(() => {
                setStatusMessage({ type: 'error', text: 'No se pudieron cargar tus datos actuales.' });
            });
    }, [setValue]);

    // ── onSubmit MODIFICADO PARA REDIRECCIÓN ───────────────────────────
    const onSubmit = async (data: EditProfileData) => {
        setIsLoading(true);
        setStatusMessage(null);

        try {
            const response = await api.put('/users/me', data);
            if (response.status === 200) {
                setLoadedName(data.fullName);

                // Verificamos si el backend exige re-verificación por cambio de correo
                if (response.data.message.includes('re-verificación')) {
                    setStatusMessage({
                        type: 'success',
                        text: 'Correo actualizado. Por seguridad, tu sesión se cerrará. Redirigiendo a verificación...'
                    });

                    setTimeout(() => {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        // Redirigimos explícitamente a la pantalla de verificación
                        navigate('/verify');
                    }, 3000);
                } else {
                    // Si no hubo cambio de correo, mensaje normal
                    setStatusMessage({ type: 'success', text: response.data.message });
                }
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                setStatusMessage({ type: 'error', text: error.response.data.message || 'Error al actualizar.' });
            } else {
                setStatusMessage({ type: 'error', text: 'Error de conexión.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── Nombre en tiempo real para el avatar ───────────────────────────
    const watchedName = watch('fullName') || loadedName;

    // ── JSX rediseñado ─────────────────────────────────────────────────
    return (
        <div className="ep-app-shell">
            {/* ── Sidebar ── */}
            <aside className="ep-sidebar">
                <div className="ep-sidebar-logo">
                    <div className="ep-sidebar-logo-icon">
                        <i className="ti ti-car" aria-hidden="true"></i>
                    </div>
                    <span className="ep-sidebar-logo-text">U-Ride</span>
                </div>

                <nav className="ep-sidebar-nav">
                    <Link to="/dashboard" className="ep-nav-item">
                        <i className="ti ti-layout-dashboard" aria-hidden="true"></i>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/profile" className="ep-nav-item ep-nav-item--active">
                        <i className="ti ti-user-circle" aria-hidden="true"></i>
                        <span>Mi Perfil</span>
                    </Link>
                    <Link to="/trips" className="ep-nav-item">
                        <i className="ti ti-route" aria-hidden="true"></i>
                        <span>Mis Viajes</span>
                    </Link>
                    <Link to="/messages" className="ep-nav-item">
                        <i className="ti ti-message-circle" aria-hidden="true"></i>
                        <span>Mensajes</span>
                    </Link>
                </nav>
            </aside>

            {/* ── Contenido principal ── */}
            <main className="ep-main">
                {/* Header */}
                <header className="ep-main-header">
                    <div className="ep-header-breadcrumb">
                        <Link to="/profile" className="ep-breadcrumb-back">
                            <i className="ti ti-arrow-left" aria-hidden="true"></i>
                        </Link>
                        <h1 className="ep-main-title">Editar Perfil</h1>
                    </div>
                    <div className="ep-header-user">
                        <div className="ep-header-avatar">
                            {watchedName ? getInitials(watchedName) : 'U'}
                        </div>
                        <span className="ep-header-name">
                            {watchedName?.split(' ')[0] ?? 'Usuario'}
                        </span>
                    </div>
                </header>

                {/* Área de contenido */}
                <div className="ep-content-area">
                    <div className="ep-profile-card">
                        <Link to="/profile" className="ep-card-cancel-btn" title="Cancelar edición">
                            <i className="ti ti-x" aria-hidden="true"></i>
                        </Link>

                        <div className="ep-avatar-wrapper">
                            <div className="ep-avatar">
                                {watchedName ? getInitials(watchedName) : 'U'}
                            </div>
                            <div className="ep-avatar-edit-ring" title="El avatar se actualiza con tu nombre">
                                <i className="ti ti-pencil" aria-hidden="true"></i>
                            </div>
                        </div>

                        <p className="ep-card-subtitle">
                            Actualiza tu información de cuenta
                        </p>
                        <p className="ep-card-university">
                            Universidad Técnica de Ambato (UTA)
                        </p>

                        <div className="ep-warning-banner">
                            <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                            <span>
                                Si cambias tu <strong>correo</strong>, deberás volver a verificar tu cuenta.
                                Tu sesión se cerrará automáticamente.
                            </span>
                        </div>

                        {statusMessage && (
                            <div className={`ep-status-alert ep-status-alert--${statusMessage.type}`}>
                                <i className={`ti ${statusMessage.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} aria-hidden="true"></i>
                                <span>{statusMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="ep-form" noValidate>
                            {/* Nombre Completo */}
                            <div className="ep-field-group">
                                <label className="ep-field-label">
                                    <div className="ep-field-label-icon">
                                        <i className="ti ti-user" aria-hidden="true"></i>
                                    </div>
                                    Nombre Completo
                                </label>
                                <div className={`ep-field-wrapper ${errors.fullName ? 'ep-field-wrapper--error' : ''}`}>
                                    <i className="ti ti-user ep-field-icon" aria-hidden="true"></i>
                                    <input
                                        type="text"
                                        placeholder="Tu nombre completo"
                                        className="ep-field-input"
                                        {...register('fullName')}
                                    />
                                </div>
                                {errors.fullName && (
                                    <span className="ep-field-error">
                                        <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                                        {errors.fullName.message}
                                    </span>
                                )}
                            </div>

                            {/* Correo Institucional */}
                            <div className="ep-field-group">
                                <label className="ep-field-label">
                                    <div className="ep-field-label-icon">
                                        <i className="ti ti-mail" aria-hidden="true"></i>
                                    </div>
                                    Correo Institucional
                                </label>
                                <div className={`ep-field-wrapper ${errors.email ? 'ep-field-wrapper--error' : ''}`}>
                                    <i className="ti ti-mail ep-field-icon" aria-hidden="true"></i>
                                    <input
                                        type="email"
                                        placeholder="ejemplo@uta.edu.ec"
                                        className="ep-field-input"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <span className="ep-field-error">
                                        <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                                        {errors.email.message}
                                    </span>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div className="ep-field-group">
                                <label className="ep-field-label">
                                    <div className="ep-field-label-icon">
                                        <i className="ti ti-phone" aria-hidden="true"></i>
                                    </div>
                                    Teléfono
                                    <span className="ep-field-optional">Opcional</span>
                                </label>
                                <div className={`ep-field-wrapper ${errors.phone ? 'ep-field-wrapper--error' : ''}`}>
                                    <i className="ti ti-phone ep-field-icon" aria-hidden="true"></i>
                                    <input
                                        type="tel"
                                        placeholder="09XXXXXXXX"
                                        className="ep-field-input"
                                        {...register('phone')}
                                    />
                                </div>
                                {errors.phone && (
                                    <span className="ep-field-error">
                                        <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                                        {errors.phone.message}
                                    </span>
                                )}
                            </div>

                            {/* ── Botones de acción ── */}
                            <div className="ep-card-actions">
                                <button
                                    type="submit"
                                    className="ep-btn-save"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <i className="ti ti-loader-2 ep-spin" aria-hidden="true"></i>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ti ti-device-floppy" aria-hidden="true"></i>
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>

                                <Link to="/profile" className="ep-btn-cancel">
                                    <i className="ti ti-arrow-back-up" aria-hidden="true"></i>
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}