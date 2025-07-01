import { type NextRequest, NextResponse } from "next/server";
import { Agent, Runner } from "@openai/agents";
import { z } from "zod";
import { sanitizeSvg } from "@/lib/utils";

const instructions = `
あなたはSVGを修正するAIエージェントです。ユーザーから提供されたSVG、元の分析、および修正指示に基づいて、SVGを更新してください。以下の要件に従ってください：
1. ユーザーの指示を正確に反映してください。
2. 大きさはクッキー型として適切なサイズに調整してください。
3. SVGコードは、クッキー型の輪郭を表すパスのみを含めてください。
4. viewBoxは0 0 100 100に設定してください。
`;

const svgModifierAgent = new Agent({
  name: "svg-modifier-agent",
  model: "gpt-4o",
  instructions,
  outputType: z.object({
    svgContent: z.string().describe("修正されたSVGコード"),
  }),
});



export async function POST(request: NextRequest) {
  try {
    const { svgContent, userRequest } = await request.json();

    if (!svgContent || !userRequest) {
      return NextResponse.json(
        { success: false, message: "SVGコンテンツまたは修正指示が見つかりません" },
        { status: 400 }
      );
    }

    const runner = new Runner();

    const result = await runner.run(svgModifierAgent, [
      {
        status: "in_progress",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: svgContent,
          }
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: userRequest,
          }
        ]
      },
    ]);

    if (!result.finalOutput) {
      return NextResponse.json(
        { success: false, message: "エージェントの出力が取得できませんでした" },
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
      { success: false, message: "エージェント処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
