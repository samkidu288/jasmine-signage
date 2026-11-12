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
  isSimulated?: boolean;
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

  const activeSlides = React.useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
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

  useEffect(() => {
    soundController.setConfig(config.audio);

    if (config.audio.enabled && !isSimulated) {
      soundController.play().then((started) => {
        if (!started) {
          setIsAudioPromptVisible(true);
        }
      });
    }
  }, [config.audio, isSimulated]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !isSimulated) {
      let wakeLock: any = null;
      const requestLock = async () => {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {}
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

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    setSlideProgress(0);
    setLoadError(null);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setSlideProgress(0);
    setLoadError(null);
  }, [activeSlides.length]);

  useEffect(() => {
    if (!currentSlide || isPaused) return;

    soundController.handleSlideTransition(currentSlide, config.audio);

    clearInterval(progressTimerRef.current);
    clearTimeout(slideTimerRef.current);
    setSlideProgress(0);

    const isVideo = currentSlide.type === 'video';
    const durationSec = currentSlide.duration > 0 ? currentSlide.duration : 15;
    const durationMs = durationSec * 1000;

    const intervalTime = 100;
    let elapsed = 0;

    progressTimerRef.current = setInterval(() => {
      elapsed += intervalTime;
      if (!isVideo) {
        const p = Math.min(100, (elapsed / durationMs) * 100);
        setSlideProgress(p);
      }
    }, intervalTime);

    const watchdogMs = isVideo && currentSlide.autoDuration
      ? Math.max(durationMs, 25000)
      : durationMs;

    slideTimerRef.current = setTimeout(() => {
      nextSlide();
    }, watchdogMs);

    return () => {
      clearInterval(progressTimerRef.current);
      clearTimeout(slideTimerRef.current);
    };
  }, [currentIndex, currentSlide, isPaused, config.audio, nextSlide]);

  useEffect(() => {
    if (videoRef.current && currentSlide?.type === 'video') {
      const vid = videoRef.current;
      vid.currentTime = 0;
      vid.muted = true;

      const attemptPlay = async () => {
        try {
          await vid.play();
          if (!currentSlide.muteVideoAudio) {
            vid.volume = (currentSlide.videoVolume ?? 100) / 100;
            vid.muted = false;
            if (vid.paused) {
              vid.muted = true;
              await vid.play();
              setIsAudioPromptVisible(true);
            }
          }
        } catch (err) {
          vid.muted = true;
          vid.play().catch(() => {});
          setIsAudioPromptVisible(true);
        }
      };

      attemptPlay();
    }
  }, [currentSlide]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && currentSlide?.type === 'video' && currentSlide.autoDuration) {
      const vidDuration = videoRef.current.duration;
      if (vidDuration && !isNaN(vidDuration) && isFinite(vidDuration) && vidDuration > 0) {
        clearTimeout(slideTimerRef.current);
        const videoDurationMs = Math.ceil(vidDuration * 1000) + 1500;
        slideTimerRef.current = setTimeout(() => {
          nextSlide();
        }, videoDurationMs);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && currentSlide?.type === 'video') {
      const { currentTime, duration } = videoRef.current;
      if (duration > 0) {
        setSlideProgress(Math.min(100, (currentTime / duration) * 100));
      }
    }
  };

  const handleVideoEnded = () => {
    if (currentSlide?.type === 'video') {
      clearTimeout(slideTimerRef.current);
      nextSlide();
    }
  };

  const handleVideoError = (e: any) => {
    soundController.handleSlideTransition({ type: 'image' } as any, config.audio);
    setLoadError('Format video tidak didukung oleh browser TV. Melompat...');
    clearTimeout(slideTimerRef.current);
    setTimeout(() => {
      nextSlide();
    }, 2000);
  };

  const handleUnlockAudio = () => {
    soundController.setConfig(config.audio);
    soundController.play().then(() => {
      setIsAudioPromptVisible(false);
    });
    if (videoRef.current && currentSlide?.type === 'video') {
      videoRef.current.muted = !!currentSlide.muteVideoAudio;
      videoRef.current.volume = (currentSlide.videoVolume ?? 100) / 100;
      videoRef.current.play().catch(() => {});
    }
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAudioPromptVisible) {
        handleUnlockAudio();
      }

      switch (e.key) {
        case 'Enter':
        case 'Select':
        case 'MediaPlayPause':
        case 'MediaPlay':
          handleUnlockAudio();
          break;
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
      onClick={() => {
        if (isAudioPromptVisible) {
          handleUnlockAudio();
        }
      }}
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

      <div className="relative flex-1 min-h-0 w-full flex overflow-hidden">
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
                  preload="auto"
                  muted
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
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
                <div className="px-4 py-2.5 rounded-2xl bg-black/65 backdrop-blur-md border border-white/15 text-white shadow-2xl max-w-lg">
                  {/* Baris 1: Text Atas Kustom atau Default */}
                  <div className="flex items-center gap-2">
                    {currentSlide.topText && currentSlide.topText.trim() ? (
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-500 text-slate-950 truncate max-w-md shadow-sm">
                        {currentSlide.topText.trim()}
                      </span>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500 text-slate-950">
                          {currentSlide.type === 'video' ? '🎬 Video' : '🖼️ Gambar'}
                        </span>
                        <span className="text-xs text-slate-300">
                          Slide {currentIndex + 1} dari {activeSlides.length}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Baris 2: Judul / Text Bawah */}
                  {currentSlide.title && (
                    <h3 className="text-base font-bold text-white mt-1 drop-shadow-sm truncate">
                      {currentSlide.title}
                    </h3>
                  )}
                </div>
              </div>

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

          {loadError && (
            <div className="absolute top-4 z-30 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/90 text-white text-xs font-semibold shadow-xl backdrop-blur-md">
              <AlertCircle className="w-4 h-4" />
              <span>{loadError}</span>
            </div>
          )}
        </main>

        {config.layout.style === 'splitscreen' && <TVSidebar layout={config.layout} />}
      </div>

      <RunningTicker config={config.ticker} />

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
