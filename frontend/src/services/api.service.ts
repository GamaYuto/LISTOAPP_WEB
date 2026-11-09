const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (
      window.location.hostname.includes('trycloudflare.com') ||
      window.location.hostname.includes('ngrok') ||
      window.location.protocol === 'https:'
    ) {
      return `${window.location.origin}/api`;
    }

    if (window.location.port === '8080') {
      return `${window.location.origin}/api`;
    }

    if (window.location.port === '5173') {
      return `http://${window.location.hostname}:3000/api`;
    }

    return `${window.location.origin}/api`;
  }

  return 'http://localhost:3000/api';
};

const API_URL = getApiBaseUrl();

export interface ProviderExperience {
  id: string;
  providerId: string;
  companyName: string;
  duration: string;
  period: string;
  description: string;
  testimonyPhotos: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  fullName: string | null;
  phone: string | null;
  address: string | null;
  documentType: 'DNI' | 'NIE' | 'PASSPORT' | null;
  documentNumber: string | null;
  isVerified: boolean;
  avatarUrl: string | null;
  availableCredits: number;
  frozenCredits: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  experiences?: ProviderExperience[];
}

export interface AuthUserSummary {
  id: string;
  email: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  fullName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone: string | null;
  availableCredits?: number;
  frozenCredits?: number;
  isVerified?: boolean;
  avatarUrl?: string | null;
  rating?: number;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: AuthUserSummary;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUserSummary;
}

export interface RechargeCreditsResponse {
  message: string;
  creditsAdded: number;
  amountPaidEur: number;
  availableCredits: number;
  frozenCredits: number;
}

export interface AddExperienceResponse {
  message: string;
  experience: ProviderExperience;
}

export interface UpdateProfileResponse {
  message: string;
  user: Partial<UserProfile>;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const loginUser = async (data: { email: string; password: string }): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error en login');
  }
  return response.json();
};

export const registerUser = async (data: FormData | Record<string, unknown>): Promise<AuthResponse> => {
  const isFormData = data instanceof FormData;
  const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
  const body = isFormData ? data : JSON.stringify(data);

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error en registro');
  }

  return response.json();
};

export const getMyProfile = async (): Promise<UserProfile> => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error al obtener perfil');
  }

  return response.json();
};

export const rechargeCredits = async (credits: number, amountEur: number): Promise<RechargeCreditsResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/auth/credits/recharge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ credits, amountEur }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error al recargar créditos');
  }

  return response.json();
};

export const addProviderExperience = async (formData: FormData): Promise<AddExperienceResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/auth/experiences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error al agregar experiencia laboral');
  }

  return response.json();
};

export const updateProfileAvatar = async (formData: FormData): Promise<UpdateProfileResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error al actualizar perfil');
  }

  return response.json();
};

export const createServiceRequest = async (data: {
  title: string;
  description: string;
  category: string;
  priceSuggested: number;
}) => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error creating service request');
  }

  return response.json();
};

export const createWindowQuote = async (formData: FormData) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/window-quotes`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error creating window quote request');
  }

  return response.json();
};

export const getWindowQuotes = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/window-quotes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error fetching window quotes');
  }

  return response.json();
};

export const updateWindowQuoteStatus = async (id: string, status: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/window-quotes/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error updating window quote status');
  }

  return response.json();
};

export const exportWindowQuotesExcel = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/window-quotes/export-excel`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error exporting window quotes');
  }

  return response.blob();
};

export const getPendingServices = async () => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/services/pending`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error fetching pending services');
  }

  return response.json();
};

export const createOffer = async (data: {
  serviceRequestId: string;
  priceOffered: number;
  comment: string;
}) => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error creating offer');
  }

  return response.json();
};

export const getMyOffers = async () => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/offers/my-offers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error fetching provider offers');
  }

  return response.json();
};

export const getMyRequests = async () => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/services/my-requests`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error fetching my requests');
  }

  return response.json();
};

export const acceptOffer = async (offerId: string) => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/offers/${offerId}/accept`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error accepting offer');
  }

  return response.json();
};

export const getMyJobs = async () => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/services/my-jobs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error fetching provider jobs');
  }

  return response.json();
};

export const updateServiceStatus = async (serviceId: string, status: string) => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/services/${serviceId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorData?.message || 'Error updating service status');
  }

  return response.json();
};
