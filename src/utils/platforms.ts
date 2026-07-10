import type { Platform } from '../types'

export interface PlatformMeta {
  id: Platform
  name: string
  color: string
  patterns: RegExp[]
}

export const PLATFORMS: PlatformMeta[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    patterns: [/youtube\.com/i, /youtu\.be/i],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    patterns: [/instagram\.com/i],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    patterns: [/facebook\.com/i, /fb\.watch/i, /fb\.com/i],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#00F2EA',
    patterns: [/tiktok\.com/i, /vm\.tiktok\.com/i],
  },
]

export function detectPlatform(url: string): Platform {
  for (const platform of PLATFORMS) {
    if (platform.patterns.some((p) => p.test(url))) return platform.id
  }
  return 'unknown'
}

export function getPlatformMeta(platform: Platform): PlatformMeta | undefined {
  return PLATFORMS.find((p) => p.id === platform)
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
