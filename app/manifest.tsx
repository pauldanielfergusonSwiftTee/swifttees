import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swift Tees",
    short_name: "Swift Tees",
    description: "Swift Tees Golf Society",

    start_url: "/",

    display: "standalone",

    background_color: "#ffffff",

    theme_color: "#052e16",

    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}