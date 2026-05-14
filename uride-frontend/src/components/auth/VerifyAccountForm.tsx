// src/components/auth/VerifyAccountForm.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axiosClient';
import { AxiosError } from 'axios';
import './VerifyAccountForm.css';




// ── Schema Zod INTACTO ─────────────────────────────────────────────────
const verifySchema = z.object({
    token: z.string().min(10, 'El token no parece ser válido')
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyAccountForm() {
    const navigate = useNavigate();

    // ── useState INTACTOS ──────────────────────────────────────────────
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<VerifyFormData>({
        resolver: zodResolver(verifySchema)
    });

    // ── onSubmit INTACTO ───────────────────────────────────────────────
    const onSubmit = async (data: VerifyFormData) => {
        setIsLoading(true);
        setStatusMessage(null);

        try {
            const response = await api.post('/auth/verify-account', { token: data.token });
            if (response.status === 200) {
                setStatusMessage({ type: 'success', text: '¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.' });
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                setStatusMessage({ type: 'error', text: error.response.data.message || 'Error al verificar.' });
            } else {
                setStatusMessage({ type: 'error', text: 'Error de conexión.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── JSX rediseñado — design system U-Ride ─────────────────────────
    return (
        <div className="verify-layout">

            {/* ── Panel izquierdo (branding) ── */}
            <div className="verify-brand-panel">
                <div className="verify-brand-content">
                    <div className="verify-brand-logo">
                        <div className="verify-brand-icon">
                            <i className="ti ti-car" aria-hidden="true"></i>
                        </div>
                        <span className="verify-brand-name">U-Ride</span>
                    </div>
                    <p className="verify-brand-tagline">
                        Estás a un paso de unirte a la comunidad de transporte seguro.
                    </p>
                    <div className="verify-steps">
                        <div className="verify-step verify-step--done">
                            <div className="verify-step-dot">
                                <i className="ti ti-check" aria-hidden="true"></i>
                            </div>
                            <span>Registro completado</span>
                        </div>
                        <div className="verify-step verify-step--active">
                            <div className="verify-step-dot">
                                <i className="ti ti-mail" aria-hidden="true"></i>
                            </div>
                            <span>Verifica tu correo</span>
                        </div>
                        <div className="verify-step verify-step--pending">
                            <div className="verify-step-dot">
                                <i className="ti ti-car" aria-hidden="true"></i>
                            </div>
                            <span>Empieza a viajar</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Panel derecho (formulario) ── */}
            <div className="verify-form-panel">
                <div className="verify-card">

                    {/* Ícono de cabecera */}
                    <div className="verify-card-icon-wrapper">
                        <div className="verify-card-icon">
                            <i className="ti ti-shield-check" aria-hidden="true"></i>
                        </div>
                    </div>

                    <div className="verify-card-header">
                        <h1 className="verify-title">Verifica tu cuenta</h1>
                        <p className="verify-subtitle">
                            Revisa tu correo institucional y pega el token de activación que te enviamos.
                        </p>
                    </div>

                    {/* Instrucción contextual */}
                    <div className="verify-info-banner">
                        <i className="ti ti-info-circle" aria-hidden="true"></i>
                        <span>
                            El token fue enviado a tu correo <strong>@uta.edu.ec</strong>. Revisa también la carpeta de spam.
                        </span>
                    </div>

                    {/* Alerta de estado */}
                    {statusMessage && (
                        <div className={`verify-alert verify-alert--${statusMessage.type}`}>
                            <i className={`ti ${statusMessage.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} aria-hidden="true"></i>
                            <span>{statusMessage.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="verify-form" noValidate>

                        {/* Token de activación */}
                        <div className="verify-field-group">
                            <label className="verify-field-label">
                                Token de Activación
                            </label>
                            <div className={`verify-field-wrapper ${errors.token ? 'verify-field-wrapper--error' : ''}`}>
                                <i className="ti ti-key verify-field-icon" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    placeholder="Pega tu token aquí..."
                                    className="verify-field-input"
                                    autoComplete="off"
                                    spellCheck={false}
                                    {...register('token')}
                                />
                            </div>
                            {errors.token && (
                                <span className="verify-field-error">
                                    <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                                    {errors.token.message}
                                </span>
                            )}
                        </div>

                        {/* Botón principal */}
                        <button
                            type="submit"
                            className="verify-btn-submit"
                            disabled={isLoading || statusMessage?.type === 'success'}
                        >
                            {isLoading ? (
                                <>
                                    <i className="ti ti-loader-2 verify-spin" aria-hidden="true"></i>
                                    Verificando...
                                </>
                            ) : statusMessage?.type === 'success' ? (
                                <>
                                    <i className="ti ti-circle-check" aria-hidden="true"></i>
                                    Cuenta verificada
                                </>
                            ) : (
                                <>
                                    <i className="ti ti-shield-check" aria-hidden="true"></i>
                                    Verificar mi cuenta
                                </>
                            )}
                        </button>
                    </form>

                    {/* Links de navegación */}
                    <div className="verify-footer-links">
                        <a href="/login" className="verify-footer-link">
                            <i className="ti ti-arrow-left" aria-hidden="true"></i>
                            Volver al inicio de sesión
                        </a>
                        <a href="/register" className="verify-footer-link">
                            ¿No recibiste el correo? Regístrate de nuevo
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}