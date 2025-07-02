"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Send,
  Upload,
  Loader2,
  Cookie,
  Menu,
  ImageIcon,
  CuboidIcon as Cube,
  Check,
  RefreshCw,
  Heart,
  Star,
  Smile,
  Coffee,
  Cake,
  Gift,
} from "lucide-react"
import { SvgViewer } from "@/components/svg-viewer"
import { StlViewer } from "@/components/stl-viewer"
import { StlDownload } from "@/components/stl-download"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

type Message = {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

type Stage = "chat" | "svg_generated" | "stl_generated" | "completed"

export default function Cookie3DChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState<Stage>("chat")
  const [svgContent, setSvgContent] = useState<string>("")
  const [stlContent, setStlContent] = useState<string>("")
  const [isModifying, setIsModifying] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    setMessages([{
      id: "1",
      type: "assistant",
      content:
        "こんにちは！🍪 どんなクッキーを作りたいですか？形や模様、テーマなど、自由に教えてください。AIがあなたの理想のクッキーデザインを提案します！",
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const generateCookieDesign = async (prompt: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cookie-cutter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("デザイン生成に失敗しました")
      }

      const data = await response.json()
      setSvgContent(data.svgContent)
      setStage("svg_generated")
      addMessage(
        "assistant",
        "クッキーのデザインを生成しました！🎨 気に入ったら「承認」ボタンを押してください。修正したい場合は、具体的な変更内容を教えてください。",
      )
    } catch (error) {
      console.error("Error generating design:", error)
      addMessage("assistant", "デザインの生成中にエラーが発生しました。もう一度お試しください。")
      toast({
        title: "エラー",
        description: "デザインの生成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const modifySvg = async (modifications: string) => {
    setIsModifying(true)
    try {
      const response = await fetch("/api/modify-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          svgContent: svgContent,
          userRequest: modifications,
        }),
      })

      if (!response.ok) {
        throw new Error("SVG修正に失敗しました")
      }

      const data = await response.json()
      setSvgContent(data.svgContent)
      addMessage("assistant", "デザインを修正しました！✨ いかがでしょうか？")
    } catch (error) {
      console.error("Error modifying SVG:", error)
      addMessage("assistant", "デザインの修正中にエラーが発生しました。")
      toast({
        title: "エラー",
        description: "デザインの修正に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsModifying(false)
    }
  }

  const approveSvg = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/convert-stl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ svgContent }),
      })

      if (!response.ok) {
        throw new Error("STL変換に失敗しました")
      }

      const data = await response.json()
      setStlContent(data.stlContent)
      setStage("stl_generated")
      addMessage(
        "assistant",
        "🎉 3Dモデル（STLファイル）の生成が完了しました！クッキー型の作成が完了です。STLファイルをダウンロードして3Dプリンターで印刷してください。素敵なクッキー作りを楽しんでくださいね！",
      )
    } catch (error) {
      console.error("Error converting to STL:", error)
      addMessage("assistant", "3Dモデルの生成中にエラーが発生しました。")
      toast({
        title: "エラー",
        description: "3Dモデルの生成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    addMessage("user", userMessage)
    setInputValue("")

    if (stage === "chat") {
      await generateCookieDesign(userMessage)
    } else if (stage === "svg_generated" && userMessage) {
      await modifySvg(userMessage)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileType = file.type
    const fileName = file.name.toLowerCase()

    try {
      if (fileType === "image/svg+xml" || fileName.endsWith(".svg")) {
        // SVGファイルの場合
        const svgText = await file.text()
        setSvgContent(svgText)
        setStage("svg_generated")
        addMessage("assistant", "SVGファイルをアップロードしました！デザインを確認できます。🎨")
      } else if (fileName.endsWith(".stl")) {
        // STLファイルの場合
        const stlText = await file.text()
        setStlContent(stlText)
        setStage("stl_generated")
        addMessage("assistant", "STLファイルをアップロードしました！3Dプレビューで確認できます。🎯")
      } else if (fileType.includes("image")) {
        // 画像の場合
        const formData = new FormData()
        formData.append("image", file)

        setIsLoading(true)
        const response = await fetch("/api/convert-svg", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("ファイル処理に失敗しました")

        const data = await response.json()
        setSvgContent(data.svgContent)
        setStage("svg_generated")
        addMessage("assistant", "アップロードされた画像からクッキーデザインを生成しました！🎨")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "エラー",
        description: "ファイルのアップロードに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetProcess = () => {
    setStage("chat")
    setSvgContent("")
    setStlContent("")
    setMessages([
      {
        id: "1",
        type: "assistant",
        content:
          "こんにちは！🍪 どんなクッキーを作りたいですか？形や模様、テーマなど、自由に教えてください。AIがあなたの理想のクッキーデザインを提案します！",
        timestamp: new Date(),
      },
    ])
  }

  const suggestionExamples = [
    { icon: Heart, text: "ハート型のクッキー", color: "text-pink-500" },
    { icon: Star, text: "星型のクッキー", color: "text-yellow-500" },
    { icon: Smile, text: "笑顔のクッキー", color: "text-blue-500" },
    { icon: Coffee, text: "コーヒーカップ型", color: "text-amber-600" },
    { icon: Cake, text: "ケーキ型のクッキー", color: "text-purple-500" },
    { icon: Gift, text: "プレゼント型", color: "text-green-500" },
  ]

  const modificationExamples = [
    "もう少し丸くしてください",
    "線を太くしてください",
    "装飾を追加してください",
    "サイズを大きくしてください",
  ]

  const Sidebar = () => (
    <div className="w-80 bg-gradient-to-b from-amber-50 to-orange-50 border-r border-amber-200 flex flex-col min-h-0 h-full">
      <div className="p-4 border-b border-amber-200 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <Cookie className="h-6 w-6 text-amber-600" />
          <h2 className="text-lg font-semibold text-amber-800">cookieGPT</h2>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${stage === "chat" ? "bg-blue-500" : stage === "svg_generated" ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className="text-sm text-gray-600">デザイン提案</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stage === "stl_generated" ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-sm text-gray-600">3Dモデル生成・完成</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {stage === "chat" && (
          <div className="p-4">
            <h3 className="font-medium text-amber-800 mb-3">💡 提案例</h3>
            <div className="space-y-2">
              {suggestionExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2 hover:bg-amber-100"
                  onClick={() => setInputValue(example.text)}
                >
                  <example.icon className={`h-4 w-4 mr-2 ${example.color}`} />
                  <span className="text-sm">{example.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {stage === "svg_generated" && (
          <div className="p-4">
            <h3 className="font-medium text-amber-800 mb-3">🔧 修正例</h3>
            <div className="space-y-2">
              {modificationExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2 hover:bg-amber-100"
                  onClick={() => setInputValue(example)}
                >
                  <span className="text-sm">{example}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-amber-200 flex-shrink-0">
        <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={resetProcess}>
          <RefreshCw className="h-4 w-4 mr-2" />
          新しいクッキーを作る
        </Button>
      </div>
    </div>
  )

  const MobileHeader = () => (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <Cookie className="h-6 w-6" />
        <h1 className="text-lg font-semibold">cookieGPT</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={resetProcess}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-80">
            <SheetHeader className="p-4 border-b border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50">
              <SheetTitle className="flex items-center gap-2 text-amber-800">
                <Cookie className="h-5 w-5" />
                cookieGPT
              </SheetTitle>
            </SheetHeader>
            <div className="bg-gradient-to-b from-amber-50 to-orange-50 h-full">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {!isMobile && <Sidebar />}

      <div className="flex-1 flex flex-col min-h-0">
        {isMobile && <MobileHeader />}

        {!isMobile && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Cookie className="h-6 w-6" />
              <h1 className="text-xl font-semibold">cookieGPT</h1>
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                {stage === "chat" && "デザイン提案中"}
                {stage === "svg_generated" && "デザイン確認中"}
                {stage === "stl_generated" && "完成"}
              </Badge>
            </div>
          </div>
        )}

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === "user" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}

                {svgContent && (
                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        生成されたクッキーデザイン
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SvgViewer svgContent={svgContent} onDownload={() => {}} />
                      <div className="mt-4 flex gap-2">
                        <Button onClick={approveSvg} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          承認して3Dモデル生成
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {stlContent && (
                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cube className="h-5 w-5" />
                        3Dモデル（STLファイル）- 完成！
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StlViewer stlContent={stlContent} />
                      <div className="mt-4">
                        <StlDownload
                          stlContent={stlContent}
                          stlSize={`${(new Blob([stlContent]).size / 1024 / 1024).toFixed(2)} MB`}
                          processingTime=""
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t bg-white p-4 flex-shrink-0">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={
                        stage === "chat"
                          ? "どんなクッキーを作りたいですか？"
                          : stage === "svg_generated"
                            ? "デザインの修正内容を入力..."
                            : "新しいクッキーを作るには「新しいクッキーを作る」ボタンを押してください"
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || isModifying || stage === "stl_generated"}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading || isModifying || stage === "stl_generated"}
                  >
                    {isLoading || isModifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || stage === "stl_generated"}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.svg,.stl"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
