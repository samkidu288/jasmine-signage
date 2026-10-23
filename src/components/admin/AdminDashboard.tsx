import React, { useState } from 'react';
import { SignageConfig } from '../../types/signage';
import { saveSignageConfig, resetSignageConfig } from '../../services/storage';
import { SlideManager } from './SlideManager';
import { TickerManager } from './TickerManager';
import { AudioManager } from './AudioManager';
import { LayoutManager } from './LayoutManager';
import { TVBroGuide } from './TVBroGuide';
import { TVPlayer } from '../tv/TVPlayer';
import {
  Film,
  Megaphone,
  Music,
  Layout,
  BookOpen,
  Save,
  Tv,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  PlaySquare,
} from 'lucide-react';

interface AdminDashboardProps {
  config: SignageConfig;
  onUpdateConfig: (newConfig: SignageConfig) => void;
  onOpenTV: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  config,
  onUpdateConfig,
  onOpenTV,
}) => {
  const [activeTab, setActiveTab] = useState<'slides' | 'ticker' | 'audio' | 'layout' | 'guide'>('slides');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);

  // Local draft state for editing
  const [draftConfig, setDraftConfig] = useState<SignageConfig>(config);

  // Keep draft in sync if external config changes
  React.useEffect(() => {
    setDraftConfig(config);
  }, [config.version]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await saveSignageConfig(draftConfig);
      onUpdateConfig(draftConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan konfigurasi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Kembalikan semua pengaturan dan slide ke data bawaan Jasmine Laundry?')) {
      const fresh = await resetSignageConfig();
      setDraftConfig(fresh);
      onUpdateConfig(fresh);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg ring-2 ring-teal-400/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
              Jasmine Laundry CMS
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                Admin Central
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              adminsignage.jasminelaundry.my.id &bull; TV Bro Android TV Signage
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Reset button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            title="Kembalikan ke Contoh Data Asli"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          {/* TV Simulator Modal Trigger */}
          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition shadow-sm"
          >
            <PlaySquare className="w-4 h-4 text-teal-400" />
            <span>Simulasi TV</span>
          </button>

          {/* Direct TV Mode Button */}
          <button
            onClick={onOpenTV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition shadow-md"
            title="Buka Halaman signage.jasminelaundry.my.id"
          >
            <Tv className="w-4 h-4" />
            <span>Buka Layar TV</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 text-xs font-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 fill-current" />
            )}
            <span>{isSaving ? 'Menyimpan...' : 'Simpan & Terapkan ke TV'}</span>
          </button>
        </div>
      </header>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-500 text-slate-950 px-6 py-2.5 flex items-center justify-center gap-2 font-bold text-xs shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            Perubahan berhasil disimpan dan langsung disinkronkan ke layar TV (signage.jasminelaundry.my.id)!
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'slides', label: 'Playlist & Konten Media', icon: Film, count: draftConfig.slides.length },
            { id: 'ticker', label: 'Teks Berjalan (Ticker)', icon: Megaphone },
            { id: 'audio', label: 'Backsound & Auto-Mute', icon: Music },
            { id: 'layout', label: 'Layout & Menu Harga', icon: Layout },
            { id: 'guide', label: 'Panduan Android TVBro', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-teal-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto pb-16">
        {activeTab === 'slides' && (
          <SlideManager
            slides={draftConfig.slides}
            onChange={(slides) => setDraftConfig({ ...draftConfig, slides })}
          />
        )}

        {activeTab === 'ticker' && (
          <TickerManager
            ticker={draftConfig.ticker}
            onChange={(ticker) => setDraftConfig({ ...draftConfig, ticker })}
          />
        )}

        {activeTab === 'audio' && (
          <AudioManager
            audio={draftConfig.audio}
            onChange={(audio) => setDraftConfig({ ...draftConfig, audio })}
          />
        )}

        {activeTab === 'layout' && (
          <LayoutManager
            layout={draftConfig.layout}
            onChange={(layout) => setDraftConfig({ ...draftConfig, layout })}
          />
        )}

        {activeTab === 'guide' && <TVBroGuide />}
      </main>

      {/* Interactive TV Simulator Modal */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">
                  Simulasi Tampilan TV Bro (Resolusi 16:9 Android TV)
                </h3>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated 16:9 TV Container */}
            <div className="relative aspect-video w-full bg-black overflow-hidden">
              <TVPlayer
                config={draftConfig}
                onOpenAdmin={() => setShowSimulator(false)}
                isSimulated={true}
              />
            </div>

            {/* Modal Footer with quick instructions */}
            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Tip: Perhatikan bahwa saat video berputar, musik backsound otomatis di-mute.
              </span>
              <button
                onClick={() => setShowSimulator(false)}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
              >
                Tutup Simulasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
