import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Upload,
  X,
  Download,
  Copy,
  Check,
  Video,
  Maximize2,
  AlertCircle,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { AspectRatio, CreationItem } from '../types';
import { STYLE_PRESETS, PROMPT_SUGGESTIONS } from '../data/showcase';

interface ImageStudioProps {
  onImageGenerated: (item: CreationItem) => void;
  onSendToVideo: (imageUrl: string, prompt: string) => void;
  onViewFullscreen: (item: CreationItem) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({
  onImageGenerated,
  onSendToVideo,
  onViewFullscreen,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [latestResult, setLatestResult] = useState<CreationItem | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel dosyası (PNG, JPG, WEBP) seçin.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Görsel boyutu en fazla 15MB olabilir.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Lütfen önce temel bir prompt girin.');
      return;
    }

    setIsEnhancing(true);
    setError(null);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: 'image',
          style: STYLE_PRESETS.find((s) => s.id === selectedStyle)?.label,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Prompt iyileştirilemedi.');
      }

      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Lütfen üretmek istediğiniz sahneyi açıklayan bir prompt yazın.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep('Model hazırlanıyor...');

    // Compose final prompt with style preset if not already contained
    const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
    let finalPrompt = prompt.trim();
    if (styleObj && !finalPrompt.includes(styleObj.promptSuffix.trim())) {
      finalPrompt += styleObj.promptSuffix;
    }

    try {
      const timer1 = setTimeout(() => setLoadingStep('Kompozisyon ve ışık hesaplanıyor...'), 1200);
      const timer2 = setTimeout(() => setLoadingStep('Pikseller oluşturuluyor ve işleniyor...'), 3500);

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio,
          referenceImage: referenceImage || undefined,
          quality,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Görsel üretilirken bir sorun oluştu.');
      }

      const newItem: CreationItem = {
        id: `img-${Date.now()}`,
        type: 'image',
        url: data.imageUrl,
        prompt: finalPrompt,
        aspectRatio: data.aspectRatio || aspectRatio,
        createdAt: 'Az önce',
        model: data.model || 'gemini-3.1-flash-lite-image',
        style: styleObj?.label,
        sourceImageUrl: referenceImage || undefined,
      };

