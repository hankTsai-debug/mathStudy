import { foxLevel, POWER_ICONS, solvedIslands } from './adventure'

/** Little Fox, who grows with every level finished and carries a power from every solved island. */
export function Fox({ stars, grow }: { stars: Record<string, number>; grow: boolean }) {
  const level = foxLevel(stars)
  const powers = solvedIslands(stars)
  return (
    <div className="fox">
      <div className={`face${grow ? ' grow' : ''}`} style={{ fontSize: 44 + level }}>
        🦊{powers.length === Object.keys(POWER_ICONS).length && <span className="crown">👑</span>}
      </div>
      <div className="lv">Lv.{level}</div>
      {powers.length > 0 && <div className="powers">{powers.map(id => <span key={id}>{POWER_ICONS[id]}</span>)}</div>}
    </div>
  )
}
