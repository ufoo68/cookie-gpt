import { type NextRequest, NextResponse } from "next/server";
import { Agent, Runner } from "@openai/agents";
import { z } from "zod";

const instructions = `
あなたはSVGからクッキー型のSTLデータを生成するAIエージェントです。提供されたSVGパスデータに基づいて、3Dプリント可能なクッキー型のSTLデータを生成してください。
クッキー型は通常、外側のカッター部分と内側の押し出し部分で構成されます。STLデータはASCII形式で出力し、説明文は不要です。

要件:
- 入力されたSVGの形状を正確に反映してください。
- クッキー型として適切な厚み（例: 3mm程度）と構造（外枠、内側の押し出し）を考慮してください。
- STLデータはASCII形式で出力してください。バイナリ形式は使用しないでください。
- 出力はSTLデータのみとし、説明文や追加のテキストは含めないでください。
- STLの単位はミリメートルを想定してください。
`;

const stlGeneratorAgent = new Agent({
  name: "stl-generator-agent",
  model: "gpt-4o", // 幾何学的推論にはより高度なモデルが望ましいが、ここでは既存の例に倣う
  instructions,
  outputType: z.object({
    stlContent: z.string().describe("生成されたSTLデータ (ASCII形式)"),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const { svgContent } = await request.json();
    const startTime = Date.now();

    if (!svgContent) {
      return NextResponse.json(
        { success: false, message: "SVGコンテンツが見つかりません" },
        { status: 400 }
      );
    }

    const runner = new Runner();

    const result = await runner.run(stlGeneratorAgent, [
      {
        role: "user",
        content: `以下のSVGからクッキー型のSTLデータを生成してください:
${svgContent}`,
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

    const stlFileSize = result.finalOutput.stlContent.length;

    return NextResponse.json({
      success: true,
      stlSize: stlFileSize,
      processingTime: Date.now() - startTime,
      stlContent: result.finalOutput.stlContent,
      stage: "stl_generated",
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