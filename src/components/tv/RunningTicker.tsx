import React from 'react';
import { TickerConfig } from '../../types/signage';
import { Megaphone } from 'lucide-react';

interface RunningTickerProps {
  config: TickerConfig;
}

export const RunningTicker: React.FC<RunningTickerProps> = ({ config }) => {
  if (!config.enabled) return null;

  // Compute animation speed based on config
  // For TV screens, slow: 55s, normal: 38s, fast: 24s
  const durationMap = {
    slow: '60s',
    normal: '40s',
    fast: '25s',
  };
  const duration = durationMap[config.speed] || '40s';

  const fullText = config.messages.join(config.separator);

  return (
    <div
      className="relative w-full overflow-hidden flex items-stretch z-30 select-none shadow-2xl border-t border-white/15"
      style={{
        backgroundColor: config.bgColor || '#0f766e',
        color: config.textColor || '#ffffff',
        minHeight: `${Math.max(48, (config.fontSize || 28) + 24)}px`,
      }}
    >
      {/* Optional Badge */}
      {config.showBadge && (
        <div className="relative z-10 flex items-center gap-2 px-5 py-2 font-bold tracking-wider text-xs md:text-sm uppercase bg-black/35 backdrop-blur-md border-r border-white/20 whitespace-nowrap shadow-md">
          <Megaphone className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="font-extrabold tracking-wide text-amber-200">
            {config.badgeText || 'PENGUMUMAN'}
          </span>
        </div>
      )}

      {/* Marquee Container */}
      <div className="relative flex-1 flex items-center overflow-hidden">
        <div
          className="flex whitespace-nowrap items-center will-change-transform"
          style={{
            animation: `marquee ${duration} linear infinite`,
            fontSize: `${config.fontSize || 28}px`,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {/* Repeat text twice for continuous looping without sudden jump */}
          <span className="inline-block px-8 py-2">{fullText}</span>
          <span className="inline-block px-8 py-2">{fullText}</span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};
