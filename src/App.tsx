/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SignageConfig } from './types/signage';
import { getSignageConfig, subscribeToConfigUpdates } from './services/storage';
import { TVPlayer } from './components/tv/TVPlayer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Tv, Shield, ExternalLink, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<'tv' | 'admin'>('tv');
  const [config, setConfig] = useState<SignageConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Determine initial mode based on hostname, query param, or hash
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const hash = window.location.hash;

    const hostname = window.location.hostname.toLowerCase();

    if (modeParam === 'admin' || hash === '#/admin') {
      setCurrentMode('admin');
    } else if (modeParam === 'tv' || hash === '#/tv') {
      setCurrentMode('tv');
    } else if (hostname.includes('adminsignage')) {
      // Domain: adminsignage.jasminelaundry.my.id
      setCurrentMode('admin');
    } else if (hostname.includes('signage')) {
      // Domain: signage.jasminelaundry.my.id
      setCurrentMode('tv');
    } else {
      // Default for preview: start in TV player mode with switcher
      setCurrentMode('tv');
    }
  }, []);

  // Fetch initial config and subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        const initialConfig = await getSignageConfig();
        setConfig(initialConfig);
      } catch (err) {
        console.error('Failed to load initial signage config', err);
      } finally {
        setIsLoading(false);
      }

      unsubscribe = subscribeToConfigUpdates((updated) => {
        setConfig(updated);
      });
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update mode in URL without full reload
  const switchMode = (mode: 'tv' | 'admin') => {
    setCurrentMode(mode);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    window.history.pushState({}, '', url.toString());
  };

  if (isLoading || !config) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-teal-400 gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-teal-400" />
        <p className="text-white font-bold text-sm tracking-wide">
          Memuat Jasmine Laundry Signage...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-black">
      {/* Render Active View */}
      {currentMode === 'tv' ? (
        <TVPlayer config={config} onOpenAdmin={() => switchMode('admin')} />
      ) : (
        <AdminDashboard
          config={config}
          onUpdateConfig={(updated) => setConfig(updated)}
          onOpenTV={() => switchMode('tv')}
        />
      )}
    </div>
  );
}
