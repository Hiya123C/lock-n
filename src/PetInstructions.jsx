// PetInstructions.jsx
import "./PetInstructions.css"

export default function PetInstructions({ onClose }) {
  return (
    <div className="pi-overlay">
      <div className="pi-card">
        <div className="pi-header">
          <span className="pi-emoji">🐱</span>
          <h2 className="pi-title">you got a pet!</h2>
        </div>

        <p className="pi-intro">here's how to keep them happy:</p>

        <div className="pi-steps">
          <div className="pi-step">
            <span className="pi-step-icon">❤️</span>
            <div>
              <strong>5 hearts max</strong>
              <p>your pet starts at 0 hearts, feed them to make them happy.</p>
            </div>
          </div>
          <div className="pi-step">
            <span className="pi-step-icon">⏳</span>
            <div>
              <strong>hearts drain over time</strong>
              <p>they lose 1 heart every 2 hours, check in regularly.</p>
            </div>
          </div>
          <div className="pi-step">
            <span className="pi-step-icon">🍪</span>
            <div>
              <strong>feed them from the store</strong>
              <p>buy food from the store, you can buy more than one.</p>
            </div>
          </div>
          <div className="pi-step">
            <span className="pi-step-icon">💀</span>
            <div>
              <strong>be responsible!</strong>
              <p>they leave and you'll lose 800 coins if they starve for 5 days straight</p>
            </div>
          </div>
        </div>

        <button className="pi-btn" onClick={onClose}>
          got it, i'll take care of them 🐾
        </button>
      </div>
    </div>
  )
}