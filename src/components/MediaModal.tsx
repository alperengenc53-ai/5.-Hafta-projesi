import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, Video, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CreationItem } from '../types';

interface MediaModalProps {
  item: CreationItem | null;
  onClose: () => void;
  onSendToVideo: (imageUrl: string, prompt: string) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  item,
  onClose,
  onSendToVideo,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `lumina-${item.type}-${item.id}.${item.type === 'video' ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
            {item.type === 'video' ? (
              <span className="flex items-center gap-1.5 text-rose-400">
                <Video className="w-4 h-4" />
                <span>Video İnceleme</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400">
                <ImageIcon className="w-4 h-4" />
                <span>Fotoğraf İnceleme</span>
              </span>
            )}
            <span>·</span>
            <span>{item.model}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Viewport */}
        <div className="flex-1 bg-black overflow-auto flex items-center justify-center p-4 min-h-[300px]">
          {item.type === 'video' ? (
            item.url.endsWith('.jpg') || item.url.endsWith('.png') ? (
              <img
                src={item.url}
                alt={item.prompt}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <video
                src={item.url}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            )
          ) : (
            <img
              src={item.url}
              alt={item.prompt}
              className="max-h-[60vh] max-w-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Footer Details & Actions */}
        <div className="p-5 border-t border-neutral-800 bg-neutral-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1 text-xs text-neutral-400 font-semibold">
              <span>Prompt Açıklaması</span>
              <button
                onClick={handleCopyPrompt}
                className="text-amber-400 hover:text-amber-300 font-normal flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
            <p className="text-xs text-neutral-200 line-clamp-3 leading-relaxed">
              {item.prompt}
            </p>
            {item.cameraSettings && (
              <div className="text-[11px] text-neutral-400 font-mono mt-1">
                Kamera: {item.cameraSettings}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {item.type === 'image' && (
              <button
                onClick={() => {
                  onClose();
                  onSendToVideo(item.url, item.prompt);
                }}
                className="px-3.5 py-2 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Videoya Dönüştür</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
