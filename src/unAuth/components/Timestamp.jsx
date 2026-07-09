import React from 'react'
import { Link } from 'phosphor-react'
import './Timestamp.css'

const Timestamp = () => {
  return (
    <div className="timestamp-container">
      {/* 1. Section heading */}
      <h2>AI YouTube Timestamps</h2>

      {/* 2. Custom description with the actual DeepSeek model */}
      <p className="timestamp-subtitle">
        Generates timestamps for a given YouTube video using the deepseek-v3 model.
        This software was built using the AI — watch tutorials how to <a href="#">here</a>.
      </p>

      {/* 3. Input group for the URL and the button */}
      <div className="input-group">
        <div className="input-wrapper">
          {/* Text box to paste the YouTube link */}
          <Link size={18} className="input-icon" />
          <input
            type="text"
            placeholder="Enter YouTube video URL"
            className="url-input"
          />
        </div>

        {/* Button to process and generate the timestamps */}
        <button className="generate-button">
          Generate
        </button>
      </div>
    </div>
  )
}

export default Timestamp
