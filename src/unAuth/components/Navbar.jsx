import React from 'react'
import { MonitorPlay } from 'phosphor-react'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <MonitorPlay className="navbar-logo-icon" size={28} />
        MyApp
      </div>
      <ul className="navbar-links">
        <li><button className="nav-cta-btn">AI Video ChatBot →</button></li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </nav>
  )
}

export default Navbar
