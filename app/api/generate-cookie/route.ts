import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const imageUrl = `data:${image.type};base64,${base64}`

    // Step 1: GPT-4o generates SVG from image
    const { text: svgResult } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `この画像を分析して、クッキー型として使えるSVGパスを生成してください。以下の要件に従ってください：

要件:
1. シンプルで切り抜きやすい形状にする
2. 細かすぎる詳細は省略する
3. クッキー型として実用的なサイズ（100x100mm程度）
4. SVGのpathタグのみを出力する
5. viewBox="0 0 100 100"で統一する
6. 形状は閉じたパスにする

出力形式:
\`\`\`svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="..." fill="none" stroke="black" stroke-width="1"/>
</svg>
\`\`\`

分析内容も含めて回答してください。`,
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
    })

    // Extract SVG from the response
    const svgMatch = svgResult.match(/```svg\n([\s\S]*?)\n```/)
    const svgContent = svgMatch ? svgMatch[1] : null

    if (!svgContent) {
      return Response.json(
        {
          error: "Failed to generate SVG",
          message: "SVGの生成に失敗しました。画像を確認してもう一度お試しください。",
          analysis: svgResult,
        },
        { status: 400 },
      )
    }

    // Step 2: Call MCP service to convert SVG to STL
    // This would be replaced with actual MCP integration
    const mcpResponse = await callMCPService(svgContent)

    return Response.json({
      success: true,
      message: "クッキー型が完成しました！🍪",
      analysis: svgResult,
      svgContent: svgContent,
      stlUrl: mcpResponse.stlUrl,
      stlSize: mcpResponse.stlSize,
      processingTime: mcpResponse.processingTime,
    })
  } catch (error) {
    console.error("Error generating cookie cutter:", error)
    return Response.json(
      {
        error: "Failed to generate cookie cutter",
        message: "クッキー型の生成に失敗しました。もう一度お試しください。",
      },
      { status: 500 },
    )
  }
}

// Mock MCP service call - replace with actual MCP integration
async function callMCPService(svgContent: string) {
  // Simulate MCP processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock response - in real implementation, this would call MCP
  return {
    stlUrl: `/api/download/cookie-${Date.now()}.stl`,
    stlSize: "2.3 MB",
    processingTime: "2.1s",
  }
}
