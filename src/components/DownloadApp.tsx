import { useCallback, useState } from 'react'
import type { AppStatus, DownloadFormat, VideoInfo, VideoQuality } from '../types'
import { detectPlatform, formatDuration, isValidUrl, PLATFORMS } from '../utils/platforms'
import { PlatformBadge, PlatformIcon } from './PlatformIcon'

const QUALITY_OPTIONS: { value: VideoQuality; label: string }[] = [
  { value: 'best', label: 'Best quality' },
  { value: '1080', label: '1080p' },
  { value: '720', label: '720p' },
  { value: '480', label: '480p' },
]

export function DownloadApp() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState<DownloadFormat>('mp4')
  const [quality, setQuality] = useState<VideoQuality>('best')
  const [status, setStatus] = useState<AppStatus>('idle')
  const [error, setError] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)

  const detectedPlatform = url.trim() ? detectPlatform(url) : 'unknown'

  const fetchInfo = useCallback(async () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Paste a video link to get started.')
      setStatus('error')
      return
    }
    if (!isValidUrl(trimmed)) {
      setError('That doesn\'t look like a valid URL.')
      setStatus('error')
      return
    }
    if (detectPlatform(trimmed) === 'unknown') {
      setError('Unsupported link. Use YouTube, Instagram, Facebook, or TikTok.')
      setStatus('error')
      return
    }

    setStatus('fetching')
    setError('')
    setVideoInfo(null)

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not fetch video info.')
      setVideoInfo(data)
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }, [url])

  const handleDownload = async () => {
    if (!videoInfo) return

    setStatus('downloading')
    setError('')

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoInfo.url,
          format,
          quality: format === 'mp4' ? quality : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Download failed.')
      }

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="(.+)"/)
      const filename = match?.[1] ?? `download.${format}`

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)

      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.')
      setStatus('error')
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      setError('')
      setStatus('idle')
    } catch {
      setError('Could not read clipboard. Paste manually instead.')
      setStatus('error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchInfo()
  }

  const isLoading = status === 'fetching' || status === 'downloading'

  return (
    <div className="min-h-svh bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
        <div className="absolute bottom-0 -left-20 h-[300px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
            </svg>
            Free media downloader
          </div>
          <h1 className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Save videos &amp; audio
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-slate-400">
            Paste a link from YouTube, Instagram Reels, Facebook, or TikTok — then download as video or audio.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl shadow-violet-950/50 backdrop-blur-xl sm:p-8">
          <label htmlFor="url-input" className="mb-2 block text-sm font-medium text-slate-300">
            Video URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                onKeyDown={handleKeyDown}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 pr-12 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                disabled={isLoading}
              />
              {detectedPlatform !== 'unknown' && url.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <PlatformIcon platform={detectedPlatform} />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePaste}
                disabled={isLoading}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-50"
              >
                Paste
              </button>
              <button
                type="button"
                onClick={fetchInfo}
                disabled={isLoading || !url.trim()}
                className="flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
              >
                {status === 'fetching' ? (
                  <>
                    <Spinner />
                    Fetching
                  </>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </div>
          )}

          {videoInfo && (
            <div className="mt-6">
              <div className="flex flex-col gap-4 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 sm:flex-row">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt=""
                    className="h-28 w-full rounded-lg object-cover sm:h-24 sm:w-40"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-2">
                    <PlatformBadge platform={videoInfo.platform} />
                  </div>
                  <h2 className="truncate text-base font-semibold text-white">{videoInfo.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {videoInfo.uploader} · {formatDuration(videoInfo.duration)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-slate-300">Download format</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormatCard
                    active={format === 'mp4'}
                    onClick={() => setFormat('mp4')}
                    icon={
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    }
                    title="Video"
                    description="Full video with audio"
                  />
                  <FormatCard
                    active={format === 'mp3'}
                    onClick={() => setFormat('mp3')}
                    icon={
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467L9 12.75V8.25m0 0L4.5 5.25M9 8.25l10.5-3" />
                      </svg>
                    }
                    title="Audio"
                    description="Audio track only"
                  />
                </div>
              </div>

              {format === 'mp4' && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-slate-300">Video quality</p>
                  <div className="flex flex-wrap gap-2">
                    {QUALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setQuality(opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                          quality === opt.value
                            ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleDownload}
                disabled={status === 'downloading'}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-base font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-60"
              >
                {status === 'downloading' ? (
                  <>
                    <Spinner />
                    Downloading…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 7.5 12 3.75m0 0L16.5 7.5M12 3.75v12" />
                    </svg>
                    Download {format === 'mp4' ? 'Video' : 'Audio'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <section className="mt-10">
          <h3 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-slate-500">
            Supported platforms
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PLATFORMS.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-5 text-center"
              >
                <div className="text-slate-300">
                  <PlatformIcon platform={p.id} className="h-7 w-7" />
                </div>
                <span className="text-sm font-medium text-slate-300">{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800/60 bg-slate-900/30 p-6">
          <h3 className="mb-5 text-center text-lg font-semibold text-slate-200">How it works</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { step: '1', title: 'Paste link', desc: 'Copy any video URL from a supported platform.' },
              { step: '2', title: 'Choose format', desc: 'Pick Video or Audio only.' },
              { step: '3', title: 'Download', desc: 'Hit download and save the file to your device.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
                  {item.step}
                </div>
                <h4 className="font-medium text-slate-200">{item.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 space-y-2 text-center text-xs text-slate-600">
          <p>
            Powered by{' '}
            <span className="font-medium text-slate-400">OEUN SOCHETRA</span>
          </p>
          <p>For personal use only. Respect content creators and platform terms of service.</p>
        </footer>
      </div>
    </div>
  )
}

function FormatCard({
  active,
  onClick,
  icon,
  title,
  description,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
        active
          ? 'border-violet-500 bg-violet-500/15 ring-1 ring-violet-500/40'
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
      }`}
    >
      <div className={active ? 'text-violet-300' : 'text-slate-400'}>{icon}</div>
      <div>
        <p className={`font-semibold ${active ? 'text-white' : 'text-slate-200'}`}>{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </button>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
