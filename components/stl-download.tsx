"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Printer, FileText } from "lucide-react"

interface STLDownloadProps {
  stlUrl: string
  stlSize?: string
  processingTime?: string
}

export default function STLDownload({ stlUrl, stlSize, processingTime }: STLDownloadProps) {
  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = stlUrl
    a.download = stlUrl.split("/").pop() || "cookie-cutter.stl"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-purple-800 flex items-center gap-2">🏗️ STLファイル</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="h-4 w-4" />
            <span>3Dプリント用ファイル</span>
          </div>
          {stlSize && <span className="text-purple-600 font-medium">{stlSize}</span>}
        </div>

        {processingTime && <div className="text-xs text-gray-500">処理時間: {processingTime}</div>}

        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white" size="sm">
            <Download className="h-4 w-4 mr-1" />
            STLダウンロード
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 このSTLファイルは3Dプリンターで直接印刷できます
        </div>
      </CardContent>
    </Card>
  )
}
