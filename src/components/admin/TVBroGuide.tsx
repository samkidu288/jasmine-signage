import React, { useState } from 'react';
import { Tv, Globe, Shield, Copy, Check, ExternalLink, HelpCircle, Server } from 'lucide-react';

export const TVBroGuide: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentTvUrl = `${currentOrigin}?mode=tv`;
  const currentAdminUrl = `${currentOrigin}?mode=admin`;

  return (
    <div className="space-y-6">
      {/* Domain Mapping Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Konfigurasi Domain Jasmine Laundry Anda
            </h3>
            <p className="text-xs text-slate-400">
              Sistem telah mendeteksi dan mendukung routing otomatis berdasarkan nama domain Anda:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TV Signage Domain */}
          <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="w-4 h-4" /> Domain Layar Android TV
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                Player Mode
              </span>
            </div>
            <p className="font-mono text-sm font-bold text-white break-all mb-1">
              signage.jasminelaundry.my.id
            </p>
            <p className="text-[11px] text-slate-400 mb-3">
              Otomatis langsung memutar slide video/gambar &amp; running text di Android TV tanpa
              menu admin.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  copyToClipboard('https://signage.jasminelaundry.my.id', 'tv-domain')
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 text-xs font-semibold transition border border-teal-500/30"
              >
                {copiedUrl === 'tv-domain' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Salin Domain TV
              </button>
              <button
                onClick={() => copyToClipboard(currentTvUrl, 'local-tv')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                {copiedUrl === 'local-tv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Salin URL Mode TV Saat Ini
              </button>
            </div>
          </div>

          {/* Admin CMS Domain */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Domain CMS Dashboard Admin
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Admin Mode
              </span>
            </div>
            <p className="font-mono text-sm font-bold text-white break-all mb-1">
              adminsignage.jasminelaundry.my.id
            </p>
            <p className="text-[11px] text-slate-400 mb-3">
              Halaman manajemen konten, upload video/gambar, pengaturan durasi, running text &amp;
              backsound.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  copyToClipboard('https://adminsignage.jasminelaundry.my.id', 'admin-domain')
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold transition border border-purple-500/30"
              >
                {copiedUrl === 'admin-domain' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Salin Domain Admin
              </button>
              <button
                onClick={() => copyToClipboard(currentAdminUrl, 'local-admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                {copiedUrl === 'local-admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Salin URL Admin Saat Ini
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Android TV & TVBro Setup Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Tv className="w-5 h-5 text-teal-400" />
          Panduan Lengkap Pemasangan di Android TV dengan TVBro
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-extrabold flex items-center justify-center text-xs mb-3">
                1
              </div>
              <h4 className="font-bold text-sm text-white mb-1.5">Instal TVBro</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Di Android TV (atau Google TV / Xiaomi TV / Chromecast), buka{' '}
                <b>Google Play Store</b>, cari browser bernama <b>TVBro</b> lalu pasang.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-extrabold flex items-center justify-center text-xs mb-3">
                2
              </div>
              <h4 className="font-bold text-sm text-white mb-1.5">Masukkan URL Signage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ketikkan alamat <b>https://signage.jasminelaundry.my.id</b> pada bilah alamat TVBro
                lalu tekan Enter/Buka.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-extrabold flex items-center justify-center text-xs mb-3">
                3
              </div>
              <h4 className="font-bold text-sm text-white mb-1.5">Set Fullscreen &amp; Home</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tekan tombol menu remote TVBro, pilih <b>Layar Penuh (Fullscreen)</b> dan tetapkan
                halaman ini sebagai <b>Homepage</b> agar selalu terbuka otomatis.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-extrabold flex items-center justify-center text-xs mb-3">
                4
              </div>
              <h4 className="font-bold text-sm text-white mb-1.5">Aktifkan Audio TV</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saat pertama kali dibuka, tekan tombol <b>OK</b> pada remote TV atau klik tombol
                konfirmasi agar TVBro mengizinkan musik latar belakang berputar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hosting & Server Nginx/Reverse Proxy Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-400" />
            Konfigurasi Nginx VPS Reverse Proxy (Port 3007)
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/40">
            Port 3007 (di atas 3006)
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Aplikasi berjalan di port <b>3007</b> (agar tidak bentrok dengan port 3006 yang sedang
          aktif). Konfigurasi Nginx di VPS Anda:
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-teal-300 overflow-x-auto space-y-1">
          <p className="text-slate-500"># Simpan di: /etc/nginx/sites-available/jasminesignage</p>
          <p className="text-white">server &#123;</p>
          <p className="pl-4">listen 80;</p>
          <p className="pl-4">server_name signage.jasminelaundry.my.id adminsignage.jasminelaundry.my.id;</p>
          <p className="pl-4">client_max_body_size 100M; # Mendukung upload video &amp; gambar besar</p>
          <p className="text-slate-500 pl-4"># Proxy ke Node.js / Express pada port 3007</p>
          <p className="pl-4">location / &#123;</p>
          <p className="pl-8">proxy_pass http://127.0.0.1:3007;</p>
          <p className="pl-8">proxy_http_version 1.1;</p>
          <p className="pl-8">proxy_set_header Upgrade $http_upgrade;</p>
          <p className="pl-8">proxy_set_header Connection 'upgrade';</p>
          <p className="pl-8">proxy_set_header Host $host;</p>
          <p className="pl-8">proxy_cache_bypass $http_upgrade;</p>
          <p className="pl-8">proxy_set_header X-Real-IP $remote_addr;</p>
          <p className="pl-8">proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;</p>
          <p className="pl-8">proxy_set_header X-Forwarded-Proto $scheme;</p>
          <p className="pl-4">&#125;</p>
          <p className="text-white">&#125;</p>
        </div>
      </div>
    </div>
  );
};
