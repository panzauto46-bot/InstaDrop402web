import { useState } from 'react';
import { DollarSign, Gift, Loader2, Link as LinkIcon, Share2, Check, Copy, ExternalLink } from 'lucide-react';

interface PriceConfiguratorProps {
  onCreateDrop: (price: number, isFree: boolean) => void;
  isCreating: boolean;
  dropLink: string | null;
}

export function PriceConfigurator({ onCreateDrop, isCreating, dropLink }: PriceConfiguratorProps) {
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('5');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (dropLink) {
      navigator.clipboard.writeText(dropLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const text = `🔒 I just created a Drop on InstaDrop 402!\n\nPay ${isFree ? 'FREE' : price + ' STX'} to unlock and download.\n\n${dropLink}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (dropLink) {
    return (
      <div className="animate-fade-in-up">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-success/5 to-electric/5 border border-success/30 backdrop-blur-sm">
          {/* Success Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-success/20 border border-success/40 flex items-center justify-center">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Drop Created!</h3>
              <p className="text-xs text-slate-400">Share this link with your buyers</p>
            </div>
          </div>

          {/* Link Display */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-700/30 mb-4">
            <LinkIcon className="w-4 h-4 text-electric flex-shrink-0" />
            <span className="text-sm font-mono text-electric flex-1 truncate">{dropLink}</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-electric/10 hover:bg-electric/20 border border-electric/30 text-electric text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShareTwitter}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:border-electric/30 text-slate-300 hover:text-white text-sm font-medium transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share to Twitter
            </button>
            <button
              onClick={() => {
                const path = dropLink.split('/').pop();
                window.location.hash = `#/drop/${path}`;
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-electric/10 border border-electric/30 text-electric hover:bg-electric/20 text-sm font-medium transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-stacks" />
          Price Configurator
        </h3>

        {/* Toggle Free/Paid */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setIsFree(false)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              !isFree
                ? 'bg-stacks/15 border border-stacks/40 text-stacks'
                : 'bg-slate-800/50 border border-slate-700/30 text-slate-400 hover:text-slate-300'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Paid
          </button>
          <button
            onClick={() => setIsFree(true)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isFree
                ? 'bg-success/15 border border-success/40 text-success'
                : 'bg-slate-800/50 border border-slate-700/30 text-slate-400 hover:text-slate-300'
            }`}
          >
            <Gift className="w-4 h-4" />
            Free
          </button>
        </div>

        {/* Price Input */}
        {!isFree && (
          <div className="mb-5 animate-fade-in-up">
            <label className="block text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">
              Amount in STX
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white font-mono text-lg placeholder-slate-600 focus:outline-none focus:border-stacks/50 focus:ring-1 focus:ring-stacks/20 transition-all"
                placeholder="5.00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-stacks/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-stacks">S</span>
                </div>
                <span className="text-xs font-mono text-stacks font-medium">STX</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              ≈ ${(parseFloat(price || '0') * 0.45).toFixed(2)} USD
            </p>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={() => onCreateDrop(isFree ? 0 : parseFloat(price || '0'), isFree)}
          disabled={isCreating || (!isFree && (!price || parseFloat(price) <= 0))}
          className={`
            w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
            ${isCreating
              ? 'bg-electric/20 border border-electric/30 text-electric/50 cursor-wait'
              : 'bg-gradient-to-r from-electric to-electric-dark hover:shadow-lg hover:shadow-electric/25 text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none'
            }
          `}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Drop...
            </>
          ) : (
            <>
              <Sparkle />
              Create Drop
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" />
    </svg>
  );
}
