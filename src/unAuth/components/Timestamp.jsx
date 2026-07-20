import { useState, useEffect } from 'react'
import { Link, ClockCounterClockwise, Scissors } from 'phosphor-react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../firebase'
import './Timestamp.css'

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

const HISTORY_KEY = 'timestampHistory'

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const generateTimestamps = httpsCallable(functions, 'generateTimestamps')

function parseHistory(raw) {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) =>
        item &&
        typeof item.url === 'string' &&
        typeof item.title === 'string' &&
        typeof item.thumbnail === 'string' &&
        Array.isArray(item.timestampsList) &&
        typeof item.timestampsString === 'string'
    )
  } catch {
    return []
  }
}

const Timestamp = () => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [videoData, setVideoData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timestampsList, setTimestampsList] = useState([])
  const [timestampsString, setTimestampsString] = useState('')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState(() => parseHistory(localStorage.getItem(HISTORY_KEY)))

  const isUrlInvalid = url.length > 0 && !YOUTUBE_URL_REGEX.test(url)

  const handleChange = (e) => {
    setUrl(e.target.value)
    setError('')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(timestampsString)
    setCopied(true)
  }

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const saveHistory = (newHistory) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    setHistory(newHistory)
  }

  const addToHistory = (item) => {
    const filtered = history.filter((h) => h.url !== item.url)
    const updated = [item, ...filtered].slice(0, 20)
    saveHistory(updated)
  }

  const clearHistory = () => {
    saveHistory([])
  }

  const loadFromHistory = (item) => {
    setUrl(item.url)
    setVideoData({ title: item.title, thumbnail: item.thumbnail })
    setTimestampsList(item.timestampsList)
    setTimestampsString(item.timestampsString)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setVideoData(null)
    setTimestampsList([])
    setTimestampsString('')

    if (!YOUTUBE_API_KEY) {
      console.error('VITE_YOUTUBE_API_KEY is missing. Please configure your .env file.')
      setError('API key is not configured. Contact the administrator.')
      return
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      setError('Could not extract video ID from the URL')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
      )
      const data = await res.json()

      if (data.error) {
        console.error('YouTube API error:', data.error)
        setError(`YouTube API error: ${data.error.message}`)
        setLoading(false)
        return
      }

      if (!data.items || data.items.length === 0) {
        setError('Video not found. Please check the URL.')
        setLoading(false)
        return
      }

      const snippet = data.items[0].snippet
      const thumbnails = snippet.thumbnails
      const thumbnail =
        thumbnails.maxres?.url ||
        thumbnails.high?.url ||
        thumbnails.medium?.url ||
        thumbnails.default?.url

      setVideoData({
        title: snippet.title,
        thumbnail,
      })

      try {
        const result = await generateTimestamps({ videoId, url })

        const list = result.data?.timestamps_list
        const str = result.data?.timestamps_string
        if (!Array.isArray(list) || typeof str !== 'string') {
          setError('Invalid response from server.')
          setLoading(false)
          return
        }

        setTimestampsList(list)
        setTimestampsString(str)
        addToHistory({
          url,
          title: snippet.title,
          thumbnail,
          timestampsList: list,
          timestampsString: str,
        })
      } catch (fnErr) {
        console.error('Cloud Function error:', fnErr)
        setError(fnErr.message || 'Failed to generate timestamps. Please try again.')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to fetch video data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="timestamp-container">
      <h2>AI YouTube Timestamps</h2>

      <p className="timestamp-subtitle">
        Generates timestamps for a given YouTube video using the deepseek-v3 model.
        This software was built using the AI — watch tutorials how to <a href="#">here</a>.
      </p>

      <form className="input-group" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <Link size={18} className="input-icon" />
          <input
            type="text"
            id="youtube-url"
            name="youtube-url"
            placeholder="Enter YouTube video URL"
            className="url-input"
            value={url}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className={`generate-button ${isUrlInvalid ? 'generate-button--invalid' : ''}`}
          disabled={loading || isUrlInvalid}
        >
          {loading ? (
            <>
              <Scissors size={16} className="icon-scissors-animating" />
              {' '}Generating...
            </>
          ) : isUrlInvalid ? 'Invalid Youtube URL' : 'Generate'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      {videoData && (
        <div className="video-result">
          <img
            className="video-thumbnail"
            src={videoData.thumbnail}
            alt={videoData.title}
          />
          <h3 className="video-title">{videoData.title}</h3>
        </div>
      )}

      {timestampsList.length > 0 && (
        <div className="timestamps-result">
          <h4 className="timestamps-heading">Generated Timestamps</h4>

          <ul className="timestamps-list">
            {timestampsList.map((ts, i) => {
              if (typeof ts !== 'string') return null
              const dashIndex = ts.indexOf(' - ')
              const time = dashIndex !== -1 ? ts.slice(0, dashIndex) : ''
              const desc = dashIndex !== -1 ? ts.slice(dashIndex + 3) : ts
              return (
                <li key={i} className="timestamp-item">
                  <span className="timestamp-time">{time}</span>
                  <span className="timestamp-desc">{desc}</span>
                </li>
              )
            })}
          </ul>

          <div className="copy-section">
            <textarea
              className="timestamps-textarea"
              readOnly
              value={timestampsString}
              rows={timestampsList.length}
            />
            <button
              type="button"
              className="copy-button"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-panel">
          <div className="history-header">
            <ClockCounterClockwise size={18} className="history-icon" />
            <h4 className="history-title">History</h4>
            <button
              type="button"
              className="history-clear"
              onClick={clearHistory}
            >
              Clear
            </button>
          </div>
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.url} className="history-item">
                <img
                  className="history-thumbnail"
                  src={item.thumbnail}
                  alt={item.title}
                />
                <span className="history-item-title">{item.title}</span>
                <button
                  type="button"
                  className="history-view-btn"
                  onClick={() => loadFromHistory(item)}
                >
                  View Timestamps
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Timestamp
