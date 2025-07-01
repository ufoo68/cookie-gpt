"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Clock } from "lucide-react"

interface STLDownloadProps {
  stlContent: string
  stlSize?: string
  processingTime?: string
}

export function StlDownload({ stlContent, stlSize, processingTime }: STLDownloadProps) {
  const handleDownload = () => {
    const blob = new Blob([stlContent], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cookie.stl"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Clean up the object URL
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-sm text-green-800 flex items-center gap-2">🎉 STLファイル生成完了！</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="h-4 w-4" />
            <span>ファイルサイズ:</span>
          </div>
          <span className="font-medium">{stlSize || "不明"}</span>
        </div>

        {processingTime && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>処理時間:</span>
            </div>
            <span className="font-medium">{processingTime}</span>
          </div>
        )}

        <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          STLファイルをダウンロード
        </Button>

        <div className="text-xs text-gray-500 text-center">3Dプリンターで印刷可能なSTLファイルです</div>
      </CardContent>
    </Card>
  )
}
