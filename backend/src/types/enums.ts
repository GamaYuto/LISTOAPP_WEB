export const Role = {
  CLIENT: 'CLIENT',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const DocumentType = {
  DNI: 'DNI',
  NIE: 'NIE',
  PASSPORT: 'PASSPORT',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const ServiceStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus];

export const OfferStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

