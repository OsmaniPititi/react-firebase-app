import React from 'react'
import { UploadSimple, Chats, VideoCamera, Code, ArrowRight } from 'phosphor-react'
import './Bumpups.css'

const cardData = [
  { id: 1, badge: 'Local Videos', type: 'dark-bg', icon: <UploadSimple size={60} weight="light" /> },
  { id: 2, badge: 'Video Chat', type: 'black-bg', icon: <Chats size={60} weight="light" /> },
  { id: 3, badge: 'AI YouTube', type: 'black-bg', icon: <VideoCamera size={60} weight="light" /> },
  { id: 4, badge: 'API', type: 'dark-bg', icon: <Code size={60} weight="light" /> },
]

const Bumpups = () => {
  return (
    <section className="bumpups">
      <div className="bompops-container">
        <h2 className="bompops-title">Do more with MyApp</h2>
        <p className="bompops-subtitle">
          Process your videos to deliver insights across all industries. Ask questions, request summaries, analyse and more with AI
        </p>

        <div className="bompops-grid">
          {cardData.map((card) => (
            <div key={card.id} className={"bompops-card " + card.type}>
              <div className="card-left">
                <span className="card-badge">{card.badge}</span>
                <button className="card-btn">
                  <ArrowRight size={16} weight="bold" /> Learn more
                </button>
              </div>
              <div className="card-right">
                {card.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Bumpups
