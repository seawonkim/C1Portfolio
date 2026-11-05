// Projects that hang on the web on the home page.
// image: thumbnail URL (or a file in public/, e.g. "/projects/ratronics.jpg")
// more: extra images; the card plays them as a slideshow after the thumbnail
//       (same images as the slideshows on the original seawonkim.com homepage)
// video: a muted looping video that plays on the card instead (image is shown while it loads)
// link: where clicking the project goes

export const site = {
  name: "Seawon Kim",
  tagline: "Graphic Designer & Marketer — branding, packaging and campaigns",
  email: "seawonkim0226@gmail.com",
  instagram: "c1portfolio", // handle, without the @
};

export const webProjects = [
  {
    title: "Ratronics",
    tag: "Brand identity",
    image: "/work/ratronics/thumb-19.jpg",
    more: [
      "/work/ratronics/thumb-18.jpg",
      "/work/ratronics/thumb-15.jpg",
      "/work/ratronics/thumb-25.jpg",
      "/work/ratronics/thumb-22.jpg",
      "/work/ratronics/thumb-16.jpg",
    ],
    link: "/work/ratronics",
  },
  {
    title: "Saligia",
    tag: "Thesis · Game concept art",
    image: "/work/saligia/title.jpg",
    more: [
      "/work/saligia/envy.gif",
      "/work/saligia/greed.gif",
      "/work/saligia/gluttony.gif",
    ],
    link: "/work/saligia",
  },
  {
    title: "Memory Bubble Store",
    tag: "Global Game Jam 2025",
    image: "/work/memory-bubble-store/mbs_image4.jpg",
    more: [
      "/work/memory-bubble-store/mbs_image2.jpg",
      "/work/memory-bubble-store/mbs_image0_1.jpg",
      "/work/memory-bubble-store/mbs_image10_0.jpg",
      "/work/memory-bubble-store/mbs_image3_0.jpg",
    ],
    link: "/work/memory-bubble-store",
  },
  {
    title: "Project Jam Plant",
    tag: "Global Game Jam 2023",
    image: "/work/project-jam-plant/gameplay-3.png",
    more: [
      "/work/project-jam-plant/gameplay-4.png",
      "/work/project-jam-plant/gameplay-2.jpg",
      "/work/project-jam-plant/art-assets.jpg",
    ],
    link: "/work/project-jam-plant",
  },
  {
    title: "Eva Terminal",
    tag: "AI puzzle game",
    image: "/work/eva-terminal/screen.jpg",
    video: "/work/eva-terminal/asking.mp4",
    link: "/work/eva-terminal",
  },
  {
    title: "Ready XR",
    tag: "MIT Reality Hack 2024",
    image: "/work/ready-xr/title.jpg",
    more: ["/work/ready-xr/vr-child.jpg", "/work/ready-xr/crouch-scene.jpg", "/work/ready-xr/vr-cover-head.jpg"],
    link: "/work/ready-xr",
  },
  {
    title: "LG Wonder Box",
    tag: "3D animation",
    image: "/projects/lg-wonder-box.webp",
    video: "/projects/lg-wonder-box.mp4",
    link: "/work/lg-wonder-box",
  },
];
