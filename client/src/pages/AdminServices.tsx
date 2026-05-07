import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { businessService, serviceService } from '../api';
import { useAuth } from '../context/AuthContext';
import { FormInput, FormTextarea, DataTable } from '../components/ui';
import { serviceSchema, type ServiceFormData } from '../schemas';
import type { Business, Service } from '../types';

export default function AdminServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      durationMinutes: 30,
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
      serviceService.getByBusiness(selectedBusiness).then(setServices).catch(console.error);
    } else {
      setServices([]);
    }
  }, [selectedBusiness]);

  const onServiceSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        await serviceService.update(selectedBusiness, editingService.id, data);
        toast.success('Servicio actualizado correctamente');
      } else {
        await serviceService.create(selectedBusiness, data);
        toast.success('Servicio creado correctamente');
      }
      serviceService.getByBusiness(selectedBusiness).then(setServices).catch(console.error);
      setShowForm(false);
      setEditingService(null);
      reset({ name: '', description: '', price: 0, durationMinutes: 30 });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar el servicio');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description || '',
      price: service.price,
      durationMinutes: service.durationMinutes,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await serviceService.delete(selectedBusiness, id);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('Servicio eliminado correctamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el servicio');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingService(null);
    reset({ name: '', description: '', price: 0, durationMinutes: 30 });
  };

  const columns: ColumnDef<Service>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'description', header: 'Descripción' },
    {
      accessorKey: 'price',
      header: 'Precio',
      cell: ({ row }) => <span>${row.original.price.toFixed(2)}</span>,
    },
    {
      accessorKey: 'durationMinutes',
      header: 'Duración',
      cell: ({ row }) => <span>{row.original.durationMinutes} min</span>,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            Eliminar
          </button>
        </div>
      ),
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
          Gestión de Servicios
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Agrega y gestiona los servicios de tus negocios
        </p>
      </div>

      <div className="mb-6">
        <select
          value={selectedBusiness}
          onChange={(e) => { setSelectedBusiness(e.target.value); setShowForm(false); }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Selecciona un negocio</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {selectedBusiness && (
        <div className="mb-6">
          <button
            onClick={() => { reset({ name: '', description: '', price: 0, durationMinutes: 30 }); setEditingService(null); setShowForm(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            + Agregar Servicio
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
          <form onSubmit={handleSubmit(onServiceSubmit)} className="space-y-4">
            <FormInput
              label="Nombre"
              {...register('name')}
              error={errors.name?.message}
            />
            <FormTextarea
              label="Descripción"
              rows={3}
              {...register('description')}
              error={errors.description?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Precio"
                type="number"
                step="0.01"
                {...register('price')}
                error={errors.price?.message}
              />
              <FormInput
                label="Duración (minutos)"
                type="number"
                {...register('durationMinutes')}
                error={errors.durationMinutes?.message}
              />
            </div>
            <div className="flex gap-3">
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
        data={services}
        columns={columns}
        emptyMessage={selectedBusiness ? 'No hay servicios para este negocio' : 'Selecciona un negocio para ver sus servicios'}
      />
    </div>
  );
}