      setLatestResult(newItem);
      onImageGenerated(newItem);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `lumina-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1.5 uppercase tracking-wider">
            <span>Gemini Vision Engine</span>
            <span>·</span>
            <span>Metin & Görsel Girişi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Yapay Zeka Fotoğraf Stüdyosu
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Ayrıntılı metin tariflerinden veya kaynak görsellerden ultra yüksek çözünürlüklü,
            sinematik fotoğraflar ve dijital sanat eserleri üretin.
          </p>
        </div>

        {/* Quick Suggestion Ideas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-md">
          <span className="text-xs text-neutral-500 whitespace-nowrap flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-neutral-400" />
            Örnekler:
          </span>
          {PROMPT_SUGGESTIONS.filter((p) => p.type === 'image')
            .slice(0, 2)
            .map((item, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(item.prompt)}
                className="px-2.5 py-1 text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-md transition-all whitespace-nowrap"
              >
                {item.title}
              </button>
            ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Prompt Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="image-prompt" className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <span>Prompt (Sahne Tanımı)</span>
              </label>

              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Promptu Gemini AI ile zenginleştir ve sinematik detaylar ekle"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Geliştiriliyor...' : 'Promptu Zenginleştir'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                id="image-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örn: Yağmurlu bir gecede neon ışıklarıyla aydınlanan İstanbul Boğazı, sokak lambalarının su birikintilerindeki yansıması, 35mm film tonu, sinematik kompozisyon..."
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40 transition-all resize-y"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
              <span>İpucu: Türkçe veya İngilizce detaylı betimlemeler en iyi sonucu verir.</span>
              <span className="font-mono tabular-nums">{prompt.length} karakter</span>
            </div>
          </div>

          {/* Style Presets */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block mb-3">
              Görsel Tarzı & Sanat Stili
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all ${
                    selectedStyle === style.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/10'
                      : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ratio & Quality Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block mb-3">
                En-Boy Oranı (Aspect Ratio)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                      aspectRatio === ratio
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-mono">{ratio}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
                      {ratio === '1:1'
                        ? 'Kare'
                        : ratio === '16:9'
                        ? 'Yatay'
                        : ratio === '9:16'
                        ? 'Dikey'
                        : ratio}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality / Model Mode */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block mb-3">
                Çözünürlük & Kalite
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setQuality('standard')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    quality === 'standard'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="text-xs font-semibold">Standart</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">Hızlı ve dengeli</div>
                </button>

                <button
                  onClick={() => setQuality('hd')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    quality === 'hd'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>Ultra HD 1K</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                      Pro
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">Yüksek doku ve keskinlik</div>
                </button>
              </div>
            </div>
          </div>

          {/* Reference Image Upload (Image-to-Image) */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Referans Görsel (İsteğe Bağlı)
                </span>
                <span className="text-[10px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">
                  Görselden Görsele Dönüştürme
                </span>
              </div>
              {referenceImage && (
                <button
                  type="button"
                  onClick={() => setReferenceImage(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Kaldır
                </button>
              )}
            </div>

            {referenceImage ? (
              <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 max-h-48 flex items-center justify-center">
                <img
                  src={referenceImage}
                  alt="Referans görsel"
                  className="max-h-48 object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => setReferenceImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-4 text-center cursor-pointer transition-all bg-neutral-950/50 hover:bg-neutral-950"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                  <Upload className="w-5 h-5 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-300">
                    Fotoğraf Yükle veya Buraya Sürükle
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Mevcut bir fotoğrafı değiştirmek, stilini dönüştürmek veya yeni ögeler eklemek için
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-rose-200">İşlem Başarısız Oldu</div>
                <div className="mt-0.5">{error}</div>
              </div>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{loadingStep || 'Görsel Oluşturuluyor...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Fotoğrafı Üret</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Output & Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Stüdyo Çıktısı & Önizleme
              </span>
              {latestResult && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Hazır
                </span>
              )}
            </div>

            {/* Display Canvas */}
            <div className="w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/80 flex items-center justify-center relative min-h-[380px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-indigo-500/20 border-b-indigo-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  <div className="text-sm font-semibold text-white">{loadingStep}</div>
                  <div className="text-xs text-neutral-400 max-w-xs">
                    Gemini AI piksel düzeyinde sahneyi inşa ediyor. Birkaç saniye sürebilir...
                  </div>
                </div>
              ) : latestResult ? (
                <div className="relative w-full h-full group">
                  <img
                    src={latestResult.url}
                    alt={latestResult.prompt}
                    className="w-full h-full object-contain max-h-[520px] rounded-xl"
                    referrerPolicy="no-referrer"
                  />

                  {/* Overlay Quick Actions */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-neutral-950/85 backdrop-blur-md p-1.5 rounded-xl border border-neutral-700/60 shadow-lg">
                    <button
                      onClick={() => onViewFullscreen(latestResult)}
                      className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Tam Ekran İncele"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(latestResult.url)}
                      className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                      title="İndir"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-neutral-500">
                  <ImageIcon className="w-10 h-10 text-neutral-600 stroke-[1.5]" />
                  <span className="text-xs font-medium text-neutral-400">Henüz Görsel Üretilmedi</span>
                  <span className="text-[11px] text-neutral-500 max-w-xs">
                    Soldaki panelden bir prompt yazarak &quot;Fotoğrafı Üret&quot; butonuna basın.
                  </span>
                </div>
              )}
            </div>

            {/* Post Generation Actions & Bridge to Video */}
            {latestResult && (
              <div className="mt-4 flex flex-col gap-3">
                {/* Bridge to Video Button! */}
                <button
                  onClick={() => onSendToVideo(latestResult.url, latestResult.prompt)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md group"
                >
                  <Video className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span>Bu Fotoğrafı Videoya Dönüştür (Canlandır) &rarr;</span>
                </button>

                {/* Prompt Details */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="font-semibold text-neutral-300">Prompt Detayı</span>
                    <button
                      onClick={() => handleCopyPrompt(latestResult.prompt)}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                  <p className="text-neutral-300 line-clamp-3 leading-relaxed text-[11px]">
                    {latestResult.prompt}
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-850 text-[10px] text-neutral-500 font-mono">
                    <span>Model: {latestResult.model}</span>
                    <span>·</span>
                    <span>Oran: {latestResult.aspectRatio}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
