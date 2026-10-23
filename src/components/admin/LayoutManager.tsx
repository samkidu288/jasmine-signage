import React from 'react';
import { LayoutConfig, PriceItem } from '../../types/signage';
import { Layout, Clock, Calendar, Sparkles, Plus, Trash2, Tag, Palette } from 'lucide-react';

interface LayoutManagerProps {
  layout: LayoutConfig;
  onChange: (layout: LayoutConfig) => void;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({ layout, onChange }) => {
  const handleUpdatePrice = (index: number, field: keyof PriceItem, value: string) => {
    const updated = [...layout.prices];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...layout, prices: updated });
  };

  const handleAddPrice = () => {
    const newItem: PriceItem = {
      name: 'Layanan Baru',
      price: 'Rp 10.000',
      unit: '/ kg',
    };
    onChange({ ...layout, prices: [...layout.prices, newItem] });
  };

  const handleDeletePrice = (index: number) => {
    onChange({
      ...layout,
      prices: layout.prices.filter((_, idx) => idx !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Layout Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Layout className="w-5 h-5 text-teal-400" />
          Format Tampilan Layar TV
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Pilih bagaimana konten disusun pada layar TV Android TV Bro Anda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Split Screen Card */}
          <div
            onClick={() => onChange({ ...layout, style: 'splitscreen' })}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              layout.style === 'splitscreen'
                ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-white">Split-Screen (Rekomendasi Toko)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500 text-slate-950 font-extrabold uppercase">
                Paling Efektif
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Media foto &amp; video tampil di sisi kiri (70%), sedangkan daftar harga &amp; layanan
              Jasmine Laundry tampil permanen di sisi kanan. Sangat informatif untuk pelanggan di
              kasir/ruang tunggu.
            </p>
            {/* Visual wireframe */}
            <div className="h-16 rounded-lg bg-slate-900 border border-slate-700 flex overflow-hidden p-1 gap-1">
              <div className="flex-1 bg-teal-600/30 rounded flex items-center justify-center text-[10px] font-bold text-teal-300">
                Video / Gambar
              </div>
              <div className="w-20 bg-slate-800 rounded flex items-center justify-center text-[9px] font-semibold text-slate-400">
                Menu Harga
              </div>
            </div>
          </div>

          {/* Fullscreen Card */}
          <div
            onClick={() => onChange({ ...layout, style: 'fullscreen' })}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              layout.style === 'fullscreen'
                ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-white">Full Screen Media (Sinematik)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                16:9 Penuh
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Video dan gambar promosi memenuhi seluruh bidang layar TV. Teks berjalan tetap ada di
              bagian bawah. Cocok jika materi video/gambar Anda sudah memiliki desain komplit.
            </p>
            {/* Visual wireframe */}
            <div className="h-16 rounded-lg bg-slate-900 border border-slate-700 flex flex-col overflow-hidden p-1 gap-1">
              <div className="flex-1 bg-teal-600/30 rounded flex items-center justify-center text-[10px] font-bold text-teal-300">
                Full 16:9 Video &amp; Gambar
              </div>
              <div className="h-3 bg-teal-500/50 rounded flex items-center justify-center text-[8px] text-white">
                Teks Berjalan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Branding Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Nama Brand &amp; Info Header TV
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nama Brand / Toko
            </label>
            <input
              type="text"
              value={layout.brandName}
              onChange={(e) => onChange({ ...layout, brandName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-500"
              placeholder="JASMINE LAUNDRY"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={layout.tagline}
              onChange={(e) => onChange({ ...layout, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-teal-500"
              placeholder="Professional Laundry & Dry Cleaning"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" /> Tampilkan Jam Digital Live
              </span>
              <input
                type="checkbox"
                checked={layout.showClock}
                onChange={(e) => onChange({ ...layout, showClock: e.target.checked })}
                className="w-4 h-4 accent-teal-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-400" /> Tampilkan Tanggal Indonesia
              </span>
              <input
                type="checkbox"
                checked={layout.showDate}
                onChange={(e) => onChange({ ...layout, showDate: e.target.checked })}
                className="w-4 h-4 accent-teal-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" /> Tampilkan Ikon Logo
              </span>
              <input
                type="checkbox"
                checked={layout.showLogo}
                onChange={(e) => onChange({ ...layout, showLogo: e.target.checked })}
                className="w-4 h-4 accent-teal-500"
              />
            </label>
          </div>
        </div>

        {/* Sidebar Price List Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-400" />
                Daftar Harga di Sidebar TV
              </h3>
              <p className="text-xs text-slate-400">
                Ditampilkan saat mode Split-Screen aktif di Android TV.
              </p>
            </div>
            <button
              onClick={handleAddPrice}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
            {layout.prices.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800"
              >
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdatePrice(idx, 'name', e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white px-2 py-1 border border-slate-700 rounded focus:border-teal-500"
                  placeholder="Nama Paket"
                />
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => handleUpdatePrice(idx, 'price', e.target.value)}
                  className="w-24 bg-transparent text-xs font-mono font-bold text-teal-300 px-2 py-1 border border-slate-700 rounded focus:border-teal-500"
                  placeholder="Rp 8.000"
                />
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => handleUpdatePrice(idx, 'unit', e.target.value)}
                  className="w-16 bg-transparent text-xs text-slate-400 px-2 py-1 border border-slate-700 rounded focus:border-teal-500"
                  placeholder="/ kg"
                />
                <input
                  type="text"
                  value={item.badge || ''}
                  onChange={(e) => handleUpdatePrice(idx, 'badge', e.target.value)}
                  className="w-20 bg-transparent text-[11px] text-amber-300 px-2 py-1 border border-slate-700 rounded focus:border-teal-500"
                  placeholder="Badge (Promo)"
                />
                <button
                  onClick={() => handleDeletePrice(idx)}
                  className="p-1 rounded text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
