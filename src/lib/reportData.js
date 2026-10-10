export const reportsSeed = [
  {
    id: "CEGCT-2025-0042",
    category: "Illegal dumping",
    severity: "CRITICAL",
    status: "SUBMITTED",
    location: "Area 18, Lilongwe",
    date: "Today, 09:42",
    reporter: "Grace Banda",
    officer: "Unassigned",
    description:
      "Construction waste has been dumped beside the stream, and runoff is entering the waterway.",
    latitude: -13.925,
    longitude: 33.781,
  },
  {
    id: "CEGCT-2025-0041",
    category: "Water pollution",
    severity: "HIGH",
    status: "UNDER_REVIEW",
    location: "Msambazi River, Mzuzu",
    date: "Today, 08:16",
    reporter: "Peter Phiri",
    officer: "Martha Chirwa",
    description:
      "Discoloured water and a strong chemical smell were reported near the footbridge.",
    latitude: -11.465,
    longitude: 34.02,
  },
  {
    id: "CEGCT-2025-0040",
    category: "Unsafe waste disposal",
    severity: "MEDIUM",
    status: "IN_PROGRESS",
    location: "Zomba Central Market",
    date: "Yesterday, 16:30",
    reporter: "Thoko Mbewe",
    officer: "James Nkhoma",
    description: "Waste is being burned behind the market after closing hours.",
    latitude: -15.385,
    longitude: 35.318,
  },
  {
    id: "CEGCT-2025-0039",
    category: "Air pollution",
    severity: "HIGH",
    status: "IN_PROGRESS",
    location: "Chilomoni, Blantyre",
    date: "Yesterday, 13:05",
    reporter: "Chisomo Juma",
    officer: "Martha Chirwa",
    description: "Smoke from an industrial site is affecting nearby homes.",
    latitude: -15.786,
    longitude: 35.002,
  },
  {
    id: "CEGCT-2025-0038",
    category: "Illegal dumping",
    severity: "LOW",
    status: "RESOLVED",
    location: "Kawale, Lilongwe",
    date: "Oct 04, 11:20",
    reporter: "Andrew Kalua",
    officer: "James Nkhoma",
    description:
      "Household refuse left along the roadside has now been cleared.",
    latitude: -13.954,
    longitude: 33.777,
  },
];

export const statusOptions = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];
export const officerOptions = [
  "Martha Chirwa",
  "James Nkhoma",
  "Ruth Moyo",
  "Unassigned",
];
export const labelCase = (value = "") =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
