const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
