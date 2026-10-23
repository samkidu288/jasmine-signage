import { AudioConfig, SlideItem } from '../types/signage';

class SoundController {
  private audioElement: HTMLAudioElement | null = null;
  private currentVolume: number = 0.5;
  private targetVolume: number = 0.5;
  private isMutedForVideo: boolean = false;
  private isUserPaused: boolean = false;
  private fadeInterval: any = null;
  private userInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (!this.audioElement && typeof Audio !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';

      // Auto-unlock on user interaction (TV remote click or keyboard)
      const unlockAudio = () => {
        this.userInteracted = true;
        if (this.audioElement && !this.isUserPaused && !this.isMutedForVideo) {
          this.audioElement.play().catch(() => {});
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);
    }
  }

  public setConfig(config: AudioConfig) {
    this.targetVolume = (config.volume ?? 50) / 100;

    if (!this.audioElement) {
      this.initAudioElement();
    }
    if (!this.audioElement) return;

    if (!config.enabled) {
      this.stop();
      return;
    }

    if (this.audioElement.src !== config.url && config.url) {
      const wasPlaying = !this.audioElement.paused;
      this.audioElement.src = config.url;
      this.audioElement.loop = config.loop;
      if (wasPlaying || this.userInteracted) {
        this.play().catch(() => {});
      }
    }

    if (!this.isMutedForVideo) {
      this.audioElement.volume = this.targetVolume;
      this.currentVolume = this.targetVolume;
    }
  }

  public async play(): Promise<boolean> {
    if (!this.audioElement) return false;
    this.isUserPaused = false;
    try {
      this.audioElement.volume = this.isMutedForVideo ? 0 : this.targetVolume;
      await this.audioElement.play();
      return true;
    } catch (err) {
      // Browser autoplay policy might block before interaction
      return false;
    }
  }

  public pause() {
    if (!this.audioElement) return;
    this.isUserPaused = true;
    this.audioElement.pause();
  }

  public stop() {
    if (!this.audioElement) return;
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
  }

  /**
   * CRITICAL LOGIC:
   * "Jika yang ditampilkan video maka audio backsound secara otomatis harus dinonaktifkan agar tidak terjadi tumpang tindih suara."
   */
  public handleSlideTransition(slide: SlideItem, config: AudioConfig) {
    if (!config.enabled || !config.autoMuteOnVideo) return;

    const isVideoWithSound = slide.type === 'video' && !slide.muteVideoAudio;

    if (isVideoWithSound) {
      // DUCK / MUTE BACKSOUND IMMEDIATELY
      this.duckAndPauseForVideo();
    } else {
      // RESTORE / RESUME BACKSOUND FOR IMAGE
      this.restoreBacksoundFromVideo(config);
    }
  }

  private duckAndPauseForVideo() {
    this.isMutedForVideo = true;
    if (!this.audioElement) return;

    clearInterval(this.fadeInterval);

    // Smoothly fade to 0 in 300ms then pause
    const startVol = this.audioElement.volume;
    const steps = 10;
    const stepTime = 30; // 300ms total
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      if (!this.audioElement) {
        clearInterval(this.fadeInterval);
        return;
      }
      const newVol = Math.max(0, startVol * (1 - currentStep / steps));
      this.audioElement.volume = newVol;

      if (currentStep >= steps) {
        clearInterval(this.fadeInterval);
        this.audioElement.volume = 0;
        this.audioElement.pause();
      }
    }, stepTime);
  }

  private restoreBacksoundFromVideo(config: AudioConfig) {
    if (!this.isMutedForVideo) return;
    this.isMutedForVideo = false;
    if (!this.audioElement || !config.enabled || this.isUserPaused) return;

    clearInterval(this.fadeInterval);

    this.audioElement.volume = 0;
    this.audioElement.play().then(() => {
      // Smooth fade in
      const target = (config.volume ?? 50) / 100;
      const steps = 15;
      const stepTime = 40; // 600ms total
      let currentStep = 0;

      this.fadeInterval = setInterval(() => {
        currentStep++;
        if (!this.audioElement) {
          clearInterval(this.fadeInterval);
          return;
        }
        const newVol = Math.min(target, (target * currentStep) / steps);
        this.audioElement.volume = newVol;

        if (currentStep >= steps) {
          clearInterval(this.fadeInterval);
          this.audioElement.volume = target;
        }
      }, stepTime);
    }).catch(() => {
      // Autoplay blocked until interaction
    });
  }

  public isMuted(): boolean {
    return this.isMutedForVideo;
  }

  public isPlaying(): boolean {
    return !!(this.audioElement && !this.audioElement.paused && this.audioElement.volume > 0);
  }

  public getAudioElement() {
    return this.audioElement;
  }
}

export const soundController = new SoundController();
