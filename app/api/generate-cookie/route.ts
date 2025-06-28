import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ success: false, message: "画像ファイルが見つかりません" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Analyze image with GPT-4o
    const { text: analysis } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この画像を分析して、クッキー型として適した形状を特定してください。主要な形状、色、特徴を詳しく説明し、クッキー型として最適化するための提案をしてください。",
            },
            {
              type: "image",
              image: dataUrl,
            },
          ],
        },
      ],
    })

    // Generate SVG based on analysis
    const { text: svgContent } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: `以下の画像分析結果に基づいて、クッキー型用のSVGファイルを生成してください：

${analysis}

要件：
- シンプルで明確な輪郭
- クッキー型として実用的
- 3Dプリント可能な形状
- SVGコードのみを出力（説明文は不要）
- viewBox="0 0 100 100"を使用
- strokeとfillを適切に設定`,
        },
      ],
    })

    // SVGのみを返す（STLは後で生成）
    return NextResponse.json({
      success: true,
      analysis,
      svgContent: svgContent.replace(/```svg\n?|\n?```/g, "").trim(),
      stage: "svg_generated", // 段階を示すフラグ
    })
  } catch (error) {
    console.error("Error generating SVG:", error)
    return NextResponse.json(
      {
        success: false,
        message: "SVGの生成中にエラーが発生しました",
        analysis: "エラーが発生したため、分析を完了できませんでした。",
      },
      { status: 500 },
    )
  }
}
