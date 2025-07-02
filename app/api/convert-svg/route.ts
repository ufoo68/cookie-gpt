import { type NextRequest, NextResponse } from "next/server";
import { Agent, Runner } from "@openai/agents";
import { z } from "zod";
import { sanitizeSvg } from "@/lib/utils";

const instructions = `
あなたはクッキー型を生成するAIエージェントです。ユーザーから送られた画像を分析し、以下の要件に従ってください：
1. 画像を分析し、主要な形状、色、特徴を詳しく説明してください。
2. 大きさはクッキー型として適切なサイズに調整してください。
3. SVGコードは、クッキー型の輪郭を表すパスのみを含めてください。
4. viewBoxは0 0 100 100に設定してください。
`;

// ✅ Agent クラスと合わせて使う
const cookieCutterAgent = new Agent({
  name: "cookie-cutter-agent",
  model: "gpt-4o",
  instructions,
  outputType: z.object({
    svgContent: z.string().describe("生成されたクッキー型のSVGコード"),
  }),
});

// ✅ APIルート
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "画像ファイルが見つかりません" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const runner = new Runner();

    const result = await runner.run(cookieCutterAgent, [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image: dataUrl,
          },
        ],
      },
    ]);

    if (!result.finalOutput) {
      return NextResponse.json(
        {
          success: false,
          message: "エージェントの出力が取得できませんでした",
        },
        { status: 500 }
      );
    }

    const sanitizedSvg = sanitizeSvg(result.finalOutput.svgContent);

    return NextResponse.json({
      success: true,
      svgContent: sanitizedSvg,
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "エージェント処理中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
