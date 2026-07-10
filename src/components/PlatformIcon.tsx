import type { Platform } from '../types'
import { getPlatformMeta } from '../utils/platforms'

interface PlatformIconProps {
  platform: Platform
  className?: string
}

export function PlatformIcon({ platform, className = 'w-5 h-5' }: PlatformIconProps) {
  switch (platform) {
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.2c2.7 0 3 0 4.1.1 1 .0 1.5.2 1.9.4.5.2.8.4 1.2.8.4.4.6.7.8 1.2.2.4.4.9.4 1.9.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.5-.4 1.9-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.4.2-.9.4-1.9.4-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.5-.2-1.9-.4-.5-.2-.8-.4-1.2-.8-.4-.4-.6-.7-.8-1.2-.2-.4-.4-.9-.4-1.9-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c0-1 .2-1.5.4-1.9.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.4-.2.9-.4 1.9-.4 1.1-.1 1.4-.1 4.1-.1zM12 0C9.3 0 8.9 0 7.8.1 6.8.1 6.1.3 5.4.6c-.7.3-1.3.7-1.9 1.3C2.9 2.5 2.5 3.1 2.2 3.8.9 4.5.7 5.2.6 6.2.5 7.3.5 7.7.5 10.4s0 3.1.1 4.2c.1 1 .3 1.7.6 2.4.3.7.7 1.3 1.3 1.9.6.6 1.2 1 1.9 1.3.7.3 1.4.5 2.4.6 1.1.1 1.5.1 4.2.1s3.1 0 4.2-.1c1-.1 1.7-.3 2.4-.6.7-.3 1.3-.7 1.9-1.3.6-.6 1-1.2 1.3-1.9.3-.7.5-1.4.6-2.4.1-1.1.1-1.5.1-4.2s0-3.1-.1-4.2c-.1-1-.3-1.7-.6-2.4-.3-.7-.7-1.3-1.3-1.9-.6-.6-1.2-1-1.9-1.3-.7-.3-1.4-.5-2.4-.6C15.1 0 14.7 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.9a1.4 1.4 0 1 1-2.9 0 1.4 1.4 0 0 1 2.9 0z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.1c0-6.6-5.4-12-12-12S0 5.5 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5h-2.9v8.4C19.6 23.1 24 18.1 24 12.1z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      )
  }
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = getPlatformMeta(platform)
  if (!meta) return null

  const colors: Record<Platform, string> = {
    youtube: 'bg-red-500/15 text-red-400 border-red-500/30',
    instagram: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    facebook: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    tiktok: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    unknown: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${colors[platform]}`}>
      <PlatformIcon platform={platform} className="w-3.5 h-3.5" />
      {meta.name}
    </span>
  )
}
