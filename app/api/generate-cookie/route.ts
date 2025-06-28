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

    // Use OpenAI Agents SDK to analyze the image and generate 3D model instructions
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この画像を分析して、クッキー型の3Dモデルに変換するための詳細な説明を生成してください。形状、色、テクスチャ、サイズなどの特徴を含めてください。",
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
    })

    // Simulate 3D model generation (in a real implementation, you would use the analysis to generate an actual 3D model)
    const mockModelUrl = "/placeholder-cookie.glb"

    return Response.json({
      success: true,
      modelUrl: mockModelUrl,
      message: "クッキー型3Dモデルが完成しました！🍪",
      analysis: text,
    })
  } catch (error) {
    console.error("Error generating 3D cookie:", error)
    return Response.json(
      {
        error: "Failed to generate 3D cookie model",
        message: "クッキー生成に失敗しました。もう一度お試しください。",
      },
      { status: 500 },
    )
  }
}
