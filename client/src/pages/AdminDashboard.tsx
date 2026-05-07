import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { adminService, businessService } from '../api';
import { useAuth } from '../context/AuthContext';
import { FormInput, FormTextarea, DataTable } from '../components/ui';
import { businessSchema, type BusinessFormData } from '../schemas';
import type { AdminReservation, Business } from '../types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      address: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/');
      return;
    }
    businessService.getMy().then(setBusinesses).catch(console.error).finally(() => setLoading(false));
  }, [user, navigate]);

  useEffect(() => {
    if (selectedBusiness) {
      adminService.getMyReservations().then(setReservations).catch(console.error);
    }
  }, [selectedBusiness]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await adminService.cancelReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
      toast.success('Reserva cancelada correctamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setCancellingId(null);
    }
  };

  const onBusinessSubmit = async (data: BusinessFormData) => {
    try {
      if (editingBusiness) {
        await businessService.update(editingBusiness.id, data);
        toast.success('Negocio actualizado correctamente');
      } else {
        await businessService.create(data);
        toast.success('Negocio creado correctamente');
      }
      businessService.getMy().then(setBusinesses).catch(console.error);
      setShowBusinessForm(false);
      setEditingBusiness(null);
      reset({ name: '', description: '', address: '', phone: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar el negocio');
    }
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    reset({
      name: business.name,
      description: business.description || '',
      address: business.address,
      phone: business.phone,
    });
    setShowBusinessForm(true);
  };

  const handleDeleteBusiness = async (id: string) => {
    try {
      await businessService.delete(id);
      setBusinesses(prev => prev.filter(b => b.id !== id));
      if (selectedBusiness === id) setSelectedBusiness('');
      toast.success('Negocio eliminado correctamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el negocio');
    }
  };

  const handleCloseForm = () => {
    setShowBusinessForm(false);
    setEditingBusiness(null);
    reset({ name: '', description: '', address: '', phone: '' });
  };

  const businessColumns: ColumnDef<Business>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'address', header: 'Dirección' },
    { accessorKey: 'phone', header: 'Teléfono' },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditBusiness(row.original)}
            className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => handleDeleteBusiness(row.original.id)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  const reservationColumns: ColumnDef<AdminReservation>[] = [
    {
      accessorKey: 'userName',
      header: 'Cliente',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.original.userName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.original.userEmail}</div>
        </div>
      ),
    },
    { accessorKey: 'serviceName', header: 'Servicio' },
    {
      accessorKey: 'reservationDate',
      header: 'Fecha',
      cell: ({ row }) => new Date(row.original.reservationDate).toLocaleDateString('es-ES'),
    },
    {
      accessorKey: 'startTime',
      header: 'Horario',
      cell: ({ row }) => (
        <span className="font-mono">{row.original.startTime} - {row.original.endTime}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusClasses = {
          Confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
          Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
          Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        }[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

        const statusLabels = {
          Confirmed: 'Confirmada',
          Cancelled: 'Cancelada',
          Pending: 'Pendiente',
        }[status] || status;

        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClasses}`}>
            {statusLabels}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        if (row.original.status !== 'Confirmed') return null;
        return (
          <button
            onClick={() => handleCancel(row.original.id)}
            disabled={cancellingId === row.original.id}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancellingId === row.original.id ? (
              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            Cancelar
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

  const filteredReservations = reservations.filter(r => r.businessId === selectedBusiness);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Panel de Admin
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tus negocios y reservas
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mis Negocios</h2>
          <button
            onClick={() => { reset({ name: '', description: '', address: '', phone: '' }); setEditingBusiness(null); setShowBusinessForm(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            + Agregar Negocio
          </button>
        </div>

        {showBusinessForm && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingBusiness ? 'Editar Negocio' : 'Nuevo Negocio'}
            </h3>
            <form onSubmit={handleSubmit(onBusinessSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nombre"
                {...register('name')}
                error={errors.name?.message}
              />
              <FormInput
                label="Teléfono"
                {...register('phone')}
                error={errors.phone?.message}
              />
              <div className="md:col-span-2">
                <FormInput
                  label="Dirección"
                  {...register('address')}
                  error={errors.address?.message}
                />
              </div>
              <div className="md:col-span-2">
                <FormTextarea
                  label="Descripción"
                  rows={2}
                  {...register('description')}
                  error={errors.description?.message}
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <DataTable
          data={businesses}
          columns={businessColumns}
          emptyMessage="No tienes negocios registrados"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reservas Recientes</h2>
          {businesses.length > 0 && (
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona un negocio</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
        </div>

        {selectedBusiness ? (
          <DataTable
            data={filteredReservations}
            columns={reservationColumns}
            emptyMessage="No hay reservas para este negocio"
            searchPlaceholder="Buscar por cliente, servicio..."
          />
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {businesses.length > 0
              ? 'Selecciona un negocio para ver sus reservas'
              : 'Agrega un negocio para ver reservas'}
          </div>
        )}
      </div>
    </div>
  );
}
