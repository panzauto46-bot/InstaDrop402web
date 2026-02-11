import { useState, useEffect } from 'react';
import {
  Lock, Unlock, Download, FileText, FileArchive, Image, Film, Music, Code, File,
  Shield, Clock, CheckCircle, Loader2, ArrowLeft, Zap, AlertCircle, XCircle
} from 'lucide-react';
import { type DropFile, formatFileSize, getFileIcon, truncateAddress } from '../store';
import { useToast } from '../components/Toast';
import { downloadFile, triggerDownload } from '../utils/api';
import { stxToMicroStx, stxToUsd, NETWORK } from '../config/stacks';

interface DropPageProps {
  drop: DropFile | null;
  wallet: { connected: boolean; address: string | null };
  onBack: () => void;
}

type PaymentStatus = 'idle' | 'connecting' | 'paying' | 'confirming' | 'success' | 'error';

const fileIconMap: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-10 h-10 text-red-400" />,
  zip: <FileArchive className="w-10 h-10 text-yellow-400" />,
  image: <Image className="w-10 h-10 text-purple-400" />,
  video: <Film className="w-10 h-10 text-blue-400" />,
  audio: <Music className="w-10 h-10 text-green-400" />,
  code: <Code className="w-10 h-10 text-cyan-400" />,
  doc: <FileText className="w-10 h-10 text-blue-300" />,
  design: <Image className="w-10 h-10 text-pink-400" />,
  file: <File className="w-10 h-10 text-slate-400" />,
};

