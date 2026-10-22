import React from 'react';
import { Sparkles, Image, Video, Wand2, FolderHeart } from 'lucide-react';

interface HeaderProps {
  activeTab: 'image' | 'video' | 'assistant' | 'gallery';
  setActiveTab: (tab: 'image' | 'video' | 'assistant' | 'gallery') => void;
  galleryCount: number;
  onQuickNew: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  galleryCount,
  onQuickNew,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap">
              Lumina AI
              <span className="text-[11px] font-medium tracking-normal text-amber-400/90 font-mono">
                Stüdyo
              </span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-900/80 border border-neutral-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'image'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
            }`}
          >
            <Image className="w-3.5 h-3.5 text-amber-400" />
            <span>Fotoğraf Üret</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'video'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span>Video Üret</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'assistant'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Prompt Sihirbazı</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'gallery'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Koleksiyon ({galleryCount})</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickNew}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-300 rounded-lg hover:from-amber-300 hover:to-amber-200 active:scale-95 transition-all shadow-md shadow-amber-400/20 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yeni Proje</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-3 pt-2.5 border-t border-neutral-850">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[11px] ${
            activeTab === 'image' ? 'text-amber-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Fotoğraf</span>
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[11px] ${
            activeTab === 'video' ? 'text-rose-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video</span>
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[11px] ${
            activeTab === 'assistant' ? 'text-indigo-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Sihirbaz</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[11px] ${
            activeTab === 'gallery' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          <FolderHeart className="w-4 h-4" />
          <span>Koleksiyon</span>
        </button>
      </div>
    </header>
  );
};
