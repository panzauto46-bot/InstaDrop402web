import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ToastProvider } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { DashboardPage } from './pages/DashboardPage';
import { DropPage } from './pages/DropPage';
import { useWallet } from './hooks/useWallet';
import { fetchDrop, type DropData } from './utils/api';
import { type DropFile } from './store';
import { Zap } from 'lucide-react';

type Page =
  | { type: 'home' }
  | { type: 'explore' }
  | { type: 'dashboard' }
  | { type: 'drop'; id: string };

function getPageFromHash(): Page {
  const hash = window.location.hash.replace('#/', '').replace('#', '');

  if (hash.startsWith('drop/')) {
    return { type: 'drop', id: hash.replace('drop/', '') };
  }
  if (hash === 'explore') return { type: 'explore' };
  if (hash === 'dashboard') return { type: 'dashboard' };
  return { type: 'home' };
}

function getPagePath(page: Page): string {
  switch (page.type) {
    case 'home': return '';
    case 'explore': return 'explore';
    case 'dashboard': return 'dashboard';
    case 'drop': return `drop/${page.id}`;
  }
}

// Convert API DropData to DropFile format
function apiDropToLocal(d: DropData): DropFile {
  return {
    id: d.id,
    name: d.originalName || d.title,
    size: d.size,
    type: d.mimetype || d.originalName?.split('.').pop() || 'file',
    price: d.price,
    isFree: d.isFree,
    seller: d.sellerWallet,
    createdAt: new Date(d.timestamp),
    url: `instadrop.xyz/d/${d.id}`,
    description: d.description,
    category: d.category,
    downloads: d.downloads,
  };
}

export function App() {
  const [page, setPage] = useState<Page>(getPageFromHash);
  const { wallet, connect, disconnect } = useWallet();
  const [currentDrop, setCurrentDrop] = useState<DropFile | null>(null);
  const [loadingDrop, setLoadingDrop] = useState(false);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const newPage = getPageFromHash();
      setPage(newPage);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load drop data when navigating to drop page — API only, no mock fallback
  useEffect(() => {
    if (page.type === 'drop') {
      setLoadingDrop(true);
      fetchDrop(page.id)
        .then((apiDrop) => {
          if (apiDrop) {
            setCurrentDrop(apiDropToLocal(apiDrop));
          } else {
            setCurrentDrop(null);
          }
        })
        .catch(() => {
          setCurrentDrop(null);
        })
        .finally(() => setLoadingDrop(false));
    } else {
      setCurrentDrop(null);
      setLoadingDrop(false);
    }
  }, [page]);

  const navigateTo = useCallback((path: string) => {
    window.location.hash = `#/${path}`;
  }, []);

  const navigateToDrop = useCallback((id: string) => {
    window.location.hash = `#/drop/${id}`;
  }, []);

  const walletProps = {
    connected: wallet.connected,
    address: wallet.address,
  };

  const currentPath = getPagePath(page);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        {/* Navbar */}
        <Navbar
          wallet={walletProps}
          onConnect={connect}
          onDisconnect={disconnect}
          currentPage={page.type === 'drop' ? 'explore' : currentPath}
          onNavigate={navigateTo}
        />

        {/* Page Content */}
        {page.type === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onNavigateToDrop={navigateToDrop}
          />
        )}

        {page.type === 'explore' && (
          <ExplorePage
            onNavigateToDrop={navigateToDrop}
          />
        )}

        {page.type === 'dashboard' && (
          <DashboardPage
            wallet={walletProps}
            onConnect={connect}
            onNavigateToDrop={navigateToDrop}
          />
        )}

        {page.type === 'drop' && (
          loadingDrop ? (
            <div className="min-h-screen flex items-center justify-center pt-16">
              <div className="text-center animate-fade-in-up">
                <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-500">Loading drop...</p>
              </div>
            </div>
          ) : (
            <DropPage
              drop={currentDrop}
              wallet={walletProps}
              onBack={() => navigateTo('explore')}
            />
          )
        )}

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-800/50 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Zap className="w-3 h-3 text-electric" />
                <span className="font-mono font-semibold">InstaDrop 402</span>
                <span>•</span>
                <span>The Instant Pay-to-Download Protocol</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <button onClick={() => navigateTo('')} className="hover:text-slate-400 transition-colors cursor-pointer">Home</button>
                <button onClick={() => navigateTo('explore')} className="hover:text-slate-400 transition-colors cursor-pointer">Explore</button>
                <button onClick={() => navigateTo('dashboard')} className="hover:text-slate-400 transition-colors cursor-pointer">Dashboard</button>
                <span>•</span>
                <span className="font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-stacks animate-pulse inline-block" />
                  Stacks Testnet
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
