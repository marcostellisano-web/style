const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const state = {
  wardrobe: [
    {
      id: createId(), name: "Navy Slim Chinos", color: "Navy", brand: "H&M",
      category: "Bottoms", rating: 8, photo: "",
      description: "A reliable everyday bottom. The slim cut works with most tops and keeps the silhouette clean without effort."
    },
    {
      id: createId(), name: "White Oxford Shirt", color: "White", brand: "Uniqlo",
      category: "Tops", rating: 8.5, photo: "",
      description: "The foundational layer. Keep it slightly open at the collar and half-tucked for an effortless editorial look."
    },
    {
      id: createId(), name: "Grey Merino Knit", color: "Grey", brand: "COS",
      category: "Tops", rating: 9, photo: "",
      description: "Elevated basics at their best. The fine gauge merino reads luxurious while staying incredibly versatile across all seasons."
    },
    {
      id: createId(), name: "Black Derby Shoes", color: "Black", brand: "Clarks",
      category: "Footwear", rating: 8, photo: "",
      description: "The most versatile formal shoe you can own. Pairs equally well with tailoring or with a relaxed jean for contrast."
    }
  ],
  generated: [],
  savedLooks: [],
  shoppingList: [],
  styleBoards: [
    {
      id: createId(), title: "Quiet Luxury", theme: "neutral layers",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: createId(), title: "Weekend Minimal", theme: "denim, knitwear",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80"
    }
  ],
  activeFilter: "all"
};
