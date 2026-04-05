// DecoLayer.jsx
// ─────────────────────────────────────────────
// Renders placed deco/pets as draggable sprites.
// Supports: emoji OR custom image paths, animation class picker,
//           pet name badge, hunger indicator, feed + remove controls.
// ─────────────────────────────────────────────

import { useState, useRef, useEffect } from "react"
import { DECO, PETS, PET_FOOD, isImagePath } from "./StoreCatalogue"
import PetNameModal from "./PetNameModal"
import "./DecoLayer.css"

const ALL_PLACEABLE = [...DECO, ...PETS]

// Renders the icon — emoji text OR <img> for custom drawings
function ItemIcon({ icon, name }) {
  if (isImagePath(icon)) {
    return <img src={icon} alt={name} className="deco-img" draggable={false} />
  }
  return <span className="deco-emoji">{icon}</span>
}

export default function DecoLayer({ storeState }) {
  const {
    active, updateItemPos, removeItem,
    namePet, getPetName,
    feedPet, getFoodQuantity, getPetHearts, isPetHungry,
    getAnimation, setAnimation,
  } = storeState

  const [namingPet,    setNamingPet]    = useState(null)
  const [animPickerFor, setAnimPickerFor] = useState(null) // itemId whose picker is open
  const [foodPickerFor, setFoodPickerFor] = useState(null) // petId whose food picker is open
  const namedThisSession = useRef(new Set())
  const dragging = useRef({})

  const handleMouseDown = (e, itemId, pos) => {
    dragging.current[itemId] = {
      startMx: e.clientX, startMy: e.clientY,
      startX: pos.x, startY: pos.y,
    }
    e.preventDefault()
  }

  useEffect(() => {
    const SPRITE = 60
    const onMove = (e) => {
      Object.entries(dragging.current).forEach(([id, d]) => {
        const x = Math.max(0, Math.min(d.startX + e.clientX - d.startMx, window.innerWidth  - SPRITE))
        const y = Math.max(0, Math.min(d.startY + e.clientY - d.startMy, window.innerHeight - SPRITE))
        updateItemPos(id, { x, y })
      })
    }
    const onUp = () => { dragging.current = {} }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup",   onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup",   onUp)
    }
  }, [updateItemPos])

  // Show naming modal first time a pet is placed
  useEffect(() => {
    PETS.forEach(pet => {
      if (active[pet.id] && !getPetName(pet.id) && !namedThisSession.current.has(pet.id)) {
        namedThisSession.current.add(pet.id)
        setNamingPet(pet)
      }
    })
  }, [active])

  const placedItems = ALL_PLACEABLE.filter(item => active[item.id])
  const isPet = (id) => id.startsWith("pet_")

  return (
    <>
      {placedItems.map(item => {
        const pos       = active[item.id]
        const name      = isPet(item.id) ? getPetName(item.id) : null
        const hungry    = isPet(item.id) && isPetHungry(item.id)
        const hearts    = isPet(item.id) ? getPetHearts(item.id) : 5
        const currentAnim = getAnimation(item.id)
        // Find the CSS class for the chosen animation
        const animCssClass = item.animations?.find(a => a.id === currentAnim)?.cssClass ?? ""

        return (
          <div
            key={item.id}
            className={`deco-sprite ${animCssClass}`}
            style={{ left: pos.x, top: pos.y }}
            onMouseDown={e => handleMouseDown(e, item.id, pos)}
          >
            {/* Pet hearts display */}
            {isPet(item.id) && (
              <div className="deco-hearts">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`deco-heart ${i < getPetHearts(item.id) ? "deco-heart-full" : "deco-heart-empty"}`}>
                    ♥
                  </span>
                ))}
              </div>
            )}

            <ItemIcon icon={item.icon} name={item.name} />

            {/* Pet name */}
            {name && <span className="deco-name">{name}</span>}

            {/* Hover controls */}
            <div className="deco-controls">
              {/* Feed button — opens food picker */}
              {isPet(item.id) && (
                <button
                  className="deco-ctrl-btn"
                  title="feed"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFoodPickerFor(prev => prev === item.id ? null : item.id)
                    setAnimPickerFor(null) // close anim picker if open
                  }}
                >
                  🍖
                </button>
              )}

              {/* Animation picker — only for items that have animation options */}
              {item.animations?.length > 0 && (
                <button
                  className="deco-ctrl-btn"
                  title="animation"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAnimPickerFor(prev => prev === item.id ? null : item.id)
                  }}
                >
                  ✨
                </button>
              )}

              {/* Remove button */}
              <button
                className="deco-ctrl-btn deco-remove"
                title="remove"
                onClick={() => removeItem(item.id)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>delete</span>
              </button>
            </div>

            {/* Food picker dropdown */}
            {foodPickerFor === item.id && (
              <div className="deco-food-picker" onClick={e => e.stopPropagation()}>
                <p className="deco-food-title">feed {getPetName(item.id) || item.name}</p>
                {PET_FOOD.map(food => {
                  const qty = getFoodQuantity(food.id)
                  return (
                    <button
                      key={food.id}
                      className={`deco-food-option ${qty === 0 ? "deco-food-empty" : ""}`}
                      onClick={() => {
                        if (qty > 0) { feedPet(item.id, food.id); setFoodPickerFor(null) }
                      }}
                      disabled={qty === 0}
                    >
                      <span className="deco-food-icon">{food.icon}</span>
                      <span className="deco-food-name">{food.name}</span>
                      <span className="deco-food-qty">×{qty}</span>
                    </button>
                  )
                })}
                {PET_FOOD.every(f => getFoodQuantity(f.id) === 0) && (
                  <p className="deco-food-none">no food! buy some in the store 🛒</p>
                )}
              </div>
            )}

            {/* Animation picker dropdown */}
            {animPickerFor === item.id && item.animations?.length > 0 && (
              <div className="deco-anim-picker" onClick={e => e.stopPropagation()}>
                {item.animations.map(anim => (
                  <button
                    key={anim.id}
                    className={`deco-anim-option ${currentAnim === anim.id ? "deco-anim-active" : ""}`}
                    onClick={() => {
                      setAnimation(item.id, anim.id)
                      setAnimPickerFor(null)
                    }}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {namingPet && (
        <PetNameModal
          pet={namingPet}
          onConfirm={(name) => { namePet(namingPet.id, name); setNamingPet(null) }}
          onSkip={() => setNamingPet(null)}
        />
      )}
    </>
  )
}