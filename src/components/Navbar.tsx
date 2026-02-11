import { useState, useEffect } from 'react';
import { Zap, Wallet, ChevronDown, LogOut, Copy, Check, Home, Compass, LayoutDashboard, Menu, X, Loader2 } from 'lucide-react';
import { truncateAddress } from '../store';
import { fetchSTXBalance } from '../config/stacks';

interface NavbarProps {
  wallet: { connected: boolean; address: string | null };
  onConnect: () => void;
  onDisconnect: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ wallet, onConnect, onDisconnect, currentPage, onNavigate }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch real wallet balance from blockchain
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      setLoadingBalance(true);
      fetchSTXBalance(wallet.address)
        .then((bal) => setBalance(bal))
        .finally(() => setLoadingBalance(false));
    } else {
      setBalance(null);
    }
  }, [wallet.connected, wallet.address]);

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, path: '' },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-4 h-4" />, path: 'explore' },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: 'dashboard' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('')}
            className="flex items-center gap-2.5 group cursor-pointer flex-shrink-0"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-electric to-electric-dark flex items-center justify-center shadow-lg shadow-electric/20 group-hover:shadow-electric/40 transition-shadow">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-stacks border-2 border-slate-950 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                Insta<span className="text-electric">Drop</span>
              </span>
              <span className="text-[10px] font-mono text-stacks font-semibold tracking-widest leading-none mt-0.5">
                402
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.path;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.path)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive
                      ? 'bg-electric/10 text-electric border border-electric/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Wallet + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Wallet Connect */}
            <div className="relative">
              {!wallet.connected ? (
                <button
                  onClick={onConnect}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric/10 border border-electric/30 text-electric hover:bg-electric/20 hover:border-electric/50 transition-all duration-200 text-sm font-medium group cursor-pointer"
                >
                  <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:border-electric/30 transition-all duration-200 text-sm cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-mono text-slate-300 text-xs">
                    {truncateAddress(wallet.address || '')}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Wallet Dropdown */}
              {showMenu && wallet.connected && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 glass rounded-xl border border-slate-700/50 shadow-2xl shadow-black/50 animate-fade-in-up overflow-hidden">
                    <div className="p-3 border-b border-slate-700/50">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Connected Wallet</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-slate-300 flex-1 truncate">
                          {wallet.address}
                        </p>
                        <button
                          onClick={handleCopy}
                          className="p-1 rounded hover:bg-slate-700/50 transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-3 border-b border-slate-700/50">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Balance</p>
                      {loadingBalance ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-stacks animate-spin" />
                          <span className="text-sm text-slate-400">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-stacks font-mono">
                          {balance !== null ? balance.toFixed(2) : '0.00'} <span className="text-xs text-slate-500">STX</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        onDisconnect();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800/50 glass animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.path;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.path);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive
                      ? 'bg-electric/10 text-electric border border-electric/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
