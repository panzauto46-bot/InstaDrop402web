import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, FileArchive, Image, Film, Music, Code, File,
  X, Sparkles
} from 'lucide-react';
import { formatFileSize, getFileIcon } from '../store';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const fileIconMap: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-8 h-8 text-red-400" />,
  zip: <FileArchive className="w-8 h-8 text-yellow-400" />,
  image: <Image className="w-8 h-8 text-purple-400" />,
  video: <Film className="w-8 h-8 text-blue-400" />,
  audio: <Music className="w-8 h-8 text-green-400" />,
  code: <Code className="w-8 h-8 text-cyan-400" />,
  doc: <FileText className="w-8 h-8 text-blue-300" />,
  file: <File className="w-8 h-8 text-slate-400" />,
};

export function DropZone({ onFileSelect, selectedFile, onClear }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  if (selectedFile) {
    const iconType = getFileIcon(selectedFile.type || selectedFile.name);
    return (
      <div className="animate-fade-in-up">
        <div className="relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
          {/* Clear button */}
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* File Icon */}
            <div className="w-16 h-16 rounded-xl bg-slate-900/80 border border-slate-700/30 flex items-center justify-center flex-shrink-0">
              {fileIconMap[iconType]}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-base truncate">{selectedFile.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </span>
                <span className="text-slate-700">•</span>
                <span className="text-xs font-mono text-slate-500 uppercase">
                  {selectedFile.name.split('.').pop() || 'file'}
                </span>
              </div>
            </div>

            {/* Checkmark */}
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
        ${isDragging
          ? 'border-electric bg-electric/5 scale-[1.02] shadow-2xl shadow-electric/20'
          : 'border-slate-700/50 hover:border-electric/40 hover:bg-slate-800/30'
        }
      `}
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Glow effect */}
      <div className="absolute inset-0 drop-zone-gradient" />

      <div className="relative z-10 flex flex-col items-center justify-center py-16 px-8">
        {/* Upload Icon */}
        <div className={`
          w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300
          ${isDragging
            ? 'bg-electric/20 border border-electric/50 animate-pulse-glow'
            : 'bg-slate-800/80 border border-slate-700/30'
          }
        `}>
          <Upload className={`w-9 h-9 transition-colors ${isDragging ? 'text-electric' : 'text-slate-400'}`} />
        </div>

        {/* Text */}
        <h3 className={`text-lg font-semibold mb-2 transition-colors ${isDragging ? 'text-electric' : 'text-white'}`}>
          {isDragging ? 'Drop it here!' : 'Drag & Drop file here to sell'}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          or <span className="text-electric hover:underline">browse from your device</span>
        </p>

        {/* Supported formats */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['PDF', 'ZIP', 'PNG', 'MP4', 'JPEG', 'MP3', 'DOCX'].map((format) => (
            <span
              key={format}
              className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/30 text-[10px] font-mono text-slate-500 uppercase tracking-wider"
            >
              {format}
            </span>
          ))}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        onChange={handleInputChange}
        className="hidden"
        accept=".pdf,.zip,.rar,.7z,.png,.jpg,.jpeg,.gif,.mp4,.mov,.mp3,.wav,.doc,.docx,.txt,.html,.css,.js,.ts,.json"
      />
    </div>
  );
}
