import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageStudio } from './components/ImageStudio';
import { VideoStudio } from './components/VideoStudio';
import { PromptAssistant } from './components/PromptAssistant';
import { GalleryView } from './components/GalleryView';
import { MediaModal } from './components/MediaModal';
import { CreationItem } from './types';
import { INITIAL_SHOWCASE } from './data/showcase';
import { Sparkles, Image as ImageIcon, Video as VideoIcon, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'assistant' | 'gallery'>('image');
  const [creations, setCreations] = useState<CreationItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_creations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_SHOWCASE;
  });

  const [videoInitialImage, setVideoInitialImage] = useState<string | null>(null);
  const [videoInitialPrompt, setVideoInitialPrompt] = useState<string>('');
  const [fullscreenItem, setFullscreenItem] = useState<CreationItem | null>(null);

  // Sync creations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lumina_creations', JSON.stringify(creations));
    } catch {
      // Ignore quota errors if data URLs are large
    }
  }, [creations]);

  const handleNewCreation = (newItem: CreationItem) => {
    setCreations((prev) => [newItem, ...prev]);
  };

  const handleSendToVideo = (imageUrl: string, prompt: string) => {
    setVideoInitialImage(imageUrl);
    setVideoInitialPrompt(prompt);
    setActiveTab('video');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUsePromptForImage = (prompt: string) => {
    setActiveTab('image');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUsePromptForVideo = (prompt: string) => {
    setVideoInitialPrompt(prompt);
    setActiveTab('video');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickNew = () => {
    setVideoInitialImage(null);
    setVideoInitialPrompt('');
    setActiveTab('image');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        galleryCount={creations.length}
        onQuickNew={handleQuickNew}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1">
        {activeTab === 'image' && (
          <ImageStudio
            onImageGenerated={handleNewCreation}
            onSendToVideo={handleSendToVideo}
            onViewFullscreen={(item) => setFullscreenItem(item)}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudio
            initialImage={videoInitialImage}
            initialPrompt={videoInitialPrompt}
            onVideoGenerated={handleNewCreation}
            onViewFullscreen={(item) => setFullscreenItem(item)}
          />
        )}

        {activeTab === 'assistant' && (
          <PromptAssistant
            onUseForImage={handleUsePromptForImage}
            onUseForVideo={handleUsePromptForVideo}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            items={creations}
            onSelectForVideo={handleSendToVideo}
            onViewFullscreen={(item) => setFullscreenItem(item)}
          />
        )}
      </main>

      {/* Lightbox Modal */}
      <MediaModal
        item={fullscreenItem}
        onClose={() => setFullscreenItem(null)}
        onSendToVideo={handleSendToVideo}
      />

      {/* Subtle Studio Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 px-4 md:px-8 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">Lumina AI Stüdyo</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.1 Flash Image & Omni Flash Video</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Metinden Görsel</span>
            <span aria-hidden="true">·</span>
            <span>Görselden Video</span>
            <span aria-hidden="true">·</span>
            <span>Prompt Sihirbazı</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
