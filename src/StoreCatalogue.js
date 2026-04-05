// STORE_CATALOGUE.js
// ─────────────────────────────────────────────
// HOW TO ADD YOUR OWN IMAGES:
//   1. Put your image files in /public/deco/ or /public/pets/
//      e.g. /public/deco/mycloud.png, /public/pets/mycat.gif
//   2. Change the `icon` field from an emoji string to an image path:
//      icon: "/deco/mycloud.png"
//   3. The renderer checks: if icon starts with "/" → renders <img>
//                           otherwise              → renders emoji text
//
// HOW TO ADD ANIMATIONS (for deco/pets):
//   `animations` is an array of animation options the student can pick.
//   Each entry: { id: "walk", label: "Walking", cssClass: "anim-walk" }
//   The CSS class is applied to the sprite wrapper in DecoLayer.
//   Define the actual @keyframes in DecoLayer.css.
//   Use `animations: []` for items with no animation options.
// ─────────────────────────────────────────────



export const THEMES = [
  { id: "theme_winter",  themeAttr: "winter-theme", name: "Winter",   price: 0,   icon: "❄️", description: "cool aircon" },
  { id: "theme_spring",  themeAttr: "leaf-theme",   name: "Spring",   price: 200, icon: "🌿", description: "touch some grass" },
  { id: "theme_wood",    themeAttr: "wood-theme",   name: "Wood",     price: 200, icon: "🪵", description: "warm earthy tones" },
  { id: "theme_blossom", themeAttr: "cherry-theme", name: "Blossoms", price: 300, icon: "🌸", description: "cherry blossom pink" },
]

export const DECO = [
  {
    id: "deco_plant", name: "Tree", price: 150,
    // ── To use your own image: change icon to "/deco/plant.png" ──
    icon: "/deco/tree.svg",
    description: "lush greenery",
    animations: [], // no animation options for static deco
  },
  // {
  //   id: "deco_lamp", name: "Warm Lamp", price: 150,
  //   icon: "💡",
  //   description: "cosy ambient glow",
  //   animations: [],
  // },
  // {
  //   id: "deco_candle", name: "Candle", price: 100,
  //   icon: "🕯️",
  //   description: "flickering focus vibes",
  //   animations: [
  //     { id: "flicker", label: "Flicker", cssClass: "anim-flicker" },
  //   ],
  // },
  {
    id: "deco_cloud", name: "Cloud", price: 200,
    // ── To use your own cloud drawing: icon: "/deco/cloud.png" ──
    icon: "☁️",
    description: "dreamy overhead cloud",
    animations: [
      { id: "none",  label: "Still",  cssClass: "" },
      { id: "drift", label: "Drifting", cssClass: "anim-drift" },
    ],
  },
]

export const PETS = [
  {
    id: "pet_cat", name: "Cat", price: 500,
    // ── To use your own cat drawing: icon: "/pets/cat.png" ──
    icon: "🐱",
    description: "judges your productivity",
    animations: [
      { id: "idle",  label: "Idle",     cssClass: "" },
      { id: "walk",  label: "Walking",  cssClass: "anim-walk" },
      { id: "sleep", label: "Sleeping", cssClass: "anim-sleep" },
    ],
  },
  // more to come:
  // {
  //   id: "pet_duck", name: "Duck", price: 300,
  //   icon: "🦆",
  //   description: "debug your focus",
  //   animations: [
  //     { id: "idle",  label: "Idle",    cssClass: "" },
  //     { id: "walk",  label: "Waddling", cssClass: "anim-walk" },
  //   ],
  // },
  // {
  //   id: "pet_capybara", name: "Capybara", price: 600,
  //   icon: "🐾",
  //   description: "chill energy only",
  //   animations: [
  //     { id: "idle",  label: "Idle",     cssClass: "" },
  //     { id: "walk",  label: "Roaming",  cssClass: "anim-walk" },
  //     { id: "sleep", label: "Napping",  cssClass: "anim-sleep" },
  //   ],
  // },
  // {
  //   id: "pet_bunny", name: "Bunny", price: 400,
  //   icon: "🐰",
  //   description: "hops between tasks",
  //   animations: [
  //     { id: "idle", label: "Idle",    cssClass: "" },
  //     { id: "hop",  label: "Hopping", cssClass: "anim-hop" },
  //   ],
  // },
]

export const PET_FOOD = [
  { id: "food_cookie", name: "Cookie", price: 50,  icon: "🍪", description: "a sweet treat",      animations: [] },
  { id: "food_carrot", name: "Carrot", price: 30,  icon: "🥕", description: "much crunchy munch", animations: [] },
  { id: "food_fish",   name: "Fish",   price: 40,  icon: "🐟", description: "cats will love this", animations: [] },
]

export const ALL_ITEMS = [...THEMES, ...DECO, ...PETS, ...PET_FOOD]

// Helper: does this icon string refer to a custom image file?
export const isImagePath = (icon) => typeof icon === "string" && icon.startsWith("/")