import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../api/axiosClient';
import { AxiosError } from 'axios';
// [CRÍTICO] Cambiamos Link por useNavigate
import { useNavigate } from 'react-router-dom';
import './ForgotPasswordForm.css';

const forgotSchema = z.object({
    email: z.string().email('Correo inválido').endsWith('@uta.edu.ec', 'Debe ser correo institucional')
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordForm() {
    const navigate = useNavigate(); // <-- Inicializamos el enrutador

    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // [CRÍTICO] Nueva variable para bloquear el formulario tras el primer éxito
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormData>({
        resolver: zodResolver(forgotSchema)
    });

    const onSubmit = async (data: ForgotFormData) => {
        setIsLoading(true);
        setStatusMessage(null);

        try {
            const response = await api.post('/auth/forgot-password', data);
            if (response.status === 200) {
                setStatusMessage({ type: 'success', text: 'Revisa tu correo. Te hemos enviado las instrucciones para recuperar tu cuenta.' });
                // ¡Bloqueamos el botón para evitar spam de tokens en Mailtrap!
                setIsSuccess(true);
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                setStatusMessage({ type: 'error', text: error.response.data.message || 'Error al solicitar recuperación.' });
            } else {
                setStatusMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-layout">
            <div className="forgot-brand-panel">
                <div className="forgot-brand-content">
                    <div className="forgot-brand-logo">
                        <div className="forgot-brand-icon">
                            <i className="ti ti-car" aria-hidden="true"></i>
                        </div>
                        <span className="forgot-brand-name">U-Ride</span>
                    </div>
                    <p className="forgot-brand-tagline">
                        Recupera tu acceso<br />y vuelve a viajar seguro.
                    </p>
                </div>
            </div>

            <div className="forgot-form-panel">
                <div className="forgot-card">
                    <div className="forgot-card-header">
                        <h1 className="forgot-title">Recuperar Contraseña</h1>
                        <p className="forgot-subtitle">Ingresa tu correo institucional y te enviaremos un enlace de recuperación.</p>
                    </div>

                    {statusMessage && (
                        <div className={`forgot-alert forgot-alert--${statusMessage.type}`}>
                            <i className={`ti ${statusMessage.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} aria-hidden="true"></i>
                            {statusMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="forgot-form" noValidate>
                        <div className="forgot-field-group">
                            <label className="forgot-field-label">Correo Institucional</label>
                            <div className={`forgot-field-wrapper ${errors.email ? 'forgot-field-wrapper--error' : ''}`}>
                                <i className="ti ti-mail forgot-field-icon" aria-hidden="true"></i>
                                <input
                                    type="email"
                                    placeholder="ejemplo@uta.edu.ec"
                                    className="forgot-field-input"
                                    {...register('email')}
                                    disabled={isSuccess} /* Opcional: bloquea el input también */
                                />
                            </div>
                            {errors.email && (
                                <span className="forgot-field-error">{errors.email.message}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="forgot-btn-submit"
                            // [CRÍTICO] El botón se desactiva si está cargando o si ya tuvo éxito
                            disabled={isLoading || isSuccess}
                        >
                            {isLoading ? (
                                <>
                                    <i className="ti ti-loader-2 forgot-spin" aria-hidden="true"></i>
                                    Enviando...
                                </>
                            ) : isSuccess ? (
                                '¡Correo Enviado!' // Feedback visual de que el proceso terminó
                            ) : (
                                'Enviar Instrucciones'
                            )}
                        </button>
                    </form>

                    {/* [CRÍTICO] Forzamos la navegación con un span clickable en lugar de un Link */}
                    <div className="forgot-footer">
                        <span
                            onClick={() => navigate('/login')}
                            className="forgot-back-link"
                            style={{ cursor: 'pointer', display: 'inline-flex' }}
                        >
                            <i className="ti ti-arrow-left" aria-hidden="true"></i>
                            Volver al inicio de sesión
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}