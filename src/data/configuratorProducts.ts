import type { LightProduct } from "@/types/product";

const BASE = "https://cdn.shopify.com/s/files/1/0816/1863/2993/files";

export const lightProducts: LightProduct[] = [
  {
    id: "ram1500-nova-2019-2024",
    name: "AlphaRex Nova Series LED",
    brand: "AlphaRex",
    vehicleFitment: "2019–2024 RAM 1500 · All Models",
    type: "headlight",
    baseImage: `${BASE}/19-24-ram-1500-nova-series-led-projector-headlights-black-326668.jpg?v=1712004650`,
    galleryViews: [
      {
        id: "front",
        label: "Front View",
        imageUrl: `${BASE}/19-24-ram-1500-nova-series-led-projector-headlights-black-326668.jpg?v=1712004650`,
      },
      {
        id: "angle",
        label: "Angle View",
        imageUrl: `${BASE}/19-24-ram-1500-nova-series-led-projector-headlights-black-847249.jpg?v=1712004650`,
      },
      {
        id: "drl-on",
        label: "DRL On",
        imageUrl: `${BASE}/19-24-ram-1500-nova-series-led-projector-headlights-black-326668.jpg?v=1712004650`,
      },
      {
        id: "turn-signal",
        label: "Turn Signal",
        imageUrl: `${BASE}/19-24-ram-1500-nova-series-led-projector-headlights-black-847249.jpg?v=1712004650`,
      },
      {
        id: "installed",
        label: "Installed",
        imageUrl: `${BASE}/19-24-ram-1500-nova-series-led-projector-headlights-black-326668.jpg?v=1712004650`,
      },
      {
        id: "night-view",
        label: "Night View",
        imageUrl: `${BASE}/19-24-ram-1500-nova-series-led-projector-headlights-black-847249.jpg?v=1712004650`,
      },
    ],
    // Approximate polygon masks in percentage coords [x%, y%]
    masks: [
      {
        id: "housing",
        name: "housing",
        type: "polygon",
        points: [[5, 5], [95, 5], [95, 95], [5, 95]],
      },
      {
        id: "lens",
        name: "lens",
        type: "polygon",
        points: [[8, 8], [92, 8], [92, 90], [8, 90]],
      },
      {
        id: "drl",
        name: "drl",
        type: "polygon",
        points: [[6, 6], [88, 6], [92, 24], [6, 26]],
      },
      {
        id: "halo",
        name: "halo",
        type: "polygon",
        points: [[18, 22], [58, 22], [70, 36], [70, 70], [58, 82], [18, 82], [6, 70], [6, 36]],
      },
      {
        id: "reflector",
        name: "reflector",
        type: "polygon",
        points: [[10, 62], [88, 62], [88, 90], [10, 90]],
      },
    ],
    disclaimer:
      "Preview is for visualization only. Final appearance may vary based on product condition, lens material, paint, coating, lighting, and installation.",
    imagePermissionNotes: "Product images sourced from AlphaRex USA via authorized Shopify CDN. For commercial reuse, verify permissions with AlphaRex.",
  },
  {
    id: "ram1500-luxx-2009-2018",
    name: "AlphaRex LUXX Series LED",
    brand: "AlphaRex",
    vehicleFitment: "2009–2018 RAM 1500 · All Models",
    type: "headlight",
    baseImage: `${BASE}/09-18-ram-truck-luxx-series-led-projector-headlights-alpha-black-118525.jpg?v=1712004337`,
    galleryViews: [
      {
        id: "front",
        label: "Front View",
        imageUrl: `${BASE}/09-18-ram-truck-luxx-series-led-projector-headlights-alpha-black-118525.jpg?v=1712004337`,
      },
      {
        id: "angle",
        label: "Angle View",
        imageUrl: `${BASE}/09-18-ram-truck-luxx-series-led-projector-headlights-alpha-black-118525.jpg?v=1712004337`,
      },
      {
        id: "drl-on",
        label: "DRL On",
        imageUrl: `${BASE}/09-18-ram-truck-luxx-series-led-projector-headlights-alpha-black-118525.jpg?v=1712004337`,
      },
      {
        id: "turn-signal",
        label: "Turn Signal",
        imageUrl: `${BASE}/09-18-ram-truck-luxx-series-led-projector-headlights-alpha-black-118525.jpg?v=1712004337`,
      },
      {
        id: "installed",
        label: "Installed",
        imageUrl: `${BASE}/09-18-ram-truck-luxx-series-led-projector-headlights-alpha-black-118525.jpg?v=1712004337`,
      },
      {
        id: "night-view",
        label: "Night View",
        imageUrl: `${BASE}/09-18-ram-truck-luxx-series-led-projector-headlights-alpha-black-118525.jpg?v=1712004337`,
      },
    ],
    masks: [
      {
        id: "housing",
        name: "housing",
        type: "polygon",
        points: [[5, 5], [95, 5], [95, 95], [5, 95]],
      },
      {
        id: "lens",
        name: "lens",
        type: "polygon",
        points: [[8, 8], [92, 8], [92, 90], [8, 90]],
      },
      {
        id: "drl",
        name: "drl",
        type: "polygon",
        points: [[6, 6], [88, 6], [90, 22], [6, 24]],
      },
      {
        id: "halo",
        name: "halo",
        type: "polygon",
        points: [[20, 24], [60, 24], [72, 38], [72, 72], [60, 84], [20, 84], [8, 72], [8, 38]],
      },
      {
        id: "reflector",
        name: "reflector",
        type: "polygon",
        points: [[10, 64], [88, 64], [88, 90], [10, 90]],
      },
    ],
    disclaimer:
      "Preview is for visualization only. Final appearance may vary based on product condition, lens material, paint, coating, lighting, and installation.",
    imagePermissionNotes: "Product images sourced from AlphaRex USA via authorized Shopify CDN.",
  },
  {
    id: "tundra-luxx-2022-2024",
    name: "AlphaRex LUXX Series LED",
    brand: "AlphaRex",
    vehicleFitment: "2022–2024 Toyota Tundra / Sequoia",
    type: "headlight",
    baseImage: `${BASE}/22-24-toyota-tundrasequoia-luxx-series-led-projector-headlights-alpha-black-629675.jpg?v=1712004723`,
    galleryViews: [
      {
        id: "front",
        label: "Front View",
        imageUrl: `${BASE}/22-24-toyota-tundrasequoia-luxx-series-led-projector-headlights-alpha-black-629675.jpg?v=1712004723`,
      },
      {
        id: "angle",
        label: "Angle View",
        imageUrl: `${BASE}/22-24-toyota-tundrasequoia-luxx-series-led-projector-headlights-alpha-black-629675.jpg?v=1712004723`,
      },
      {
        id: "drl-on",
        label: "DRL On",
        imageUrl: `${BASE}/22-24-toyota-tundrasequoia-luxx-series-led-projector-headlights-alpha-black-629675.jpg?v=1712004723`,
      },
      {
        id: "turn-signal",
        label: "Turn Signal",
        imageUrl: `${BASE}/22-24-toyota-tundrasequoia-luxx-series-led-projector-headlights-alpha-black-629675.jpg?v=1712004723`,
      },
      {
        id: "installed",
        label: "Installed",
        imageUrl: `${BASE}/22-24-toyota-tundrasequoia-luxx-series-led-projector-headlights-alpha-black-629675.jpg?v=1712004723`,
      },
      {
        id: "night-view",
        label: "Night View",
        imageUrl: `${BASE}/22-24-toyota-tundrasequoia-luxx-series-led-projector-headlights-alpha-black-629675.jpg?v=1712004723`,
      },
    ],
    masks: [
      {
        id: "housing",
        name: "housing",
        type: "polygon",
        points: [[5, 5], [95, 5], [95, 95], [5, 95]],
      },
      {
        id: "lens",
        name: "lens",
        type: "polygon",
        points: [[8, 8], [92, 8], [92, 90], [8, 90]],
      },
      {
        id: "drl",
        name: "drl",
        type: "polygon",
        points: [[6, 6], [90, 6], [92, 20], [6, 22]],
      },
      {
        id: "halo",
        name: "halo",
        type: "polygon",
        points: [[22, 26], [62, 26], [74, 40], [74, 74], [62, 86], [22, 86], [10, 74], [10, 40]],
      },
      {
        id: "reflector",
        name: "reflector",
        type: "polygon",
        points: [[10, 66], [88, 66], [88, 90], [10, 90]],
      },
    ],
    disclaimer:
      "Preview is for visualization only. Final appearance may vary based on product condition, lens material, paint, coating, lighting, and installation.",
    imagePermissionNotes: "Product images sourced from AlphaRex USA via authorized Shopify CDN.",
  },
];
