const TABS = [
  { id: 'today', label: 'Today', icon: '📋' },
  { id: 'foods', label: 'Foods', icon: '🍖' },
  { id: 'trends', label: 'Trends', icon: '📈' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={active === tab.id ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
