import { SignageConfig } from '../types/signage';
import { DEFAULT_SIGNAGE_CONFIG } from './sampleData';

const STORAGE_KEY = 'jasmine_signage_config_v2';
const BROADCAST_CHANNEL_NAME = 'jasmine_signage_broadcast';

// Create BroadcastChannel for real-time inter-tab/browser updates
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

/**
 * Get signage configuration from local storage or server
 */
export async function getSignageConfig(): Promise<SignageConfig> {
  // 1. First check localStorage for immediate render
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

  // 2. Fetch from server in background or if localData is null
  try {
    const res = await fetch('/api/signage');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const serverData: SignageConfig = json.data;
        // If server data is newer or local is missing, use server data
        if (!localData || (serverData.version && serverData.version >= (localData.version || 0))) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          }
          return serverData;
        }
      }
    }
  } catch (err) {
    // Server might be offline or client-only preview, ignore
  }

  // 3. Fallback to local or default
  if (!localData) {
    localData = DEFAULT_SIGNAGE_CONFIG;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
    }
  }

  return localData;
}

/**
 * Save signage configuration locally and sync to server
 */
export async function saveSignageConfig(config: SignageConfig): Promise<boolean> {
  const updatedConfig: SignageConfig = {
    ...config,
    version: (config.version || 1) + 1,
    lastUpdated: new Date().toISOString(),
  };

  // 1. Save to local storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  // 2. Broadcast to other open windows/TV tabs
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'CONFIG_UPDATED', config: updatedConfig });
    } catch (e) {
      console.warn('Failed to broadcast message', e);
    }
  }

  // 3. Save to server API
  try {
    const res = await fetch('/api/signage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedConfig),
    });
    return res.ok;
  } catch (err) {
    console.warn('Server offline, saved locally only', err);
    return true; // Still true because saved locally
  }
}

/**
 * Reset to default Jasmine Laundry configuration
 */
export async function resetSignageConfig(): Promise<SignageConfig> {
  const freshConfig: SignageConfig = {
    ...DEFAULT_SIGNAGE_CONFIG,
    lastUpdated: new Date().toISOString(),
    version: Date.now(),
  };
  await saveSignageConfig(freshConfig);
  return freshConfig;
}

/**
 * Upload a media file (Image, Video, or Audio)
 * Falls back to Data URL in browser if server upload fails
 */
export async function uploadMedia(file: File): Promise<{ url: string; filename: string; type: 'image' | 'video' | 'audio' }> {
  let fileType: 'image' | 'video' | 'audio' = 'image';
  if (file.type.startsWith('video/')) fileType = 'video';
  else if (file.type.startsWith('audio/')) fileType = 'audio';

  // Read file as base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        fileData: base64Data,
        fileType,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return {
          url: data.url,
          filename: data.filename || file.name,
          type: fileType,
        };
      }
    }
  } catch (err) {
    console.warn('Server upload unavailable, using Data URL in-memory', err);
  }

  // Fallback to Data URL
  return {
    url: base64Data,
    filename: file.name,
    type: fileType,
  };
}

/**
 * Subscribe to real-time configuration changes (BroadcastChannel + polling fallback)
 */
export function subscribeToConfigUpdates(callback: (config: SignageConfig) => void): () => void {
  // BroadcastChannel listener
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'CONFIG_UPDATED' && event.data.config) {
      callback(event.data.config);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // LocalStorage storage event listener (cross-tab in standard browsers)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch (err) {
        // ignore
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  // Background polling for TVBro (polling every 10 seconds to catch remote updates from Admin server)
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
    } catch {
      // server unreachable
    }
  }, 8000);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
    clearInterval(pollInterval);
  };
}
