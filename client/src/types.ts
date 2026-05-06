export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  ownerId: string;
  createdAt: string;
}

export interface CreateBusinessRequest {
  name: string;
  description: string;
  address: string;
  phone: string;
  openTime?: string;
  closeTime?: string;
  slotDurationMinutes?: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  businessId: string;
  createdAt: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  businessId: string;
}

export interface Reservation {
  id: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  userId: string;
  userName: string;
  businessId: string;
  businessName: string;
  serviceId: string;
  serviceName: string;
  createdAt: string;
}

export interface CreateReservationRequest {
  reservationDate: string;
  startTime: string;
  businessId: string;
  serviceId: string;
  notes?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

export interface AdminReservation {
  id: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  businessId: string;
  businessName: string;
  serviceId: string;
  serviceName: string;
  createdAt: string;
}

export interface UserForAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
}