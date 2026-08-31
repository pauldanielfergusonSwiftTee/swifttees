import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swift Tees",
    short_name: "Swift Tees",
    description: "Swift Tees Golf Society",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111827",
    icons: [
      {
        src: "/swiftteeslogo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}