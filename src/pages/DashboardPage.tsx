import { useState, useEffect } from 'react';
import { DropZone } from '../components/DropZone';
import { PriceConfigurator } from '../components/PriceConfigurator';
import { useToast } from '../components/Toast';
import { uploadFile, fetchSellerDrops } from '../utils/api';
import {
  formatFileSize, truncateAddress, getFileIcon,
} from '../store';
import {
  Wallet, Shield, LayoutDashboard, ArrowRight, Zap, TrendingUp,
  FileText, FileArchive, Image, Film, Music, Code, File,
  Gift, ExternalLink, Clock, Package, DollarSign, AlertCircle, Loader2
} from 'lucide-react';

interface DashboardPageProps {
  wallet: { connected: boolean; address: string | null };
  onConnect: () => void;
  onNavigateToDrop: (id: string) => void;
}

const fileIconMapSmall: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-400" />,
  zip: <FileArchive className="w-4 h-4 text-yellow-400" />,
  image: <Image className="w-4 h-4 text-purple-400" />,
  video: <Film className="w-4 h-4 text-blue-400" />,
  audio: <Music className="w-4 h-4 text-green-400" />,
  code: <Code className="w-4 h-4 text-cyan-400" />,
  doc: <FileText className="w-4 h-4 text-blue-300" />,
  design: <Image className="w-4 h-4 text-pink-400" />,
  file: <File className="w-4 h-4 text-slate-400" />,
};

const UPLOAD_CATEGORIES = [
  { value: '', label: 'Select Category' },
  { value: 'Ebook', label: '📄 Ebook' },
  { value: 'Code', label: '💻 Code' },
  { value: 'Design', label: '🎨 Design' },
  { value: 'Audio', label: '🎵 Audio' },
];

function WalletGate({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-electric/3 blur-3xl" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 text-center">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm">
          <div className="w-20 h-20 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-electric" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            You need to connect a Stacks wallet (Leather or Xverse) to access the Seller Dashboard.
            Your wallet address is used to receive payments.
          </p>

          <button
            onClick={onConnect}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-electric to-electric-dark text-white font-bold text-base hover:shadow-lg hover:shadow-electric/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
            <Shield className="w-3.5 h-3.5" />
            <span>Supports Leather & Xverse wallets</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Unified drop type for display (works with both API and local data)
interface DisplayDrop {
  id: string;
  name: string;
  size: number;
  type: string;
  price: number;
  isFree: boolean;
  downloads: number;
  createdAt: Date;
}

export function DashboardPage({ wallet, onConnect, onNavigateToDrop }: DashboardPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dropLink, setDropLink] = useState<string | null>(null);
  const [myDrops, setMyDrops] = useState<DisplayDrop[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const { showToast } = useToast();

  // Load user's drops from API
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      loadMyDrops();
    }
  }, [wallet.connected, wallet.address]);

  const loadMyDrops = async () => {
    if (!wallet.address) return;
    setLoadingDrops(true);
    setServerError(false);

    try {
      const apiDrops = await fetchSellerDrops(wallet.address);
      const drops: DisplayDrop[] = apiDrops.map((d) => ({
        id: d.id,
        name: d.originalName || d.title,
        size: d.size,
        type: d.mimetype || 'file',
        price: d.price,
        isFree: d.isFree,
        downloads: d.downloads,
        createdAt: new Date(d.timestamp),
      }));
      setMyDrops(drops);
    } catch {
      setMyDrops([]);
      setServerError(true);
    } finally {
      setLoadingDrops(false);
    }
  };

  if (!wallet.connected) {
    return <WalletGate onConnect={onConnect} />;
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setDropLink(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setDropLink(null);
    setDescription('');
    setCategory('');
  };

  const handleCreateDrop = async (price: number, isFree: boolean) => {
    if (!selectedFile || !wallet.address) return;

    setIsCreating(true);

    try {
      const drop = await uploadFile({
        file: selectedFile,
        title: selectedFile.name,
        price,
        isFree,
        sellerWallet: wallet.address,
        description,
        category,
      });

      setDropLink(`${window.location.origin}/#/drop/${drop.id}`);
      showToast('Upload successful! Your file is now live on the marketplace.', 'success');
      setDescription('');
      setCategory('');

      // Reload my drops
      await loadMyDrops();
    } catch {
      // Show clear error — no silent fallback
      showToast('Upload failed. Please make sure the server is running (npm run server).', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const totalEarnings = myDrops.reduce((sum, d) => sum + (d.isFree ? 0 : d.price * d.downloads), 0);
  const totalDownloads = myDrops.reduce((sum, d) => sum + d.downloads, 0);

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-electric/3 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-stacks/3 blur-3xl" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-electric" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Seller Dashboard</h1>
              <p className="text-sm text-slate-500">
                Connected as <span className="font-mono text-electric">{truncateAddress(wallet.address || '')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Server is offline. Run <code className="font-mono bg-red-500/10 px-1.5 py-0.5 rounded">npm run server</code> to enable uploads and file management.</span>
            <button onClick={loadMyDrops} className="ml-auto px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in-up">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-electric" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Files</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{myDrops.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Downloads</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{totalDownloads}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-stacks" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Earned</span>
            </div>
            <p className="text-2xl font-bold text-stacks font-mono">{totalEarnings} <span className="text-xs text-slate-500">STX</span></p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-electric" />
            <h2 className="text-lg font-semibold text-white">Create New Drop</h2>
          </div>

          {/* Drop Zone */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <DropZone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={handleClear}
            />
          </div>

          {/* Description & Category Fields */}
          {selectedFile && (
            <div className="mb-6 animate-fade-in-up space-y-4">
              {/* Description */}
              <div>
                <label className="block text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your file — what buyers will get..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all appearance-none cursor-pointer"
                >
                  {UPLOAD_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-slate-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Configurator */}
              <PriceConfigurator
                onCreateDrop={handleCreateDrop}
                isCreating={isCreating}
                dropLink={dropLink}
              />
            </div>
          )}
        </div>

        {/* My Files Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-lg font-semibold text-white">My Files</h2>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/60 text-xs font-mono text-slate-500">{myDrops.length}</span>
          </div>

          {loadingDrops ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 text-electric animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading your files...</p>
            </div>
          ) : myDrops.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-slate-800/30">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">No files yet</p>
              <p className="text-xs text-slate-600">Upload your first file above to start selling</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myDrops
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((drop) => {
                  const iconType = getFileIcon(drop.type);
                  return (
                    <button
                      key={drop.id}
                      onClick={() => onNavigateToDrop(drop.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-electric/30 hover:bg-slate-800/40 transition-all group cursor-pointer text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800/60 border border-slate-700/30 flex items-center justify-center flex-shrink-0">
                        {fileIconMapSmall[iconType]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate group-hover:text-electric transition-colors">{drop.name}</p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                          <span>{formatFileSize(drop.size)}</span>
                          <span className="text-slate-800">•</span>
                          <span>{drop.createdAt.toLocaleDateString()}</span>
                          <span className="text-slate-800">•</span>
                          <span>{drop.downloads} downloads</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {drop.isFree ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-medium">
                            <Gift className="w-3 h-3" />
                            Free
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-stacks/10 border border-stacks/20 text-stacks text-xs font-mono font-bold">
                            {drop.price} STX
                          </span>
                        )}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-electric transition-colors" />
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
