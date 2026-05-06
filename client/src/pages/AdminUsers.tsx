import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../api';
import { useAuth } from '../context/AuthContext';
import type { UserForAdmin } from '../types';

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/');
      return;
    }
    adminService.getAllUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    if (id === user?.id) {
      alert('No puedes eliminarte a ti mismo');
      return;
    }
    const targetUser = users.find(u => u.id === id);
    if (targetUser?.role === 'Admin') {
      alert('No puedes eliminar a otro administrador');
      return;
    }
    setDeletingId(id);
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el usuario');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ve y elimina usuarios del sistema
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Teléfono</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Fecha Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{u.email}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{u.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      u.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}>
                      {u.role === 'Admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {new Date(u.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4">
                    {u.id !== user?.id && u.role !== 'Admin' && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deletingId === u.id}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === u.id ? (
                          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        Eliminar
                      </button>
                    )}
                    {(u.id === user?.id || u.role === 'Admin') && (
                      <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No hay usuarios registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}