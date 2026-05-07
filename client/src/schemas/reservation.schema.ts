import { z } from 'zod';

export const reservationSchema = z.object({
  serviceId: z.string().uuid('Selecciona un servicio'),
  reservationDate: z.string().min(1, 'Selecciona una fecha'),
  startTime: z.string().min(1, 'Selecciona un horario'),
  notes: z.string().optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
