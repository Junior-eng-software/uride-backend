// src/components/auth/ResetPasswordForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axiosClient';
import { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './ResetPasswordForm.css'; // <-- Importamos los estilos

const resetSchema = z.object({
    token: z.string().min(10, 'El token no es válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordForm() {
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
        resolver: zodResolver(resetSchema)
    });

    const onSubmit = async (data: ResetFormData) => {
        setIsLoading(true);
        setStatusMessage(null);

        try {
            const response = await api.post('/auth/reset-password', {
                token: data.token,
                newPassword: data.password
            });

            if (response.status === 200) {
                setStatusMessage({ type: 'success', text: 'Contraseña actualizada. Redirigiendo al inicio de sesión...' });
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                setStatusMessage({ type: 'error', text: error.response.data.message || 'Error al restablecer.' });
            } else {
                setStatusMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-layout">
            {/* ── Panel izquierdo (branding) ── */}
            <div className="reset-brand-panel">
                <div className="reset-brand-content">
                    <div className="reset-brand-logo">
                        <div className="reset-brand-icon">
                            <i className="ti ti-car" aria-hidden="true"></i>
                        </div>
                        <span className="reset-brand-name">U-Ride</span>
                    </div>
                    <p className="reset-brand-tagline">
                        Asegura tu cuenta<br />con una nueva contraseña.
                    </p>
                </div>
            </div>

            {/* ── Panel derecho (formulario) ── */}
            <div className="reset-form-panel">
                <div className="reset-card">
                    <div className="reset-card-header">
                        <h1 className="reset-title">Crear Nueva Contraseña</h1>
                        <p className="reset-subtitle">Ingresa el token de recuperación de tu correo y define tu nueva contraseña.</p>
                    </div>

                    {statusMessage && (
                        <div className={`reset-alert reset-alert--${statusMessage.type}`}>
                            <i className={`ti ${statusMessage.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} aria-hidden="true"></i>
                            {statusMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="reset-form" noValidate>

                        {/* Token */}
                        <div className="reset-field-group">
                            <label className="reset-field-label">Token de Seguridad</label>
                            <div className={`reset-field-wrapper ${errors.token ? 'reset-field-wrapper--error' : ''}`}>
                                <i className="ti ti-key reset-field-icon" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    placeholder="Pega el token aquí..."
                                    className="reset-field-input"
                                    {...register('token')}
                                />
                            </div>
                            {errors.token && (
                                <span className="reset-field-error">{errors.token.message}</span>
                            )}
                        </div>

                        {/* Nueva Contraseña */}
                        <div className="reset-field-group">
                            <label className="reset-field-label">Nueva Contraseña</label>
                            <div className={`reset-field-wrapper ${errors.password ? 'reset-field-wrapper--error' : ''}`}>
                                <i className="ti ti-lock reset-field-icon" aria-hidden="true"></i>
                                <input
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    className="reset-field-input"
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && (
                                <span className="reset-field-error">{errors.password.message}</span>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="reset-field-group">
                            <label className="reset-field-label">Confirmar Contraseña</label>
                            <div className={`reset-field-wrapper ${errors.confirmPassword ? 'reset-field-wrapper--error' : ''}`}>
                                <i className="ti ti-shield-check reset-field-icon" aria-hidden="true"></i>
                                <input
                                    type="password"
                                    placeholder="Repite tu contraseña"
                                    className="reset-field-input"
                                    {...register('confirmPassword')}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <span className="reset-field-error">{errors.confirmPassword.message}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="reset-btn-submit"
                            disabled={isLoading || statusMessage?.type === 'success'}
                        >
                            {isLoading ? (
                                <>
                                    <i className="ti ti-loader-2 reset-spin" aria-hidden="true"></i>
                                    Actualizando...
                                </>
                            ) : (
                                'Restablecer Contraseña'
                            )}
                        </button>
                    </form>

                    <div className="reset-footer">
                        <Link to="/login" className="reset-back-link">
                            <i className="ti ti-arrow-left" aria-hidden="true"></i>
                            Cancelar y volver
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}