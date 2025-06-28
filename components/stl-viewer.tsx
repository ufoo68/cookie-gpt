"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface STLViewerProps {
  stlContent: string
}

export default function STLViewer({ stlContent }: STLViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-purple-800 flex items-center gap-2">🏗️ STLプレビュー</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-center min-h-[120px] bg-gray-50 rounded border">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">🏗️</div>
              <p className="text-sm">STL 3Dモデル</p>
              <p className="text-xs text-gray-500">3Dプリンター対応</p>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-2">STLデータ（先頭100文字）:</div>
            <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto max-h-40">
              <code>{stlContent.substring(0, 100)}...</code>
            </pre>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">3Dプリンター用STLファイルです</div>
      </CardContent>
    </Card>
  )
}
