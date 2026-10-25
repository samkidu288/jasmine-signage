import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SignageConfig, SlideItem } from '../../types/signage';
import { soundController } from '../../services/soundController';
import { TVHeader } from './TVHeader';
import { TVSidebar } from './TVSidebar';
import { RunningTicker } from './RunningTicker';
import { Volume2, Play, Settings, AlertCircle, RefreshCw } from 'lucide-react';

interface TVPlayerProps {
  config: SignageConfig;
  onOpenAdmin: () => void;
  isSimulated?: boolean; // When rendered inside admin dashboard simulator
}

export const TVPlayer: React.FC<TVPlayerProps> = ({ config, onOpenAdmin, isSimulated = false }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAudioPromptVisible, setIsAudioPromptVisible] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<any>(null);
  const slideTimerRef = useRef<any>(null);

  // Filter active slides matching schedule
  const activeSlides = React.useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const filtered = config.slides.filter((slide) => {
      if (!slide.isActive) return false;
      if (slide.schedule) {
        if (!slide.schedule.allDays && !slide.schedule.days.includes(currentDay)) {
          return false;
        }
        if (!slide.schedule.allHours) {
          if (slide.schedule.startTime && currentHourMin < slide.schedule.startTime) return false;
          if (slide.schedule.endTime && currentHourMin > slide.schedule.endTime) return false;
        }
      }
      return true;
    });

    return filtered.length > 0 ? filtered : config.slides;
  }, [config.slides]);

  const currentSlide: SlideItem | null = activeSlides[currentIndex] || activeSlides[0] || null;

  // Initialize background audio controller
  useEffect(() => {
    soundController.setConfig(config.audio);

    // Try playing BGM if enabled
    if (config.audio.enabled && !isSimulated) {
      soundController.play().then((started) => {
        if (!started) {
          // Autoplay blocked by browser policy -> show audio unlock banner
          setIsAudioPromptVisible(true);
        }
      });
    }
  }, [config.audio, isSimulated]);

  // Request Screen Wake Lock so Android TV / TVBro doesn't sleep
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !isSimulated) {
      let wakeLock: any = null;
      const requestLock = async () => {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          // Wake lock request failed or denied
        }
      };
      requestLock();

      const handleVisibilityChange = () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
          requestLock();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (wakeLock) wakeLock.release().catch(() => {});
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isSimulated]);

  // Go to next slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIdx = (prev + 1) % activeSlides.length;
      return nextIdx;
    });
    setSlideProgress(0);
    setLoadError(null);
  }, [activeSlides.length]);

  // Go to previous slide
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setSlideProgress(0);
    setLoadError(null);
  }, [activeSlides.length]);

  // Main slide rotation timer & audio management
  useEffect(() => {
    if (!currentSlide || isPaused) return;

    // Trigger audio transition: AUTO-MUTES if video, RESTORES if image!
    soundController.handleSlideTransition(currentSlide, config.audio);

    // Clear previous timers
    clearInterval(progressTimerRef.current);
    clearTimeout(slideTimerRef.current);
    setSlideProgress(0);

    const isVideo = currentSlide.type === 'video';

    // If it's a video and autoDuration is enabled, the onEnded event will trigger nextSlide.
    // However, we also add a safety fallback timeout in case the video hangs or is very long
    const durationSec = currentSlide.duration > 0 ? currentSlide.duration : 15;
    const durationMs = durationSec * 1000;

    const intervalTime = 100;
    let elapsed = 0;

    progressTimerRef.current = setInterval(() => {
      elapsed += intervalTime;
      const p = Math.min(100, (elapsed / durationMs) * 100);
      setSlideProgress(p);
    }, intervalTime);

    if (!isVideo || !currentSlide.autoDuration) {
      slideTimerRef.current = setTimeout(() => {
        nextSlide();
      }, durationMs);
    }

    return () => {
      clearInterval(progressTimerRef.current);
      clearTimeout(slideTimerRef.current);
    };
  }, [currentIndex, currentSlide, isPaused, config.audio, nextSlide]);

  // Video event handlers
  const handleVideoEnded = () => {
    if (currentSlide?.type === 'video' && currentSlide.autoDuration) {
      nextSlide();
    }
  };

  const handleVideoError = () => {
    setLoadError('Gagal memuat video. Melompat ke slide berikutnya...');
    setTimeout(() => {
      nextSlide();
    }, 3000);
  };

  // User unlocks audio via remote / touch / mouse
  const handleUnlockAudio = () => {
    soundController.play().then(() => {
      setIsAudioPromptVisible(false);
    });
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation for TV Remote Control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If prompt is visible, any key dismisses and unlocks audio
      if (isAudioPromptVisible) {
        handleUnlockAudio();
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          prevSlide();
          break;
        case ' ':
          setIsPaused((p) => !p);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          onOpenAdmin();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAudioPromptVisible, nextSlide, prevSlide, onOpenAdmin]);

  // Track fullscreen changes from browser
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen max-h-screen overflow-hidden bg-slate-950 text-white flex flex-col select-none font-sans ${
        isSimulated ? 'rounded-2xl border-4 border-slate-700 shadow-2xl' : ''
      }`}
      style={
        (config.layout.tvScale && config.layout.tvScale !== 100 && !isSimulated)
          ? {
              transform: `scale(${config.layout.tvScale / 100})`,
              transformOrigin: 'top left',
              width: `${(100 / config.layout.tvScale) * 100}vw`,
              height: `${(100 / config.layout.tvScale) * 100}vh`,
            }
          : undefined
      }
    >
      {/* Top Header */}
      <TVHeader
        layout={config.layout}
        currentSlide={currentSlide}
        audioConfig={config.audio}
        isBgmActive={soundController.isPlaying() && !soundController.isMuted()}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onToggleAudioMute={() => {
          if (soundController.isPlaying()) {
            soundController.pause();
          } else {
            soundController.play();
          }
        }}
      />

      {/* Main Content Area */}
      <div className="relative flex-1 min-h-0 w-full flex overflow-hidden">
        {/* Media Player Showcase */}
        <main className="relative flex-1 min-h-0 h-full bg-black flex items-center justify-center overflow-hidden">
          {currentSlide ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {currentSlide.type === 'video' ? (
                <video
                  ref={videoRef}
                  key={currentSlide.id}
                  src={currentSlide.url}
                  autoPlay
                  playsInline
                  muted={currentSlide.muteVideoAudio}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  key={currentSlide.id}
                  src={currentSlide.url}
                  alt={currentSlide.title}
                  className={`w-full h-full object-contain transition-all duration-700 ${
                    currentSlide.transition === 'zoom'
                      ? 'scale-100 hover:scale-105'
                      : currentSlide.transition === 'slide'
                      ? 'translate-x-0'
                      : 'opacity-100'
                  }`}
                  onError={() => {
                    setLoadError('Gagal memuat gambar');
                    setTimeout(nextSlide, 3000);
                  }}
                />
              )}

              {/* Slide Title Tag Overlay */}
              <div className="absolute bottom-4 left-6 z-20 pointer-events-none">
                <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-xl max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500 text-slate-950">
                      {currentSlide.type === 'video' ? '🎬 Video' : '🖼️ Gambar'}
                    </span>
                    <span className="text-xs text-slate-300">
                      Slide {currentIndex + 1} dari {activeSlides.length}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 drop-shadow-sm truncate">
                    {currentSlide.title}
                  </h3>
                </div>
              </div>

              {/* Slide Progress Indicator Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20 overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-100 ease-linear shadow-glow"
                  style={{ width: `${slideProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <RefreshCw className="w-12 h-12 text-teal-400 animate-spin mb-4" />
              <p className="text-lg font-semibold">Tidak ada slide aktif yang terjadwal</p>
              <p className="text-sm text-slate-500 mt-1">
                Buka Admin Dashboard untuk menambahkan konten gambar atau video.
              </p>
            </div>
          )}

          {/* Load Error Alert */}
          {loadError && (
            <div className="absolute top-4 z-30 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/90 text-white text-xs font-semibold shadow-xl backdrop-blur-md">
              <AlertCircle className="w-4 h-4" />
              <span>{loadError}</span>
            </div>
          )}
        </main>

        {/* Optional Sidebar (Split-screen mode) */}
        {config.layout.style === 'splitscreen' && <TVSidebar layout={config.layout} />}
      </div>

      {/* Bottom Running Text Marquee */}
      <RunningTicker config={config.ticker} />

      {/* TVBro / Android TV Audio Unlock Prompt */}
      {isAudioPromptVisible && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border-2 border-teal-500/60 rounded-3xl p-6 text-center shadow-2xl ring-4 ring-teal-500/20">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto mb-4 border border-teal-500/40">
              <Volume2 className="w-9 h-9 animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Aktifkan Audio TV Digital Signage
            </h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Browser TVBro Android TV memerlukan 1x izin klik/remote untuk memutar suara backsound
              dan video secara otomatis.
            </p>
            <button
              onClick={handleUnlockAudio}
              className="w-full py-4 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-98 text-slate-950 font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl transition-all"
            >
              <Play className="w-6 h-6 fill-current" />
              Mulai &amp; Aktifkan Suara TV (Tekan OK)
            </button>
            <p className="text-xs text-slate-400 mt-3">
              Tip: Tekan tombol <b>OK</b> pada remote TV atau sentuh layar.
            </p>
          </div>
        </div>
      )}

      {/* Floating Discreet Button to Open Admin CMS or Switch Mode */}
      {!isSimulated && (
        <div className="absolute top-3 left-3 z-40 opacity-20 hover:opacity-100 transition-opacity">
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-teal-300 text-xs font-semibold border border-teal-500/30 shadow-lg backdrop-blur-md"
            title="Buka CMS Admin Signage"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin CMS</span>
          </button>
        </div>
      )}
    </div>
  );
};
