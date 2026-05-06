import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessService, serviceService } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Business, Service, CreateServiceRequest } from '../types';

export default function AdminServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    businessId: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await serviceService.update(selectedBusiness, editingService.id, formData);
      } else {
        await serviceService.create(selectedBusiness, formData);
      }
      serviceService.getByBusiness(selectedBusiness).then(setServices).catch(console.error);
      setShowForm(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price: 0, durationMinutes: 30, businessId: selectedBusiness });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el servicio');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      businessId: selectedBusiness,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;
    try {
      await serviceService.delete(selectedBusiness, id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el servicio');
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
            onClick={() => { setShowForm(true); setEditingService(null); setFormData({ name: '', description: '', price: 0, durationMinutes: 30, businessId: selectedBusiness }); }}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingService(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Duración</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{service.name}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{service.description}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">${service.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{service.durationMinutes} min</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && selectedBusiness && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No hay servicios para este negocio
            </div>
          )}
          {!selectedBusiness && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Selecciona un negocio para ver sus servicios
            </div>
          )}
        </div>
      </div>
    </div>
  );
}