import { useState, useEffect } from 'react';
import {
  Zap, ShoppingBag, Upload, ArrowRight, Shield, Globe, Clock,
  Lock, FileText, FileArchive, Image, Film, Music, Code, File,
  Gift, Download, Users, TrendingUp, Loader2, AlertCircle
} from 'lucide-react';
import { formatFileSize, getFileIcon, type DropFile } from '../store';
import { fetchAllDrops, fetchStats } from '../utils/api';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onNavigateToDrop: (id: string) => void;
}

const fileIconMapCard: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-6 h-6 text-red-400" />,
  zip: <FileArchive className="w-6 h-6 text-yellow-400" />,
  image: <Image className="w-6 h-6 text-purple-400" />,
  video: <Film className="w-6 h-6 text-blue-400" />,
  audio: <Music className="w-6 h-6 text-green-400" />,
  code: <Code className="w-6 h-6 text-cyan-400" />,
  doc: <FileText className="w-6 h-6 text-blue-300" />,
  design: <Image className="w-6 h-6 text-pink-400" />,
  file: <File className="w-6 h-6 text-slate-400" />,
};

function RecentDropCard({ drop, onClick }: { drop: DropFile; onClick: () => void }) {
  const iconType = getFileIcon(drop.type);
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-electric/30 hover:bg-slate-800/40 transition-all duration-300 cursor-pointer text-left overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-electric/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Icon + Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/30 flex items-center justify-center">
            {fileIconMapCard[iconType]}
          </div>
          {drop.category && (
            <span className="px-2 py-1 rounded-md bg-slate-800/60 border border-slate-700/20 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {drop.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white mb-1 truncate group-hover:text-electric transition-colors">
          {drop.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 min-h-[2rem]">
          {drop.description || 'No description'}
        </p>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
            <span>{formatFileSize(drop.size)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {drop.downloads || 0}
            </span>
          </div>

          {drop.isFree ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-semibold">
              <Gift className="w-3 h-3" />
              Free
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stacks/10 border border-stacks/20 text-stacks text-xs font-mono font-bold">
              <Lock className="w-3 h-3" />
              {drop.price} STX
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function HomePage({ onNavigate, onNavigateToDrop }: HomePageProps) {
  const [recentDrops, setRecentDrops] = useState<DropFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);
  const [stats, setStats] = useState<{ totalFiles: number; totalDownloads: number; totalSellers: number }>({
    totalFiles: 0,
    totalDownloads: 0,
    totalSellers: 0,
  });

  useEffect(() => {
    // Fetch real stats from API
    fetchStats()
      .then((data) => {
        setStats(data);
        setServerOnline(true);
      })
      .catch(() => {
        setServerOnline(false);
      });

    // Fetch real drops from API
    fetchAllDrops()
      .then((apiDrops) => {
        const mapped: DropFile[] = apiDrops.slice(0, 4).map((d) => ({
          id: d.id,
          name: d.originalName || d.title,
          size: d.size,
          type: d.mimetype || 'file',
          price: d.price,
          isFree: d.isFree,
          seller: d.sellerWallet,
          createdAt: new Date(d.timestamp),
          url: `instadrop.xyz/d/${d.id}`,
          description: d.description,
          category: d.category,
          downloads: d.downloads,
        }));
        setRecentDrops(mapped);
        setServerOnline(true);
      })
      .catch(() => {
        setRecentDrops([]);
        setServerOnline(false);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-electric/3 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-stacks/3 blur-3xl" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="relative z-10">
        {/* Server offline warning */}
        {!serverOnline && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Server is offline. Please run <code className="font-mono bg-red-500/10 px-1.5 py-0.5 rounded">npm run server</code> to enable full functionality.</span>
            </div>
          </div>
        )}

        {/* ===== HERO SECTION ===== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric/10 border border-electric/30 text-electric text-xs font-mono font-semibold mb-8 animate-fade-in-up">
            <Zap className="w-3.5 h-3.5" />
            THE INSTANT PAY-TO-DOWNLOAD PROTOCOL
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Sell any digital file.
            <br />
            <span className="bg-gradient-to-r from-electric via-electric-light to-stacks bg-clip-text text-transparent">
              Get paid instantly.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Upload your file, set a price in STX, share the link.
            Buyers pay and download instantly — no accounts, no stores, no middlemen.
            <span className="text-electric font-medium"> WeTransfer meets Web3.</span>
          </p>

          {/* ===== TWO GATEWAY BUTTONS ===== */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Start Selling - Primary */}
            <button
              onClick={() => onNavigate('dashboard')}
              className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-electric to-electric-dark text-white font-bold text-lg shadow-xl shadow-electric/20 hover:shadow-2xl hover:shadow-electric/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <Upload className="w-5 h-5" />
              Start Selling
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Explore Drops - Secondary */}
            <button
              onClick={() => onNavigate('explore')}
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/60 border-2 border-slate-700/50 text-slate-200 font-bold text-lg hover:border-stacks/40 hover:bg-slate-800/80 hover:text-white hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-5 h-5 text-stacks" />
              Explore Drops
              <ArrowRight className="w-5 h-5 text-stacks group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats Bar — Real data from API */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: stats.totalFiles.toLocaleString(), label: 'Files Uploaded', icon: <TrendingUp className="w-4 h-4 text-electric" /> },
              { value: stats.totalDownloads.toLocaleString(), label: 'Downloads', icon: <Download className="w-4 h-4 text-success" /> },
              { value: stats.totalSellers.toLocaleString(), label: 'Sellers', icon: <Users className="w-4 h-4 text-stacks" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  {stat.icon}
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono">{stat.value}</span>
                </div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                icon: <Upload className="w-6 h-6 text-electric" />,
                title: 'Upload & Set Price',
                desc: 'Drag & drop your file. Set price in STX or make it free.',
                bgClass: 'bg-electric/10 border-electric/20',
              },
              {
                step: '02',
                icon: <Globe className="w-6 h-6 text-stacks" />,
                title: 'Share the Link',
                desc: 'Get a unique URL. Share it anywhere — Twitter, Discord, email.',
                bgClass: 'bg-stacks/10 border-stacks/20',
              },
              {
                step: '03',
                icon: <Zap className="w-6 h-6 text-success" />,
                title: 'Instant Payment',
                desc: 'Buyers pay via wallet. File downloads automatically. Done.',
                bgClass: 'bg-success/10 border-success/20',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700/60 transition-all duration-300 group"
              >
                <div className="absolute top-4 right-4 text-[40px] font-extrabold text-slate-800/40 font-mono leading-none select-none">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl ${item.bgClass} border flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== RECENT DROPS TEASER ===== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stacks/10 border border-stacks/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-stacks" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recent Drops</h2>
                <p className="text-xs text-slate-500">Latest files available on the marketplace</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30 text-slate-400 hover:text-white hover:border-electric/30 text-sm font-medium transition-all cursor-pointer"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 text-electric animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading drops...</p>
            </div>
          ) : recentDrops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentDrops.map((drop) => (
                <RecentDropCard
                  key={drop.id}
                  drop={drop}
                  onClick={() => onNavigateToDrop(drop.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-slate-900/30 border border-slate-800/30">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-7 h-7 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No drops yet</h3>
              <p className="text-sm text-slate-500 mb-6">Be the first to upload and sell a digital file!</p>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 rounded-xl bg-electric/10 border border-electric/30 text-electric font-medium text-sm hover:bg-electric/20 transition-all cursor-pointer"
              >
                Upload Your First File
              </button>
            </div>
          )}
        </section>

        {/* ===== FEATURES STRIP ===== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900/80 via-electric/5 to-slate-900/80 border border-slate-800/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: <Shield className="w-5 h-5 text-electric" />, label: 'Encrypted Files', sub: 'End-to-end security' },
                { icon: <Zap className="w-5 h-5 text-stacks" />, label: 'Instant Download', sub: 'After payment confirms' },
                { icon: <Globe className="w-5 h-5 text-success" />, label: 'No Sign Up', sub: 'Just connect wallet' },
                { icon: <Lock className="w-5 h-5 text-purple-400" />, label: 'HTTP 402', sub: 'Native paywall protocol' },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/30 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <span className="text-sm font-semibold text-white">{f.label}</span>
                  <span className="text-[11px] text-slate-500">{f.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
