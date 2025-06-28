import { type NextRequest, NextResponse } from "next/server";
import { Agent, Runner } from "@openai/agents";
import { z } from "zod";
import { sanitizeSvg } from "@/lib/utils";

const instructions = `
あなたはSVGを修正するAIエージェントです。ユーザーから提供されたSVG、元の分析、および修正指示に基づいて、SVGを更新してください。以下の要件に従ってください：
1. ユーザーの指示を正確に反映してください。
2. クッキー型として実用的な形状を維持してください。
3. SVGコードのみを出力してください（説明文は不要です）。
4. viewBox="0 0 100 100" を維持してください。
5. strokeとfillを適切に設定してください。
6. SVGの構造を保ちつつ、ユーザーの要求に応じて形状や色を変更してください。
7. 改行やエスケープ文字は不要です。
`;

const svgModifierAgent = new Agent({
  name: "svg-modifier-agent",
  model: "gpt-4o",
  instructions,
  outputType: z.object({
    svgContent: z.string().describe("修正されたSVGコード"),
  }),
});

const createModificationPrompt = (
  svgContent: string,
  userRequest: string,
  originalAnalysis: string
) => `以下のSVGを、ユーザーの修正指示に従って修正してください：

現在のSVG:
${svgContent}

元の分析:
${originalAnalysis}

ユーザーの修正指示:
${userRequest}`;



export async function POST(request: NextRequest) {
  try {
    const { svgContent, userRequest, originalAnalysis } = await request.json();

    if (!svgContent || !userRequest) {
      return NextResponse.json(
        { success: false, message: "SVGコンテンツまたは修正指示が見つかりません" },
        { status: 400 }
      );
    }

    const runner = new Runner();

    const result = await runner.run(svgModifierAgent, [
      {
        role: "user",
        content: createModificationPrompt(
          svgContent,
          userRequest,
          originalAnalysis
        ),
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
      stage: "svg_modified",
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { success: false, message: "エージェント処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
