export type MediaType = 'image' | 'video';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type VideoDuration = '5s' | '10s';

export type VideoResolution = '720p' | '1080p';

export interface CreationItem {
  id: string;
  type: MediaType;
  url: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  model: string;
  style?: string;
  duration?: string;
  resolution?: string;
  sourceImageUrl?: string;
  cameraSettings?: string;
}

export interface PromptEnhanceResult {
  enhancedPrompt: string;
  explanationTr?: string;
  cameraDetails?: string;
  negativePrompt?: string;
}
