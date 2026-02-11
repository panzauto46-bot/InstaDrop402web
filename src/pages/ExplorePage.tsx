import { useState, useEffect } from 'react';
import {
  Lock, Search, Filter, FileText, FileArchive, Image, Film, Music, Code, File,
  Gift, Download, Zap, Eye, ShoppingBag, Sparkles, X, Loader2, AlertCircle
} from 'lucide-react';
import { fetchAllDrops } from '../utils/api';
import { formatFileSize, truncateAddress, getFileIcon } from '../store';

interface ExplorePageProps {
  onNavigateToDrop: (id: string) => void;
}

const CATEGORIES = ['All', 'Ebook', 'Code', 'Design', 'Audio'];

const fileIconMapLarge: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-8 h-8 text-red-400" />,
  zip: <FileArchive className="w-8 h-8 text-yellow-400" />,
  image: <Image className="w-8 h-8 text-purple-400" />,
  video: <Film className="w-8 h-8 text-blue-400" />,
  audio: <Music className="w-8 h-8 text-green-400" />,
  code: <Code className="w-8 h-8 text-cyan-400" />,
  doc: <FileText className="w-8 h-8 text-blue-300" />,
  design: <Image className="w-8 h-8 text-pink-400" />,
  file: <File className="w-8 h-8 text-slate-400" />,
};

const categoryColors: Record<string, string> = {
  Ebook: 'text-red-400 bg-red-400/10 border-red-400/20',
  Code: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  Design: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  Audio: 'text-green-400 bg-green-400/10 border-green-400/20',
};

function getThumbnailGradient(type: string): string {
  const gradients: Record<string, string> = {
    pdf: 'from-red-900/30 via-red-800/10 to-slate-900/60',
    zip: 'from-yellow-900/30 via-yellow-800/10 to-slate-900/60',
    image: 'from-purple-900/30 via-purple-800/10 to-slate-900/60',
    video: 'from-blue-900/30 via-blue-800/10 to-slate-900/60',
    audio: 'from-green-900/30 via-green-800/10 to-slate-900/60',
    code: 'from-cyan-900/30 via-cyan-800/10 to-slate-900/60',
    design: 'from-pink-900/30 via-pink-800/10 to-slate-900/60',
  };
  return gradients[type] || 'from-slate-800/30 via-slate-700/10 to-slate-900/60';
}

// Unified display type for marketplace cards
interface DisplayDrop {
  id: string;
  name: string;
  size: number;
  type: string;
  price: number;
  isFree: boolean;
  seller: string;
  description: string;
  category: string;
  downloads: number;
}

function MarketplaceCard({ drop, onUnlock }: { drop: DisplayDrop; onUnlock: () => void }) {
  const iconType = getFileIcon(drop.type);
  const gradient = getThumbnailGradient(iconType);
  const catColor = drop.category ? categoryColors[drop.category] || 'text-slate-400 bg-slate-400/10 border-slate-400/20' : '';

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800/60 hover:border-electric/30 transition-all duration-300 overflow-hidden">
      {/* Thumbnail Area */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        <div className="relative z-10 w-16 h-16 rounded-2xl bg-slate-900/60 border border-slate-700/40 flex items-center justify-center backdrop-blur-sm shadow-xl">
          {fileIconMapLarge[iconType]}
        </div>

        {!drop.isFree && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
            <Lock className="w-3 h-3 text-stacks" />
            <span className="text-[10px] font-mono text-stacks font-bold">LOCKED</span>
          </div>
        )}

        {drop.category && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold uppercase tracking-wider ${catColor}`}>
            {drop.category}
          </div>
        )}

        <div className="absolute inset-0 bg-electric/0 group-hover:bg-electric/5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
            <Eye className="w-3.5 h-3.5 text-white" />
            <span className="text-xs text-white font-medium">Preview</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold text-white mb-1.5 truncate group-hover:text-electric transition-colors">
          {drop.name}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {drop.description || 'No description available'}
        </p>

        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600 mb-4">
          <span>{formatFileSize(drop.size)}</span>
          <span className="text-slate-800">•</span>
          <span className="truncate">{truncateAddress(drop.seller)}</span>
          <span className="text-slate-800">•</span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {drop.downloads}
          </span>
        </div>

        <button
          onClick={onUnlock}
          className={`
            w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
            ${drop.isFree
              ? 'bg-success/10 border border-success/30 text-success hover:bg-success/20 hover:border-success/40 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gradient-to-r from-stacks to-stacks-dark text-slate-900 font-bold hover:shadow-lg hover:shadow-stacks/20 hover:scale-[1.02] active:scale-[0.98]'
            }
          `}
        >
          {drop.isFree ? (
            <>
              <Gift className="w-4 h-4" />
              Download Free
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              {drop.price} STX
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function ExplorePage({ onNavigateToDrop }: ExplorePageProps) {
  const [drops, setDrops] = useState<DisplayDrop[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    loadDrops();
  }, []);

  const loadDrops = async () => {
    setLoading(true);
    setServerError(false);
    try {
      const apiDrops = await fetchAllDrops();
      const mapped: DisplayDrop[] = apiDrops.map((d) => ({
        id: d.id,
        name: d.originalName || d.title,
        size: d.size,
        type: d.mimetype || 'file',
        price: d.price,
        isFree: d.isFree,
        seller: d.sellerWallet,
        description: d.description,
        category: d.category,
        downloads: d.downloads,
      }));
      setDrops(mapped);
    } catch {
      // Server is offline — show error, NO mock data
      setDrops([]);
      setServerError(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrops = drops.filter((drop) => {
    const matchSearch = drop.name.toLowerCase().includes(search.toLowerCase()) ||
      drop.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || drop.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] rounded-full bg-stacks/3 blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] rounded-full bg-electric/3 blur-3xl" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pt-8 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-stacks/10 border border-stacks/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-stacks" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Explore Drops</h1>
              <p className="text-sm text-slate-500">Discover and unlock premium digital files</p>
            </div>
          </div>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Server is offline. Run <code className="font-mono bg-red-500/10 px-1.5 py-0.5 rounded">npm run server</code> to load marketplace data.</span>
            <button onClick={loadDrops} className="ml-auto px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files, descriptions..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-700/50 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border
                    ${activeCategory === cat
                      ? 'bg-electric/10 border-electric/30 text-electric'
                      : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:text-white hover:border-slate-600'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            Showing <span className="text-white font-semibold">{filteredDrops.length}</span> drops
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-stacks" />
            <span>x402 Direct Payment</span>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-electric animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading drops...</p>
          </div>
        ) : filteredDrops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDrops.map((drop, i) => (
              <div key={drop.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <MarketplaceCard
                  drop={drop}
                  onUnlock={() => onNavigateToDrop(drop.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {serverError ? 'Server Offline' : 'No drops found'}
            </h3>
            <p className="text-sm text-slate-500">
              {serverError
                ? 'Start the server to browse the marketplace'
                : search || activeCategory !== 'All'
                  ? 'Try different search terms or filters'
                  : 'No files have been uploaded yet. Be the first seller!'
              }
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-slate-900/40 border border-slate-800/50">
            <div className="w-12 h-12 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-electric" />
            </div>
            <h3 className="text-lg font-bold text-white">Got something to sell?</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Upload your digital file and start earning STX in minutes. No setup required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
