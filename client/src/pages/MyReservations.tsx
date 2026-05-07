import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { reservationService } from '../api';
import type { Reservation } from '../types';
import { DataTable } from '../components/ui';

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    reservationService.getMy()
      .then(setReservations)
      .catch((err) => {
        console.error('Error fetching reservations:', err);
        toast.error('Error al cargar las reservas');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await reservationService.cancel(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
      toast.success('Reserva cancelada correctamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setCancellingId(null);
    }
  };

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'businessName',
      header: 'Negocio',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{row.original.businessName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'serviceName',
      header: 'Servicio',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">{row.original.serviceName}</span>
      ),
    },
    {
      accessorKey: 'reservationDate',
      header: 'Fecha',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {new Date(row.original.reservationDate).toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })}
        </span>
      ),
    },
    {
      accessorKey: 'startTime',
      header: 'Horario',
      cell: ({ row }) => (
        <span className="font-mono text-gray-700 dark:text-gray-300">
          {row.original.startTime} - {row.original.endTime}
        </span>
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mis Reservas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tus reservas realizadas
        </p>
      </div>

      {loading ? (
        <DataTable
          data={[]}
          columns={columns}
          loading={true}
          emptyMessage="Cargando reservas..."
        />
      ) : reservations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No tienes reservas aún
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Explora negocios y realiza tu primera reserva
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar Negocios
          </Link>
        </div>
      ) : (
        <DataTable
          data={reservations}
          columns={columns}
          emptyMessage="No tienes reservas aún"
          searchPlaceholder="Buscar por negocio, servicio o estado..."
        />
      )}
    </div>
  );
}
