// Case-study pages. Each entry becomes /work/<slug>.
// To add a project, copy an entry and change the text and images.
//
// Rows inside a section:
//   img(src)            one full-width image
//   cols(src, src, ...) images side by side
//   center(src)         one image, centred and not too wide (good for tall posters)
//   video(src, poster)  a video player (only loads when someone presses play)
//   smalls(src, ...)    small images (like little sprite GIFs) shown at their own size, side by side
//   pixels(src, ...)    tiny pixel-art sprites, enlarged with crisp pixels


const img = (src, alt = "") => ({ type: "full", src, alt });
const cols = (...srcs) => ({ type: "cols", items: srcs.map((src) => ({ src, alt: "" })) });
const center = (src, alt = "") => ({ type: "center", src, alt });
const video = (src, poster) => ({ type: "video", src, poster });
const smalls = (...srcs) => ({ type: "smalls", items: srcs.map((src) => ({ src, alt: "" })) });
const pixels = (...srcs) => ({ ...smalls(...srcs), pixel: true });


// Ratronics slides, rendered from the brand presentation PDF (saved in public/work/ratronics)
const slide = (n) => `/work/ratronics/slide-${n}.jpg`;

// Ratronics shorthand: a number is a full-width slide, [a, b] is a side-by-side pair.
const ratRows = (...items) =>
  items.map((item) => (Array.isArray(item) ? cols(...item.map((n) => slide(n))) : img(slide(item), `Ratronics slide ${item}`)));


// Animated GIFs from the original Saligia page (saved in public/work/saligia).
const SAL_GIF = {
  gluttony: "gluttony.gif",
  greed: "greed.gif",
  envy: "envy.gif",
  merry: "merry.gif",
  merryRunning: "merry-running.gif",
  sprite1: "sprite-1.gif",
  sprite2: "sprite-2.gif",
  sprite3: "sprite-3.gif",
};
const gif = (key) => `/work/saligia/${SAL_GIF[key]}`;
// Saligia files saved in public/work/saligia
const SAL_LOCAL = {
  title: "title.jpg",
  keyArt: "key-art.jpg",
  about: "slide-32.jpg",
  merry: "slide-33.jpg",
  callisto: "slide-36.jpg",
  hair: "slide-37.jpg",
  hairVariation: "slide-38.jpg",
  outfits: "slide-39.jpg",
  toothCollector: "slide-310.jpg",
  feastKingdom: "slide-312.jpg",
  feastRooms: "slide-311.jpg",
  tiles: "slide-313.jpg",
  scenes: "slide-314.jpg",
  edison: "slide-315.jpg",
  props: "props.png",
  eryline: "slide-316.jpg",
  erylineHair: "slide-317.jpg",
  creature: "slide-318.jpg",
  stageProps: "slide-319.jpg",
  stage: "slide-321.jpg",
  photo1: "exhibition/seawon-code.jpg",
  photo2: "exhibition/dsc01392.jpg",
  photo3: "exhibition/dsc01381.jpg",
  photo4: "exhibition/dsc01388.jpg",
  photo5: "exhibition/dsc01387.jpg",
  photo6: "exhibition/dsc01395.jpg",
  photo7: "exhibition/dsc01382.jpg",
  photo8: "exhibition/img-8544.jpg",
  photo9: "exhibition/dsc01383.jpg",
};
const sal = (key) => `/work/saligia/${SAL_LOCAL[key]}`;

// Saved in public/work/memory-bubble-store
const MBS_LOCAL = {
  poster: "poster.jpg",
  shot1: "mbs_image4.jpg",
  shot2: "mbs_image2.jpg",
  shot3: "mbs_image0_1.jpg",
  shot4: "mbs_image10_0.jpg",
  shot5: "mbs_image3_0.jpg",
};
const mbs = (key) => `/work/memory-bubble-store/${MBS_LOCAL[key]}`;

const PJP = (file) => `/work/project-jam-plant/${file}`;

const RXR = (file) => `/work/ready-xr/${file}`;

const EVA = (file) => `/work/eva-terminal/${file}`;
const EVA_SCREEN = EVA("screen.jpg");

