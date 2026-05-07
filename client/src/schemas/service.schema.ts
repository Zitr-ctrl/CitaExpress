import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().default(''),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  durationMinutes: z.number().int().min(5, 'La duración debe ser al menos 5 minutos'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
