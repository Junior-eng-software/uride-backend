// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axiosClient';
import { AxiosError } from 'axios';
import './LoginForm.css';
import { useNavigate, Link } from 'react-router-dom';
// ── Schema Zod INTACTO ─────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email('Correo inválido'),
    password: z.string().min(1, 'La contraseña es obligatoria')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const navigate = useNavigate();

    // ── useState INTACTOS ──────────────────────────────────────────────
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    // ── onSubmit INTACTO ───────────────────────────────────────────────
    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setStatusMessage(null);

        try {
            const response = await api.post('/auth/login', data);
            if (response.status === 200) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                navigate('/profile');
                setStatusMessage({ type: 'success', text: '¡Inicio de sesión exitoso! (JWT Guardado)' });
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                setStatusMessage({ type: 'error', text: error.response.data.message || 'Error al iniciar sesión.' });
            } else {
                setStatusMessage({ type: 'error', text: 'Error de conexión.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── JSX rediseñado pixel-perfect ───────────────────────────────────
    return (
        <div className="login-layout">

            {/* ── Panel izquierdo (branding) ── */}
            <div className="login-brand-panel">
                <div className="login-brand-content">
                    <div className="login-brand-logo">
                        <div className="login-brand-icon">
                            <i className="ti ti-car" aria-hidden="true"></i>
                        </div>
                        <span className="login-brand-name">U-Ride</span>
                    </div>
                    <p className="login-brand-tagline">
                        Transporte seguro<br />compartido para estudiantes
                    </p>
                </div>
            </div>

            {/* ── Panel derecho (formulario) ── */}
            <div className="login-form-panel">
                <div className="login-card">

                    <div className="login-card-header">
                        <h1 className="login-title">¡Hola de nuevo!</h1>
                        <p className="login-subtitle">Ingresa a tu cuenta estudiantil</p>
                    </div>

                    {statusMessage && (
                        <div className={`login-alert login-alert--${statusMessage.type}`}>
                            <i className={`ti ${statusMessage.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} aria-hidden="true"></i>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <span>{statusMessage.text}</span>

                                {/* Si el error indica que falta activación, mostramos el camino hacia /verify */}
                                {statusMessage.text.toLowerCase().includes('not activated') && (
                                    <button
                                        onClick={() => navigate('/verify')}
                                        className="login-verify-link-btn"
                                        style={{
                                            background: 'none', border: 'none', padding: 0,
                                            color: 'inherit', textDecoration: 'underline',
                                            cursor: 'pointer', textAlign: 'left', fontWeight: 'bold'
                                        }}
                                    >
                                        Ir a verificar mi cuenta ahora →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>

                        {/* Correo Institucional */}
                        <div className="login-field-group">
                            <label className="login-field-label">Correo Institucional</label>
                            <div className={`login-field-wrapper ${errors.email ? 'login-field-wrapper--error' : ''}`}>
                                <i className="ti ti-mail login-field-icon" aria-hidden="true"></i>
                                <input
                                    type="email"
                                    placeholder="ejemplo@uta.edu.ec"
                                    className="login-field-input"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <span className="login-field-error">{errors.email.message}</span>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div className="login-field-group">
                            <label className="login-field-label">Contraseña</label>
                            <div className={`login-field-wrapper ${errors.password ? 'login-field-wrapper--error' : ''}`}>
                                <i className="ti ti-lock login-field-icon" aria-hidden="true"></i>
                                <input
                                    type="password"
                                    className="login-field-input"
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && (
                                <span className="login-field-error">{errors.password.message}</span>
                            )}
                            <div className="login-forgot-row">
                                <Link to="/forgot-password" className="login-forgot-link">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        {/* Botón principal */}
                        <button
                            type="submit"
                            className="login-btn-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="ti ti-loader-2 login-spin" aria-hidden="true"></i>
                                    Iniciando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>

                        {/* Divisor */}
                        <div className="login-divider">
                            <span className="login-divider-text">o</span>
                        </div>

                    </form>

                    <p className="login-redirect">
                        ¿No tienes cuenta?{' '}
                        <a href="/register" className="login-redirect-link">
                            Regístrate aquí{' '}
                            <i className="ti ti-arrow-right" aria-hidden="true"></i>
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}