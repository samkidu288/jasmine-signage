export type MediaType = 'image' | 'video';

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'none';

export interface SlideItem {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  duration: number; // in seconds
  autoDuration: boolean; // For videos: auto-advance when ended
  muteVideoAudio: boolean; // If true, video has no audio, backsound keeps playing
  videoVolume: number; // 0 - 100
  transition: TransitionType;
  isActive: boolean;
  order: number;
  schedule?: {
    allDays: boolean;
    days: number[]; // 0 = Sunday, 1 = Monday, ...
    allHours: boolean;
    startTime?: string; // "07:00"
    endTime?: string; // "22:00"
  };
}

export interface TickerConfig {
  enabled: boolean;
  messages: string[];
  separator: string;
  speed: 'slow' | 'normal' | 'fast';
  bgColor: string;
  textColor: string;
  fontSize: number; // in pixels
  showBadge: boolean;
  badgeText: string;
}

export interface AudioConfig {
  enabled: boolean;
  url: string;
  title: string;
  volume: number; // 0 - 100
  loop: boolean;
  autoMuteOnVideo: boolean; // CRITICAL: auto-mute backsound when video plays
  fadeTransition: boolean;
}

export interface PriceItem {
  name: string;
  price: string;
  unit: string;
  badge?: string;
}

export interface LayoutConfig {
  style: 'fullscreen' | 'splitscreen' | 'compact';
  showClock: boolean;
  showDate: boolean;
  showLogo: boolean;
  brandName: string;
  tagline: string;
  logoUrl?: string;
  accentColor: string;
  sidebarTitle: string;
  prices: PriceItem[];
  infoCards: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export interface SignageConfig {
  slides: SlideItem[];
  ticker: TickerConfig;
  audio: AudioConfig;
  layout: LayoutConfig;
  lastUpdated: string;
  version: number;
}
