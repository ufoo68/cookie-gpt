import { NextRequest, NextResponse } from "next/server";
import { deserialize } from "@jscad/svg-deserializer";
import { serialize } from "@jscad/stl-serializer";
import * as modeling from "@jscad/modeling";

const COOKIE_SIZE = 70; // クッキー型のサイズ(直径)を70mmに設定

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

export async function POST(request: NextRequest) {
  try {
    const { svgContent } = await request.json();

    if (!svgContent || typeof svgContent !== "string") {
      return NextResponse.json(
        { success: false, message: "SVGコンテンツが無効です" },
        { status: 400 }
      );
    }

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
              extrudeLinear({ height: 15 }, offset({ delta: 2 }, scaledShape)),
              extrudeLinear({ height: 2 }, offset({ delta: 4 }, scaledShape))
            ),
            extrudeLinear({ height: 15 }, scaledShape));
        });
    if (extruded.length === 0) {
      return NextResponse.json(
        { success: false, message: "有効なSVGパスが見つかりません" },
        { status: 400 }
      );
    }
    // 3Dジオメトリの検証
    const validExtruded = extruded.filter(isValidGeom3);
    if (validExtruded.length === 0) {
      return NextResponse.json(
        { success: false, message: "有効な3Dジオメトリが見つかりません" },
        { status: 400 }
      );
    }
    // STLをASCII形式で生成
    const stlArray = serialize({ binary: false }, validExtruded);
    const stlContent = stlArray[0];

    return NextResponse.json({
      success: true,
      stlContent,
    });
  } catch (error) {
    console.error("STL生成エラー:", error);
    return NextResponse.json(
      { success: false, message: "STL生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
