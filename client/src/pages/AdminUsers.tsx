import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { adminService } from '../api';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/ui';
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
    if (id === user?.id) {
      toast.error('No puedes eliminarte a ti mismo');
      return;
    }
    const targetUser = users.find(u => u.id === id);
    if (targetUser?.role === 'Admin') {
      toast.error('No puedes eliminar a otro administrador');
      return;
    }
    setDeletingId(id);
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Usuario eliminado correctamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el usuario');
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<UserForAdmin>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Teléfono' },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const isAdmin = row.original.role === 'Admin';
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isAdmin
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
          }`}>
            {isAdmin ? 'Admin' : 'Cliente'}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha Registro',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('es-ES'),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const isCurrentUser = row.original.id === user?.id;
        const isAdmin = row.original.role === 'Admin';

        if (isCurrentUser || isAdmin) {
          return <span className="text-sm text-gray-400 dark:text-gray-500">-</span>;
        }

        return (
          <button
            onClick={() => handleDelete(row.original.id)}
            disabled={deletingId === row.original.id}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
          >
            {deletingId === row.original.id ? (
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
        );
      },
    },
  ];

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

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyMessage="No hay usuarios registrados"
      />
    </div>
  );
}
