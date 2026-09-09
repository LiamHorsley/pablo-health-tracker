import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase.js'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = still checking

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return unsubscribe
  }, [])

  return { user, loading: user === undefined }
}
