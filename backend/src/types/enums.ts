export const Role = {
  CLIENT: 'CLIENT',
  PROVIDER: 'PROVIDER'
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ServiceStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
} as const;
export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus];

export const OfferStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];
