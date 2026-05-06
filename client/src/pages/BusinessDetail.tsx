import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { businessService, serviceService, reservationService } from '../api';
import type { Business, Service, AvailableSlot } from '../types';
import { useAuth } from '../context/AuthContext';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      businessService.getById(id),
      serviceService.getByBusiness(id)
    ]).then(([biz, servs]) => {
      setBusiness(biz);
      setServices(servs);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    reservationService.getAvailableSlots(id, selectedDate)
      .then(setSlots)
      .catch(console.error);
  }, [id, selectedDate]);

  const handleReserve = async () => {
    if (!selectedService || !selectedSlot) return;
    setSubmitting(true);
    try {
      await reservationService.create({
        reservationDate: selectedDate,
        startTime: selectedSlot,
        businessId: id!,
        serviceId: selectedService,
        notes
      });
      navigate('/my-reservations');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Negocio no encontrado</h2>
        <Link to="/" className="text-indigo-600 dark:text-indigo-400 mt-4 inline-block hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a negocios
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {business.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {business.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                <p className="font-medium text-gray-900 dark:text-white">{business.address}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                <p className="font-medium text-gray-900 dark:text-white">{business.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Horario: {business.openTime} - {business.closeTime}
          </div>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">Este negocio aún no tiene servicios disponibles</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Servicios Disponibles</h2>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecciona un servicio
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Elige un servicio...</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price} ({service.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Horarios Disponibles</h2>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Selecciona una fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-6"
          />

          {slots.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay horarios disponibles para esta fecha
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => setSelectedSlot(slot.startTime)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSlot === slot.startTime
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-indigo-500 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {user && selectedService && selectedSlot ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Confirmar Reserva</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Alguna solicitud especial?"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Servicio seleccionado</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {services.find(s => s.id === selectedService)?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDate}</p>
                <p className="font-medium text-indigo-600 dark:text-indigo-400">{selectedSlot}</p>
              </div>
            </div>

            <button
              onClick={handleReserve}
              disabled={submitting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Reservando...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirmar Reserva</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : !user ? (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">¿Quieres hacer una reserva?</h3>
          <p className="text-indigo-100 mb-6">Inicia sesión o crea una cuenta para reservar servicios</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-indigo-700 text-white font-semibold rounded-xl hover:bg-indigo-800 transition-colors"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-6 text-center border border-amber-200 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-200">
            Selecciona un servicio y un horario para continuar con tu reserva
          </p>
        </div>
      )}
    </div>
  );
}