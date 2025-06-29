import { type NextRequest, NextResponse } from "next/server";
import { Agent, Runner } from "@openai/agents";
import { z } from "zod";

const instructions = `
あなたはSTLデータを修正するAIエージェントです。提供されたSTLデータとユーザーの修正指示に基づいて、STLデータを更新してください。
STLデータはASCII形式で出力し、説明文は不要です。

要件:
- 入力されたSTLデータとユーザーの指示を正確に反映してください。
- クッキー型として適切な構造を維持してください。
- STLデータはASCII形式で出力してください。バイナリ形式は使用しないでください。
- 出力はSTLデータのみとし、説明文や追加のテキストは含めないでください。
- STLの単位はミリメートルを想定してください。
`;

const stlModifierAgent = new Agent({
  name: "stl-modifier-agent",
  model: "gpt-4o", // 幾何学的推論にはより高度なモデルが望ましい
  instructions,
  outputType: z.object({
    modificationDescription: z.string().describe("ユーザーの修正指示に基づくSTLデータの変更内容"),
    stlContent: z.string().describe("修正されたSTLデータ (ASCII形式)"),
  }),
});

const createStlModificationPrompt = (
  stlContent: string,
  userRequest: string
) => `以下のSTLデータを、ユーザーの修正指示に従って修正してください：

現在のSTL:
${stlContent}

ユーザーの修正指示:
${userRequest}`;

export async function POST(request: NextRequest) {
  try {
    const { stlContent, userRequest } = await request.json();
    const startTime = Date.now();

    if (!stlContent || !userRequest) {
      return NextResponse.json(
        { success: false, message: "STLコンテンツまたは修正指示が見つかりません" },
        { status: 400 }
      );
    }

    const runner = new Runner();

    const result = await runner.run(stlModifierAgent, [
      {
        role: "user",
        content: createStlModificationPrompt(stlContent, userRequest),
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
      modificationDescription: result.finalOutput.modificationDescription,
      processingTime: Date.now() - startTime,
      stlContent: result.finalOutput.stlContent,
      stlSize: stlFileSize,
      stage: "stl_modified",
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
