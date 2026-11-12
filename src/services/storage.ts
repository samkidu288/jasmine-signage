import { SignageConfig } from '../types/signage';
import { DEFAULT_SIGNAGE_CONFIG } from './sampleData';

const STORAGE_KEY = 'jasmine_signage_config_v2';
const BROADCAST_CHANNEL_NAME = 'jasmine_signage_broadcast';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

export async function getSignageConfig(): Promise<SignageConfig> {
  let localData: SignageConfig | null = null;
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        localData = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse local storage config', e);
      }
    }
  }

  try {
    const res = await fetch('/api/signage');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const serverData: SignageConfig = json.data;
        if (!localData || (serverData.version && serverData.version >= (localData.version || 0))) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          }
          return serverData;
        }
      }
    }
  } catch (err) {}

  if (!localData) {
    localData = DEFAULT_SIGNAGE_CONFIG;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
    }
  }
  return localData;
}

export async function saveSignageConfig(config: SignageConfig): Promise<boolean> {
  const updatedConfig: SignageConfig = {
    ...config,
    lastUpdated: new Date().toISOString(),
    version: (config.version || 1) + 1,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
  }

  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'CONFIG_UPDATED',
      config: updatedConfig,
    });
  }

  try {
    const res = await fetch('/api/signage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedConfig),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function resetSignageConfig(): Promise<SignageConfig> {
  const freshConfig: SignageConfig = {
    ...DEFAULT_SIGNAGE_CONFIG,
    lastUpdated: new Date().toISOString(),
    version: Date.now(),
  };
  await saveSignageConfig(freshConfig);
  return freshConfig;
}

export function uploadMedia(
  file: File,
  onProgress?: (percent: number, loadedBytes: number, totalBytes: number) => void
): Promise<{ url: string; filename: string; type: 'image' | 'video' | 'audio' }> {
  return new Promise((resolve, reject) => {
    let fileType: 'image' | 'video' | 'audio' = 'image';
    if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.min(100, Math.round((e.loaded / e.total) * 100));
          onProgress(percent, e.loaded, e.total);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data && data.success && data.url) {
            if (onProgress) onProgress(100, file.size, file.size);
            resolve({
              url: data.url,
              filename: data.filename || file.name,
              type: fileType,
            });
            return;
          }
        } catch (e) {}
      }
      reject(new Error(`Upload gagal (Status ${xhr.status}): ${xhr.statusText || 'Kesalahan server'}`));
    };

    xhr.onerror = () => {
      reject(new Error('Koneksi terputus saat mengunggah file ke server.'));
    };

    xhr.send(formData);
  });
}

export function subscribeToConfigUpdates(callback: (config: SignageConfig) => void): () => void {
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'CONFIG_UPDATED' && event.data.config) {
      callback(event.data.config);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch (err) {}
    }
  };

  window.addEventListener('storage', handleStorage);

  const pollInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/signage');
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          const remote: SignageConfig = json.data;
          const currentRaw = localStorage.getItem(STORAGE_KEY);
          if (currentRaw) {
            const current = JSON.parse(currentRaw);
            if (remote.version > (current.version || 0)) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
              callback(remote);
            }
          }
        }
      }
    } catch {}
  }, 8000);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
    clearInterval(pollInterval);
  };
}
