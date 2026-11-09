export interface JwtUserPayload {
  id: string;
  email: string;
  role: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface RegisterBody {
  email?: string;
  password?: string;
  role?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface LoginBody {
  email?: string;
  password?: string;
}

export interface RechargeCreditsBody {
  credits?: number | string;
  amountEur?: number | string;
}

export interface CreateExperienceBody {
  companyName?: string;
  duration?: string;
  period?: string;
  description?: string;
}

export interface UpdateProfileBody {
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface UserSummaryResponse {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  phone: string | null;
  availableCredits: number;
  frozenCredits: number;
  isVerified: boolean;
  avatarUrl: string | null;
}