export function DropPage({ drop, wallet, onBack }: DropPageProps) {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [txId, setTxId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (status === 'confirming') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('success');
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Auto-download after successful payment
  useEffect(() => {
    if (status === 'success' && drop) {
      handleAutoDownload();
    }
  }, [status]);

  const handleAutoDownload = async () => {
    if (!drop) return;
    setDownloading(true);
    try {
      const response = await downloadFile(drop.id, txId || undefined);
      await triggerDownload(response, drop.name);
      showToast('File downloaded successfully!', 'success');
    } catch {
      showToast('Auto-download failed. Click the download button to try again.', 'info');
    } finally {
      setDownloading(false);
    }
  };

  if (!drop) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Drop Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">This drop doesn't exist or the server is offline.</p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-electric/10 border border-electric/30 text-electric text-sm font-medium hover:bg-electric/20 transition-all cursor-pointer"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const iconType = getFileIcon(drop.type);
  const isLocked = status !== 'success';

  const handlePay = async () => {
    if (drop.isFree) {
      setStatus('confirming');
      setProgress(0);
      return;
    }

    if (!wallet.connected) {
      showToast('Please connect your wallet first!', 'error');
      return;
    }

    setStatus('paying');
    setErrorMessage(null);

    try {
      const { openSTXTransfer } = await import('@stacks/connect');

      openSTXTransfer({
        recipient: drop.seller,
        amount: BigInt(stxToMicroStx(drop.price)),
        memo: `instadrop:${drop.id}`,
        network: NETWORK,
        onFinish: (data: { txId: string }) => {
          const transactionId = data.txId;
          setTxId(transactionId);
          setStatus('confirming');
          setProgress(0);
          showToast('Transaction submitted! Waiting for confirmation...', 'info');
        },
        onCancel: () => {
          setStatus('error');
          setErrorMessage('Transaction was cancelled by user.');
          showToast('Transaction cancelled.', 'error');
        },
      });
    } catch (err: unknown) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Payment failed';

      if (message.includes('insufficient') || message.includes('balance')) {
        setErrorMessage('Insufficient STX balance. Please top up your wallet.');
      } else if (message.includes('wallet') || message.includes('extension')) {
        setErrorMessage('No Stacks wallet detected. Please install Leather or Xverse.');
      } else {
        setErrorMessage(message);
      }
      showToast('Payment failed: ' + message, 'error');
    }
  };

  const handleDownload = async () => {
    if (!drop) return;
    setDownloading(true);
    try {
      const response = await downloadFile(drop.id, txId || undefined);
      await triggerDownload(response, drop.name);
      showToast('Download started!', 'success');
    } catch {
      showToast('Download failed. The server may be offline.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-electric/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric/20 to-transparent" />
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-8 mt-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </button>

        {/* 402 Badge */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stacks/10 border border-stacks/30 text-stacks text-xs font-mono font-semibold mb-4">
            <Zap className="w-3 h-3" />
            HTTP 402 — PAYMENT REQUIRED
          </div>
        </div>

        {/* Main Card */}
        <div className={`
          rounded-3xl overflow-hidden transition-all duration-700
          ${status === 'success'
            ? 'bg-gradient-to-br from-success/5 to-success/10 border-2 border-success/40 shadow-2xl shadow-success/10'
            : 'glass border border-slate-700/50 shadow-2xl shadow-black/50'
          }
        `}>
          {/* File Preview Section */}
          <div className="p-8 text-center border-b border-slate-700/30">
            <div className="relative inline-block mb-6">
              {isLocked ? (
                <div className={`w-24 h-24 rounded-2xl bg-slate-800/80 border-2 border-slate-700/50 flex items-center justify-center mx-auto ${status === 'paying' || status === 'confirming' ? 'animate-lock-shake' : 'animate-float'}`}>
                  <Lock className="w-12 h-12 text-slate-400" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-success/10 border-2 border-success/40 flex items-center justify-center mx-auto animate-check-appear">
                  <Unlock className="w-12 h-12 text-success" />
                </div>
              )}

              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/50 flex items-center justify-center shadow-lg">
                {fileIconMap[iconType]}
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">{drop.name}</h2>
            <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-500">
              <span>{formatFileSize(drop.size)}</span>
              <span className="text-slate-700">•</span>
              <span className="uppercase">{drop.name.split('.').pop()}</span>
            </div>

            {drop.description && (
              <p className="mt-3 text-sm text-slate-500 max-w-sm mx-auto">
                {drop.description}
              </p>
            )}

            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <Shield className="w-3.5 h-3.5 text-electric" />
              <span className="text-xs text-slate-400">Seller:</span>
              <span className="text-xs font-mono text-electric">{truncateAddress(drop.seller)}</span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-8">
            {status === 'idle' && (
              <div className="animate-fade-in-up">
                <div className="text-center mb-6">
                  {drop.isFree ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold text-success">FREE</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-stacks/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-stacks">S</span>
                        </div>
                        <span className="text-4xl font-bold text-white font-mono">{drop.price}</span>
                        <span className="text-lg text-slate-500 font-mono">STX</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        ≈ ${stxToUsd(drop.price)} USD
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={handlePay}
                  className={`
                    w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer
                    ${drop.isFree
                      ? 'bg-gradient-to-r from-success to-success-dark hover:shadow-lg hover:shadow-success/25 text-white hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gradient-to-r from-stacks to-stacks-dark hover:shadow-lg hover:shadow-stacks/25 text-slate-900 font-bold hover:scale-[1.02] active:scale-[0.98]'
                    }
                  `}
                >
                  {drop.isFree ? (
                    <>
                      <Download className="w-5 h-5" />
                      DOWNLOAD FOR FREE
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      PAY {drop.price} STX TO UNLOCK
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-600 mt-3 flex items-center justify-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Secured by Stacks Blockchain (Testnet)
                </p>
              </div>
            )}

            {status === 'paying' && (
              <div className="text-center animate-fade-in-up">
                <Loader2 className="w-8 h-8 text-stacks animate-spin mx-auto mb-3" />
                <p className="text-sm text-stacks font-medium">Confirm in your wallet...</p>
                <p className="text-xs text-slate-500 mt-1">Waiting for transaction approval</p>
              </div>
            )}

            {status === 'confirming' && (
              <div className="animate-fade-in-up">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-electric animate-spin" />
                    <p className="text-sm text-electric font-medium">Confirming on blockchain...</p>
                  </div>
                  <p className="text-xs text-slate-500">Verifying payment in mempool</p>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-electric to-stacks transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs font-mono text-slate-500 text-center">
                  {Math.min(Math.round(progress), 100)}% confirmed
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success/40 flex items-center justify-center mx-auto mb-4 animate-check-appear">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-success mb-1">Payment Confirmed!</h3>
                <p className="text-sm text-slate-400 mb-6">Your file is ready to download</p>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-success to-success-dark hover:shadow-lg hover:shadow-success/25 text-white font-semibold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download {drop.name}
                    </>
                  )}
                </button>

                {txId && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
                    <p className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-success" />
                      TX: {txId.slice(0, 10)}...{txId.slice(-6)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-red-400 mb-1">Payment Failed</h3>
                <p className="text-sm text-slate-400 mb-6">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>

                <button
                  onClick={() => {
                    setStatus('idle');
                    setErrorMessage(null);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white font-medium text-sm hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-600">
            Powered by <span className="text-electric font-semibold">InstaDrop 402</span> — The Instant Pay-to-Download Protocol
          </p>
        </div>
      </div>
    </div>
  );
}
