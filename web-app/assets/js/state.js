const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Bump this key whenever the default wardrobe changes — clears old cached data
const STORAGE_KEY = "curato_wardrobe_v2";

const DEFAULT_WARDROBE = [
  {
    id: createId(),
    name: "Pleated Wide Pants",
    brand: "Uniqlo", color: "Black", colorHex: "#111111",
    category: "Bottoms", rating: 9.5,
    photo: "/wardrobe-photos/uniqlo%20pleated%20wide%20pants%20-%20black.png",
    description: "Your single best bottom. Black pleated wide leg elevates any basic top immediately. Dress up with the chunky loafer or down with the Sambas. Never looks like an accident."
  },
  {
    id: createId(),
    name: "Barrel Leg Trousers",
    brand: "Uniqlo", color: "Olive", colorHex: "#4d7c0f",
    category: "Bottoms", rating: 9,
    photo: "/wardrobe-photos/uniqlo%20barrel%20leg%20trousers%20-%20olive.png",
    description: "Olive is the surprise performer in your wardrobe. It plays equally well with cream, black, white, and navy. The barrel silhouette balances a fitted top perfectly."
  },
  {
    id: createId(),
    name: "Wide Fit Jeans",
    brand: "Uniqlo", color: "Black", colorHex: "#1a1a1a",
    category: "Bottoms", rating: 8,
    photo: "/wardrobe-photos/uniqlo%20wide%20fit%20jeans%20-%20black.png",
    description: "The everyday workhorse. Black wide-leg denim reads more intentional than dark wash. Reliable across all your footwear — the Sambas and Club C both work well here."
  },
  {
    id: createId(),
    name: "Oxford Boxy Cropped Shirt",
    brand: "Uniqlo", color: "Light Blue", colorHex: "#93c5fd",
    category: "Tops", rating: 9,
    photo: "/wardrobe-photos/uniqlo%20oxford%20boxy%20cropped%20shirt.png",
    description: "The cropped boxy cut hits the balance point between oversized and fitted. Half-tuck into the pleated wide pants — the proportion does all the work."
  },
  {
    id: createId(),
    name: "Waffle Crew Neck",
    brand: "Uniqlo", color: "Cream", colorHex: "#e8e0d0",
    category: "Tops", rating: 8.5,
    photo: "/wardrobe-photos/uniqlo%20waffle%20crew%20neck.png",
    description: "The texture play in an otherwise minimal wardrobe. The waffle knit adds visual interest without pattern — wear with the olive trousers for an easy tonal palette."
  },
  {
    id: createId(),
    name: "Basic Black Tee",
    brand: "", color: "Black", colorHex: "#111111",
    category: "Tops", rating: 8,
    photo: "/wardrobe-photos/basic%20black%20tee.png",
    description: "The true foundation layer. Slightly oversized through the shoulder reads more editorial than a fitted crew. Tuck one side for shape under the barrel leg trousers."
  },
  {
    id: createId(),
    name: "Basic White Tee",
    brand: "", color: "White", colorHex: "#f5f5f5",
    category: "Tops", rating: 8,
    photo: "/wardrobe-photos/basic%20white%20tee.png",
    description: "The cleanest canvas you own. Half-tuck into wide trousers, wear under an open shirt, or style alone with the Sambas. Almost always the right call."
  },
  {
    id: createId(),
    name: "Utility Jacket",
    brand: "Uniqlo", color: "Olive", colorHex: "#4d7c0f",
    category: "Outerwear", rating: 8.5,
    photo: "/wardrobe-photos/uniqlo%20utility%20jacket.png",
    description: "The functional layer that doubles as a statement. Wear open over a tee or closed over knitwear. The utility pockets keep it grounded — pairs especially well with black and white basics."
  },
  {
    id: createId(),
    name: "Italy Windbreaker",
    brand: "Adidas", color: "Blue", colorHex: "#003da5",
    category: "Outerwear", rating: 8.5,
    photo: "/wardrobe-photos/adidas%20italy%20windbreaker.png",
    description: "The sporting archive at its best. Layer over a basic tee with barrel-leg trousers for a continental athletic look. The Italian colourway keeps it from reading too casual."
  },
  {
    id: createId(),
    name: "2024 Vintage Milan Kit",
    brand: "AC Milan", color: "Red and Black", colorHex: "#cc0000",
    category: "Statement", rating: 9,
    photo: "/wardrobe-photos/2024%20vintage%20milan%20kit.png",
    description: "A conversation-starting statement piece. Worn casually with wide trousers or baggy denim it reads as effortlessly cool rather than costume. The bolder the piece, the simpler the rest."
  },
  {
    id: createId(),
    name: "Sambas",
    brand: "Adidas", color: "Black", colorHex: "#111111",
    category: "Footwear", rating: 9.5,
    photo: "/wardrobe-photos/adidas%20sambas%20-%20black.png",
    description: "The most versatile trainer in rotation. Black on black keeps it sleek — works under tailoring, wide denim, or any casual outfit without overthinking."
  },
  {
    id: createId(),
    name: "Club C",
    brand: "Reebok", color: "White", colorHex: "#f0ede8",
    category: "Footwear", rating: 8.5,
    photo: "/wardrobe-photos/reeok%20club%20c.png",
    description: "The clean alternative to the Samba. The low-profile white court shoe has a quieter energy — great with navy, olive, or black bottoms when you want the shoes to disappear."
  },
  {
    id: createId(),
    name: "Chunky Loafer",
    brand: "", color: "Black", colorHex: "#111111",
    category: "Footwear", rating: 9,
    photo: "/wardrobe-photos/chunky%20loafer%20-%20black.png",
    description: "The silhouette upgrade. The chunky sole adds visual weight that balances beautifully against wide-leg trousers. Dressier than trainers but never stuffy."
  },
  {
    id: createId(),
    name: "Tassel Loafer",
    brand: "", color: "Tan", colorHex: "#c4a882",
    category: "Footwear", rating: 8.5,
    photo: "/wardrobe-photos/tassle%20loafer.png",
    description: "The heritage dressy option. The tassel detail lifts a simple outfit into something more deliberate. Wear with the pleated wide pants for a continental European look."
  },
  {
    id: createId(),
    name: "Tank Watch",
    brand: "Seiko", color: "Silver", colorHex: "#9ca3af",
    category: "Accessories", rating: 9,
    photo: "/wardrobe-photos/seiko%20tank.png",
    description: "The most considered accessory in your wardrobe. A slim rectangular case reads with quiet authority — equally at home with a cropped shirt or rolled sleeves on a casual day."
  },
  {
    id: createId(),
    name: "Gold Hoop Earrings",
    brand: "", color: "Gold", colorHex: "#ca8a04",
    category: "Accessories", rating: 9,
    photo: "/wardrobe-photos/gold%20hoop%20earrings.png",
    description: "The instant polish piece. A medium hoop pulls any outfit from casual to considered without effort. Works equally with a basic tee or a structured shirt."
  }
];

