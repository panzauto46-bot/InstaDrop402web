// Types, utilities and storage for InstaDrop 402
// NO MORE MOCK DATA — marketplace only shows real uploads

export interface DropFile {
  id: string;
  name: string;
  size: number;
  type: string;
  price: number;
  isFree: boolean;
  seller: string;
  createdAt: Date;
  url: string;
  description?: string;
  category?: string;
  downloads?: number;
  thumbnail?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getFileIcon(type: string): string {
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'zip';
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return 'image';
  if (type.includes('video') || type.includes('mp4')) return 'video';
  if (type.includes('audio') || type.includes('mp3')) return 'audio';
  if (type.includes('text') || type.includes('doc')) return 'doc';
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json') || type.includes('html') || type.includes('css') || type.includes('code')) return 'code';
  if (type.includes('design') || type.includes('figma') || type.includes('sketch')) return 'design';
  return 'file';
}

// Local storage for drops (backup only when server is running)
const drops: Map<string, DropFile> = new Map();

export function saveDrop(drop: DropFile): void {
  drops.set(drop.id, drop);
  const stored = JSON.parse(localStorage.getItem('instadrop_drops') || '{}');
  stored[drop.id] = { ...drop, createdAt: drop.createdAt.toISOString() };
  localStorage.setItem('instadrop_drops', JSON.stringify(stored));
}

export function getDrop(id: string): DropFile | null {
  // Try memory first
  const memDrop = drops.get(id);
  if (memDrop) return memDrop;

  // Try localStorage
  const stored = JSON.parse(localStorage.getItem('instadrop_drops') || '{}');
  if (stored[id]) {
    const drop = { ...stored[id], createdAt: new Date(stored[id].createdAt) };
    drops.set(id, drop);
    return drop;
  }

  return null;
}

export function getAllDrops(): DropFile[] {
  const stored = JSON.parse(localStorage.getItem('instadrop_drops') || '{}');
  const localDrops: DropFile[] = Object.values(stored).map((d: unknown) => {
    const drop = d as DropFile & { createdAt: string };
    return { ...drop, createdAt: new Date(drop.createdAt) };
  });
  return localDrops;
}

export function getUserDrops(address: string): DropFile[] {
  return getAllDrops().filter(d => d.seller === address);
}
