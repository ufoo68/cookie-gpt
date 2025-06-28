import { type NextRequest, NextResponse } from "next/server";
import { Agent, Runner } from "@openai/agents";
import { z } from "zod";
import { sanitizeSvg } from "@/lib/utils";

const instructions = `
あなたはクッキー型を生成するAIエージェントです。ユーザーから送られた画像を分析し、クッキー型として適した形状を特
定してSVGを生成してください。以下の要件に従ってください：
1. 画像を分析し、主要な形状、色、特徴を詳しく説明してください。
2. クッキー型として最適化するための提案を行ってください。
3. SVGコードを生成する際は、以下の要件を守ってください：
   - シンプルで明確な輪郭
   - クッキー型として実用的
   - 3Dプリント可能な形状
   - SVGコードのみを出力（説明文は不要）
   - viewBox="0 0 100 100"を使用
   - strokeとfillを適切に設定
   - SVGの構造を保ちつつ、クッキー型としての実用性を維持
   - 改行やエスケープ文字は不要
`;

// ✅ Agent クラスと合わせて使う
const cookieCutterAgent = new Agent({
  name: "cookie-cutter-agent",
  model: "gpt-4o",
  instructions,
  outputType: z.object({
    analysis: z.string().describe("画像の分析結果テキスト"),
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
            type: "input_text",
            text: "この画像を分析して、クッキー型として適した形状を特定してください。主要な形状、色、特徴を詳しく説明し、クッキー型として最適化するための提案をしてください。",
          },
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
