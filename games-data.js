(function(){
  const categories = [
    { slug: "ai-slots", name: "AI Slots", description: "AI-powered and GPT‑5 enhanced slots." },
    { slug: "emoji-slots", name: "Emoji & Scratchers", description: "Fun emoji slots and scratchers." },
    { slug: "fruit-slots", name: "Fruit Slots", description: "Juicy fruit-themed reels." },
    { slug: "food-slots", name: "Food & Restaurant", description: "Delicious food-themed slots." },
    { slug: "classic-slots", name: "Classic & Razr", description: "Classic professional slots and Razr editions." },
    { slug: "bank-vault", name: "Bank & Vault", description: "Vault and currency-themed experiences." },
    { slug: "emotions", name: "Emotions", description: "Mood and emotion-driven slots." }
  ];

  const games = [
    // AI
    { id: "ai-fortune-reels", title: "AI Fortune Reels", href: "AIFortuneReels/ai-fortune-reels.html", category: "ai-slots", cover: "logo.png", desc: "Professional AI-driven casino slot machine." },
    { id: "claude-casino-slots", title: "Claude's Fortune", href: "ClaudeCasinoSlots/claude-casino-slots.html", category: "ai-slots", cover: "logo.png", desc: "Premium slot with Claude AI flair." },
    { id: "claude-sonnet-slots", title: "Claude 4 Sonnet Slots", href: "ClaudeSonnetSlots/claude-sonnet-slots.html", category: "ai-slots", cover: "logo.png", desc: "AI casino experience themed around Sonnet." },
    { id: "neon-mirage-razr", title: "Neon Mirage Slots — GPT‑5", href: "NeonMirageSlots/NeonMirageSlots-Razr.html", category: "ai-slots", cover: "logo.png", desc: "GPT‑5 edition neon cabinet experience." },
    { id: "neon-crown-royale", title: "Neon Crown Royale — GPT‑5 HIGH", href: "GPT5HighSlots/neon-crown-royale-razr.html", category: "ai-slots", cover: "logo.png", desc: "Premium GPT‑5 HIGH slot for Razr." },
    { id: "markkd-for-fortune", title: "Markk'd for Fortune", href: "MarkkdforFortune/MarkkdforFortune.html", category: "ai-slots", cover: "logo.png", desc: "Crystal Ball AI-powered slots." },

    // Emoji
    { id: "emoji-slots", title: "Emoji Slots", href: "EmojiSlots/emoji-slots.html", category: "emoji-slots", cover: "Cover art/EmojiSlots.png", desc: "Spin emoji reels for prizes." },
    { id: "emoji-scratchers", title: "Emoji Scratchers", href: "EmojiScratchers/emoji-scratchers.html", category: "emoji-slots", cover: "Cover art/EmojiScratchers.png", desc: "Scratch and win with emojis." },

    // Fruit
    { id: "fruit-frenzy", title: "Fruit Frenzy", href: "FruitFrenzy/fruit-frenzy.html", category: "fruit-slots", cover: "logo.png", desc: "Classic fruit-themed fun." },
    { id: "fruit-freezy", title: "10x Fruity Freezy", href: "FruitFrenzy/Markks10xFruitFreezy.html", category: "fruit-slots", cover: "logo.png", desc: "Chill fruity reels with 10x vibes." },
    { id: "fruit-frenzy-razr", title: "Fruit Frenzy — Razr Edition", href: "FruitFrenzy/Markks10xFruitFrenzy-Razr.html", category: "fruit-slots", cover: "logo.png", desc: "Fruit Frenzy optimized for Razr." },

    // Food & Restaurant
    { id: "jbs-pizzeria", title: "JB's Pizzeria", href: "JBsPizzeria/JBsPizzeria.html", category: "food-slots", cover: "logo.png", desc: "Pizza-themed slot experience." },
    { id: "jbs-pizzeria-razr", title: "JB's Pizzeria — Razr", href: "JBsPizzeria/JBsPizzeria-Razr.html", category: "food-slots", cover: "logo.png", desc: "Pizzeria slot tuned for Razr." },
    { id: "mcmarkks-burgers", title: "McMarkk's Burgers", href: "McMarkksBurgers/McMarkksBurgers.html", category: "food-slots", cover: "logo.png", desc: "Fast food slot classic." },
    { id: "mcmarkks-burgers-2", title: "McMarkk's Burgers 2", href: "McMarkksBurgers/McMarkksBurgers2.html", category: "food-slots", cover: "logo.png", desc: "Restaurant edition of the burger slot." },
    { id: "mcmarkks-burgers-2-razr", title: "McMarkk's Burgers 2 — Razr", href: "McMarkksBurgers/McMarkksBurgers2-Razr.html", category: "food-slots", cover: "logo.png", desc: "Burgers sequel optimized for Razr." },

    // Classic & Razr
    { id: "markks-royal-razr", title: "Markk's Royal Slots — Razr", href: "MarkksSlotMachine/markks-slot-machine-razr.html", category: "classic-slots", cover: "logo.png", desc: "Professional slot for Razr." },
    { id: "motorazr-pro", title: "Professional Slots — Razr 2024", href: "MotoRazrProfessionalSlots/motorazr-professional-slots.html", category: "classic-slots", cover: "logo.png", desc: "Casino-grade slot for Razr 2024." },
    { id: "motorazr-pro-enhanced", title: "Professional Slots — Enhanced", href: "MotoRazrProfessionalSlots/motorazr-professional-slots-enhanced.html", category: "classic-slots", cover: "logo.png", desc: "Enhanced edition of pro slots." },
    { id: "motorazr-2024-pwa", title: "Motorazr 2024 Slot Machine", href: "MotoRazr2024Slot/index.html", category: "classic-slots", cover: "logo.png", desc: "PWA slot for Razr 2024." },

    // Bank & Vault
    { id: "markkdbills-vault", title: "Vault Slots - Markk'dBills", href: "MarkkdBills/markkdbills.html", category: "bank-vault", cover: "logo.png", desc: "Vault-themed slot experience." },
    { id: "markkdbills-razr", title: "Vault Slots — Razr", href: "MarkkdBills/razr-slot-machine.html", category: "bank-vault", cover: "logo.png", desc: "Vault-themed slot tuned for Razr." },
    { id: "annex", title: "The Annex", href: "Annex/annex.html", category: "bank-vault", cover: "Cover art/Annex.png", desc: "Financial services & currency exchange." },

    // Emotions
    { id: "emotions", title: "Markk's Emotions", href: "MarkksEmotions/MarkksEmotions.html", category: "emotions", cover: "logo.png", desc: "Mood and emotion-driven slots." }
  ];

  window.MARKKADE = { CATEGORIES: categories, GAMES: games };
})();
