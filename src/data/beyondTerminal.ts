import type { BeyondAct, BeyondAlbumItem, BeyondCard, BeyondSymbol } from "@/types";

export const beyondPhotoWallIntro = {
  eyebrow: "Hidden album",
  title: "Beyond The Terminal",
  deck: "Photos, people, notes, and the parts that don't fit inside a resume.",
};

export const beyondAlbumItems: BeyondAlbumItem[] = [
  {
    id: "hackathon-sprint",
    kind: "event",
    title: "48-hour build sprint",
    caption:
      "A hackathon frame for prototypes, pressure, and the small decisions that make teams move faster.",
    tags: ["hackathon", "prototype", "team"],
    meta: "Mumbai / overnight build",
    color: "cobalt",
    size: "hero",
    image: {
      alt: "Placeholder collage panel for a hackathon sprint photo.",
      aspectRatio: "5 / 4",
      dominantColor: "#245DFF",
    },
  },
  {
    id: "seminar-room",
    kind: "photo",
    title: "Room full of signals",
    caption:
      "Seminars, community rooms, and those fast conversations that turn into a better question.",
    tags: ["seminar", "community"],
    meta: "Add real event photo later",
    color: "lemon",
    size: "wide",
    image: {
      alt: "Placeholder wide panel for a seminar or community room photo.",
      aspectRatio: "16 / 9",
      dominantColor: "#FFE45E",
    },
  },
  {
    id: "quote-board",
    kind: "quote",
    title: "Borrowed fire",
    caption:
      "A quote slot for a developer, artist, or thinker worth keeping close to the work.",
    tags: ["quote", "inspiration"],
    quote: "Make the useful thing feel alive.",
    meta: "Quote attribution goes here",
    color: "pink",
    size: "square",
  },
  {
    id: "people-and-proof",
    kind: "person",
    title: "People I learn from",
    caption:
      "A simple place for photos with mentors, speakers, builders, and people who changed the room.",
    tags: ["people", "learning", "moments"],
    meta: "Name / event / year",
    color: "amber",
    size: "tall",
    image: {
      alt: "Placeholder portrait panel for a photo with people at an event.",
      aspectRatio: "4 / 5",
      dominantColor: "#FFC24B",
    },
  },
  {
    id: "project-demo",
    kind: "project",
    title: "Demo table energy",
    caption:
      "Behind-the-scenes shots from demos, rough prototypes, experiments, and tiny wins.",
    tags: ["demo", "project", "prototype"],
    meta: "Prototype log",
    color: "coral",
    size: "wide",
    image: {
      alt: "Placeholder panel for a project demo table photo.",
      aspectRatio: "16 / 10",
      dominantColor: "#FF5A5F",
    },
  },
  {
    id: "meetup-notes",
    kind: "event",
    title: "Meetup afterglow",
    caption:
      "The small album space for travel, local meetups, quick notes, and hallway conversations.",
    tags: ["meetup", "travel", "notes"],
    meta: "City / meetup / memory",
    color: "lilac",
    size: "square",
    image: {
      alt: "Placeholder square panel for meetup and travel photos.",
      aspectRatio: "1 / 1",
      dominantColor: "#BDA8FF",
    },
  },
  {
    id: "big-room-moment",
    kind: "person",
    title: "The big room moment",
    caption:
      "For the occasional photo with someone important, without turning the page into a press release.",
    tags: ["people", "event", "memory"],
    meta: "Person / context",
    color: "cobalt",
    size: "tall",
    image: {
      alt: "Placeholder tall panel for a photo with a notable person.",
      aspectRatio: "4 / 5",
      dominantColor: "#245DFF",
    },
  },
  {
    id: "tiny-trick",
    kind: "quote",
    title: "Tiny trick, saved",
    caption:
      "A quick technique, note, or strange useful thing that deserves to live outside the formal portfolio.",
    tags: ["trick", "note"],
    quote: "Small details compound into trust.",
    color: "lemon",
    size: "square",
  },
];

const beyondSymbolMark: BeyondSymbol = {
  id: "pastel-mist-mark",
  src: "/beyond-terminal/symbol-mark.svg",
  alt: "Pastel mist symbol mark for Beyond The Terminal.",
  placement: "top-left",
  accent: "signal",
};

