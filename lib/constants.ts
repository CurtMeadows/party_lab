import type { Product, Package, AddOnOption } from "@/types/booking";

export const PRODUCTS: Product[] = [
  {
    name: "Dance Dome",
    description: "Classic igloo-style inflatable nightclub perfect for any celebration",
    capacity: "10-15 guests",
    dimensions: "16x16",
    imageUrl: "/igloo_shape.jpg",
    glowColor: "pink",
  },
  {
    name: "Light Haus",
    description: "Modern cube design with maximum space and style",
    capacity: "15-30 guests",
    dimensions: "20x20x12",
    imageUrl: "/box_shape.JPG",
    glowColor: "purple",
  },
  {
    name: "Club Noir",
    description: "Premium house-style venue for the ultimate party experience",
    capacity: "15-30 guests",
    dimensions: "23x16x12",
    imageUrl: "/house_shape.jpg",
    glowColor: "teal",
  },
];

export const PACKAGES: Package[] = [
  {
    name: "Party Starter",
    price: 0, // Base price only - no upgrade
    description: "Perfect for birthdays & small gatherings",
    features: [
      "Color-Changing LED Lighting",
      "Bluetooth Speaker Sound System",
      "3-Hour Rental",
      "Setup & Teardown Included",
    ],
    glowColor: "purple",
  },
  {
    name: "Glow Getter",
    price: 150, // Upgrade price on top of base
    description: "VIP vibes with premium extras",
    features: [
      "Everything in Party Starter",
      "Disco Ball",
      "Red Ropes & Carpet",
      "Curated Playlist",
      "Wireless Microphone",
      "Glow-Up Party Bags (15)",
    ],
    glowColor: "pink",
    featured: true,
    savings: 105, // Would cost $255 separately
  },
  {
    name: "All-Star VIP",
    price: 250, // Upgrade price on top of base
    description: "The ultimate all-night party experience",
    features: [
      "Everything in Glow Getter",
      "Overnight Package",
      "Unlimited Extended Hours",
      "Perfect for All-Night Events",
    ],
    glowColor: "teal",
    savings: 155, // Would cost $405 separately
  },
];

export const ADD_ONS: AddOnOption[] = [
  {
    id: "discoBall",
    name: "Disco Ball",
    price: 30,
    description: "Spinning disco ball with LED spotlight for authentic nightclub vibes",
  },
  {
    id: "redRopesCarpet",
    name: "Red Ropes & Carpet",
    price: 75,
    description: "VIP entrance with red carpet and velvet ropes",
  },
  {
    id: "curatedPlaylist",
    name: "Curated Playlist",
    price: 50,
    description: "Age-appropriate themed playlist curated for your event",
  },
  {
    id: "wirelessMicrophone",
    name: "Wireless Microphone",
    price: 50,
    description: "Wireless microphone for announcements and karaoke",
  },
  {
    id: "glowBags",
    name: "Glow-Up Party Bags",
    price: 50,
    description: "Party favor bags with glow accessories for up to 15 guests",
  },
  {
    id: "extraHour",
    name: "Extra Hour",
    price: 50,
    description: "Extend your party by one additional hour",
  },
  {
    id: "overnightPackage",
    name: "Overnight Package",
    price: 150,
    description: "Unlimited extended hours for all-night events and overnight parties",
  },
];

export const TIME_BLOCKS = [
  { value: "10:00-13:00", label: "10:00 AM - 1:00 PM" },
  { value: "13:30-16:30", label: "1:30 PM - 4:30 PM" },
  { value: "17:00-20:00", label: "5:00 PM - 8:00 PM" },
];

export const EVENT_TYPES = [
  "Birthday Party",
  "Teen Night",
  "Sweet 16",
  "Quinceañera",
  "Graduation",
  "School Event",
  "Family Celebration",
  "Other",
];

export const BOOKING_FEE = 100;

// Minimum hours in advance for booking
export const MIN_HOURS_ADVANCE = 48;

