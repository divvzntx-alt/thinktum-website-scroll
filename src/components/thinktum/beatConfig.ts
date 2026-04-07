export interface BeatConfig {
  id: number;
  formation:
    | "planet"
    | "grid"
    | "spheres"
    | "continents"
    | "rain"
    | "trunk"
    | "branches"
    | "tree"
    | "roots"
    | "tunnel"
    | "city";
  headline: string;
  support: string;
  scrollWeight: number;
  chapterType: "arrival" | "transition" | "hybrid";
  textMode: "full" | "headline" | "hidden";
  rail: "world" | "tree" | "network";
  railStart: number;
  railEnd: number;
  cameraMode:
    | "planetArrival"
    | "planetDive"
    | "gridArrival"
    | "gridGather"
    | "spheresArrival"
    | "spheresRise"
    | "continentsArrival"
    | "continentsCollapse"
    | "rainArrival"
    | "trunkRise"
    | "branchesOrbit"
    | "treeArrival"
    | "treeOrbit"
    | "rootsDrop"
    | "tunnelEntry"
    | "tunnelTravel"
    | "cityBurst"
    | "cityArrival";
  counterValue: number;
}

export const TREE_ORBIT_CHAPTER = 12;
export const TUNNEL_TRAVEL_CHAPTER = 15;
export const CITY_ARRIVAL_CHAPTER = 17;

export const beats: BeatConfig[] = [
  {
    id: 0,
    formation: "planet",
    headline: "",
    support: "",
    scrollWeight: 1.6,
    chapterType: "arrival",
    textMode: "hidden",
    rail: "world",
    railStart: 0,
    railEnd: 0.1,
    cameraMode: "planetArrival",
    counterValue: 0,
  },
  {
    id: 1,
    formation: "planet",
    headline: "",
    support: "",
    scrollWeight: 2.7,
    chapterType: "transition",
    textMode: "hidden",
    rail: "world",
    railStart: 0.1,
    railEnd: 0.24,
    cameraMode: "planetDive",
    counterValue: 0,
  },
  {
    id: 2,
    formation: "grid",
    headline: "The industry was built for a different world.",
    support:
      "Rigid. Fixed. Built like buildings — walls, floors, departments that don't talk.",
    scrollWeight: 2.4,
    chapterType: "arrival",
    textMode: "full",
    rail: "world",
    railStart: 0.24,
    railEnd: 0.38,
    cameraMode: "gridArrival",
    counterValue: 1,
  },
  {
    id: 3,
    formation: "grid",
    headline: "",
    support: "",
    scrollWeight: 2.55,
    chapterType: "transition",
    textMode: "hidden",
    rail: "world",
    railStart: 0.38,
    railEnd: 0.5,
    cameraMode: "gridGather",
    counterValue: 1,
  },
  {
    id: 4,
    formation: "spheres",
    headline: "Then everything accelerated.",
    support: "AI. Data. Customer expectations that won't wait.",
    scrollWeight: 1.8,
    chapterType: "arrival",
    textMode: "full",
    rail: "world",
    railStart: 0.5,
    railEnd: 0.6,
    cameraMode: "spheresArrival",
    counterValue: 2,
  },
  {
    id: 5,
    formation: "spheres",
    headline: "",
    support: "",
    scrollWeight: 2.6,
    chapterType: "transition",
    textMode: "hidden",
    rail: "world",
    railStart: 0.6,
    railEnd: 0.74,
    cameraMode: "spheresRise",
    counterValue: 2,
  },
  {
    id: 6,
    formation: "continents",
    headline: "Disconnected systems. Disconnected teams.",
    support: "Fragmented rules. Speed measured in months, not days.",
    scrollWeight: 1.95,
    chapterType: "arrival",
    textMode: "full",
    rail: "world",
    railStart: 0.74,
    railEnd: 0.84,
    cameraMode: "continentsArrival",
    counterValue: 3,
  },
  {
    id: 7,
    formation: "continents",
    headline: "",
    support: "",
    scrollWeight: 2.7,
    chapterType: "transition",
    textMode: "hidden",
    rail: "world",
    railStart: 0.84,
    railEnd: 0.94,
    cameraMode: "continentsCollapse",
    counterValue: 3,
  },
  {
    id: 8,
    formation: "rain",
    headline: "The gap became impossible to ignore.",
    support: "The buildings couldn't move.",
    scrollWeight: 1.9,
    chapterType: "arrival",
    textMode: "full",
    rail: "world",
    railStart: 0.94,
    railEnd: 1,
    cameraMode: "rainArrival",
    counterValue: 4,
  },
  {
    id: 9,
    formation: "trunk",
    headline: "Not built. Grown.",
    support: "Nature solved this problem a long time ago.",
    scrollWeight: 2.15,
    chapterType: "hybrid",
    textMode: "full",
    rail: "tree",
    railStart: 0,
    railEnd: 0.18,
    cameraMode: "trunkRise",
    counterValue: 5,
  },
  {
    id: 10,
    formation: "branches",
    headline: "A system finding its shape.",
    support: "Invisible roots. Modular branches. Grows exactly where it's needed.",
    scrollWeight: 2.3,
    chapterType: "hybrid",
    textMode: "full",
    rail: "tree",
    railStart: 0.18,
    railEnd: 0.4,
    cameraMode: "branchesOrbit",
    counterValue: 6,
  },
  {
    id: 11,
    formation: "tree",
    headline: "LIZ was built for this moment.",
    support:
      "The most resilient infrastructure ever built doesn't look like a machine.",
    scrollWeight: 2.05,
    chapterType: "arrival",
    textMode: "full",
    rail: "tree",
    railStart: 0.4,
    railEnd: 0.56,
    cameraMode: "treeArrival",
    counterValue: 7,
  },
  {
    id: 12,
    formation: "tree",
    headline: "LIZ is built on the same logic.",
    support: "Flow. Assess. Data. Each branch growing where your business needs it.",
    scrollWeight: 3.2,
    chapterType: "arrival",
    textMode: "full",
    rail: "tree",
    railStart: 0.56,
    railEnd: 0.82,
    cameraMode: "treeOrbit",
    counterValue: 8,
  },
  {
    id: 13,
    formation: "roots",
    headline: "Not to replace. To connect.",
    support: "Foundation forming beneath everything you see.",
    scrollWeight: 2.95,
    chapterType: "hybrid",
    textMode: "full",
    rail: "tree",
    railStart: 0.82,
    railEnd: 1,
    cameraMode: "rootsDrop",
    counterValue: 9,
  },
  {
    id: 14,
    formation: "tunnel",
    headline: "",
    support: "",
    scrollWeight: 2.75,
    chapterType: "transition",
    textMode: "hidden",
    rail: "network",
    railStart: 0,
    railEnd: 0.15,
    cameraMode: "tunnelEntry",
    counterValue: 9,
  },
  {
    id: 15,
    formation: "tunnel",
    headline: "You are now inside it.",
    support: "This is what your infrastructure feels like when everything connects.",
    scrollWeight: 4.9,
    chapterType: "arrival",
    textMode: "full",
    rail: "network",
    railStart: 0.15,
    railEnd: 0.68,
    cameraMode: "tunnelTravel",
    counterValue: 10,
  },
  {
    id: 16,
    formation: "city",
    headline: "",
    support: "",
    scrollWeight: 2.9,
    chapterType: "transition",
    textMode: "hidden",
    rail: "network",
    railStart: 0.68,
    railEnd: 0.82,
    cameraMode: "cityBurst",
    counterValue: 10,
  },
  {
    id: 17,
    formation: "city",
    headline: "",
    support: "",
    scrollWeight: 3.6,
    chapterType: "arrival",
    textMode: "hidden",
    rail: "network",
    railStart: 0.82,
    railEnd: 1,
    cameraMode: "cityArrival",
    counterValue: 10,
  },
];

