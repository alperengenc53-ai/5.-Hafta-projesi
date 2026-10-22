import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Wand2,
  Upload,
  X,
  Download,
  Copy,
  Check,
  Maximize2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Clapperboard,
  Film,
} from 'lucide-react';
import { CreationItem } from '../types';
import { VIDEO_MOTION_PRESETS, PROMPT_SUGGESTIONS } from '../data/showcase';

interface VideoStudioProps {
  initialImage?: string | null;
  initialPrompt?: string;
  onVideoGenerated: (item: CreationItem) => void;
  onViewFullscreen: (item: CreationItem) => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  initialImage,
  initialPrompt,
  onVideoGenerated,
  onViewFullscreen,
}) => {
  const [mode, setMode] = useState<'text-to-video' | 'image-to-video'>(
    initialImage ? 'image-to-video' : 'text-to-video'
  );
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [sourceImage, setSourceImage] = useState<string | null>(initialImage || null);
  const [selectedMotion, setSelectedMotion] = useState('push-in');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<'5s' | '10s'>('5s');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [latestResult, setLatestResult] = useState<CreationItem | null>(null);

  // Video player controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImage) {
      setSourceImage(initialImage);
      setMode('image-to-video');
    }
    if (initialPrompt && !prompt) {
      setPrompt(initialPrompt);
    }
  }, [initialImage, initialPrompt]);

  useEffect(() => {
    if (!latestResult || latestResult.url.startsWith('data:video')) return;

    const canvas = document.getElementById('cinematic-motion-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = latestResult.url;

    let animId: number;
    let t = 0;

    img.onload = () => {
      canvas.width = img.naturalWidth || 1280;
      canvas.height = img.naturalHeight || 720;

      const render = () => {
        if (!isPlaying) {
          animId = requestAnimationFrame(render);
          return;
        }

        t += 0.008 * playbackSpeed;
        const scale = 1 + 0.07 * (Math.sin(t) * 0.5 + 0.5);
        const offsetX = Math.sin(t * 0.7) * 16;
        const offsetY = Math.cos(t * 0.5) * 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Subtle cinematic atmospheric lighting sweep
        const sweepX = ((Math.sin(t * 0.8) + 1) / 2) * canvas.width;
        const grad = ctx.createLinearGradient(sweepX - 180, 0, sweepX + 180, canvas.height);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.5, 'rgba(255, 230, 200, 0.05)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.restore();
        animId = requestAnimationFrame(render);
      };

      render();
    };

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [latestResult, isPlaying, playbackSpeed]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel dosyası (PNG, JPG) yükleyin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Lütfen önce temel bir video sahnesi promptu girin.');
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
          type: 'video',
          style: VIDEO_MOTION_PRESETS.find((m) => m.id === selectedMotion)?.label,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Video promptu iyileştirilemedi.');
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
    if (mode === 'text-to-video' && !prompt.trim()) {
      setError('Lütfen video sahnesini anlatan bir metin girin.');
      return;
    }

    if (mode === 'image-to-video' && !sourceImage) {
      setError('Lütfen canlandırmak için bir fotoğraf yükleyin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep('Omni Video Modeli başlatılıyor...');

    // Combine motion preset with prompt
    const motionObj = VIDEO_MOTION_PRESETS.find((m) => m.id === selectedMotion);
    let finalPrompt = prompt.trim();
    if (motionObj && !finalPrompt.includes(motionObj.promptModifier)) {
      finalPrompt = finalPrompt ? `${finalPrompt}. ${motionObj.promptModifier}` : motionObj.promptModifier;
    }

    try {
      const t1 = setTimeout(() => setLoadingStep('Kamera yörüngesi ve hareket fiziği hesaplanıyor...'), 2000);
      const t2 = setTimeout(() => setLoadingStep('Video kareleri sentezleniyor (720p/1080p)...'), 6000);
      const t3 = setTimeout(() => setLoadingStep('Zamansal süreklilik ve ışık kodlaması tamamlanıyor...'), 12000);

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          referenceImage: mode === 'image-to-video' ? sourceImage : undefined,
          aspectRatio,
          duration,
          resolution,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Video üretimi sırasında bir hata oluştu.');
      }

      const newItem: CreationItem = {
        id: `vid-${Date.now()}`,
        type: 'video',
        url: data.videoUrl,
        prompt: finalPrompt,
        aspectRatio: data.aspectRatio || aspectRatio,
        duration: data.duration || duration,
        resolution: data.resolution || resolution,
        createdAt: 'Az önce',
        model: 'gemini-omni-1.1-flash',
        style: motionObj?.label,
        sourceImageUrl: sourceImage || undefined,
      };

      setLatestResult(newItem);
      onVideoGenerated(newItem);
      setIsPlaying(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleDownload = (videoUrl: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `lumina-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const setSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1.5 uppercase tracking-wider">
            <span>Gemini Omni Flash 1.1</span>
            <span>·</span>
            <span>Sinematik Video Sentezi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Yapay Zeka Video Stüdyosu
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Metin tariflerinden sinematik video sahneleri oluşturun veya herhangi bir fotoğrafı gerçekçi
            kamera hareketleri ve dinamik fizik ile canlandırın.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setMode('text-to-video')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === 'text-to-video'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Metinden Video</span>
          </button>
          <button
            onClick={() => setMode('image-to-video')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === 'image-to-video'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Fotoğrafı Canlandır</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Image-to-Video Photo Uploader if in image-to-video mode */}
          {mode === 'image-to-video' && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                  Canlandırılacak Kaynak Fotoğraf
                </span>
                {sourceImage && (
                  <button
                    onClick={() => setSourceImage(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Fotoğrafı Değiştir
                  </button>
                )}
              </div>

              {sourceImage ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 max-h-56 flex items-center justify-center">
                  <img
                    src={sourceImage}
                    alt="Canlandırılacak fotoğraf"
                    className="max-h-56 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[11px] text-white flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span>Canlandırmaya hazır</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-rose-500/30 hover:border-rose-500/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-neutral-950/60 hover:bg-neutral-950"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <Upload className="w-6 h-6 text-rose-400" />
                    <span className="text-xs font-semibold text-rose-200">
                      Fotoğraf Seç veya Sürükle
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Fotoğraf Stüdyosundan veya bilgisayarınızdan herhangi bir görsel yükleyin
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video Prompt Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="video-prompt" className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <span>{mode === 'image-to-video' ? 'Hareket & Atmosfer Tanımı' : 'Video Sahnesi Tanımı'}</span>
              </label>

              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Geliştiriliyor...' : 'Video Dinamiklerini Güçlendir'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                id="video-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'image-to-video'
                    ? 'Örn: Kamera yavaşça nesneye doğru ilerliyor, rüzgarda saçlar hafifçe dalgalanıyor, arka plandaki ışıklar parıldıyor...'
                    : 'Örn: Karla kaplı dağların üzerinden süzülen bir kartalın sinematik drone takibi, gün batımı ışıkları, 60fps akıcı hareket...'
                }
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/40 transition-all resize-y"
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
              <span>Omni Flash modeli dinamik kamera ve ışık hareketlerini doğrudan destekler.</span>
              <span className="font-mono tabular-nums">{prompt.length} karakter</span>
            </div>
          </div>

          {/* Camera Motion Presets */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block mb-3">
              Kamera & Hareket Şablonları
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {VIDEO_MOTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedMotion(preset.id)}
                  className={`p-2.5 text-xs font-medium rounded-xl border text-left transition-all ${
                    selectedMotion === preset.id
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-sm shadow-rose-500/10'
                      : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-semibold">{preset.label}</div>
                  <div className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                    {preset.promptModifier}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format, Duration & Resolution Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Format (16:9 or 9:16) */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block mb-2.5">
                Format
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-mono">16:9</div>
                  <div className="text-[10px] text-neutral-500">Sinematik</div>
                </button>

                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-mono">9:16</div>
                  <div className="text-[10px] text-neutral-500">Reels / Shorts</div>
                </button>
              </div>
            </div>

            {/* Duration (5s or 10s) */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block mb-2.5">
                Klip Süresi
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDuration('5s')}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                    duration === '5s'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-mono">5 Saniye</div>
                  <div className="text-[10px] text-neutral-500">Hızlı Klip</div>
                </button>

                <button
                  onClick={() => setDuration('10s')}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                    duration === '10s'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-mono">10 Saniye</div>
                  <div className="text-[10px] text-neutral-500">Genişletilmiş</div>
                </button>
              </div>
            </div>

            {/* Resolution */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block mb-2.5">
                Çözünürlük
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setResolution('720p')}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                    resolution === '720p'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-mono">720p HD</div>
                  <div className="text-[10px] text-neutral-500">Standart</div>
                </button>

                <button
                  onClick={() => setResolution('1080p')}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                    resolution === '1080p'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-mono">1080p FHD</div>
                  <div className="text-[10px] text-neutral-500">Yüksek Netlik</div>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-rose-200">Video Üretilemedi</div>
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
            disabled={isLoading || (mode === 'text-to-video' && !prompt.trim()) || (mode === 'image-to-video' && !sourceImage)}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Video className="w-4 h-4 animate-spin" />
                <span>{loadingStep || 'Video Sentezleniyor...'}</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>{mode === 'image-to-video' ? 'Fotoğrafı Canlandır ve Video Üret' : 'Videoyu Üret'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Player & Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Video Oynatıcı & Canlı Önizleme
              </span>
              {latestResult && (
                <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Omni Flash
                </span>
              )}
            </div>

            {/* Display Canvas / Video Player */}
            <div className="w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800/80 flex items-center justify-center relative min-h-[380px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 border-t-rose-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-amber-500/20 border-b-amber-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  <div className="text-sm font-semibold text-white">{loadingStep}</div>
                  <div className="text-xs text-neutral-400 max-w-xs">
                    Gemini Omni Flash modeli saniyede 24 kare sinematik video oluşturuyor...
                  </div>
                </div>
              ) : latestResult ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                  {latestResult.url.startsWith('data:video') ? (
                    <video
                      ref={videoRef}
                      src={latestResult.url}
                      autoPlay
                      loop={isLooping}
                      playsInline
                      className="w-full max-h-[500px] object-contain rounded-xl"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  ) : (
                    <div className="relative w-full flex items-center justify-center overflow-hidden bg-neutral-950">
                      <canvas
                        id="cinematic-motion-canvas"
                        className="w-full max-h-[500px] object-contain rounded-xl"
                      />
                      <div className="absolute bottom-3 left-3 bg-black/80 px-2.5 py-1 rounded-lg text-[11px] text-rose-300 font-mono flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>Sinematik Kamera Hareketi · {latestResult.duration || '5s'}</span>
                      </div>
                    </div>
                  )}

                  {/* Player Controls Bar */}
                  <div className="w-full bg-neutral-950/95 border-t border-neutral-800/80 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlay}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                        title={isPlaying ? 'Durdur' : 'Oynat'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play();
                          }
                        }}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                        title="Başa Sar"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setIsLooping(!isLooping)}
                        className={`px-2 py-1 rounded-md text-[11px] font-mono border transition-all ${
                          isLooping
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        Döngü (Loop)
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[0.5, 1, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setSpeed(speed)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            playbackSpeed === speed
                              ? 'bg-neutral-800 text-rose-300 border-neutral-700'
                              : 'text-neutral-500 border-transparent hover:text-neutral-300'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}

                      <button
                        onClick={() => handleDownload(latestResult.url)}
                        className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1.5 ml-2"
                        title="Video Olarak İndir"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>İndir (Video)</span>
                      </button>
                      <button
                        onClick={() => onViewFullscreen(latestResult)}
                        className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Tam Ekran"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-neutral-500">
                  <Video className="w-10 h-10 text-neutral-600 stroke-[1.5]" />
                  <span className="text-xs font-medium text-neutral-400">Henüz Video Üretilmedi</span>
                  <span className="text-[11px] text-neutral-500 max-w-xs">
                    Soldaki panelden prompt girerek veya bir fotoğraf yükleyerek &quot;Videoyu Üret&quot; butonuna basın.
                  </span>
                </div>
              )}
            </div>

            {/* Video Details Card */}
            {latestResult && (
              <div className="mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="font-semibold text-neutral-300">Video Sahne Bilgisi</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(latestResult.prompt);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Kopyalandı' : 'Promptu Kopyala'}</span>
                  </button>
                </div>
                <p className="text-neutral-300 line-clamp-3 leading-relaxed text-[11px]">
                  {latestResult.prompt}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-850 text-[10px] text-neutral-500 font-mono">
                  <span>Model: gemini-omni-1.1-flash</span>
                  <span>·</span>
                  <span>Süre: {latestResult.duration || '5s'}</span>
                  <span>·</span>
                  <span>Çözünürlük: {latestResult.resolution || '720p'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
