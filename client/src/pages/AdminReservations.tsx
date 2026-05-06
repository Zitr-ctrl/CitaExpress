import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, businessService } from '../api';
import { useAuth } from '../context/AuthContext';
import type { AdminReservation, Business } from '../types';

export default function AdminReservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return;
    setCancellingId(id);
    try {
      await adminService.cancelReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const filteredReservations = selectedBusiness
    ? reservations.filter(r => r.businessId === selectedBusiness)
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Reservas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ve y cancela reservas de tus negocios
        </p>
      </div>

      <div className="mb-6">
        <select
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos los negocios</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Negocio</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Servicio</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Horario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{reservation.userName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{reservation.userEmail}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{reservation.userPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{reservation.businessName}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{reservation.serviceName}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {new Date(reservation.reservationDate).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                    {reservation.startTime} - {reservation.endTime}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      reservation.status === 'Confirmed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : reservation.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                    }`}>
                      {reservation.status === 'Confirmed' ? 'Confirmada' :
                       reservation.status === 'Cancelled' ? 'Cancelada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {reservation.status === 'Confirmed' && (
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        disabled={cancellingId === reservation.id}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancellingId === reservation.id ? (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReservations.length === 0 && selectedBusiness && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No hay reservas para este negocio
            </div>
          )}
          {!selectedBusiness && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Selecciona un negocio para ver sus reservas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}