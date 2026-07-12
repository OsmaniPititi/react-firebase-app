import { MonitorPlay } from 'phosphor-react'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <MonitorPlay className="navbar-logo-icon" size={28} />
        MyApp
      </div>
      <button className="nav-cta-btn">AI Video ChatBot →</button>
    </nav>
  )
}

export default Navbar
