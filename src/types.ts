export type GenerationMode = 'image' | 'video';

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface MediaResult {
  id: string;
  mode: GenerationMode;
  prompt: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: number;
  aspectRatio: string;
  duration?: number;
}

export interface GenerateResponse {
  success: boolean;
  mediaUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  metadata?: {
    aspectRatio?: string;
    duration?: number;
    model?: string;
  processingTime?: number;
  seed?: number;
  steps?: number;
    guidanceScale?: number;
  fps?: number;
    resolution?: string;
    fileSize?: number;
  stylePreset?: string;
  negativePrompt?: string;
  sampler?: string;
  clipLength?: number;
  [key: string]: string | number | undefined;
  [key: number]: string | number | undefined;
  };
}

export interface AppSettings {
  aspectRatio: string;
  stylePreset: string;
  quality: 'draft' | 'standard' | 'high';
  seed: string;
  negativePrompt: string;
  webhookUrl: string;
  converterWebhookUrl: string;
  translatorWebhookUrl: string;
  autoDownload: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  aspectRatio: '1:1',
  stylePreset: 'cinematic',
  quality: 'standard',
  seed: '',
  negativePrompt: '',
  webhookUrl: '/generate-ai-media',
  converterWebhookUrl: '/convert-media',
  translatorWebhookUrl: '/translate-prompt',
  autoDownload: false,
};

export type ConversionDirection = 'video-to-audio' | 'audio-to-video';

export type ConversionStatus = 'idle' | 'uploading' | 'converting' | 'success' | 'error';

export interface ConversionResult {
  id: string;
  direction: ConversionDirection;
  sourceName: string;
  resultUrl: string;
  thumbnailUrl?: string;
  createdAt: number;
 fileSize?: number;
  duration?: number;
  format: string;
}

export interface ConvertResponse {
  success: boolean;
  resultUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  metadata?: {
    format?: string;
    fileSize?: number;
    duration?: number;
    bitrate?: string;
    codec?: string;
    [key: string]: string | number | undefined;
  };
}

export type TranslationDirection = 'hi-to-en' | 'en-to-hi';

export interface TranslationResult {
  id: string;
  direction: TranslationDirection;
  sourceText: string;
  translatedText: string;
  refinedPrompt?: string;
  createdAt: number;
}

export interface TranslateResponse {
  success: boolean;
  translation?: string;
  refinedPrompt?: string;
  detectedLanguage?: string;
  confidence?: number;
  error?: string;
  metadata?: {
    model?: string;
    processingTime?: number;
    [key: string]: string | number | undefined;
  };
}

export const SAMPLE_HINDI_PROMPTS: string[] = [
  'हिमालय की बर्फीली चोटियों पर सूर्योदय, सुनहरी रोशनी, बर्फ से ढके शिखर, सिनेमैटिक',
  'उत्तराखंड की घाटी में प्राचीन मंदिर, पवित्र ध्वजाएं लहरा रहे हैं, कोहरा, शांत सुबह',
  'एक शांत झील जिसमें बर्फीले पहाड़ झिलते हैं, शांत पानी, गोधूलि आकाश, फोटोरियलिस्टिक',
  'बौद्ध भिक्षु चट्टान के किनारे ध्यान कर रहे हैं, हिमालयी भोर, आध्यात्मिक चमक, 85mm लेंस',
  'पहाड़ी ढलान पर जैव-दीप्तिमान जंगल, जुगनू, रहस्यमय वातावरण, फैंटेसी आर्ट',
  'देवभूमि में सीढ़ीदार खेतों का हवाई दृश्य, हरा-भरा, घुमावदार नदी, गोल्डन आवर',
];

export const ASPECT_RATIOS: { label: string; value: string; icon: string }[] = [
  { label: 'Square', value: '1:1', icon: 'square' },
  { label: 'Portrait', value: '9:16', icon: 'portrait' },
  { label: 'Landscape', value: '16:9', icon: 'landscape' },
  { label: 'Story', value: '4:5', icon: 'story' },
  { label: 'Wide', value: '21:9', icon: 'wide' },
];

export const STYLE_PRESETS: { label: string; value: string; description: string }[] = [
  { label: 'Cinematic', value: 'cinematic', description: 'Film-grade color grading, dramatic lighting' },
  { label: 'Photoreal', value: 'photoreal', description: 'Ultra-realistic photography' },
  { label: 'Anime', value: 'anime', description: 'Japanese animation style' },
  { label: 'Digital Art', value: 'digital-art', description: 'Illustrated, painterly' },
  { label: '3D Render', value: '3d-render', description: 'Octane / Blender look' },
  { label: 'Fantasy', value: 'fantasy', description: 'Epic, ethereal, mythical' },
];

export const QUALITY_OPTIONS: { label: string; value: 'draft' | 'standard' | 'high'; description: string }[] = [
  { label: 'Draft', value: 'draft', description: 'Fast preview, lower detail' },
  { label: 'Standard', value: 'standard', description: 'Balanced speed and quality' },
  { label: 'High', value: 'high', description: 'Maximum detail, slower' },
];

export const SAMPLE_PROMPTS: Record<GenerationMode, string[]> = {
  image: [
    'Misty Himalayan peaks at sunrise, golden light washing over snow-capped summits, ultra-detailed, cinematic',
    'Ancient stone temple nestled in Uttarakhand valley, prayer flags fluttering, soft morning fog',
    'A serene alpine lake reflecting snow mountains, mirror-still water, twilight sky, photorealistic',
    'Cyberpunk cityscape with neon-lit mountain backdrop, rain-slicked streets, cinematic wide shot',
    'Portrait of a sage meditating on a cliff edge, Himalayan dawn, ethereal glow, 85mm lens',
  'Bioluminescent forest on a mountain slope, fireflies, mystical atmosphere, fantasy art',
  'Aerial view of terraced fields in Devbhumi, lush green, winding river, golden hour',
    'Minimalist mountain silhouette, gradient sky, Japanese woodblock print style',
  ],
  video: [
    'Cinematic drone shot soaring over Himalayan peaks at sunrise, clouds drifting between summits',
    'Time-lapse of stars rotating over an ancient Uttarakhand temple, milky way, serene',
    'Slow-motion snow avalanche cascading down a mountain face, 4K, dramatic',
    'Aerial pan across terraced valley farms at golden hour, mist rolling through, cinematic',
    'Walking POV through a misty Himalayan forest trail, sunlight filtering through pines',
    'Hyper-lapse of a mountain river flowing through rapids, smooth motion, photorealistic',
    'Cinematic shot of prayer flags fluttering in mountain wind, soft bokeh background',
    'Golden hour timelapse of shadow creeping across a snow-capped summit ridge',
  ],
};
