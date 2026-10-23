import React, { useState, useRef } from 'react';
import { AudioConfig } from '../../types/signage';
import { soundController } from '../../services/soundController';
import { uploadMedia } from '../../services/storage';
import {
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface AudioManagerProps {
  audio: AudioConfig;
  onChange: (audio: AudioConfig) => void;
}

export const AudioManager: React.FC<AudioManagerProps> = ({ audio, onChange }) => {
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset background audio options (royalty-free cafe, lounge, gentle acoustic)
  const audioPresets = [
    {
      title: 'Coffee Shop & Cafe Ambience (Tenang & Nyaman)',
      url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    },
    {
      title: 'Rain & Cozy Chill Background',
      url: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
    },
    {
      title: 'Outdoor Garden Breeze',
      url: 'https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg',
    },
  ];

  // Test toggle play/pause in admin
  const handleTogglePlay = async () => {
    soundController.setConfig(audio);
    if (isPlayingTest) {
      soundController.pause();
      setIsPlayingTest(false);
    } else {
      const ok = await soundController.play();
      if (ok) setIsPlayingTest(true);
    }
  };

  // Upload audio file
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadMedia(file);
      onChange({
        ...audio,
        url: res.url,
        title: file.name.replace(/\.[^/.]+$/, ''),
      });
      soundController.setConfig({ ...audio, url: res.url });
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah file audio.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner: Crucial User Feature Highlight */}
      <div className="bg-gradient-to-r from-teal-950/80 via-emerald-950/60 to-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Fitur Anti Tumpang Tindih Suara (Auto-Mute on Video)
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 font-extrabold uppercase">
                Aktif
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Sesuai instruksi Anda: Saat slide menampilkan <b>Video ber-audio</b>, backsound musik
              secara otomatis dimatikan/diheningkan agar tidak terjadi tumpang tindih suara. Ketika
              berpindah kembali ke <b>Gambar</b>, backsound otomatis menyala kembali dengan efek
              fade-in yang halus.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Slide Gambar: BGM Looping Berjalan</span>
              </div>
              <span className="text-teal-400 font-bold">&rarr;</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Slide Video Masuk: BGM Langsung Auto-Mute</span>
              </div>
              <span className="text-teal-400 font-bold">&rarr;</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Video Selesai: BGM Fade-in Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Audio Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-teal-400" />
              Kontrol Backsound Looping TV
            </h4>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {audio.enabled ? 'Backsound Aktif' : 'Mati'}
              </span>
              <button
                onClick={() => {
                  const next = !audio.enabled;
                  onChange({ ...audio, enabled: next });
                  soundController.setConfig({ ...audio, enabled: next });
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  audio.enabled ? 'bg-teal-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    audio.enabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Active Audio Info & Test Play */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 truncate pr-2">
                <Radio className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">
                  {audio.title || 'Lagu Backsound Aktif'}
                </span>
              </div>
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shrink-0"
              >
                {isPlayingTest ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Tes
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Tes Audio
                  </>
                )}
              </button>
            </div>

            {/* Volume Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-teal-400" /> Volume Default Backsound
                </span>
                <span className="font-mono font-bold text-teal-300">{audio.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audio.volume}
                onChange={(e) => {
                  const vol = parseInt(e.target.value) || 50;
                  onChange({ ...audio, volume: vol });
                  soundController.setConfig({ ...audio, volume: vol });
                }}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          {/* Auto-Mute Toggle Checkbox */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={audio.autoMuteOnVideo}
                onChange={(e) => onChange({ ...audio, autoMuteOnVideo: e.target.checked })}
                className="w-4 h-4 rounded text-teal-500 accent-teal-500 focus:ring-0"
              />
              <span className="text-xs font-bold text-white">
                Otomatis Senyapkan Backsound saat Video Berputar
              </span>
            </label>
            <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
              Memastikan audio video promosi (seperti edukasi cucian, testimoni, atau iklan) dapat
              didengar jelas oleh pelanggan di toko tanpa gangguan musik latar.
            </p>
          </div>

          {/* Looping Checkbox */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={audio.loop}
                onChange={(e) => onChange({ ...audio, loop: e.target.checked })}
                className="w-4 h-4 rounded text-teal-500 accent-teal-500 focus:ring-0"
              />
              <span className="text-xs font-bold text-white">
                Putar Terus Menerus Tanpa Henti (Looping)
              </span>
            </label>
          </div>
        </div>

        {/* Right: Upload MP3 or Select Preset */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-4 border-b border-slate-800">
            <Upload className="w-4 h-4 text-teal-400" />
            Upload File Musik / Ganti Lagu
          </h4>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-500/30 hover:border-teal-400 bg-slate-950/60 rounded-xl p-5 text-center cursor-pointer transition group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioUpload}
            />
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <p className="text-xs font-bold text-white">
              {isUploading ? 'Sedang Mengunggah Audio...' : 'Upload File Audio Sendiri (MP3 / WAV / OGG)'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              File tersimpan di server dan otomatis sinkron ke TVBro signage
            </p>
          </div>

          {uploadError && (
            <p className="text-xs text-red-400 bg-red-950/30 p-2 rounded-lg">{uploadError}</p>
          )}

          {/* Curated Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Atau Pilih Musik Suasana Toko yang Tersedia:
            </label>
            <div className="space-y-2">
              {audioPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChange({
                      ...audio,
                      url: preset.url,
                      title: preset.title,
                    });
                    soundController.setConfig({
                      ...audio,
                      url: preset.url,
                      title: preset.title,
                    });
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    audio.url === preset.url
                      ? 'bg-teal-500/15 border-teal-500 text-teal-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <Music className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-xs font-semibold truncate">{preset.title}</span>
                  </div>
                  {audio.url === preset.url && (
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
