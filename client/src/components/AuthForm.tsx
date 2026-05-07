import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FormInput } from './ui';
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '../schemas';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema) as any,
    defaultValues: mode === 'login'
      ? { email: '', password: '' }
      : { name: '', email: '', phone: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    try {
      if (mode === 'login') {
        await login((data as LoginFormData).email, (data as LoginFormData).password);
      } else {
        const registerData = data as RegisterFormData;
        await registerUser(registerData.name, registerData.email, registerData.password, registerData.phone);
      }
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || (mode === 'login' ? 'Error al iniciar sesión' : 'Error al registrarse'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {mode === 'login'
                ? 'Ingresa tus credenciales para continuar'
                : 'Completa tus datos para registrarte'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mode === 'register' && (
              <>
                <FormInput
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  {...register('name')}
                  error={(errors as any).name?.message}
                />

                <FormInput
                  label="Teléfono"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  {...register('phone')}
                  error={(errors as any).phone?.message}
                />
              </>
            )}

            <FormInput
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <FormInput
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{mode === 'login' ? 'Iniciando sesión...' : 'Registrando...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  Inicia sesión
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