export const work = [
  {
    slug: "ratronics",
    title: "Ratronics",
    subtitle: "A nostalgic yet innovative electronics company",
    color: "#ffe14d",
    accent: "#ec5a9b",
    hero: { src: slide(15) },
    meta: [
      { label: "Client", value: "Self-initiated" },
      { label: "Type", value: "Brand mock-up" },
      { label: "Role", value: "Brand identity, packaging, illustration" },
    ],
    tags: ["Brand identity", "Logo design", "Packaging", "Visual storytelling"],
    intro: [
      "Ratronics is a self-initiated brand mock-up project that reimagines a vintage electronics company.",
      "The concept combines the nostalgic aesthetic of retro gadgets with modern technology, creating a playful yet innovative brand identity through logo design, packaging, and visual storytelling.",
    ],
    sections: [
      {
        title: "Concept",
        text: "Rat + Retro + Electronics. Defining who Ratronics is for, what it believes in, and the personality that ties it all together.",
        rows: ratRows(2, [3, 4], [5, 6]),
      },
      {
        title: "Logo",
        text: "A monogram and wordmark built from the shapes of old circuitry and pixel type.",
        rows: ratRows([7, 8], [9, 10]),
      },
      {
        title: "Color & Graphics",
        text: "Bright candy colors, a friendly icon set, and repeat patterns that bring the mascot to every surface.",
        rows: ratRows([11, 12], 13),
      },
      {
        title: "Physical Applications",
        text: "Posters, keychains, packaging, and shopping bags — the brand in your hands.",
        rows: ratRows(14, [16, 17], [18, 19], 20),
      },
      {
        title: "Digital Applications",
        text: "Campaign graphics, app icons, social screens and a website that carry the same playful system online.",
        rows: ratRows(21, 22, [23, 24], 25, [26, 27], 28),
      },
    ],
    next: "saligia",
  },
  {
    slug: "saligia",
    title: "Saligia",
    subtitle: "Game concept art thesis",
    color: "#f6c9d3",
    accent: "#9b1d36",
    hero: { src: sal("title", 2000), alt: "Saligia title art" },
    meta: [
      { label: "Project", value: "BFA thesis" },
      { label: "Medium", value: "Game concept art" },
      { label: "Role", value: "Story, characters, environments, exhibition" },
    ],
    tags: ["Concept art", "Character design", "World building", "Exhibition"],
    intro: [
      "My thesis project, using game concept art as my medium. The story follows the youngest sibling traveling through a cursed mansion. The player\x27s goal is to save the siblings and uncover the truth behind the curse.",
    ],
    sections: [
      {
        title: "Trailer",
        text: "The full trailer, with sound.",
        rows: [video("/work/saligia/trailer.mp4", sal("keyArt"))],
      },
      {
        title: "Game Mock-up",
        text: "Mock-up gameplay screens for the Gluttony, Greed and Envy levels.",
        rows: [img(gif("gluttony"), "Gluttony animation"), cols(gif("greed"), gif("envy"))],
      },
      {
        title: "Why game concept art?",
        text: "Games have always inspired me with their visual storytelling, and through concept art, I provide an interactive experience that helps information and emotions linger longer in a player\x27s memory.",
        rows: [img(sal("about"), "About Saligia"), img(sal("keyArt"), "Saligia key art")],
      },
      {
        title: "Characters",
        text: "The siblings and the strange residents of the mansion — from turnarounds to hair and outfit studies.",
        rows: [
          cols(sal("merry", 1200), sal("callisto", 1200)),
          cols(gif("merry"), gif("merryRunning")),
          cols(sal("hair", 1200), sal("hairVariation", 1200)),
          smalls(gif("sprite1")),
          cols(sal("outfits", 1200), sal("toothCollector", 1200)),
          cols(sal("edison", 1200), sal("eryline", 1200)),
          cols(sal("erylineHair", 1200), sal("creature", 1200)),
        ],
      },
      {
        title: "World & Props",
        text: "The Feast Kingdom and the rooms, props and stage pieces that fill it.",
        rows: [
          img(sal("feastKingdom"), "The Feast Kingdom"),
          cols(sal("feastRooms", 1200), sal("tiles", 1200)),
          cols(sal("scenes", 1200), sal("stageProps", 1200)),
          img(sal("props")),
          smalls(gif("sprite2"), gif("sprite3")),
          img(sal("stage")),
        ],
      },
      {
        title: "Exhibition",
        text: "The thesis show: a cake-shaped installation, masks and printed pieces from the world of Saligia.",
        rows: [
          cols(sal("photo1", 900), sal("photo4", 900), sal("photo7", 900)),
          cols(sal("photo2", 1200), sal("photo3", 1200)),
          cols(sal("photo5", 1200), sal("photo6", 1200)),
          cols(sal("photo8", 900), sal("photo9", 900)),
        ],
      },
    ],
    next: "memory-bubble-store",
  },
  {
    slug: "memory-bubble-store",
    title: "Memory Bubble Store",
    subtitle: "A calming, nostalgic game made in 48 hours",
    color: "#c6e8f8",
    accent: "#6c4ff5",
    hero: { src: mbs("poster", 1400), alt: "Memory Bubble Store poster", fit: "contain" },
    meta: [
      { label: "Event", value: "Global Game Jam 2025" },
      { label: "Team", value: "Christine Chang (coding director)" },
      { label: "Role", value: "Art & visual design" },
    ],
    tags: ["Game jam", "Game art", "Illustration"],
    links: [
      { label: "Play the game", href: "https://chanc245.github.io/Memory-Bubble-Store/" },
      { label: "Game jam page", href: "https://globalgamejam.org/games/2025/memory-bubble-store-1" },
    ],
    intro: [
      "Memory Bubble Store is a calming, nostalgic game created for Global Game Jam 2025, where players run a shop selling origami toys sealed in bubbles that reveal heartfelt childhood memories of nature.",
    ],
    sections: [
      {
        title: "In the shop",
        text: "Screens from the game: the shop, the customers, and the memories hidden inside each bubble.",
        rows: [cols(mbs("shot1"), mbs("shot2")), cols(mbs("shot3"), mbs("shot4")), center(mbs("shot5"))],
      },
    ],
    next: "project-jam-plant",
  },
  {
    slug: "project-jam-plant",
    title: "Project Jam Plant",
    subtitle: "A pixel-art game about roots, made in 48 hours",
    color: "#d6efb4",
    accent: "#a2562a",
    hero: { src: PJP("art-assets.jpg"), alt: "Project Jam Plant art assets" },
    meta: [
      { label: "Event", value: "Global Game Jam 2023" },
      { label: "Theme", value: "Roots" },
      { label: "Team", value: "Bini Park, Christine Chang" },
      { label: "Role", value: "Art & animation director" },
    ],
    tags: ["Game jam", "Pixel art", "Animation"],
    links: [
      { label: "Play the game", href: "https://chanc245.github.io/Project_Jam_Plant/" },
      { label: "Game jam page", href: "https://v3.globalgamejam.org/2023/games/project-jam-plant-5" },
    ],
    intro: [
      "A Global Game Jam 2023 game I made with my team around the theme \"Roots.\" I was the art and animation director.",
    ],
    sections: [
      {
        title: "Gameplay",
        text: "The full play-through, plus moments from the game.",
        rows: [
          video(PJP("gameplay.mp4"), PJP("gameplay-3.png")),
          cols(PJP("gameplay-1.gif"), PJP("gameplay-2.jpg")),
          cols(PJP("gameplay-3.png"), PJP("gameplay-4.png")),
        ],
      },
      {
        title: "Animation",
        text: "The animated sequence from the game.",
        rows: [img(PJP("animation.gif"), "Project Jam Plant animation")],
      },
      {
        title: "Rooms & Map",
        text: "Each room from sketch to final color, and the root map that connects them.",
        rows: [center(PJP("rooms.jpg"), "Rooms from sketch to color"), img(PJP("map-screen.png"), "Root map screen")],
      },
      {
        title: "Sprites",
        text: "Little pixel-art pieces made for the game.",
        rows: [pixels(...["s1", "s2", "s3", "s4", "s5", "s6_1", "s7", "s9", "map"].map((n) => PJP(`sprites/${n}.png`)))],
      },
    ],
    next: "eva-terminal",
  },
  {
    slug: "eva-terminal",
    title: "Eva Terminal",
    subtitle: "A lateral thinking puzzle game with an AI game master",
    color: "#d4f5a6",
    accent: "#1f8a4c",
    hero: { src: EVA_SCREEN, alt: "Eva Terminal interface" },
    meta: [
      { label: "Project", value: "Spider Mansion — Eva Terminal" },
      { label: "Built with", value: "Gemini API, Node.js" },
      { label: "Role", value: "Character & interface design" },
    ],
    tags: ["Game design", "AI", "Interface design"],
    links: [
      { label: "Try the demo", href: "https://eva-terminal-demo.onrender.com/" },
      { label: "Devpost", href: "https://devpost.com/software/spider-mansion" },
    ],
    intro: [
      "Eva Terminal is a new take on the classic lateral thinking puzzle game, where players solve scenarios through questioning.",
      "At the heart of the game is the conversation between a game master, who provides the scenario, and a player, who asks questions to uncover the secret.",
    ],
    sections: [
      {
        title: "See it in action",
        text: "A walkthrough of a puzzle with Eva.",
        rows: [video(EVA("demo.mp4"), EVA_SCREEN)],
      },
      {
        title: "What is a lateral thinking puzzle?",
        text: [
          "A lateral thinking puzzle is a verbal puzzle where you guess the scenario by asking questions. The key is conversation: a game master provides the scenario, and the player asks questions to figure it out.",
          "Inspired by AI chatbots, we wanted players to feel the thrill of solving puzzles through conversation with an AI — making the classic format more engaging, dynamic and accessible.",
        ],
      },
      {
        title: "How Eva works",
        text: [
          "We designed a virtual interface featuring our main character, Eva, who serves as the game master. Eva presents a scenario, and the player solves it by asking yes-or-no questions. Eva can only answer \"Yes,\" \"No,\" or \"Doesn\x27t relate.\"",
          "We integrated the Gemini API into a Node.js app to create a chat-style terminal. Gemini is given the scenario and its solution, then judges each question by how closely it relates to the answer.",
        ],
      },
      {
        title: "Designing Eva",
        text: "Eva's pixel-art character, our sticky-note planning wall, and four versions of the terminal interface on the way to the final design.",
        rows: [cols(EVA("eva-character.jpg"), EVA("brainstorm.jpg")), center(EVA("interface.jpg"), "Four versions of the Eva Terminal interface")],
      },
      {
        title: "Challenges",
        bullets: [
          "Making sure the AI could understand and respond to a wide range of questions, using Google AI as a text analyzer.",
          "Fine-tuning how the AI judges answers so the puzzles stay challenging but fair.",
          "Giving the AI enough information, through detailed scenario setups and solutions, to answer well.",
        ],
      },
      {
        title: "What\x27s next",
        bullets: [
          "AI-generated puzzles, for an ever-changing set of challenges.",
          "Saving player feedback on Eva\x27s answers to keep improving the experience.",
          "Bringing the game to more platforms, like mobile.",
        ],
      },
    ],
    next: "ready-xr",
  },
  {
    slug: "ready-xr",
    title: "Ready XR",
    subtitle: "An emergency training protocol experience in XR",
    color: "#ffd9d6",
    accent: "#e2231a",
    hero: { src: RXR("crouch.jpg"), alt: "A Ready XR user crouching under a table" },
    meta: [
      { label: "Event", value: "MIT Reality Hack 2024" },
      { label: "Team", value: "Team Goose — Daniel Nguyen, Brady Li, Lauryn Vania Kurniawan, Gozie Nwaka" },
      { label: "Made in", value: "3 days" },
    ],
    tags: ["Hackathon", "XR", "Pictograms", "Experience design"],
    links: [{ label: "Devpost", href: "https://devpost.com/software/readyxr" }],
    intro: [
      "This project was made during MIT Reality Hack 2024, in three days, with four teammates I had just met.",
      "In a world full of unexpected disasters, we often forget the in-the-moment decisions that can save our lives — and training programs can be costly and boring. Ready XR is an emergency training protocol experience: immersive XR simulations that help people new to an area, or with little exposure to natural disasters, learn and practice emergency preparedness in a fun, fast-paced way.",
    ],
    sections: [
      {
        title: "The experience",
        text: "Players learn research-based actions — cover your head, crouch under a table, grab a child — guided by simple on-screen prompts.",
        rows: [cols(RXR("vr-child.jpg"), RXR("vr-cover-head.jpg")), img(RXR("crouch-scene.jpg"), "Crouch under a table")],
      },
      {
        title: "Pictograms",
        text: "A set of clear, bold pictograms so instructions read instantly, even in a stressful moment.",
        rows: [cols(RXR("pose-02.png"), RXR("pose-03.png"), RXR("pose-04.png"), RXR("pose-05.png"))],
      },
      {
        title: "Making it",
        text: "To bring the vision to life, we worked across design, music and sound, and development.",
        rows: [center(RXR("title.jpg"), "Ready XR title card"), img(RXR("process.jpg"), "Design and development process"), img(RXR("team-at-work.jpg"), "The team at work")],
      },
    ],
    next: "lg-wonder-box",
  },
  {
    slug: "lg-wonder-box",
    title: "LG Wonder Box",
    subtitle: "Melting Dreams",
    color: "#d9d0ff",
    accent: "#6a3df0",
    hero: { src: "/projects/lg-wonder-box.webp", alt: "Marshmallows floating out of the LG Wonder Box" },
    meta: [
      { label: "Type", value: "3D animation" },
      { label: "Team", value: "Bini Park, Christine Chang, Yunseo Jung" },
      { label: "Role", value: "3D modeling & design" },
    ],
    tags: ["3D animation", "3D modeling", "Motion"],
    intro: [
      "In this 3D animation, we follow the delightful journey of two marshmallows as they embrace the essence of \"Life\x27s Good\" through the changing seasons. I worked on 3D modeling and design.",
    ],
    sections: [
      {
        title: "Film",
        text: "Melting Dreams — final video.",
        rows: [video("/projects/lg-wonder-box.mp4", "/projects/lg-wonder-box.webp")],
      },
    ],
    next: "ratronics",
  },
];

export const getWork = (slug) => work.find((w) => w.slug === slug);
