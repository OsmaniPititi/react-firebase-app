import { useState } from 'react'
import { Link } from 'phosphor-react'
import './Timestamp.css'

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

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

const Timestamp = () => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [videoData, setVideoData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setUrl(e.target.value)
    setError('')
    setVideoData(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setVideoData(null)

    if (!YOUTUBE_URL_REGEX.test(url)) {
      setError('Please enter a valid YouTube URL')
      return
    }
    setError('')

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
            placeholder="Enter YouTube video URL"
            className="url-input"
            value={url}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="generate-button" disabled={loading}>
          {loading ? 'Loading...' : 'Generate'}
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
    </div>
  )
}

export default Timestamp
