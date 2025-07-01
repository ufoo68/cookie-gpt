import { NextRequest, NextResponse } from "next/server";
import { deserialize } from "@jscad/svg-deserializer";
import { serialize } from "@jscad/stl-serializer";
import * as modeling from "@jscad/modeling";

const extrudeLinear = modeling.extrusions.extrudeLinear;
const offset = modeling.expansions.offset;
const subtract = modeling.booleans.subtract;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

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
          const inner = extrudeLinear({ height: 10 }, shape);
          const outer = extrudeLinear({ height: 10 }, offset({ delta: 1 }, shape));
          return subtract(outer, inner);
        });
    if (extruded.length === 0) {
      return NextResponse.json(
        { success: false, message: "有効なSVGパスが見つかりません" },
        { status: 400 }
      );
    }

    // STLをASCII形式で生成
    const stlArray = serialize({ binary: false }, extruded);
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
