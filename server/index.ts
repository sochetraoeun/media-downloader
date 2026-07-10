import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import cors from 'cors'
import express from 'express'

const PORT = Number(process.env.PORT) || 3001

const app = express()
app.use(cors())
app.use(express.json())

type Platform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'unknown'

interface VideoInfo {
  title: string
  thumbnail: string
  duration: number
  uploader: string
  platform: Platform
  url: string
}

function detectPlatform(url: string): Platform {
  const lower = url.toLowerCase()
  if (/youtube\.com|youtu\.be/.test(lower)) return 'youtube'
  if (/instagram\.com/.test(lower)) return 'instagram'
  if (/facebook\.com|fb\.watch|fb\.com/.test(lower)) return 'facebook'
  if (/tiktok\.com|vm\.tiktok\.com/.test(lower)) return 'tiktok'
  return 'unknown'
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function runYtDlp(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    proc.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') {
        reject(
          new Error(
            'yt-dlp is not installed. Install it with: brew install yt-dlp',
          ),
        )
      } else {
        reject(err)
      }
    })

    proc.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`))
    })
  })
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120)
}

const VIDEO_FORMAT_MAP: Record<string, string> = {
  best: 'bestvideo[vcodec^=avc1]+bestaudio/bestvideo+bestaudio/best',
  '1080':
    'bestvideo[vcodec^=avc1][height<=1080]+bestaudio/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
  '720':
    'bestvideo[vcodec^=avc1][height<=720]+bestaudio/bestvideo[height<=720]+bestaudio/best[height<=720]/best',
  '480':
    'bestvideo[vcodec^=avc1][height<=480]+bestaudio/bestvideo[height<=480]+bestaudio/best[height<=480]/best',
}

const VIDEO_SORT_MAP: Record<string, string> = {
  best: 'vcodec:h264,res,acodec:aac',
  '1080': 'vcodec:h264,res:1080,acodec:aac',
  '720': 'vcodec:h264,res:720,acodec:aac',
  '480': 'vcodec:h264,res:480,acodec:aac',
}

async function downloadToTempFile(args: string[]): Promise<string> {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'media-dl-'))
  const outputTemplate = path.join(tempDir, 'output.%(ext)s')
  const downloadArgs = [...args, '-o', outputTemplate]

  try {
    await runYtDlp(downloadArgs)
    const files = await readdir(tempDir)
    const outputFile = files.find((file) => file.startsWith('output.'))
    if (!outputFile) {
      await rm(tempDir, { recursive: true, force: true })
      throw new Error('Download completed but no output file was produced.')
    }
    return path.join(tempDir, outputFile)
  } catch (err) {
    await rm(tempDir, { recursive: true, force: true })
    throw err
  }
}

function streamFileToResponse(
  filePath: string,
  res: express.Response,
  contentType: string,
  filename: string,
): void {
  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  const stream = createReadStream(filePath)
  const tempDir = path.dirname(filePath)

  stream.on('error', (err) => {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message })
    } else {
      res.destroy()
    }
    void rm(tempDir, { recursive: true, force: true })
  })

  stream.on('end', () => {
    void rm(tempDir, { recursive: true, force: true })
  })

  res.on('close', () => {
    if (!stream.destroyed) stream.destroy()
  })

  stream.pipe(res)
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/info', async (req, res) => {
  const url = String(req.query.url ?? '')

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Please provide a valid URL.' })
  }

  const platform = detectPlatform(url)
  if (platform === 'unknown') {
    return res.status(400).json({
      error: 'Unsupported platform. Use YouTube, Instagram, Facebook, or TikTok links.',
    })
  }

  try {
    const { stdout } = await runYtDlp([
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      url,
    ])

    const data = JSON.parse(stdout) as {
      title?: string
      thumbnail?: string
      duration?: number
      uploader?: string
      channel?: string
    }

    const info: VideoInfo = {
      title: data.title ?? 'Untitled',
      thumbnail: data.thumbnail ?? '',
      duration: data.duration ?? 0,
      uploader: data.uploader ?? data.channel ?? 'Unknown',
      platform,
      url,
    }

    res.json(info)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch video info.'
    res.status(500).json({ error: message })
  }
})

app.post('/api/download', async (req, res) => {
  const { url, format = 'mp4', quality = 'best' } = req.body as {
    url?: string
    format?: 'mp4' | 'mp3'
    quality?: string
  }

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Please provide a valid URL.' })
  }

  const platform = detectPlatform(url)
  if (platform === 'unknown') {
    return res.status(400).json({ error: 'Unsupported platform.' })
  }

  try {
    const infoArgs = ['--dump-json', '--no-playlist', '--no-warnings', url]
    const { stdout } = await runYtDlp(infoArgs)
    const data = JSON.parse(stdout) as { title?: string }
    const title = sanitizeFilename(data.title ?? 'download')
    const ext = format === 'mp3' ? 'mp3' : 'mp4'
    const filename = `${title}.${ext}`

    const args = ['--no-playlist', '--no-warnings', url]

    if (format === 'mp3') {
      args.unshift('-x', '--audio-format', 'mp3', '--audio-quality', '0')
    } else {
      args.unshift(
        '-f',
        VIDEO_FORMAT_MAP[quality] ?? VIDEO_FORMAT_MAP.best,
        '-S',
        VIDEO_SORT_MAP[quality] ?? VIDEO_SORT_MAP.best,
        '--merge-output-format',
        'mp4',
      )
    }

    const filePath = await downloadToTempFile(args)
    streamFileToResponse(
      filePath,
      res,
      format === 'mp3' ? 'audio/mpeg' : 'video/mp4',
      filename,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Download failed.'
    if (!res.headersSent) res.status(500).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`Media download server running at http://localhost:${PORT}`)
})
