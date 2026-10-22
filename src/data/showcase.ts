import { CreationItem } from '../types';
import cyberpunkImg from '../assets/images/showcase_cyberpunk_neon_1792655463217.jpg';
import cheetahImg from '../assets/images/showcase_wildlife_cheetah_1792655464096.jpg';
import nebulaImg from '../assets/images/showcase_cosmic_nebula_1792655464559.jpg';
import villaImg from '../assets/images/showcase_architectural_villa_1792655464064.jpg';

export const INITIAL_SHOWCASE: CreationItem[] = [
  {
    id: 'showcase-1',
    type: 'image',
    url: cyberpunkImg,
    prompt: 'Cinematic editorial portrait of a cyberpunk female character with subtle iridescent cyberware patterns, dramatic cyan and amber rim lighting, rain-slicked Tokyo background, shot on 85mm f/1.2 lens, photorealistic film grain, 8k resolution',
    aspectRatio: '1:1',
    createdAt: 'Örnek Proje',
    model: 'gemini-nano-banana-2.1',
    style: 'Dijital Sanat & Cyberpunk',
    cameraSettings: '85mm f/1.2, Neon Rim Light, Film Grain',
  },
  {
    id: 'showcase-2',
    type: 'video',
    url: cheetahImg,
    prompt: 'Dramatic wide-angle wildlife photograph of a magnificent cheetah running across the golden Serengeti savanna at sunset, motion blur in dust, sharp eye focus, National Geographic award-winning lighting, warm amber dusk atmosphere',
    aspectRatio: '16:9',
    createdAt: 'Örnek Video Projesi',
    model: 'gemini-omni-1.1-flash',
    duration: '5s',
    resolution: '720p',
    style: 'Doğa & Sinematik Yavaş Çekim',
    cameraSettings: 'Geniş Açı Takip Kamerası, 60fps Slow Motion',
  },
  {
    id: 'showcase-3',
    type: 'video',
    url: nebulaImg,
    prompt: 'Cinematic space scene of an ethereal cosmic nebula with swirling violet and celestial gold stardust, a sleek research starship gliding through stellar clouds, James Webb telescope aesthetic, photorealistic VFX grade',
    aspectRatio: '16:9',
    createdAt: 'Örnek Video Projesi',
    model: 'gemini-omni-1.1-flash',
    duration: '10s',
    resolution: '1080p',
    style: 'Bilim Kurgu & VFX',
    cameraSettings: 'Yavaş Süzülen Kamera, Volumetrik Işık',
  },
  {
    id: 'showcase-4',
    type: 'image',
    url: villaImg,
    prompt: 'Architectural Digest photography of a minimalist concrete and glass luxury villa perched on a coastal cliff overlooking calm ocean at dawn, soft atmospheric fog, warm interior architectural lighting, Japanese wabi-sabi minimalism',
    aspectRatio: '4:3',
    createdAt: 'Örnek Proje',
    model: 'gemini-3.1-flash-lite-image',
    style: 'Mimari & Tasarım',
    cameraSettings: '35mm Tilt-Shift, Sabah Sisi ve Doğal Günışığı',
  },
];

export const STYLE_PRESETS = [
  { id: 'photorealistic', label: 'Fotogerçekçi', promptSuffix: ', ultra-realistic photograph, 8k resolution, authentic textures, natural light, shot on Hasselblad' },
  { id: 'cinematic', label: 'Sinematik Film', promptSuffix: ', 35mm anamorphic film still, cinematic color grading, dramatic chiaroscuro lighting, depth of field' },
  { id: 'digital-art', label: 'Dijital Sanat', promptSuffix: ', detailed digital illustration, concept art, trending on ArtStation, vibrant dynamic composition' },
  { id: 'anime', label: 'Anime & Manga', promptSuffix: ', modern Makoto Shinkai studio anime style, clean line art, luminous color palette, atmospheric sky' },
  { id: '3d-render', label: '3D Studio Render', promptSuffix: ', Octane render, raytraced subsurface scattering, clean studio softbox lighting, 4k detail' },
  { id: 'vintage', label: 'Vintage Analog', promptSuffix: ', vintage 1970s Kodachrome film photograph, warm film grain, nostalgic color palette' },
  { id: 'architectural', label: 'Minimalist Mimari', promptSuffix: ', clean architectural photography, brutalist geometry, balanced framing, soft morning light' },
];

export const VIDEO_MOTION_PRESETS = [
  { id: 'push-in', label: 'Yavaş İleri Yaklaşma (Push In)', promptModifier: 'Smooth slow cinematic camera push in towards the focal subject, gentle atmospheric motion.' },
  { id: 'drone-pan', label: 'Drone Süzülüşü (Aerial Pan)', promptModifier: 'Cinematic wide aerial drone sweeping motion, majestic view with organic motion physics.' },
  { id: 'slow-mo', label: 'Ağır Çekim (Slow Motion)', promptModifier: 'Graceful slow-motion 60fps dynamics, capturing fluid organic micro-movements.' },
  { id: 'orbit', label: 'Yörünge Hareketi (Orbit)', promptModifier: 'Smooth orbital tracking shot revolving around the main subject with shallow depth of field.' },
  { id: 'static', label: 'Sabit Plan & Canlı Detaylar', promptModifier: 'Locked tripod camera with vivid natural breeze, light changes, and living environmental motion.' },
];

export const PROMPT_SUGGESTIONS = [
  {
    title: 'Kapadokya Balonları',
    type: 'image' as const,
    prompt: 'Kapadokya vadileri üzerinde gün doğumunda gökyüzüne yükselen yüzlerce rengarenk sıcak hava balonu, peri bacaları ve sabah sisi, altın saat ışığı',
  },
  {
    title: 'Neon Gece Yarışı',
    type: 'video' as const,
    prompt: 'Yağmurla parlayan fütüristik şehir sokaklarında hızla kayan elektrikli spor araba, neon yansımaları ve lastiklerden çıkan su damlaları',
  },
  {
    title: 'Büyülü Kütüphane',
    type: 'image' as const,
    prompt: 'Tavanı gökyüzüne açılan devasa ahşap antik kütüphane, havada süzülen parlayan kitaplar ve toz zerrelerinin arasından süzülen güneş huzmeleri',
  },
  {
    title: 'Okyanus Dalgası & Yunuslar',
    type: 'video' as const,
    prompt: 'Kristal berraklığındaki turkuaz tropikal dalgaların arasından sıçrayan yunuslar, ağır çekimde su damlacıkları ve sualtı ışık kırılmaları',
  },
];
