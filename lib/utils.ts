import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeSvg(rawSvg: string): string {
  // AI might wrap the SVG in markdown code blocks, so remove them.
  let svg = rawSvg.replace(/```svg\n?|\n?```/g, "").trim();

  // It might also return a JSON-encoded string with escaped quotes.
  // A simple replacement is the most robust way to handle this.
  svg = svg.replace(/\\"/g, '"');

  // It might also be wrapped in a single pair of quotes.
  if ((svg.startsWith('"') && svg.endsWith('"')) || (svg.startsWith("'") && svg.endsWith("'"))) {
    svg = svg.substring(1, svg.length - 1);
  }

  return svg;
}
