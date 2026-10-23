import React, { useState, useEffect } from 'react';
import { LayoutConfig, SlideItem, AudioConfig } from '../../types/signage';
import { Volume2, VolumeX, Radio, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

interface TVHeaderProps {
  layout: LayoutConfig;
  currentSlide: SlideItem | null;
  audioConfig: AudioConfig;
  isBgmActive: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleAudioMute: () => void;
}

export const TVHeader: React.FC<TVHeaderProps> = ({
  layout,
  currentSlide,
  audioConfig,
  isBgmActive,
  isFullscreen,
  onToggleFullscreen,
  onToggleAudioMute,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time (HH:MM:SS)
  const timeString = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Format date: "Kamis, 22 Oktober 2026"
  const dateString = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isVideoSlide = currentSlide?.type === 'video';
  const isVideoWithSound = isVideoSlide && !currentSlide?.muteVideoAudio;

  return (
    <header className="relative w-full z-20 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/85 via-black/60 to-transparent backdrop-blur-[2px] text-white select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        {layout.showLogo && (
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-teal-600/90 shadow-lg ring-2 ring-teal-400/50 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
          </div>
        )}
        <div>
          <h1 className="font-extrabold tracking-wider text-xl md:text-2xl drop-shadow-md text-white flex items-center gap-2">
            {layout.brandName || 'JASMINE LAUNDRY'}
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-300 border border-teal-400/40">
              Live TV
            </span>
          </h1>
          <p className="text-xs text-teal-100/80 font-medium tracking-wide">
            {layout.tagline || 'Professional Laundry & Dry Cleaning'}
          </p>
        </div>
      </div>

      {/* Middle Status (Audio Indicator showing auto-mute behavior in action) */}
      <div className="hidden lg:flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/10 text-xs backdrop-blur-md">
        {isVideoWithSound ? (
          <div className="flex items-center gap-2 text-amber-300 font-medium animate-pulse">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Suara Video Aktif &bull; Backsound Auto-Mute</span>
          </div>
        ) : audioConfig.enabled && isBgmActive ? (
          <div className="flex items-center gap-2 text-teal-300 font-medium">
            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>BGM Looping Aktif</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <VolumeX className="w-4 h-4 text-slate-400" />
            <span>Audio TV Hening</span>
          </div>
        )}
      </div>

      {/* Right: Date, Time & Fullscreen Controls */}
      <div className="flex items-center gap-4">
        {layout.showDate && (
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-300 font-medium tracking-wide">{dateString}</div>
          </div>
        )}

        {layout.showClock && (
          <div className="flex items-center px-3.5 py-1.5 rounded-xl bg-black/50 border border-white/15 backdrop-blur-md shadow-inner">
            <span className="font-mono text-xl md:text-2xl font-bold tracking-wider text-teal-300">
              {timeString}
            </span>
          </div>
        )}

        {/* Audio Toggle button */}
        <button
          onClick={onToggleAudioMute}
          title="Toggle Suara TV"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition text-white border border-white/15"
        >
          {isBgmActive || isVideoWithSound ? (
            <Volume2 className="w-5 h-5 text-teal-300" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Fullscreen button for TVBro Android TV */}
        <button
          onClick={onToggleFullscreen}
          title="Layar Penuh TV (TVBro)"
          className="p-2 rounded-xl bg-teal-600/80 hover:bg-teal-500 active:scale-95 transition text-white shadow-lg border border-teal-400/50"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
};
