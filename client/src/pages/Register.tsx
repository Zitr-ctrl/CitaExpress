import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

export default function Register() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <AuthForm mode="register" />;
}