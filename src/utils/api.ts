// API client for InstaDrop 402
// All functions call the backend — NO mock fallback

import { API_BASE } from '../config/stacks';

export interface DropData {
  id: string;
  title: string;
  price: number;
  isFree: boolean;
  sellerWallet: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  description: string;
  category: string;
  downloads: number;
  timestamp: string;
}

export class PaymentRequiredError extends Error {
  price: number;
  currency: string;
  recipient: string;
  fileId: string;

  constructor(data: { price: number; currency: string; recipient: string; fileId: string }) {
    super('Payment Required');
    this.name = 'PaymentRequiredError';
    this.price = data.price;
    this.currency = data.currency;
    this.recipient = data.recipient;
    this.fileId = data.fileId;
  }
}

// Helper for headers
const getHeaders = () => {
  return {
    'Bypass-Tunnel-Reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
  };
};

// Fetch all drops from server
export async function fetchAllDrops(): Promise<DropData[]> {
  const res = await fetch(`${API_BASE}/files`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch drops');
  const json = await res.json();
  return json.data || [];
}

// Fetch single drop by ID
export async function fetchDrop(id: string): Promise<DropData | null> {
  const res = await fetch(`${API_BASE}/files/${id}`, { headers: getHeaders() });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

// Fetch drops by seller wallet
export async function fetchSellerDrops(wallet: string): Promise<DropData[]> {
  const res = await fetch(`${API_BASE}/files/seller/${wallet}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch seller drops');
  const json = await res.json();
  return json.data || [];
}

// Fetch platform stats
export async function fetchStats(): Promise<{
  totalFiles: number;
  totalDownloads: number;
  totalSellers: number;
}> {
  const res = await fetch(`${API_BASE}/stats`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  const json = await res.json();
  return json.data;
}

// Upload a file to the server
export async function uploadFile(params: {
  file: File;
  title: string;
  price: number;
  isFree: boolean;
  sellerWallet: string;
  description?: string;
  category?: string;
}): Promise<DropData> {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('title', params.title);
  formData.append('price', params.price.toString());
  formData.append('isFree', params.isFree.toString());
  formData.append('sellerWallet', params.sellerWallet);
  formData.append('description', params.description || '');
  formData.append('category', params.category || '');

  // Note: specific headers for bypass, but let browser handle Content-Type for FormData
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Bypass-Tunnel-Reminder': 'true',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  const json = await res.json();
  return json.data;
}

// Download file with x402 payment protocol
export async function downloadFile(id: string, txId?: string): Promise<Response> {
  const url = txId
    ? `${API_BASE}/download/${id}?txId=${encodeURIComponent(txId)}`
    : `${API_BASE}/download/${id}`;

  const res = await fetch(url, { headers: getHeaders() });

  if (res.status === 402) {
    const data = await res.json();
    throw new PaymentRequiredError({
      price: data.price,
      currency: data.currency,
      recipient: data.recipient,
      fileId: data.fileId,
    });
  }

  if (res.status === 403) {
    const data = await res.json();
    throw new Error(data.error || 'Payment verification failed');
  }

  if (!res.ok) {
    throw new Error('Download failed');
  }

  return res;
}

// Trigger browser download from response
export async function triggerDownload(response: Response, filename: string): Promise<void> {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
