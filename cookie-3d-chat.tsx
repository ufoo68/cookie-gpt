"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { Upload, Loader2, ImageIcon, FileText, Box, Menu, Sparkles, Wand2, CheckCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import SVGViewer from "@/components/svg-viewer"
import STLViewer from "@/components/stl-viewer"
import Cookie3DViewer from "@/components/cookie-3d-viewer"
import STLDownload from "@/components/stl-download"

type WorkflowStage = "initial" | "svg_ready" | "stl_ready" | "stl_final"

interface ProcessingResult {
  success: boolean
  svgContent?: string
  stlContent?: string
  analysis?: string
  modificationDescription?: string
  stage?: string
  processingTime?: number
  stlSize?: number
}

export default function Cookie3DChat() {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>("initial")
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [svgContent, setSvgContent] = useState<string>("")
  const [stlContent, setStlContent] = useState<string>("")
  const [analysis, setAnalysis] = useState<string>("")
  const [modificationHistory, setModificationHistory] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return

      setIsProcessing(true)
      const formData = new FormData()
      formData.append("file", file)

      try {
        // Determine file type and set appropriate stage
        const fileType = file.type
        const fileName = file.name.toLowerCase()

        if (fileName.endsWith(".stl")) {
          // STL file - start from STL stage
          const text = await file.text()
          setStlContent(text)
          setCurrentStage("stl_ready")
          toast({
            title: "STLファイルアップロード完了",
            description: "STLファイルが読み込まれました。修正やダウンロードが可能です。",
          })
        } else if (fileName.endsWith(".svg") || fileType === "image/svg+xml") {
          // SVG file - start from SVG stage
          const text = await file.text()
          setSvgContent(text)
          setCurrentStage("svg_ready")
          toast({
            title: "SVGファイルアップロード完了",
            description: "SVGファイルが読み込まれました。修正やSTL変換が可能です。",
          })
        } else if (fileType.startsWith("image/")) {
          // Image file - start from initial analysis
          const response = await fetch("/api/generate-cookie", {
            method: "POST",
            body: formData,
          })

          const result: ProcessingResult = await response.json()

          if (result.success && result.svgContent) {
            setSvgContent(result.svgContent)
            setAnalysis(result.analysis || "")
            setCurrentStage("svg_ready")
            toast({
              title: "SVG生成完了",
              description: "画像からSVGが生成されました！",
            })
          } else {
            throw new Error("SVG生成に失敗しました")
          }
        } else {
          throw new Error("サポートされていないファイル形式です")
        }
      } catch (error) {
        console.error("File upload error:", error)
        toast({
          title: "エラー",
          description: "ファイルの処理中にエラーが発生しました。",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [toast],
  )

  const handleModifySVG = useCallback(async () => {
    if (!inputValue.trim() || !svgContent) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/modify-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          svgContent,
          modificationRequest: inputValue,
        }),
      })

      const result: ProcessingResult = await response.json()

      if (result.success && result.svgContent) {
        setSvgContent(result.svgContent)
        setModificationHistory((prev) => [...prev, `SVG修正: ${inputValue}`])
        setInputValue("")
        toast({
          title: "SVG修正完了",
          description: "SVGが修正されました！",
        })
      } else {
        throw new Error("SVG修正に失敗しました")
      }
    } catch (error) {
      console.error("SVG modification error:", error)
      toast({
        title: "エラー",
        description: "SVG修正中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [inputValue, svgContent, toast])

  const handleGenerateSTL = useCallback(async () => {
    if (!svgContent) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/generate-stl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ svgContent }),
      })

      const result: ProcessingResult = await response.json()

      if (result.success && result.stlContent) {
        setStlContent(result.stlContent)
        setCurrentStage("stl_ready")
        toast({
          title: "STL生成完了",
          description: "3DプリンタブルなSTLファイルが生成されました！",
        })
      } else {
        throw new Error("STL生成に失敗しました")
      }
    } catch (error) {
      console.error("STL generation error:", error)
      toast({
        title: "エラー",
        description: "STL生成中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [svgContent, toast])

  const handleModifySTL = useCallback(async () => {
    if (!inputValue.trim() || !stlContent) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/modify-stl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stlContent,
          modificationRequest: inputValue,
        }),
      })

      const result: ProcessingResult = await response.json()

      if (result.success && result.stlContent) {
        setStlContent(result.stlContent)
        setModificationHistory((prev) => [...prev, `STL修正: ${inputValue}`])
        setInputValue("")
        toast({
          title: "STL修正完了",
          description: result.modificationDescription || "STLが修正されました！",
        })
      } else {
        throw new Error("STL修正に失敗しました")
      }
    } catch (error) {
      console.error("STL modification error:", error)
      toast({
        title: "エラー",
        description: "STL修正中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [inputValue, stlContent, toast])

  const handleCompleteWorkflow = useCallback(() => {
    setCurrentStage("stl_final")
    toast({
      title: "ワークフロー完了",
      description: "クッキー型の作成が完了しました！",
    })
  }, [toast])

  const getPlaceholderText = () => {
    switch (currentStage) {
      case "svg_ready":
        return "SVGを修正してください（例：もっと丸く、線を太く）"
      case "stl_ready":
        return "STLを修正してください（例：厚みを3mmに、サイズを20%大きく）"
      default:
        return "画像をアップロードしてください"
    }
  }

  const getActionButton = () => {
    if (currentStage === "svg_ready") {
      return (
        <div className="flex gap-2">
          <Button onClick={handleModifySVG} disabled={!inputValue.trim() || isProcessing} className="flex-1">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            SVG修正
          </Button>
          <Button onClick={handleGenerateSTL} disabled={isProcessing} variant="outline">
            STL変換
          </Button>
        </div>
      )
    }

    if (currentStage === "stl_ready") {
      return (
        <div className="flex gap-2">
          <Button onClick={handleModifySTL} disabled={!inputValue.trim() || isProcessing} className="flex-1">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            STL修正
          </Button>
          <Button onClick={handleCompleteWorkflow} variant="outline">
            <CheckCircle className="h-4 w-4" />
            完了
          </Button>
        </div>
      )
    }

    return null
  }

  const SidebarContent = () => (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">🍪 クッキー型メーカー</h3>
        <p className="text-sm text-gray-600 mb-4">画像から3Dプリンタブルなクッキー型を作成</p>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          ワークフロー
        </h4>
        <div className="space-y-2 text-sm">
          <div
            className={`flex items-center gap-2 p-2 rounded ${currentStage === "initial" ? "bg-blue-100" : "bg-gray-50"}`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>1. 画像アップロード</span>
            {currentStage !== "initial" && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
          </div>
          <div
            className={`flex items-center gap-2 p-2 rounded ${currentStage === "svg_ready" ? "bg-blue-100" : "bg-gray-50"}`}
          >
            <FileText className="h-4 w-4" />
            <span>2. SVG生成・修正</span>
            {["stl_ready", "stl_final"].includes(currentStage) && (
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            )}
          </div>
          <div
            className={`flex items-center gap-2 p-2 rounded ${currentStage === "stl_ready" ? "bg-blue-100" : "bg-gray-50"}`}
          >
            <Box className="h-4 w-4" />
            <span>3. STL生成・修正</span>
            {currentStage === "stl_final" && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-2">対応ファイル形式</h4>
        <div className="space-y-1 text-sm">
          <Badge variant="outline" className="mr-1">
            JPG
          </Badge>
          <Badge variant="outline" className="mr-1">
            PNG
          </Badge>
          <Badge variant="outline" className="mr-1">
            SVG
          </Badge>
          <Badge variant="outline" className="mr-1">
            STL
          </Badge>
        </div>
      </div>

      {currentStage === "svg_ready" && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">SVG修正例</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• もっと丸く</p>
              <p>• 線を太くして</p>
              <p>• 角を滑らかに</p>
              <p>• サイズを大きく</p>
            </div>
          </div>
        </>
      )}

      {currentStage === "stl_ready" && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">STL修正例</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• 厚みを3mmに</p>
              <p>• サイズを20%大きく</p>
              <p>• より頑丈に</p>
              <p>• 表面を滑らかに</p>
            </div>
          </div>
        </>
      )}

      {modificationHistory.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">修正履歴</h4>
            <ScrollArea className="h-32">
              <div className="space-y-1 text-xs">
                {modificationHistory.map((mod, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-gray-600">
                    {mod}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 bg-white border-r border-orange-200 shadow-sm">
            <SidebarContent />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          {isMobile && (
            <div className="bg-white border-b border-orange-200 p-4 flex items-center justify-between">
              <h1 className="font-bold text-lg">🍪 クッキー型メーカー</h1>
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Upload Area */}
              {currentStage === "initial" && (
                <Card className="border-dashed border-2 border-orange-300 bg-orange-50">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🍪</div>
                      <h2 className="text-2xl font-bold text-orange-800 mb-2">クッキー型を作ろう！</h2>
                      <p className="text-orange-700 mb-6">画像、SVG、STLファイルをアップロードして始めましょう</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        size="lg"
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-5 w-5 mr-2" />
                        )}
                        ファイルを選択
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.svg,.stl"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                        }}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Display */}
              {currentStage !== "initial" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* SVG Viewer */}
                  {svgContent && <SVGViewer svgContent={svgContent} />}

                  {/* STL Viewer */}
                  {stlContent && <STLViewer stlContent={stlContent} />}

                  {/* 3D Preview */}
                  <Cookie3DViewer stlContent={stlContent} svgContent={svgContent} />

                  {/* Download Section */}
                  {stlContent && (
                    <STLDownload stlContent={stlContent} svgContent={svgContent} filename="cookie-cutter" />
                  )}
                </div>
              )}

              {/* Input Area */}
              {(currentStage === "svg_ready" || currentStage === "stl_ready") && (
                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={getPlaceholderText()}
                        disabled={isProcessing}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            if (currentStage === "svg_ready") {
                              handleModifySVG()
                            } else if (currentStage === "stl_ready") {
                              handleModifySTL()
                            }
                          }
                        }}
                      />
                      {getActionButton()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Completion Message */}
              {currentStage === "stl_final" && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">クッキー型完成！</h3>
                    <p className="text-green-700">
                      3Dプリンタブルなクッキー型が完成しました。ダウンロードして印刷してください！
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
