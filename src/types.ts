export type Platform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'unknown'

export type DownloadFormat = 'mp4' | 'mp3'

export type VideoQuality = 'best' | '1080' | '720' | '480'

export interface VideoInfo {
  title: string
  thumbnail: string
  duration: number
  uploader: string
  platform: Platform
  url: string
}

export type AppStatus = 'idle' | 'fetching' | 'ready' | 'downloading' | 'error'
