const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3000/api`;
  }
  return 'http://localhost:3000/api';
};

const API_URL = getApiBaseUrl();

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const loginUser = async (data: any) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error en login');
  }
  return response.json();
};

export const registerUser = async (data: any) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error en registro');
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
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error creating service request');
  }

  return response.json();
};

export const createWindowQuote = async (formData: FormData) => {
  const token = getAuthToken();
  const headers: any = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/window-quotes`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
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
    const errorData = await response.json().catch(() => null);
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
    const errorData = await response.json().catch(() => null);
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
    const errorData = await response.json().catch(() => null);
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
    const errorData = await response.json().catch(() => null);
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
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error creating offer');
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
    const errorData = await response.json().catch(() => null);
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
    const errorData = await response.json().catch(() => null);
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
    const errorData = await response.json().catch(() => null);
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
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error updating service status');
  }

  return response.json();
};
