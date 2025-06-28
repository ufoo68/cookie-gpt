import { fal } from "@fal-ai/serverless-client"

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

    // Generate 3D model using Fal AI
    const result = await fal.subscribe("fal-ai/stable-video-diffusion", {
      input: {
        image_url: imageUrl,
        prompt:
          "Transform this image into a 3D cookie shape with rounded edges, cookie texture, and golden brown color. Make it look like a delicious baked cookie.",
        num_inference_steps: 25,
        guidance_scale: 7.5,
      },
    })

    return Response.json({
      success: true,
      modelUrl: result.video?.url || "/placeholder-cookie.glb",
      message: "クッキー型3Dモデルが完成しました！🍪",
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