export const beyondRouteIntro = {
  eyebrow: "Beyond The Terminal",
  title: "Pastel signals for the things that travel with you.",
  deck:
    "A stricter side route for travel notes, training, books, and field observations. The page moves in long rectangular bands, larger type, and one focal point at a time.",
};

const signalCards: BeyondCard[] = [
  {
    id: "signal-statement",
    kind: "statement",
    layout: "hero_split",
    accent: "lavender",
    alignment: "start",
    eyebrow: "Act I / Signal",
    title: "The route narrows the noise and lets the larger ideas breathe.",
    deck:
      "Floating tiles are gone. The landing now behaves like a paced editorial sequence with bigger typography, slimmer cards, and motion that frames the reading order instead of distracting from it.",
    body: [
      "Beyond The Terminal is where the portfolio stops trying to explain everything at once. The emphasis shifts from collection to composition.",
      "Travel, books, discipline, and field notes now live inside one grid: charcoal shell, pastel mist surfaces, metallic rules, and deliberate spacing that keeps the eye on one clear object at a time.",
    ],
    notes: [
      { id: "signal-note-1", label: "Palette", value: "Charcoal, lavender, mist", tone: "accent" },
      { id: "signal-note-2", label: "Pacing", value: "Three acts, fixed bands", tone: "muted" },
      { id: "signal-note-3", label: "Intent", value: "Focus over clutter", tone: "warm" },
    ],
    symbol: beyondSymbolMark,
    cta: {
      label: "Read field notes",
      href: "/beyond-terminal/journal",
      kind: "link",
    },
  },
  {
    id: "signal-visual",
    kind: "feature",
    layout: "hero_split",
    accent: "powder",
    alignment: "center",
    eyebrow: "Portal bloom / pastel mist",
    title: "The homepage handoff and the destination now speak the same visual language.",
    deck:
      "The shared transition architecture stays, but the bloom, the card frame, and the typography now align with the destination instead of feeling like a separate effect pasted on top.",
    body: [
      "Borders, symbol placement, and media framing follow one shared contract so future photography and graphic swaps can happen without breaking the layout grammar.",
    ],
    media: {
      kind: "image",
      src: "/beyond-terminal/signal-core.svg",
      alt: "Pastel abstract signal graphic with soft lavender bloom, slim lines, and a framed symbol study.",
      aspectRatio: "5 / 4",
      priority: true,
      treatment: "chrome",
      frame: "signal",
      surfaceTone: "lavender",
    },
    notes: [
      { id: "signal-note-4", label: "Motion", value: "Pastel bloom + soft settle", tone: "accent" },
      { id: "signal-note-5", label: "Graphics", value: "Abstract framed studies", tone: "muted" },
    ],
    symbol: {
      ...beyondSymbolMark,
      placement: "bottom-right",
      accent: "ghost",
    },
  },
];

