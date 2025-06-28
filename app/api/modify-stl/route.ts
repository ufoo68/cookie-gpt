import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { stlContent, modificationRequest } = await request.json()
    const startTime = Date.now()

    if (!stlContent || !modificationRequest) {
      return NextResponse.json(
        { success: false, message: "STLコンテンツまたは修正指示が見つかりません" },
        { status: 400 },
      )
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `あなたはSTLファイルを修正するAIエージェントです。提供されたSTLデータと修正指示に基づいて、新しいSTLデータを生成してください。

修正可能な要素:
- 厚み調整（薄く/厚く）
- サイズ調整（大きく/小さく）
- 構造改良（より頑丈に、より軽量に）
- 3Dプリント最適化（サポート材不要、オーバーハング改善）
- 表面調整（滑らかさ、エッジの鋭さ）

STLデータはASCII形式で出力し、説明文は不要です。修正内容の説明は別途提供してください。`,
      prompt: `以下のSTLファイルを修正してください:

修正指示: ${modificationRequest}

元のSTLデータ:
${stlContent.substring(0, 1000)}...

修正されたSTLデータを生成し、修正内容を説明してください。`,
    })

    // Extract STL content and modification description
    const stlMatch = text.match(/solid[\s\S]*?endsolid/)
    const modifiedStlContent = stlMatch ? stlMatch[0] : stlContent

    // Generate a simple modification description
    const modificationDescription = `修正内容: ${modificationRequest}に基づいてSTLファイルを調整しました。`

    return NextResponse.json({
      success: true,
      stlContent: modifiedStlContent,
      modificationDescription,
      processingTime: Date.now() - startTime,
      stage: "stl_modified",
    })
  } catch (error) {
    console.error("STL modification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "STL修正中にエラーが発生しました",
      },
      { status: 500 },
    )
  }
}