export const TOTAL_BEATS = beats.length;

export interface BeatCard {
  title: string;
  body: string;
  cta: string;
  appearAt: number;
  disappearAt: number;
  side: "left" | "right";
}

export const lizCards: BeatCard[] = [
  {
    title: "liz flow",
    body: "Build any customer journey.\nNo code. No waiting.",
    cta: "Explore Flow ->",
    appearAt: 0.05,
    disappearAt: 0.35,
    side: "left",
  },
  {
    title: "liz assess",
    body: "Hyper-personalised underwriting rules.\nInstant deployment.",
    cta: "Explore Assess ->",
    appearAt: 0.35,
    disappearAt: 0.65,
    side: "right",
  },
  {
    title: "liz data",
    body: "Real-time analytics.\nEvery decision visible.",
    cta: "Explore Data ->",
    appearAt: 0.65,
    disappearAt: 0.95,
    side: "left",
  },
];

export const tunnelCards: BeatCard[] = [
  {
    title: "Insurance Carriers",
    body: "Core infrastructure, reimagined.",
    cta: "Learn more ->",
    appearAt: 0.05,
    disappearAt: 0.2,
    side: "left",
  },
  {
    title: "Insurance Providers",
    body: "Speed to market, finally possible.",
    cta: "Learn more ->",
    appearAt: 0.2,
    disappearAt: 0.35,
    side: "right",
  },
  {
    title: "Distribution Groups",
    body: "Every channel, one system.",
    cta: "Learn more ->",
    appearAt: 0.35,
    disappearAt: 0.5,
    side: "left",
  },
  {
    title: "Insurtechs",
    body: "Built to move fast. LIZ moves with you.",
    cta: "Learn more ->",
    appearAt: 0.5,
    disappearAt: 0.65,
    side: "right",
  },
  {
    title: "Reinsurers",
    body: "Complexity managed. Clarity delivered.",
    cta: "Learn more ->",
    appearAt: 0.65,
    disappearAt: 0.8,
    side: "left",
  },
  {
    title: "All Industries",
    body: "One platform. Every journey.",
    cta: "Learn more ->",
    appearAt: 0.8,
    disappearAt: 0.95,
    side: "right",
  },
];
