import React from 'react'
import Navbar from './components/Navbar'
import Bumpups from './components/Bumpups'
import Timestamp from './components/Timestamp'
import Footer from './components/Footer'
import './LandingPage.css'

const LandinPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-main">
        <div className="landing-hero">
          <h1 className="landing-title">hello landing page</h1>
        </div>
        <Bumpups />
        <Timestamp />
      </main>
      <Footer />
    </div>
  )
}

export default LandinPage
