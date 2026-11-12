import React from 'react';
import { LayoutConfig } from '../../types/signage';
import { Tag, ShieldCheck, Clock, PhoneCall } from 'lucide-react';

interface TVSidebarProps {
  layout: LayoutConfig;
}

export const TVSidebar: React.FC<TVSidebarProps> = ({ layout }) => {
  const footerStyle = layout.sidebarFooterStyle || 'compact';

  return (
    <aside className="w-80 md:w-96 lg:w-[420px] shrink-0 h-full flex flex-col bg-slate-950/90 backdrop-blur-xl border-l border-white/10 text-white p-3.5 md:p-4 overflow-hidden select-none shadow-2xl">
      {/* Title Header (Kompak) */}
      <div className="flex items-center gap-2 pb-2.5 mb-2 border-b border-teal-500/30 shrink-0">
        <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
          <Tag className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xs md:text-sm font-extrabold tracking-wide uppercase text-teal-300 truncate">
            {layout.sidebarTitle || 'DAFTAR LAYANAN & HARGA'}
          </h2>
          <p className="text-[10px] text-slate-400 truncate">Jasmine Laundry Bersih &amp; Wangi</p>
        </div>
      </div>

      {/* Daftar Layanan & Harga (Muat 6-8 layanan pas layar) */}
      <div className="flex-1 min-h-0 space-y-1.5 overflow-y-auto no-scrollbar">
        {layout.prices && layout.prices.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
          >
            <div className="flex-1 pr-2 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs md:text-sm text-slate-100 truncate">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 whitespace-nowrap">
              <span className="font-bold text-xs md:text-sm text-teal-300 font-mono">
                {item.price}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer 1 Baris Ramping */}
      {footerStyle === 'compact' && (
        <div className="pt-2 mt-2 border-t border-white/10 shrink-0 flex items-center justify-between text-[10px] md:text-[11px] text-slate-300">
          <span className="flex items-center gap-1 font-medium truncate">
            <PhoneCall className="w-3 h-3 text-teal-400 shrink-0" />
            CS: <b className="text-white font-mono">0821-2859-4817</b>
          </span>
          <span className="flex items-center gap-1 text-teal-300 font-semibold shrink-0">
            <Clock className="w-3 h-3 text-teal-400 shrink-0" />
            08.00 - 20.00 WITA
          </span>
        </div>
      )}
    </aside>
  );
};
