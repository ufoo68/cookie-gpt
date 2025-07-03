import { type NextRequest, NextResponse } from "next/server";
import { Agent, Runner, tool } from "@openai/agents";
import { z } from "zod";
import { sanitizeSvg, convertStl } from "@/lib/utils"; // Assuming this is the path to your convertStl function

const instructions = `
## 概要

あなたはクッキー型のSVGとSTLを生成するAIエージェントです。

## SVG生成の要件

ユーザーから送られたリクエストを分析し、以下の要件に従ってください：
1. 大きさはクッキー型として適切なサイズに調整してください。
2. SVGコードは、クッキー型の輪郭を表すパスのみを含めてください。
3. viewBoxは0 0 100 100で設定してください。

## STL変換の要件

ユーザーリクエストから生成したSVGをconvert-stlツールを使用してSTL形式に変換してください。

## 変更の要求

ユーザーがSVGに対して変更を要求した場合、以下の手順に従ってください：
1. 変更内容を理解し、必要なSVGの修正を行います。
2. 修正後のSVGコードを生成し、svgContentとして返します。
3. convert-stlツールを使用して、修正後のSVGをSTL形式に変換し、stlContentとして返します。
`;

const convertStlCookieCutter = tool({
  name: 'convert-stl',
  description: 'SVGのクッキー型をSTLに変換します。',
  parameters: z.object({ svgContent: z.string() }) as any,
  async execute({ svgContent }) {
    return convertStl(svgContent);
  },
});

const cookieCutterAgent = new Agent({
  name: "cookie-cutter-agent",
  model: "gpt-4.1-nano",
  modelSettings: {
    toolChoice: "required",
  },
  instructions,
  tools: [convertStlCookieCutter],
  outputType: z.object({
    answer: z.string().describe("ユーザーのリクエストに対する回答"),
    svgContent: z.string().describe("生成されたクッキー型のSVGコード"),
    stlContent: z.string().describe("生成されたクッキー型のSTLコード"),
  }) as any,
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
      answer: result.finalOutput.answer,
      svgContent: sanitizedSvg,
      stlContent: result.finalOutput.stlContent,
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
