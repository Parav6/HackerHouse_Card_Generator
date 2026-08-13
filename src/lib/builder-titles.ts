const ADJECTIVES = [
  "Goa",
  "Anjuna",
  "Calangute",
  "Palolem",
  "Vagator",
  "Susegad",
  "Tropical",
  "Coconut",
  "Surf",
  "Fenny-Fueled",
  "Beachside",
  "Shack",
  "Cashew",
  "Monsoon",
  "Bebinca-Loving",
];

const ROUNS: Record<string, string[]> = {
  Frontend: ["Pixel Painter", "DOM Dominator", "CSS Crusader", "UI Alchemist", "React Runner"],
  Backend: ["API Architect", "Database Deity", "Gopher Gladiator", "Server Sorcerer", "Rust Wrangler"],
  Fullstack: ["End-to-End Evangelist", "Stack Sovereign", "Goa Guru", "Code Commando", "Framework Wizard"],
  "AI/ML": ["Model Magician", "Prompt Prophet", "Tensor Titan", "Neural Ninja", "GPU Gladiator"],
  Mobile: ["App Ambassador", "Flutter Flyer", "Swift Sailor", "Viewport Voyager", "Touchscreen Techie"],
  Blockchain: ["Solidity Sage", "Web3 Warrior", "Gas Gladiator", "Chain Commander", "Rust Rover"],
  Design: ["Figma Fanatic", "Aesthetic Anchor", "Creative Cruiser", "Layout Legend", "Vector King"],
  "Product Manager": ["Backlog Boss", "Roadmap Ranger", "Feature Finder", "Sprint Sherpa", "Scope Scout"],
  Founder: ["Pitch Pilot", "Hustle Hero", "Equity Explorer", "Goa Gladiator", "Venture Viking"],
};

export function generateBuilderTitle(role: string, stack: string): string {
  // Try to find matching nouns for the role, else use a generic list
  const nouns = ROUNS[role] || ["Builder", "Hacker", "Architect", "Developer", "Creator"];

  // Select random elements
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  // For specific custom combos
  if (role === "Blockchain" && (stack.toLowerCase() === "solidity" || stack.toLowerCase() === "rust")) {
    return `${adjective} Smart-Contract Sorcerer`;
  }
  if (role === "AI/ML" && stack.toLowerCase() === "python") {
    return `${adjective} Intelligence Oracle`;
  }
  if (role === "Backend" && stack.toLowerCase() === "go") {
    return `${adjective} Gopher Gladiator`;
  }
  if (role === "Frontend" && stack.toLowerCase() === "react") {
    return `${adjective} React Architect`;
  }

  return `${adjective} ${stack} ${noun}`;
}
