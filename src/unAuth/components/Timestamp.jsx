import React from 'react'
import './Timestamp.css'

const Timestamp = () => {
  const now = new Date().toLocaleString()

  return (
    <div className="timestamp">
      <p>Current timestamp: {now}</p>
    </div>
  )
}

export default Timestamp