const artifactCards: BeyondCard[] = [
  {
    id: "artifact-discipline",
    kind: "artifact",
    layout: "wide_strip",
    accent: "peach",
    alignment: "center",
    eyebrow: "Act II / Artifact A",
    title: "Discipline deserves one long frame, not a scatter of fragments.",
    deck:
      "Training, repetition, and recovery move into one measured strip. The geometry stays long, the copy stays short, and the visual treatment feels composed instead of stacked.",
    body: [
      "The old landing scattered these ideas across too many surfaces. This version compresses them into one wide artifact with stronger hierarchy and calmer spacing.",
      "The card reads like a designed object: structural labels, slim lines, and a restrained pastel wash that still feels premium without slipping into neon tech styling.",
    ],
    media: {
      kind: "image",
      src: "/beyond-terminal/discipline-grid.svg",
      alt: "Pastel editorial study of measured bars, slim dividers, and a powder-blue grid within a wide frame.",
      aspectRatio: "16 / 9",
      treatment: "obsidian",
      frame: "offset",
      surfaceTone: "peach",
    },
    notes: [
      { id: "artifact-note-1", label: "Thread", value: "Training and craft", tone: "accent" },
      { id: "artifact-note-2", label: "Feel", value: "Measured, slim, calm", tone: "muted" },
      { id: "artifact-note-3", label: "Use", value: "One dominant band, not fragments", tone: "warm" },
    ],
    symbol: beyondSymbolMark,
  },
  {
    id: "artifact-observation",
    kind: "artifact",
    layout: "wide_strip_reverse",
    accent: "powder",
    alignment: "center",
    eyebrow: "Act II / Artifact B",
    title: "Observation, travel, and reading now share the same border system.",
    deck:
      "Books, stations, and brief encounters sit inside a second wide strip, giving them the same visual weight as the discipline track instead of treating them as side notes.",
    body: [
      "This keeps the route mixed and thematic rather than category-siloed. A marked page, a train platform, and a travel ritual can belong to one editorial object.",
      "The page feels richer because sequence, scale, and motion do the work that component clutter used to do.",
    ],
    media: {
      kind: "image",
      src: "/beyond-terminal/observation-atlas.svg",
      alt: "Pastel editorial atlas graphic with route lines, framed rectangles, and a soft powder-blue haze.",
      aspectRatio: "16 / 9",
      treatment: "chrome",
      frame: "offset",
      surfaceTone: "powder",
    },
    notes: [
      { id: "artifact-note-4", label: "Thread", value: "Travel, books, people", tone: "accent" },
      { id: "artifact-note-5", label: "Feel", value: "Cinematic, aligned, fluid", tone: "muted" },
      { id: "artifact-note-6", label: "Rule", value: "One strong focal point per view", tone: "warm" },
    ],
    symbol: {
      ...beyondSymbolMark,
      placement: "top-right",
      accent: "ghost",
    },
  },
];

const fieldNotesCards: BeyondCard[] = [
  {
    id: "field-notes-feature",
    kind: "journal",
    layout: "journal_feature",
    accent: "silver",
    alignment: "center",
    eyebrow: "Act III / Field Notes",
    title: "The journal arrives as one last major card, not a leftover rail.",
    deck:
      "Archive discovery now arrives inside the same system: one feature strip, aligned secondary cards, and one clear route back home once the reading branch is visible.",
    body: [
      "The archive and article pages stay calmer than the landing page, but they keep the same typography, borders, pastel tones, and geometry so the route feels coherent end to end.",
    ],
    media: {
      kind: "image",
      src: "/beyond-terminal/field-notes-grid.svg",
      alt: "Structured field-notes board with soft silver dividers, pastel surfaces, and wide editorial proportions.",
      aspectRatio: "16 / 9",
      treatment: "paper",
      frame: "default",
      surfaceTone: "silver",
    },
    notes: [
      { id: "field-note-1", label: "Surface", value: "Local MDX journal", tone: "accent" },
      { id: "field-note-2", label: "Shape", value: "Feature band + aligned archive", tone: "muted" },
      { id: "field-note-3", label: "Exit", value: "One clear return action", tone: "warm" },
    ],
    symbol: {
      ...beyondSymbolMark,
      placement: "bottom-left",
      accent: "signal",
    },
    cta: {
      label: "Browse the archive",
      href: "/beyond-terminal/journal",
      kind: "link",
    },
  },
];

export const beyondActs: BeyondAct[] = [
  {
    id: "signal",
    title: "Signal",
    deck:
      "A split hero strip establishes the banded grid, the pastel palette, and the shared portal language immediately.",
    cards: signalCards,
  },
  {
    id: "artifacts",
    title: "Artifacts",
    deck:
      "Two horizontal artifacts regroup the old chapter sprawl into stronger thematic objects.",
    cards: artifactCards,
  },
  {
    id: "field-notes",
    title: "Field Notes",
    deck:
      "Journal discovery is now a feature moment with aligned supporting strips instead of a dense lower-page rail.",
    cards: fieldNotesCards,
  },
];

export const beyondArchiveIntro = {
  eyebrow: "Field Notes",
  title: "Local essays framed like the same system, just quieter.",
  deck:
    "The archive stays close to the codebase and the card system. Entries remain typed, local, and easy to extend without breaking the wider visual language.",
};

export const beyondExitCopy = {
  eyebrow: "Return path",
  title: "Leave with the atmosphere, not the noise.",
  deck:
    "The route resolves with one clean decision: continue into the journal or step back into the main portfolio with the same pastel memory still intact.",
};
