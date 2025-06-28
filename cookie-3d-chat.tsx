"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Loader2, Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import SVGViewer from "./components/svg-viewer"
import STLDownload from "./components/stl-download"

interface Message {
  id: number
  type: "text" | "image" | "svg-stl"
  content: string
  svgContent?: string
  stlUrl?: string
  stlSize?: string
  processingTime?: string
  analysis?: string
  time: string
  isMe: boolean
  isLoading?: boolean
}

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "text",
      content:
        "こんにちは！🍪✨\n\n新しいワークフローでクッキー型を作成します：\n1️⃣ GPT-4oがイラストからSVG形状を生成\n2️⃣ MCPサービスがSVGから3D STLファイルを作成\n3️⃣ SVGとSTLの両方をダウンロード可能\n\n画像をアップロードして始めましょう！🚀",
      time: "14:30",
      isMe: false,
    },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Add user's image message
    const imageMessage: Message = {
      id: Date.now(),
      type: "image",
      content: URL.createObjectURL(file),
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }
    setMessages((prev) => [...prev, imageMessage])

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      type: "text",
      content: "🤖 Step 1: GPT-4oで画像を分析中...\n📐 SVG形状を生成しています...\n⚙️ MCPサービスでSTL変換準備中...",
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: false,
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/generate-cookie", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      if (result.success) {
        // Add analysis message first
        const analysisMessage: Message = {
          id: Date.now() + 2,
          type: "text",
          content: `🤖 AI分析完了！\n\n${result.analysis}`,
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        }
        setMessages((prev) => [...prev, analysisMessage])

        // Then add SVG + STL message
        setTimeout(() => {
          const resultMessage: Message = {
            id: Date.now() + 3,
            type: "svg-stl",
            content: "🎉 クッキー型の生成が完了しました！",
            svgContent: result.svgContent,
            stlUrl: result.stlUrl,
            stlSize: result.stlSize,
            processingTime: result.processingTime,
            time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
            isMe: false,
          }
          setMessages((prev) => [...prev, resultMessage])
        }, 1000)
      } else {
        // Add error message
        const errorMessage: Message = {
          id: Date.now() + 2,
          type: "text",
          content: `❌ ${result.message}\n\n${result.analysis || ""}`,
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      // Remove loading message and add error message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))
      const errorMessage: Message = {
        id: Date.now() + 2,
        type: "text",
        content: "🚨 ネットワークエラーが発生しました。もう一度お試しください。",
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsGenerating(false)
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-amber-300 to-orange-300 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-md">
                🍪
              </div>
              <div>
                <h1 className="font-bold text-amber-900 text-lg">cookieGPT</h1>
                <p className="text-amber-800 text-sm">GPT→SVG→MCP→STL</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-amber-900 hover:bg-amber-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-amber-100 to-orange-100 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-amber-900">cookieGPT</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6 text-amber-900" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-md border-2 border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    新ワークフロー
                  </h3>
                  <div className="text-sm text-amber-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>GPT-4o画像解析</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>SVG形状生成</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span>MCP STL変換</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span>ファイルダウンロード</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow-md border-2 border-amber-200 flex-shrink-0">
                {msg.isMe ? "🧁" : msg.type === "svg-stl" ? "🤖" : "🍪"}
              </div>
              <div className={`max-w-[85%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-md ${
                    msg.isMe
                      ? "bg-gradient-to-r from-orange-300 to-amber-300 text-amber-900 rounded-br-md"
                      : "bg-white text-amber-900 rounded-bl-md border-2 border-amber-100"
                  }`}
                >
                  {msg.type === "text" && (
                    <div className="flex items-start gap-2">
                      {msg.isLoading && <Loader2 className="h-4 w-4 animate-spin mt-1 flex-shrink-0" />}
                      <p className="text-sm font-medium whitespace-pre-line">{msg.content}</p>
                    </div>
                  )}
                  {msg.type === "image" && (
                    <div className="space-y-2">
                      <img
                        src={msg.content || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-w-full h-40 object-cover rounded-lg"
                      />
                      <p className="text-xs">イラストをアップロードしました</p>
                    </div>
                  )}
                  {msg.type === "svg-stl" && msg.svgContent && msg.stlUrl && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium">{msg.content}</p>
                      <SVGViewer svgContent={msg.svgContent} onDownload={() => {}} />
                      <STLDownload
                        stlUrl={msg.stlUrl}
                        stlSize={msg.stlSize || ""}
                        processingTime={msg.processingTime || ""}
                      />
                    </div>
                  )}
                </div>
                <span className="text-xs text-amber-700 mt-1 px-2">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Input */}
        <div className="p-4 bg-gradient-to-r from-amber-200 to-orange-200 border-t-2 border-amber-300">
          <div className="bg-white rounded-full p-3 shadow-lg border-2 border-amber-200">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <Button
              className="w-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-md rounded-full py-4 text-lg font-medium"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>AI処理中...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Upload className="h-6 w-6" />
                  <span>画像をアップロードしてクッキー型を作成</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
      {/* Desktop Sidebar */}
      <div className="w-80 bg-gradient-to-b from-amber-100 to-orange-100 border-r-4 border-amber-200 shadow-xl">
        <div className="p-6 border-b-2 border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg">
              🍪
            </div>
            <div>
              <h1 className="font-bold text-amber-900 text-xl">cookieGPT</h1>
              <p className="text-amber-800 text-sm">GPT→SVG→MCP→STL</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              新ワークフロー
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium text-sm">GPT-4o解析</p>
                  <p className="text-xs text-gray-600">画像からSVG生成</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium text-sm">SVG最適化</p>
                  <p className="text-xs text-gray-600">クッキー型用形状</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium text-sm">MCP変換</p>
                  <p className="text-xs text-gray-600">SVG→STL変換</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </span>
                <div>
                  <p className="font-medium text-sm">ダウンロード</p>
                  <p className="text-xs text-gray-600">SVG + STLファイル</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3">🎯 特徴</h3>
            <ul className="text-sm text-amber-800 space-y-2">
              <li>• 実用的なSTLファイル出力</li>
              <li>• 3Dプリンター対応</li>
              <li>• SVGプレビュー機能</li>
              <li>• MCP外部連携</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <div className="bg-gradient-to-r from-amber-300 to-orange-300 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-amber-900 text-2xl">cookieGPT</h2>
              <p className="text-amber-800">画像→SVG→STL の自動変換ワークフロー</p>
            </div>
            <div className="flex items-center gap-2 text-amber-900">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">MCP連携 オンライン</span>
            </div>
          </div>
        </div>

        {/* Desktop Messages */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-amber-200 flex-shrink-0">
                {msg.isMe ? "🧁" : msg.type === "svg-stl" ? "🤖" : "🍪"}
              </div>
              <div className={`max-w-[70%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`px-6 py-4 rounded-2xl shadow-lg ${
                    msg.isMe
                      ? "bg-gradient-to-r from-orange-300 to-amber-300 text-amber-900 rounded-br-md"
                      : "bg-white text-amber-900 rounded-bl-md border-2 border-amber-100"
                  }`}
                >
                  {msg.type === "text" && (
                    <div className="flex items-start gap-3">
                      {msg.isLoading && <Loader2 className="h-5 w-5 animate-spin mt-1 flex-shrink-0" />}
                      <p className="font-medium whitespace-pre-line leading-relaxed">{msg.content}</p>
                    </div>
                  )}
                  {msg.type === "image" && (
                    <div className="space-y-3">
                      <img
                        src={msg.content || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <p className="text-sm">イラストをアップロードしました</p>
                    </div>
                  )}
                  {msg.type === "svg-stl" && msg.svgContent && msg.stlUrl && (
                    <div className="space-y-4">
                      <p className="font-medium">{msg.content}</p>
                      <SVGViewer svgContent={msg.svgContent} onDownload={() => {}} />
                      <STLDownload
                        stlUrl={msg.stlUrl}
                        stlSize={msg.stlSize || ""}
                        processingTime={msg.processingTime || ""}
                      />
                    </div>
                  )}
                </div>
                <span className="text-sm text-amber-700 mt-2 px-3">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Input */}
        <div className="p-6 bg-gradient-to-r from-amber-200 to-orange-200 border-t-2 border-amber-300">
          <div className="max-w-2xl mx-auto">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <Button
              className="w-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg rounded-full py-6 text-xl font-medium"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>AI処理中... GPT→SVG→MCP→STL</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Upload className="h-8 w-8" />
                  <span>画像をアップロードしてクッキー型を作成</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
