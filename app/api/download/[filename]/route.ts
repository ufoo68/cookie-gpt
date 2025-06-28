import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const { filename } = params

  // Simulate STL file generation
  const stlContent = `solid cookie_cutter
  facet normal 0.0 0.0 1.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 1.0 0.0 0.0
      vertex 0.5 1.0 0.0
    endloop
  endfacet
  facet normal 0.0 0.0 -1.0
    outer loop
      vertex 0.0 0.0 2.0
      vertex 0.5 1.0 2.0
      vertex 1.0 0.0 2.0
    endloop
  endfacet
endsolid cookie_cutter`

  return new NextResponse(stlContent, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
