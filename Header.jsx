import { signOut } from 'firebase/auth'
import { auth } from './firebase.js'
import pabloPhoto from './pablo.jpg'

export default function Header() {
  return (
    <header className="top-bar">
      <span className="top-bar-title">
        <img src={pabloPhoto} alt="" className="header-logo" />
        Pablo's Tracker
      </span>
      <button type="button" className="signout-btn" onClick={() => signOut(auth)}>
        Sign out
      </button>
    </header>
  )
}
