import React, { useState, useRef } from 'react';
import { SlideItem, TransitionType } from '../../types/signage';
import { uploadMedia } from '../../services/storage';
import {
  Upload,
  Film,
  Image as ImageIcon,
  Clock,
  Volume2,
  VolumeX,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface SlideManagerProps {
  slides: SlideItem[];
  onChange: (slides: SlideItem[]) => void;
}

export const SlideManager: React.FC<SlideManagerProps> = ({ slides, onChange }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [newUrlInput, setNewUrlInput] = useState<string>('');
  const [newTitleInput, setNewTitleInput] = useState<string>('');
  const [newTypeInput, setNewTypeInput] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle direct file upload (image or video)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const isVideo = file.type.startsWith('video/');
      const result = await uploadMedia(file);

      const newSlide: SlideItem = {
        id: `slide-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: isVideo ? 'video' : 'image',
        url: result.url,
        duration: isVideo ? 15 : 8,
        autoDuration: isVideo,
        muteVideoAudio: false,
        videoVolume: 100,
        transition: 'fade',
        isActive: true,
        order: slides.length + 1,
        schedule: {
          allDays: true,
          days: [0, 1, 2, 3, 4, 5, 6],
          allHours: true,
        },
      };

      onChange([...slides, newSlide]);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah file media.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add slide from URL
  const handleAddFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrlInput.trim()) return;

    const isVideo =
      newTypeInput === 'video' ||
      newUrlInput.endsWith('.mp4') ||
      newUrlInput.endsWith('.webm');

    const newSlide: SlideItem = {
      id: `slide-${Date.now()}`,
      title: newTitleInput.trim() || (isVideo ? 'Video Promosi Baru' : 'Gambar Banner Baru'),
      type: isVideo ? 'video' : 'image',
      url: newUrlInput.trim(),
      duration: isVideo ? 15 : 10,
      autoDuration: isVideo,
      muteVideoAudio: false,
      videoVolume: 100,
      transition: 'fade',
      isActive: true,
      order: slides.length + 1,
      schedule: {
        allDays: true,
        days: [0, 1, 2, 3, 4, 5, 6],
        allHours: true,
      },
    };

    onChange([...slides, newSlide]);
    setNewUrlInput('');
    setNewTitleInput('');
  };

  // Update specific slide property
  const updateSlide = (id: string, updates: Partial<SlideItem>) => {
    onChange(
      slides.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Delete slide
  const deleteSlide = (id: string) => {
    if (confirm('Hapus slide ini dari antrian tayang TV?')) {
      onChange(slides.filter((s) => s.id !== id));
    }
  };

  // Reorder slide
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const updated = [...slides];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Upload & Add Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-400" />
                Upload Media (Gambar &amp; Video)
              </h3>
              <p className="text-xs text-slate-400">
                Mendukung gambar (JPG, PNG, WebP) dan video (MP4, WebM) untuk tayang di Android TV.
              </p>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-500/40 hover:border-teal-400 bg-slate-950/60 hover:bg-slate-950/80 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              {isUploading ? (
                <div className="w-7 h-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>
            <p className="font-semibold text-white text-sm">
              {isUploading ? 'Sedang Memproses Upload...' : 'Klik atau Tarik File Gambar/Video ke Sini'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              File otomatis disimpan dan disinkronkan ke TV Player signage.jasminelaundry.my.id
            </p>
          </div>

          {uploadError && (
            <p className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-800/50 p-2.5 rounded-xl">
              {uploadError}
            </p>
          )}
        </div>

        {/* Add via URL Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" />
              Tambah Media via Link / URL
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Gunakan jika memiliki tautan gambar CDN atau video MP4 online.
            </p>

            <form onSubmit={handleAddFromUrl} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Judul Slide / Promosi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Promo Cuci Sepatu 20rb"
                  value={newTitleInput}
                  onChange={(e) => setNewTitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tipe Konten
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTypeInput('image')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold border ${
                      newTypeInput === 'image'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTypeInput('video')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold border ${
                      newTypeInput === 'video'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" /> Video MP4
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  URL Media (https://...)
                </label>
                <input
                  type="url"
                  placeholder="https://domain.com/video.mp4 atau image.jpg"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={!newUrlInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah ke Antrian TV
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Slide Playlist Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-teal-400" />
              Daftar Putar Tayangan TV ({slides.length} Konten)
            </h3>
            <p className="text-xs text-slate-400">
              Atur urutan pemutaran, durasi tayang gambar/video, dan perilaku audio saat video berputar.
            </p>
          </div>
        </div>

        {slides.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Belum ada slide. Unggah media pertama Anda di atas.
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`p-4 rounded-2xl border transition-all ${
                  slide.isActive
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Order Controls */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => moveSlide(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-20"
                        title="Geser ke atas"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono font-bold text-teal-400">{idx + 1}</span>
                      <button
                        onClick={() => moveSlide(idx, 'down')}
                        disabled={idx === slides.length - 1}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-20"
                        title="Geser ke bawah"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Preview Media */}
                    <div className="relative w-24 h-16 rounded-xl bg-slate-900 overflow-hidden border border-slate-700 flex items-center justify-center shrink-0">
                      {slide.type === 'video' ? (
                        <>
                          <video
                            src={slide.url}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Film className="w-5 h-5 text-amber-300" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span
                        className={`absolute bottom-1 right-1 text-[9px] font-bold px-1 py-0.5 rounded ${
                          slide.type === 'video'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-teal-500 text-slate-950'
                        }`}
                      >
                        {slide.type === 'video' ? 'VIDEO' : 'GAMBAR'}
                      </span>
                    </div>

                    {/* Title and metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                          className="font-bold text-white text-sm bg-transparent border-b border-transparent hover:border-slate-700 focus:border-teal-500 focus:bg-slate-900 px-1 py-0.5 rounded transition truncate"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                        {slide.type === 'video' ? (
                          <span className="flex items-center gap-1 text-amber-300 font-medium">
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            {slide.muteVideoAudio
                              ? 'Video Bisu (Backsound Tetap Nyala)'
                              : 'Auto-Mute Backsound Aktif Saat Video Diputar'}
                          </span>
                        ) : (
                          <span className="text-teal-300">
                            🎵 Backsound BGM berputar di latar belakang
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Duration, Controls & Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Duration Settings */}
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      {slide.type === 'video' && slide.autoDuration ? (
                        <span className="text-xs font-semibold text-amber-300">
                          Sesuai Panjang Video
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="3"
                            max="300"
                            value={slide.duration}
                            onChange={(e) =>
                              updateSlide(slide.id, {
                                duration: Math.max(3, parseInt(e.target.value) || 5),
                              })
                            }
                            className="w-12 bg-slate-950 text-white text-xs font-bold font-mono px-1.5 py-0.5 rounded border border-slate-700 text-center"
                          />
                          <span className="text-xs text-slate-400">detik</span>
                        </div>
                      )}
                    </div>

                    {/* For Video: Auto-duration Toggle */}
                    {slide.type === 'video' && (
                      <button
                        onClick={() =>
                          updateSlide(slide.id, { autoDuration: !slide.autoDuration })
                        }
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-medium border ${
                          slide.autoDuration
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                        title="Otomatis berganti slide saat durasi video habis"
                      >
                        {slide.autoDuration ? 'Auto-End Video: ON' : 'Durasi Manual'}
                      </button>
                    )}

                    {/* Transition Effect */}
                    <select
                      value={slide.transition}
                      onChange={(e) =>
                        updateSlide(slide.id, { transition: e.target.value as TransitionType })
                      }
                      className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1.5 rounded-xl focus:border-teal-500"
                    >
                      <option value="fade">Transisi: Fade</option>
                      <option value="slide">Transisi: Slide</option>
                      <option value="zoom">Transisi: Zoom</option>
                      <option value="none">Transisi: Langsung</option>
                    </select>

                    {/* Active Toggle */}
                    <button
                      onClick={() => updateSlide(slide.id, { isActive: !slide.isActive })}
                      className={`p-2 rounded-xl transition ${
                        slide.isActive
                          ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }`}
                      title={slide.isActive ? 'Nonaktifkan Slide' : 'Aktifkan Slide'}
                    >
                      {slide.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteSlide(slide.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      title="Hapus Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Video Audio Rules Info Banner for this slide */}
                {slide.type === 'video' && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      Ketika video ini diputar di TV, browser TVBro akan otomatis membisukan lagu
                      latar belakang (BGM) agar suara video terdengar jernih.
                    </span>

                    <button
                      onClick={() =>
                        updateSlide(slide.id, { muteVideoAudio: !slide.muteVideoAudio })
                      }
                      className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                    >
                      {slide.muteVideoAudio ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                          <span>Video saat ini bisu (BGM tetap nyala)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ubah ke video bisu</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
