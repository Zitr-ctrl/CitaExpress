import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().default(''),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  phone: z.string().min(8, 'Teléfono inválido'),
});

export type BusinessFormData = z.infer<typeof businessSchema>;
