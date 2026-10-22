import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  Copy,
  Check,
  Maximize2,
  Sparkles,
  Play,
} from 'lucide-react';
import { CreationItem } from '../types';

interface GalleryViewProps {
  items: CreationItem[];
  onSelectForVideo: (imageUrl: string, prompt: string) => void;
  onViewFullscreen: (item: CreationItem) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  items,
  onSelectForVideo,
  onViewFullscreen,
}) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleCopyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: CreationItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `lumina-${item.type}-${item.id}.${item.type === 'video' ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5 uppercase tracking-wider">
            <span>Stüdyo Koleksiyonu</span>
            <span>·</span>
            <span>{items.length} Eser</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Koleksiyon & Üretilenler
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Ürettiğiniz fotoğraf ve videoları inceleyin, indirin veya bir fotoğrafı doğrudan videoya dönüştürün.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Tümü ({items.length})
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'image'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fotoğraflar</span>
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'video'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Videolar</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Sparkles className="w-8 h-8 text-neutral-600 mb-2" />
          <h3 className="text-base font-semibold text-neutral-300">Bu kategoride içerik bulunamadı</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Fotoğraf veya Video Stüdyosu sekmelerinden ilk eserinizi üreterek koleksiyonunuza ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl overflow-hidden shadow-xl hover:border-neutral-700 transition-all flex flex-col group"
            >
              {/* Media Container */}
              <div
                className="relative bg-neutral-950 flex items-center justify-center overflow-hidden cursor-pointer aspect-video"
                onClick={() => onViewFullscreen(item)}
              >
                {item.type === 'video' ? (
                  item.url.endsWith('.jpg') || item.url.endsWith('.png') ? (
                    <div className="relative w-full h-full">
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-rose-500/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <video
                      src={item.url}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  )
                ) : (
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Type & Format Badges (unboxed or minimal) */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-mono">
                  {item.type === 'video' ? (
                    <span className="flex items-center gap-1 text-rose-300 font-semibold">
                      <VideoIcon className="w-3 h-3" />
                      Video · {item.duration || '5s'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <ImageIcon className="w-3 h-3" />
                      Fotoğraf · {item.aspectRatio}
                    </span>
                  )}
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  <span className="px-3 py-1.5 bg-neutral-900/90 text-white rounded-lg text-xs font-medium border border-neutral-700 shadow-md flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    Büyüt
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                {/* Clean Unboxed Metadata */}
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <span>{item.model}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.createdAt}</span>
                </div>

                {/* Prompt */}
                <p className="text-xs text-neutral-200 line-clamp-3 leading-relaxed">
                  {item.prompt}
                </p>

                {/* Action Toolbar */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyPrompt(item.id, item.prompt)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Promptu Kopyala"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                      title="İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.type === 'image' && (
                    <button
                      onClick={() => onSelectForVideo(item.url, item.prompt)}
                      className="px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg transition-all flex items-center gap-1"
                    >
                      <VideoIcon className="w-3 h-3 text-rose-400" />
                      <span>Canlandır</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
