import { signOut } from 'firebase/auth'
import { auth } from './firebase.js'

export default function Header() {
  return (
    <header className="top-bar">
      <span className="top-bar-title">🐾 Pablo's Tracker</span>
      <button type="button" className="signout-btn" onClick={() => signOut(auth)}>
        Sign out
      </button>
    </header>
  )
}
