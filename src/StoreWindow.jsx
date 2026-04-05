// StoreWindow.jsx
import { useState } from "react"
import DraggableWindow from "./DraggableWindow"
import { THEMES, DECO, PETS, PET_FOOD, isImagePath } from "./StoreCatalogue"
import PetInstructions from "./PetInstructions"
import "./StoreWindow.css"

const TABS = ["themes", "deco", "pets", "food", "owned"]

export default function Store({
  coins, spendCoins, canAfford, onClose, storeState,
}) {
  const {
    buyItem, isOwned, owned,
    placeItem, removeItem, isActive,
    getFoodQuantity,
  } = storeState

  const [tab,        setTab]        = useState("themes")
  const [justBought, setJustBought] = useState(null)
  const [showPetInstructions, setShowPetInstructions] = useState(false)

  const handleBuy = (item) => {
    const isFood = item.id.startsWith("food_")
    if (!isFood && isOwned(item.id)) return
    if (!canAfford(item.price)) return
    spendCoins(item.price)
    buyItem(item.id)
    setJustBought(item.id)
    setTimeout(() => setJustBought(null), 1500)
    if (item.id.startsWith("pet_")) {
      setShowPetInstructions(true)
    }
  }


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
        <div className="store-balance">
          <span className="material-symbols-outlined store-coin-icon">copyright</span>
          <span className="store-coin-count">{coins}</span>
          <span className="store-coin-label">coins</span>
        </div>

        <div className="store-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`store-tab ${tab === t ? "store-tab-active" : ""}`}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </div>

        <div className="store-grid">
          {tabItems.length === 0 && (
            <p className="store-empty">nothing here yet, start locking in!</p>
          )}
          {tabItems.map(item => {
            const owned_      = isOwned(item.id)
            const active_     = isActive(item.id)
            const affordable  = canAfford(item.price)
            const bought_     = justBought === item.id
            const isFood      = item.id.startsWith("food_")
            const isPlaceable = item.id.startsWith("deco_") || item.id.startsWith("pet_")
            const qty         = isFood ? getFoodQuantity(item.id) : 0

            return (
              <div
                key={item.id}
                className={`store-card ${owned_ ? "store-owned" : ""} ${!affordable && !owned_ && !isFood ? "store-locked" : ""}`}
              >
                {isImagePath(item.icon)
                  ? <img src={item.icon} alt={item.name} className="store-item-img" />
                  : <span className="store-item-icon">{item.icon}</span>
                }
                <span className="store-item-name">{item.name}</span>
                <span className="store-item-desc">{item.description}</span>

                {/* Food: always show quantity + buy button */}
                {isFood ? (
                  <div className="store-food-row">
                    <span className="store-food-qty">owned: {qty}</span>
                    <button
                      className={`store-buy-btn ${bought_ ? "store-buy-flash" : ""}`}
                      onClick={() => handleBuy(item)}
                      disabled={!affordable}
                    >
                      {bought_ ? "✓ added!" : (
                        <><span className="material-symbols-outlined" style={{fontSize:'14px',verticalAlign:'middle'}}>copyright</span> {item.price}</>
                      )}
                    </button>
                  </div>
                ) : !owned_ ? (
                  <button
                    className={`store-buy-btn ${bought_ ? "store-buy-flash" : ""}`}
                    onClick={() => handleBuy(item)}
                    disabled={!affordable}
                  >
                    {bought_ ? "✓ got it!" : (
                      <><span className="material-symbols-outlined" style={{fontSize:'14px',verticalAlign:'middle'}}>copyright</span> {item.price}</>
                    )}
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
      {showPetInstructions && (
        <PetInstructions onClose={() => setShowPetInstructions(false)} />
      )}
    </DraggableWindow>
  )
}