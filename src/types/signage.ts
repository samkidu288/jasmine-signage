export type MediaType = 'image' | 'video';

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'none';

export interface SlideItem {
  id: string;
  title: string;
  topText?: string; // Customizable top caption text (Baris 1)
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
    days: number[];
    allHours: boolean;
    startTime?: string;
    endTime?: string;
  };
}

export interface TickerConfig {
  enabled: boolean;
  messages: string[];
  separator: string;
  speed: 'slow' | 'normal' | 'fast';
  bgColor: string;
  textColor: string;
  fontSize: number;
  showBadge: boolean;
  badgeText: string;
}

export interface AudioConfig {
  enabled: boolean;
  url: string;
  title: string;
  volume: number;
  loop: boolean;
  autoMuteOnVideo: boolean;
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
  tvScale?: number;
  sidebarFooterStyle?: 'none' | 'compact' | 'cards';
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
