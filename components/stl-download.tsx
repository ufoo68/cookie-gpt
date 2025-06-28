"use client"

import { Download, FileDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface STLDownloadProps {
  stlUrl: string
  stlSize: string
  processingTime: string
}

export default function STLDownload({ stlUrl, stlSize, processingTime }: STLDownloadProps) {
  const downloadSTL = async () => {
    try {
      const response = await fetch(stlUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cookie-cutter-${Date.now()}.stl`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("ダウンロードに失敗しました。もう一度お試しください。")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-amber-900">🖨️ 3Dプリンター用STLファイル</h4>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {stlSize}
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {processingTime}
          </Badge>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <FileDown className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h5 className="font-medium text-blue-900 mb-2">STLファイルの準備完了！</h5>
            <p className="text-sm text-blue-800 mb-3">
              MCPサービスによってSVGから3Dクッキー型が生成されました。 3Dプリンターで印刷してご利用ください。
            </p>
            <div className="flex items-center gap-2">
              <Button onClick={downloadSTL} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                STLファイルをダウンロード
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">3Dプリンター設定推奨値:</p>
            <ul className="space-y-0.5">
              <li>• レイヤー高: 0.2mm</li>
              <li>• インフィル: 20%</li>
              <li>• サポート: 不要</li>
              <li>• 材質: PLA推奨</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
