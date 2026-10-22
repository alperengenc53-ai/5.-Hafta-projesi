import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Camera,
  ShieldAlert,
  Lightbulb,
  Compass,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react';
import { PromptEnhanceResult } from '../types';

interface PromptAssistantProps {
  onUseForImage: (prompt: string) => void;
  onUseForVideo: (prompt: string) => void;
}

export const PromptAssistant: React.FC<PromptAssistantProps> = ({
  onUseForImage,
  onUseForVideo,
}) => {
  const [inputIdea, setInputIdea] = useState('');
  const [targetType, setTargetType] = useState<'image' | 'video'>('image');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PromptEnhanceResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!inputIdea.trim()) {
      setError('Lütfen geliştirmek istediğiniz bir fikir veya sahne yazın.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputIdea,
          type: targetType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Prompt geliştirilemedi.');
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SAMPLE_IDEAS = [
    {
      category: 'Doğa & Manzara',
      text: 'Sisli Karadeniz yaylalarında sabah güneşi ve ahşap yayla evi',
      type: 'image' as const,
    },
    {
      category: 'Sinematik Aksiyon',
      text: 'Otoyolda yağmur altında hızlanan klasik kırmızı spor araba',
      type: 'video' as const,
    },
    {
      category: 'Bilim Kurgu Portre',
      text: 'Kırmızı gezegen Mars kolonisinde cam kasklı kadın astronot',
      type: 'image' as const,
    },
    {
      category: 'Ürün & Reklam',
      text: 'Buzlu su damlacıklarıyla kaplı ferahlatıcı cam şişe içecek',
      type: 'image' as const,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1.5 uppercase tracking-wider">
          <span>Gemini 3.8 Flash Asistanı</span>
          <span>·</span>
          <span>Profesyonel Sanat Yönetimi</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Prompt Sihirbazı & Fikir Atölyesi
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
          Aklınızdaki ham fikri yazın; Gemini yapay zekası ışıklandırma, lens, kamera hareketleri ve
          kompozisyon detaylarını ekleyerek ultra kaliteli bir görsel ve video promptuna dönüştürsün.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            {/* Target Modality Selector */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Hedef Format
              </span>
              <div className="flex items-center gap-1 bg-neutral-950 p-1 border border-neutral-800 rounded-xl">
                <button
                  onClick={() => setTargetType('image')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    targetType === 'image'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Fotoğraf İçin</span>
                </button>
                <button
                  onClick={() => setTargetType('video')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    targetType === 'video'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Video İçin</span>
                </button>
              </div>
            </div>

            {/* Input textarea */}
            <label htmlFor="raw-idea-input" className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block mb-2">
              Aklınızdaki Fikir (Türkçe veya İngilizce)
            </label>
            <textarea
              id="raw-idea-input"
              value={inputIdea}
              onChange={(e) => setInputIdea(e.target.value)}
              placeholder="Örn: Ormanda gün batımı, parlayan bir göl ve sis..."
              rows={4}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/40 transition-all resize-y"
            />

            {/* Ready Idea Chips */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Hızlı İlham Fikirleri:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_IDEAS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputIdea(sample.text);
                      setTargetType(sample.type);
                    }}
                    className="px-2.5 py-1 text-xs bg-neutral-950 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 rounded-lg text-left transition-all"
                  >
                    <span className="text-[10px] text-neutral-500 block font-mono">{sample.category}</span>
                    <span>{sample.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleEnhance}
              disabled={isLoading || !inputIdea.trim()}
              className="mt-6 w-full py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Gemini Promptu Zenginleştiriyor...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Promptu Profesyonelleştir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Enhanced Result (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-2xl min-h-[380px] flex flex-col justify-between">
            {result ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      Geliştirilmiş Stüdyo Promptu
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.enhancedPrompt)}
                    className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>

                {/* The main prompt */}
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 text-xs md:text-sm leading-relaxed font-mono selection:bg-amber-500/40">
                  {result.enhancedPrompt}
                </div>

                {/* Explanation */}
                {result.explanationTr && (
                  <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-300 block mb-0.5">
                        Sanat Yönetmeni Notu:
                      </span>
                      <span>{result.explanationTr}</span>
                    </div>
                  </div>
                )}

                {/* Camera & Lighting */}
                {result.cameraDetails && (
                  <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 flex items-start gap-2.5">
                    <Camera className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-300 block mb-0.5">
                        Önerilen Kamera & Işık:
                      </span>
                      <span className="font-mono text-neutral-300">{result.cameraDetails}</span>
                    </div>
                  </div>
                )}

                {/* Negative prompt */}
                {result.negativePrompt && (
                  <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-300 block mb-0.5">
                        Önerilen Negatif Filtre:
                      </span>
                      <span className="font-mono text-rose-300/90">{result.negativePrompt}</span>
                    </div>
                  </div>
                )}

                {/* Action Bridges */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onUseForImage(result.enhancedPrompt)}
                    className="flex-1 py-2.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Fotoğraf Stüdyosuna Aktar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onUseForVideo(result.enhancedPrompt)}
                    className="flex-1 py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <VideoIcon className="w-4 h-4" />
                    <span>Video Stüdyosuna Aktar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
                <Wand2 className="w-10 h-10 text-neutral-700 mb-3" />
                <span className="text-sm font-semibold text-neutral-400">
                  Promptunuz Burada Geliştirilecek
                </span>
                <span className="text-xs text-neutral-500 max-w-sm mt-1">
                  Soldaki panele bir kelime veya cümle yazıp &quot;Promptu Profesyonelleştir&quot; butonuna bastığınızda,
                  Gemini ışık, kamera, açı ve detay parametrelerini ekleyerek bu alanda sunacaktır.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
