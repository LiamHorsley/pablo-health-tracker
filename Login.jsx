import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from './firebase.js'
import pabloPhoto from './pablo.jpg'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src={pabloPhoto} alt="Pablo" className="login-logo" />
        <h1>Pablo's Tracker</h1>
        <div className="login-tabs">
          <button
            type="button"
            aria-label="Switch to sign in"
            className={mode === 'signin' ? 'login-tab active' : 'login-tab'}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            aria-label="Switch to create account"
            className={mode === 'signup' ? 'login-tab active' : 'login-tab'}
            onClick={() => setMode('signup')}
          >
            Create account
          </button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function friendlyError(err) {
  const code = err?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Email or password is incorrect.'
  }
  if (code.includes('email-already-in-use')) {
    return 'An account already exists for that email — try signing in instead.'
  }
  if (code.includes('weak-password')) {
    return 'Password should be at least 6 characters.'
  }
  if (code.includes('invalid-email')) {
    return 'That email address looks invalid.'
  }
  return 'Something went wrong. Please try again.'
}
