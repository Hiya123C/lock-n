// Store.jsx
// ─────────────────────────────────────────────
// Tabs: themes | deco | pets | pet food | owned
// Themes only show if unlocked (winter always free).
// Deco/pets show a "Place" / "Remove" toggle when owned.
// ─────────────────────────────────────────────

import { useState } from "react"
import DraggableWindow from "./DraggableWindow"
import { THEMES, DECO, PETS, PET_FOOD, isImagePath } from "./StoreCatalogue"
import "./StoreWindow.css"

const TABS = ["themes", "deco", "pets", "food", "owned"]

export default function Store({
  coins, spendCoins, canAfford, onClose,
  storeState, // full useStore() object passed from LockInView
}) {
  const {
    buyItem, isOwned, owned,
    placeItem, removeItem, isActive,
  } = storeState

  const [tab,       setTab]       = useState("themes")
  const [justBought,setJustBought]= useState(null)

  const handleBuy = (item) => {
    if (isOwned(item.id) || !canAfford(item.price)) return
    spendCoins(item.price)
    buyItem(item.id)
    setJustBought(item.id)
    setTimeout(() => setJustBought(null), 1500)
  }

  // Items to show per tab
  const tabItems = {
    themes: THEMES,
    deco:   DECO,
    pets:   PETS,
    food:   PET_FOOD,
    owned:  [...THEMES, ...DECO, ...PETS, ...PET_FOOD].filter(i => isOwned(i.id)),
  }[tab]

  return (
    <DraggableWindow
      title="Store"
      icon="storefront"
      onClose={onClose}
      defaultPos={{ x: Math.max(0, window.innerWidth - 440), y: 100 }}
      defaultSize={{ w: 400, h: 520 }}
    >
      <div className="store-inner">
        {/* Coin balance */}
        <div className="store-balance">
          <span className="material-symbols-outlined store-coin-icon">copyright</span>
          <span className="store-coin-count">{coins}</span>
          <span className="store-coin-label">coins</span>
        </div>

        {/* Tabs */}
        <div className="store-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`store-tab ${tab === t ? "store-tab-active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="store-grid">
          {tabItems.length === 0 && (
            <p className="store-empty">nothing here yet, start locking in!</p>
          )}
          {tabItems.map(item => {
            const owned_    = isOwned(item.id)
            const active_   = isActive(item.id)
            const affordable= canAfford(item.price)
            const bought_   = justBought === item.id
            const isPlaceable = item.id.startsWith("deco_") || item.id.startsWith("pet_")

            return (
              <div
                key={item.id}
                className={`store-card ${owned_ ? "store-owned" : ""} ${!affordable && !owned_ ? "store-locked" : ""}`}
              >
                {isImagePath(item.icon)
                  ? <img src={item.icon} alt={item.name} className="store-item-img" />
                  : <span className="store-item-icon">{item.icon}</span>
                }
                <span className="store-item-name">{item.name}</span>
                <span className="store-item-desc">{item.description}</span>

                {/* Buy or Place/Remove */}
                {!owned_ ? (
                  <button
                    className={`store-buy-btn ${bought_ ? "store-buy-flash" : ""}`}
                    onClick={() => handleBuy(item)}
                    disabled={!affordable}
                  >
                    {bought_ ? "✓ got it!" : <><span className="material-symbols-outlined" style={{fontSize:'14px',verticalAlign:'middle'}}>copyright</span> {item.price}</>}
                  </button>
                ) : isPlaceable ? (
                  <button
                    className={`store-buy-btn ${active_ ? "store-btn-remove" : "store-btn-place"}`}
                    onClick={() => active_ ? removeItem(item.id) : placeItem(item.id)}
                  >
                    {active_ ? "remove" : "place"}
                  </button>
                ) : (
                  <span className="store-owned-badge">owned ✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </DraggableWindow>
  )
}