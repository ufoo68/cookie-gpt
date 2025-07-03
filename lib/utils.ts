import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { deserialize } from "@jscad/svg-deserializer";
import { serialize } from "@jscad/stl-serializer";
import * as modeling from "@jscad/modeling";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeSvg(rawSvg: string): string {
  // AI might wrap the SVG in markdown code blocks, so remove them.
  let svg = rawSvg.replace(/```svg\n?|\n?```/g, "").trim();

  // It might also return a JSON-encoded string with escaped quotes.
  // A simple replacement is the most robust way to handle this.
  svg = svg.replace(/\\"/g, '"').replace(/\\'/g, "'");

  // It might also be wrapped in a single pair of quotes.
  if ((svg.startsWith('"') && svg.endsWith('"')) || (svg.startsWith("'") && svg.endsWith("'"))) {
    svg = svg.substring(1, svg.length - 1);
  }

  // Remove style attribute from the root <svg> tag
  svg = svg.replace(/<svg([^>]*)style=["'][^"']*["']([^>]*)>/, '<svg$1$2>');

  return svg;
}

const COOKIE_SIZE = 50; // クッキー型のサイズ
const COOKIE_HEIGHT = 15; // クッキー型の高さ
const COOKIE_THICKNESS = 2; // クッキー型の厚み

const extrudeLinear = modeling.extrusions.extrudeLinear;
const offset = modeling.expansions.offset;
const subtract = modeling.booleans.subtract;
const union = modeling.booleans.union;
const measurements = modeling.measurements;
const transforms = modeling.transforms;

function isValidGeom3(shape: modeling.geometries.geom3.Geom3): shape is modeling.geometries.geom3.Geom3 {
  return modeling.geometries.geom3.isA(shape) &&
         Array.isArray(shape.polygons) &&
         shape.polygons.length > 0 &&
         shape.polygons.every(p => p.vertices.length >= 3);
};

export function convertStl(svgContent: string): string {
  // SVG → 2Dジオメトリ（黒塗り部分）
  const shapes: modeling.geometries.path2.Path2[] = deserialize({ output: "geometry" },  svgContent);
  const extruded = 
    shapes
      .filter((shape) => shape.isClosed)
      .map((shape) => {
        // SVGパスをクッキー型のサイズにスケーリング
        const bbox = measurements.measureBoundingBox(shape);
        const sizeX = bbox[1][0] - bbox[0][0];
        const sizeY = bbox[1][1] - bbox[0][1];
        const currentMax = Math.max(sizeX, sizeY);
        const ratio = COOKIE_SIZE / currentMax;
        const scaledShape = transforms.scale(
          [ratio, ratio, 1],
          shape
        );
        // スケーリング後の形状を押し出し
        return subtract(
          union(
            extrudeLinear({ height: COOKIE_HEIGHT }, offset({ delta: COOKIE_THICKNESS }, scaledShape)),
            extrudeLinear({ height: COOKIE_THICKNESS }, offset({ delta: COOKIE_THICKNESS * 2 }, scaledShape))
          ),
          extrudeLinear({ height: COOKIE_HEIGHT }, scaledShape));
      });
  if (extruded.length === 0) {
    throw new Error("No valid shapes found in the SVG content.");
  }
  const validExtruded = extruded.filter(isValidGeom3);
  if (validExtruded.length === 0) {
    throw new Error("No valid extruded shapes found.");
  }
  const stlArray = serialize({ binary: false }, validExtruded);
  return stlArray[0];
}
