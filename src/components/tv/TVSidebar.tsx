import React from 'react';
import { LayoutConfig } from '../../types/signage';
import { Tag, Sparkles, ShieldCheck, Clock, PhoneCall } from 'lucide-react';

interface TVSidebarProps {
  layout: LayoutConfig;
}

export const TVSidebar: React.FC<TVSidebarProps> = ({ layout }) => {
  return (
    <aside className="w-72 md:w-80 lg:w-[380px] shrink-0 h-full flex flex-col bg-slate-950/85 backdrop-blur-xl border-l border-white/10 text-white p-4 overflow-hidden select-none shadow-2xl">
      {/* Title */}
      <div className="flex items-center gap-2 pb-3 border-b border-teal-500/30">
        <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
          <Tag className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-teal-300">
            {layout.sidebarTitle || 'DAFTAR LAYANAN & HARGA'}
          </h2>
          <p className="text-[11px] text-slate-400">Jasmine Laundry Bersih &amp; Terpercaya</p>
        </div>
      </div>

      {/* Price Items */}
      <div className="flex-1 min-h-0 py-3 space-y-2 overflow-y-auto no-scrollbar">
        {layout.prices && layout.prices.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
          >
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-100">{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-base text-teal-300 font-mono">{item.price}</span>
              <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Features & Contact */}
      <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-teal-950/40 border border-teal-500/20 text-teal-200">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Garansi Cuci Ulang 100% jika tidak puas</span>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-200">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Buka Setiap Hari: 07.00 - 21.00 WIB</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 text-slate-300 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
            CS WhatsApp:
          </span>
          <span className="font-mono font-bold text-white tracking-wider">0812-3456-7890</span>
        </div>
      </div>
    </aside>
  );
};
