import React, { useState } from 'react';
import { TickerConfig } from '../../types/signage';
import { RunningTicker } from '../tv/RunningTicker';
import { Megaphone, Plus, Trash2, Sliders, Palette, Type, FastForward } from 'lucide-react';

interface TickerManagerProps {
  ticker: TickerConfig;
  onChange: (ticker: TickerConfig) => void;
}

export const TickerManager: React.FC<TickerManagerProps> = ({ ticker, onChange }) => {
  const [newMessage, setNewMessage] = useState<string>('');

  const colorPresets = [
    { label: 'Jasmine Teal', bg: '#0f766e', text: '#ffffff' },
    { label: 'Emerald Deep', bg: '#064e3b', text: '#ecfdf5' },
    { label: 'Midnight Blue', bg: '#0f172a', text: '#38bdf8' },
    { label: 'Royal Purple', bg: '#581c87', text: '#f5d0fe' },
    { label: 'Crimson Red', bg: '#881337', text: '#ffe4e6' },
    { label: 'Dark Charcoal', bg: '#18181b', text: '#facc15' },
  ];

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onChange({
      ...ticker,
      messages: [...ticker.messages, newMessage.trim()],
    });
    setNewMessage('');
  };

  const handleUpdateMessage = (index: number, val: string) => {
    const updated = [...ticker.messages];
    updated[index] = val;
    onChange({
      ...ticker,
      messages: updated,
    });
  };

  const handleDeleteMessage = (index: number) => {
    onChange({
      ...ticker,
      messages: ticker.messages.filter((_, idx) => idx !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-bold text-white">Pratinjau Langsung Running Text TV</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
            {ticker.enabled ? 'Aktif di Layar TV' : 'Dinonaktifkan'}
          </span>
        </div>

        {/* The Marquee Preview */}
        <div className="rounded-xl overflow-hidden border border-slate-700 shadow-inner">
          <RunningTicker config={ticker} />
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Style & Speed Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-teal-400" />
              Pengaturan Tampilan &amp; Animasi
            </h4>

            {/* Toggle Enable */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Tampilkan Running Text</span>
              <button
                onClick={() => onChange({ ...ticker, enabled: !ticker.enabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  ticker.enabled ? 'bg-teal-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    ticker.enabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Speed Option */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <FastForward className="w-3.5 h-3.5 text-teal-400" /> Kecepatan Berjalan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'normal', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onChange({ ...ticker, speed: spd })}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                      ticker.speed === spd
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {spd === 'slow' ? 'Lambat' : spd === 'normal' ? 'Normal' : 'Cepat'}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-teal-400" /> Ukuran Huruf (TV View)
                </label>
                <span className="text-xs font-mono font-bold text-teal-300">
                  {ticker.fontSize} px
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="44"
                step="2"
                value={ticker.fontSize}
                onChange={(e) =>
                  onChange({ ...ticker, fontSize: parseInt(e.target.value) || 28 })
                }
                className="w-full accent-teal-500"
              />
            </div>

            {/* Badge Label */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Label Kotak Judul (Badge)
              </label>
              <input
                type="text"
                value={ticker.badgeText}
                onChange={(e) => onChange({ ...ticker, badgeText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-500"
                placeholder="Contoh: INFO JASMINE"
              />
            </div>

            {/* Color Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Palette className="w-3.5 h-3.5 text-teal-400" /> Tema Warna
              </label>
              <div className="grid grid-cols-2 gap-2">
                {colorPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      onChange({ ...ticker, bgColor: preset.bg, textColor: preset.text })
                    }
                    className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-left"
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: preset.bg }}
                    />
                    <span className="text-[11px] text-slate-300 truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Message Items Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-3">Daftar Teks &amp; Pengumuman</h4>
            <p className="text-xs text-slate-400 mb-4">
              Teks ini akan bergulir secara kontinu di bagian bawah layar Android TV Bro.
            </p>

            {/* Add New Message Form */}
            <form onSubmit={handleAddMessage} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pengumuman, info promo, atau jam operasional baru..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </form>

            {/* Message List */}
            <div className="space-y-3">
              {ticker.messages.map((msg, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800"
                >
                  <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => handleUpdateMessage(index, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-white border-b border-transparent hover:border-slate-700 focus:border-teal-500 focus:bg-slate-900 px-2 py-1 rounded transition"
                  />
                  <button
                    onClick={() => handleDeleteMessage(index)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition shrink-0"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
