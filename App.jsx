import { useState } from 'react'
import { useAuth } from './useAuth.js'
import Login from './Login.jsx'
import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'
import TodayView from './TodayView.jsx'
import FoodsView from './FoodsView.jsx'
import TrendsView from './TrendsView.jsx'

export default function App() {
  const { user, loading } = useAuth()
  const [tab, setTab] = useState('today')

  if (loading) {
    return <div className="full-screen-center">Loading…</div>
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        {tab === 'today' && <TodayView uid={user.uid} onGoToFoods={() => setTab('foods')} />}
        {tab === 'foods' && <FoodsView uid={user.uid} />}
        {tab === 'trends' && <TrendsView uid={user.uid} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