function loadWardrobe() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // corrupted storage — fall through to defaults
  }
  return DEFAULT_WARDROBE;
}

export function saveWardrobe(wardrobe) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wardrobe));
  } catch {
    // storage full or unavailable — silently skip
  }
}

const REFINE_KEY = "curato_refine_list_v1";

function loadRefineList() {
  try {
    const saved = localStorage.getItem(REFINE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // corrupted — fall through
  }
  return [];
}

export function saveRefineList(list) {
  try {
    localStorage.setItem(REFINE_KEY, JSON.stringify(list));
  } catch {
    // storage full or unavailable — silently skip
  }
}

const SAVED_LOOKS_KEY = "curato_saved_looks_v1";

function loadSavedLooks() {
  try {
    const saved = localStorage.getItem(SAVED_LOOKS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // corrupted — fall through
  }
  return [];
}

export function saveSavedLooks(looks) {
  try {
    localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(looks));
  } catch {
    // storage full or unavailable — silently skip
  }
}

const PROFILE_KEY = "curato_profile_v1";

const DEFAULT_PROFILE = {
  name: "Marco",
  age: "34",
  location: "Toronto",
  build: "Slim athletic",
  height: "5'8\"",
  weight: "138 lbs",
  skin: "Light olive",
  hair: "Dark curly",
  notes: "Italian-Canadian runner"
};

function loadProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { ...DEFAULT_PROFILE };
}

export function saveProfile(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
}

export const state = {
  wardrobe: loadWardrobe(),
  generated: [],
  savedLooks: loadSavedLooks(),
  shoppingList: [],
  refineList: loadRefineList(),
  profile: loadProfile(),
  styleBoards: [
    {
      id: createId(),
      title: "Everyday Essentials",
      tags: ["all black", "blazer", "stripes", "summer", "oxford"],
      images: [
        "/style-board-photos/everyday-essentials-1.jpg",
        "/style-board-photos/everyday-essentials-2.jpg",
        "/style-board-photos/everyday-essentials-3.jpg",
        "/style-board-photos/everyday-essentials-4.jpg",
        "/style-board-photos/everyday-essentials-5.jpg"
      ]
    },
    {
      id: createId(),
      title: "Weekend Minimal",
      tags: ["denim", "knitwear", "relaxed"],
      images: [
        "/style-board-photos/weekend-minimal-1.jpg",
        "/style-board-photos/weekend-minimal-2.jpg",
        "/style-board-photos/weekend-minimal-3.jpg"
      ]
    }
  ],
  activeFilter: "all",
  anchoredItem: null
};
