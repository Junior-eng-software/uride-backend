import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axiosClient';
import { AxiosError } from 'axios';
import './RegisterForm.css';
import { useNavigate } from 'react-router-dom';


// ── Esquema Zod INTACTO ────────────────────────────────────────────────
const registerSchema = z.object({
    fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string()
        .email('Formato de correo inválido')
        .endsWith('@uta.edu.ec', 'U-Ride es exclusivo para la UTA. Usa tu correo @uta.edu.ec'),
    phone: z.string().min(10, 'El teléfono debe tener 10 dígitos').optional(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
const navigate = useNavigate();

    // ── useState INTACTOS ──────────────────────────────────────────────
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ── useState adicionales solo para UI visual ───────────────────────
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    // ── onSubmit INTACTO ───────────────────────────────────────────────
    const onSubmit = async (data: RegisterFormData) => {
        if (!termsAccepted) {
            setStatusMessage({ type: 'error', text: 'Debes aceptar los Términos de Servicio para continuar.' });
            return;
        }
        setIsLoading(true);
        setStatusMessage(null);

        try {
            const response = await api.post('/auth/register', data);
            if (response.status === 201) {
                setStatusMessage({ type: 'success', text: response.data.message });
                setTimeout(() => navigate('/verify'), 2000);
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                setStatusMessage({ type: 'error', text: error.response.data.message || 'Error al registrar usuario.' });
            } else {
                setStatusMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── JSX rediseñado pixel-perfect ───────────────────────────────────
    return (
        <div className="auth-layout">

            {/* ── Panel izquierdo (branding) ── */}
            <div className="auth-brand-panel">
                <div className="brand-content">
                    <div className="brand-logo">
                        <div className="brand-icon">
                            <i className="ti ti-car" aria-hidden="true"></i>
                        </div>
                        <span className="brand-name">U-Ride</span>
                    </div>
                    <p className="brand-tagline">
                        Únete a la comunidad de transporte seguro de la UTA.
                    </p>
                    <div className="brand-badge">
                        <i className="ti ti-shield-check" aria-hidden="true"></i>
                        <span>Usuarios Verificados</span>
                    </div>
                </div>
            </div>

            {/* ── Panel derecho (formulario) ── */}
            <div className="auth-form-panel">
                <div className="auth-form-container">

                    <div className="form-header">
                        <h1 className="form-title">Crea tu cuenta</h1>
                        <p className="form-subtitle">Ingresa tus datos institucionales para comenzar.</p>
                    </div>

                    {statusMessage && (
                        <div className={`status-alert status-alert--${statusMessage.type}`}>
                            <i className={`ti ${statusMessage.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} aria-hidden="true"></i>
                            {statusMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>

                        {/* Nombre Completo */}
                        <div className="field-group">
                            <label className="field-label">Nombre Completo</label>
                            <div className={`field-input-wrapper ${errors.fullName ? 'field-input-wrapper--error' : ''}`}>
                                <i className="ti ti-user field-icon" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    placeholder="Ej. María Cáceres"
                                    className="field-input"
                                    {...register('fullName')}
                                />
                            </div>
                            {errors.fullName && (
                                <span className="field-error">{errors.fullName.message}</span>
                            )}
                        </div>

                        {/* Correo Institucional */}
                        <div className="field-group">
                            <label className="field-label">Correo Institucional</label>
                            <div className={`field-input-wrapper ${errors.email ? 'field-input-wrapper--error' : ''}`}>
                                <i className="ti ti-mail field-icon" aria-hidden="true"></i>
                                <input
                                    type="email"
                                    placeholder="ejemplo@uta.edu.ec"
                                    className="field-input"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email ? (
                                <span className="field-error">{errors.email.message}</span>
                            ) : (
                                <span className="field-hint">
                                    <i className="ti ti-info-circle" aria-hidden="true"></i>
                                    Debe ser un correo válido terminado en .edu.ec
                                </span>
                            )}
                        </div>

                        {/* Universidad + Carrera (grid 2 columnas — campos visuales) */}
                        <div className="field-row">
                            <div className="field-group">
                                <label className="field-label">Universidad</label>
                                <div className="field-input-wrapper field-input-wrapper--readonly">
                                    <input
                                        type="text"
                                        value="Univ. Técnica de Ambato (UTA)"
                                        className="field-input"
                                        readOnly
                                        tabIndex={-1}
                                    />
                                </div>
                            </div>
                            <div className="field-group">
                                <label className="field-label">Carrera / Facultad</label>
                                <div className="field-input-wrapper field-input-wrapper--select">
                                    <select className="field-input field-select" defaultValue="">
                                        <option value="" disabled>Selecciona tu carrera...</option>
                                        <option>Ingeniería en Software</option>
                                        <option>Ingeniería en Sistemas</option>
                                        <option>Ingeniería Civil</option>
                                        <option>Medicina</option>
                                        <option>Derecho</option>
                                        <option>Otra</option>
                                    </select>
                                    <i className="ti ti-chevron-down field-icon-right" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>

                        {/* Contraseña + Confirmar (grid 2 columnas) */}
                        <div className="field-row">
                            <div className="field-group">
                                <label className="field-label">Contraseña</label>
                                <div className={`field-input-wrapper ${errors.password ? 'field-input-wrapper--error' : ''}`}>
                                    <i className="ti ti-lock field-icon" aria-hidden="true"></i>
                                    <input
                                        type="password"
                                        className="field-input"
                                        {...register('password')}
                                    />
                                </div>
                                {errors.password && (
                                    <span className="field-error">{errors.password.message}</span>
                                )}
                            </div>
                            <div className="field-group">
                                <label className="field-label">Confirmar Contraseña</label>
                                <div className={`field-input-wrapper ${confirmPassword && confirmPassword !== watch('password') ? 'field-input-wrapper--error' : ''}`}>
                                    <i className="ti ti-check field-icon" aria-hidden="true"></i>
                                    <input
                                        type="password"
                                        className="field-input"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                {confirmPassword && confirmPassword !== watch('password') && (
                                    <span className="field-error">Las contraseñas no coinciden</span>
                                )}
                            </div>
                        </div>

                        {/* Términos */}
                        <label className="terms-label">
                            <input
                                type="checkbox"
                                className="terms-checkbox"
                                checked={termsAccepted}
                                onChange={e => setTermsAccepted(e.target.checked)}
                            />
                            <span className="terms-text">
                                Acepto los{' '}
                                <a href="#" className="terms-link">Términos de Servicio</a>, las{' '}
                                <a href="#" className="terms-link">Políticas de Seguridad</a>{' '}
                                y confirmo que soy estudiante activo.
                            </span>
                        </label>

                        {/* Botón principal */}
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <i className="ti ti-loader-2 spin" aria-hidden="true"></i>
                                    Registrando...
                                </>
                            ) : (
                                'Crear mi cuenta'
                            )}
                        </button>
                    </form>

                    <p className="auth-redirect">
                        ¿Ya tienes una cuenta?{' '}
                        <a href="/login" className="auth-redirect-link">
                            Inicia sesión aquí{' '}
                            <i className="ti ti-arrow-right" aria-hidden="true"></i>
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}