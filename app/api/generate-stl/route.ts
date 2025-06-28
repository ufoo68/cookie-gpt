import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { svgContent } = await request.json()

    if (!svgContent) {
      return NextResponse.json({ success: false, message: "SVGコンテンツが見つかりません" }, { status: 400 })
    }

    // Simulate MCP STL conversion with processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const stlUrl = `/api/download/cookie-${Date.now()}.stl`
    const stlSize = "2.3 MB"
    const processingTime = "2.1秒"

    return NextResponse.json({
      success: true,
      stlUrl,
      stlSize,
      processingTime,
      stage: "stl_generated",
    })
  } catch (error) {
    console.error("Error generating STL:", error)
    return NextResponse.json(
      {
        success: false,
        message: "STLファイルの生成中にエラーが発生しました",
      },
      { status: 500 },
    )
  }
}
