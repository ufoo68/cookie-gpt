import { type NextRequest, NextResponse } from "next/server";
import { Agent, Runner } from "@openai/agents";
import { z } from "zod";
import { sanitizeSvg } from "@/lib/utils";

const instructions = `
あなたはクッキー型のSVGを生成するAIエージェントです。ユーザーから送られたリクエストを分析し、以下の要件に従ってください：
1. 大きさはクッキー型として適切なサイズ（例：直径5cm程度）に調整してください。
2. SVGコードは、クッキー型の輪郭を表すパスのみを含めてください。
3. viewBoxは0 0 100 100 とし、幅と高さは50mmに設定してください。
`;

const cookieCutterAgent = new Agent({
  name: "cookie-cutter-agent",
  model: "gpt-4o",
  instructions,
  outputType: z.object({
    analysis: z.string().describe("画像の分析結果テキスト"),
    svgContent: z.string().describe("生成されたクッキー型のSVGコード"),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, message: "無効なプロンプトです" },
        { status: 400 }
      );
    }

    const runner = new Runner();

    const result = await runner.run(cookieCutterAgent, [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: prompt,
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
      analysis: result.finalOutput.analysis,
      svgContent: sanitizedSvg,
      stage: "svg_generated",
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
