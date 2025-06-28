import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params

    // In a real implementation, you would:
    // 1. Validate the filename
    // 2. Check if the file exists
    // 3. Return the actual file content

    // For demo purposes, we'll generate a simple STL file content
    if (filename.endsWith(".stl")) {
      // Simple STL file header (binary format simulation)
      const stlContent = generateMockSTL()

      return new NextResponse(stlContent, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": stlContent.length.toString(),
        },
      })
    }

    if (filename.endsWith(".svg")) {
      // Return SVG content
      const svgContent = generateMockSVG()

      return new NextResponse(svgContent, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    }

    return NextResponse.json({ success: false, message: "ファイルが見つかりません" }, { status: 404 })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json(
      { success: false, message: "ファイルのダウンロード中にエラーが発生しました" },
      { status: 500 },
    )
  }
}

function generateMockSTL(): string {
  // Generate a simple STL file content for a cookie shape
  // This is a simplified version - in reality, you'd convert the SVG to 3D geometry
  const stlHeader = "solid cookie\n"
  const stlFooter = "endsolid cookie\n"

  // Simple triangular faces for a basic cookie shape
  let triangles = ""
  const radius = 20
  const height = 3
  const segments = 16

  // Generate triangles for top and bottom faces
  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2
    const angle2 = ((i + 1) / segments) * Math.PI * 2

    const x1 = Math.cos(angle1) * radius
    const y1 = Math.sin(angle1) * radius
    const x2 = Math.cos(angle2) * radius
    const y2 = Math.sin(angle2) * radius

    // Top face triangle
    triangles += `  facet normal 0.0 0.0 1.0\n`
    triangles += `    outer loop\n`
    triangles += `      vertex 0.0 0.0 ${height}\n`
    triangles += `      vertex ${x1} ${y1} ${height}\n`
    triangles += `      vertex ${x2} ${y2} ${height}\n`
    triangles += `    endloop\n`
    triangles += `  endfacet\n`

    // Bottom face triangle
    triangles += `  facet normal 0.0 0.0 -1.0\n`
    triangles += `    outer loop\n`
    triangles += `      vertex 0.0 0.0 0.0\n`
    triangles += `      vertex ${x2} ${y2} 0.0\n`
    triangles += `      vertex ${x1} ${y1} 0.0\n`
    triangles += `    endloop\n`
    triangles += `  endfacet\n`
  }

  return stlHeader + triangles + stlFooter
}

function generateMockSVG(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#D2691E" stroke="#8B4513" stroke-width="2"/>
  <circle cx="35" cy="35" r="3" fill="#3C1810"/>
  <circle cx="65" cy="35" r="3" fill="#3C1810"/>
  <circle cx="50" cy="60" r="3" fill="#3C1810"/>
  <circle cx="30" cy="65" r="2" fill="#3C1810"/>
  <circle cx="70" cy="65" r="2" fill="#3C1810"/>
</svg>`
}
