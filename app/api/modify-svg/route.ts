import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { svgContent, userRequest, originalAnalysis } = await request.json()

    if (!svgContent || !userRequest) {
      return NextResponse.json(
        { success: false, message: "SVGコンテンツまたは修正指示が見つかりません" },
        { status: 400 },
      )
    }

    // Modify SVG based on user request
    const { text: modifiedSvg } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: `以下のSVGを、ユーザーの修正指示に従って修正してください：

現在のSVG:
${svgContent}

元の分析:
${originalAnalysis}

ユーザーの修正指示:
${userRequest}

要件：
- ユーザーの指示を正確に反映
- クッキー型として実用的な形状を維持
- SVGコードのみを出力（説明文は不要）
- viewBox="0 0 100 100"を維持
- strokeとfillを適切に設定`,
        },
      ],
    })

    return NextResponse.json({
      success: true,
      svgContent: modifiedSvg.replace(/```svg\n?|\n?```/g, "").trim(),
      stage: "svg_modified",
    })
  } catch (error) {
    console.error("Error modifying SVG:", error)
    return NextResponse.json(
      {
        success: false,
        message: "SVGの修正中にエラーが発生しました",
      },
      { status: 500 },
    )
  }
}
