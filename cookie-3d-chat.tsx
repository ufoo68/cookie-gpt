"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Loader2, Menu, X, Zap, Send, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import SVGViewer from "./components/svg-viewer"
import STLDownload from "./components/stl-download"
import STLViewer from "./components/stl-viewer"

interface Message {
  id: number
  type: "text" | "image" | "svg" | "stl" | "user-input"
  content: string
  svgContent?: string
  stlContent?: string
  stlSize?: string
  processingTime?: string
  analysis?: string
  modifications?: string
  time: string
  isMe: boolean
  isLoading?: boolean
  stage?: "svg_generated" | "svg_modified" | "stl_generated" | "stl_modified"
  showStlViewer?: boolean
}

export default function Cookie3DChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "text",
      content:
        "こんにちは！🍪✨\n\n新しいワークフローでクッキー型を作成します：\n1️⃣ GPT-4oがイラストからSVG形状を生成\n2️⃣ あなたがSVGを確認・修正指示\n3️⃣ MCPサービスでSTL変換\n4️⃣ STLファイルの確認・修正指示\n5️⃣ 最終的なファイルをダウンロード\n\n画像、SVG、STLファイルをアップロードして始めましょう！🚀",
      time: "14:30",
      isMe: false,
    },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentSvg, setCurrentSvg] = useState<string>("")
  const [currentStl, setCurrentStl] = useState<string>("")
  const [originalAnalysis, setOriginalAnalysis] = useState<string>("")
  const [currentStage, setCurrentStage] = useState<"initial" | "svg_ready" | "stl_ready" | "stl_final">("initial")
  const [userInput, setUserInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileType = file.type
    const fileName = file.name.toLowerCase()

    // SVGファイルの処理
    if (fileType === "image/svg+xml" || fileName.endsWith(".svg")) {
      const svgContent = await file.text()

      // SVGファイルメッセージを追加
      const svgFileMessage: Message = {
        id: Date.now(),
        type: "svg",
        content:
          "📐 SVGファイルをアップロードしました！\n\n確認して、修正が必要でしたらお知らせください。\n問題なければ「STL変換」ボタンを押してください。",
        svgContent: svgContent,
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
        stage: "svg_generated",
      }
      setMessages((prev) => [...prev, svgFileMessage])
      setCurrentSvg(svgContent)
      setCurrentStage("svg_ready")
      return
    }

    // STLファイルの処理
    if (fileName.endsWith(".stl")) {
      const stlContent = await file.text()

      // STLファイルメッセージを追加
      const stlFileMessage: Message = {
        id: Date.now(),
        type: "stl",
        content:
          "🏗️ STLファイルをアップロードしました！\n\n3Dプレビューとダウンロードが利用できます。\n修正が必要でしたらお知らせください。",
        stlContent: stlContent,
        stlSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
        stage: "stl_generated",
        showStlViewer: true,
      }
      setMessages((prev) => [...prev, stlFileMessage])
      setCurrentStl(stlContent)
      setCurrentStage("stl_ready")
      return
    }

    // 画像ファイルの処理（既存のロジック）
    if (fileType.startsWith("image/")) {
      await handleImageUpload(event)
      return
    }

    // サポートされていないファイル形式
    const errorMessage: Message = {
      id: Date.now(),
      type: "text",
      content:
        "❌ サポートされていないファイル形式です。\n\n対応形式：\n• 画像ファイル（JPG, PNG, GIF, WebP）\n• SVGファイル（.svg）\n• STLファイル（.stl）",
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: false,
    }
    setMessages((prev) => [...prev, errorMessage])
  }

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
      content: "🤖 Step 1: GPT-4oで画像を分析中...\n📐 SVG形状を生成しています...",
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: false,
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/convert-svg", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      if (result.success) {
        setCurrentSvg(result.svgContent)
        setOriginalAnalysis(result.analysis)
        setCurrentStage("svg_ready")

        // Add analysis message first
        const analysisMessage: Message = {
          id: Date.now() + 2,
          type: "text",
          content: `🤖 AI分析完了！\n\n${result.analysis}`,
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        }
        setMessages((prev) => [...prev, analysisMessage])

        // Then add SVG message
        setTimeout(() => {
          const svgMessage: Message = {
            id: Date.now() + 3,
            type: "svg",
            content:
              "📐 SVG形状を生成しました！\n\n確認して、修正が必要でしたらお知らせください。\n問題なければ「STL変換」ボタンを押してください。",
            svgContent: result.svgContent,
            time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
            isMe: false,
            stage: "svg_generated",
          }
          setMessages((prev) => [...prev, svgMessage])
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

  const handleUserMessage = async () => {
    if (!userInput.trim()) return

    // SVG修正の場合
    if (currentStage === "svg_ready") {
      await handleSvgModification()
    }
    // STL修正の場合
    else if (currentStage === "stl_ready") {
      await handleStlModification()
    }
  }

  const handleSvgModification = async () => {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: "user-input",
      content: userInput,
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }
    setMessages((prev) => [...prev, userMessage])

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      type: "text",
      content: "🔧 SVGを修正中...",
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: false,
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    setIsGenerating(true)
    const currentInput = userInput
    setUserInput("")

    try {
      const response = await fetch("/api/modify-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          svgContent: currentSvg,
          userRequest: currentInput,
          originalAnalysis,
        }),
      })

      const result = await response.json()

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      if (result.success) {
        setCurrentSvg(result.svgContent)

        // Add modified SVG message
        const modifiedSvgMessage: Message = {
          id: Date.now() + 2,
          type: "svg",
          content:
            "✅ SVGを修正しました！\n\n確認して、さらに修正が必要でしたらお知らせください。\n問題なければ「STL変換」ボタンを押してください。",
          svgContent: result.svgContent,
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
          stage: "svg_modified",
        }
        setMessages((prev) => [...prev, modifiedSvgMessage])
      } else {
        // Add error message
        const errorMessage: Message = {
          id: Date.now() + 2,
          type: "text",
          content: `❌ ${result.message}`,
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
        content: "🚨 修正中にエラーが発生しました。もう一度お試しください。",
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsGenerating(false)
  }

  const handleStlModification = async () => {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: "user-input",
      content: userInput,
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }
    setMessages((prev) => [...prev, userMessage])

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      type: "text",
      content: "🔧 STLを修正中...\n⚙️ 3Dモデルを調整しています...",
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: false,
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    setIsGenerating(true)
    const currentInput = userInput
    setUserInput("")

    try {
      const response = await fetch("/api/modify-stl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stlContent: currentStl,
          userRequest: currentInput,
        }),
      })

      const result = await response.json()

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      if (result.success) {
        setCurrentStl(result.stlContent)

        // Add modified STL message
        const modifiedStlMessage: Message = {
          id: Date.now() + 2,
          type: "stl",
          content: `✅ STLを修正しました！\n\n修正内容: ${result.modificationDescription}\n\n確認して、さらに修正が必要でしたらお知らせください。\n問題なければ「完了」ボタンを押してください。`,
          stlContent: result.stlContent,
          stlSize: `${(result.stlSize / 1024 / 1024).toFixed(2)} MB`,
          processingTime: `${result.processingTime}秒`,
          modifications: result.modificationDescription,
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
          stage: "stl_modified",
          showStlViewer: true,
        }
        setMessages((prev) => [...prev, modifiedStlMessage])
      } else {
        // Add error message
        const errorMessage: Message = {
          id: Date.now() + 2,
          type: "text",
          content: `❌ ${result.message}`,
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
        content: "🚨 STL修正中にエラーが発生しました。もう一度お試しください。",
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsGenerating(false)
  }

  const handleGenerateSTL = async () => {
    if (!currentSvg || currentStage !== "svg_ready") return

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now(),
      type: "text",
      content: "⚙️ MCPサービスでSTL変換中...\n🏗️ 3Dモデルを生成しています...",
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: false,
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    setIsGenerating(true)

    try {
      const response = await fetch("/api/convert-stl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ svgContent: currentSvg }),
      })

      const result = await response.json()

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      if (result.success) {
        setCurrentStl(result.stlContent)
        setCurrentStage("stl_ready")

        // Add STL message
        const stlMessage: Message = {
          id: Date.now() + 1,
          type: "stl",
          content:
            "🎉 STLファイルの生成が完了しました！\n\n3Dプレビューで確認してください。\n修正が必要でしたらお知らせください。\n問題なければ「完了」ボタンを押してください。",
          stlContent: result.stlContent,
          stlSize: result.stlSize,
          processingTime: result.processingTime,
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
          stage: "stl_generated",
          showStlViewer: true,
        }
        setMessages((prev) => [...prev, stlMessage])
      } else {
        // Add error message
        const errorMessage: Message = {
          id: Date.now() + 1,
          type: "text",
          content: `❌ ${result.message}`,
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      // Remove loading message and add error message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "text",
        content: "🚨 STL生成中にエラーが発生しました。もう一度お試しください。",
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsGenerating(false)
  }

  const handleCompleteWorkflow = () => {
    setCurrentStage("stl_final")

    const completionMessage: Message = {
      id: Date.now(),
      type: "text",
      content:
        "🎉 ワークフロー完了！\n\nクッキー型の作成が完了しました。\n新しいクッキー型を作成するには、画像をアップロードしてください。",
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isMe: false,
    }
    setMessages((prev) => [...prev, completionMessage])
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-amber-300 to-orange-300 p-4 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-md">
                🍪
              </div>
              <div>
                <h1 className="font-bold text-amber-900 text-lg">cookieGPT</h1>
                <p className="text-amber-800 text-sm">GPT→SVG→修正→STL→修正</p>
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
            <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-amber-100 to-orange-100 p-4 shadow-xl overflow-y-auto">
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
                    拡張ワークフロー
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
                      <span>SVG形状生成・修正</span>
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
                      <span>STL確認・修正</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        5
                      </span>
                      <span>ファイルダウンロード</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Messages - フレックスで残りの高さを使用 */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow-md border-2 border-amber-200 flex-shrink-0">
                {msg.isMe ? "🧁" : msg.type === "svg" ? "📐" : msg.type === "stl" ? "🏗️" : "🍪"}
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
                  {msg.type === "user-input" && <p className="text-sm font-medium">{msg.content}</p>}
                  {msg.type === "svg" && msg.svgContent && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium">{msg.content}</p>
                      <SVGViewer svgContent={msg.svgContent} onDownload={() => {}} />
                      {currentStage === "svg_ready" && (
                        <Button
                          onClick={handleGenerateSTL}
                          disabled={isGenerating}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                          size="sm"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <ArrowRight className="h-4 w-4 mr-2" />
                          )}
                          STL変換
                        </Button>
                      )}
                    </div>
                  )}
                  {msg.type === "stl" && msg.stlContent && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium">{msg.content}</p>
                      {msg.showStlViewer && <STLViewer stlContent={msg.stlContent} />}
                      <STLDownload
                        stlContent={msg.stlContent}
                        stlSize={msg.stlSize || ""}
                        processingTime={msg.processingTime || ""}
                      />
                      {currentStage === "stl_ready" && (
                        <Button
                          onClick={handleCompleteWorkflow}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          ✅ 完了
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-amber-700 mt-1 px-2">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Input - 固定位置 */}
        <div className="p-4 bg-gradient-to-r from-amber-200 to-orange-200 border-t-2 border-amber-300 flex-shrink-0">
          {currentStage === "initial" || currentStage === "stl_final" ? (
            <div className="space-y-3">
              {/* ファイルアップロード */}
              <div className="bg-white rounded-full p-3 shadow-lg border-2 border-amber-200">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.svg,.stl"
                  className="hidden"
                />
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
                      <span>ファイルアップロード</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* ファイル形式の説明 */}
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-800 font-medium">対応形式</p>
                <div className="flex justify-center gap-4 mt-2 text-xs text-amber-700">
                  <span>📷 画像</span>
                  <span>📐 SVG</span>
                  <span>🏗️ STL</span>
                </div>
              </div>
            </div>
          ) : currentStage === "svg_ready" || currentStage === "stl_ready" ? (
            <div className="flex gap-2 bg-white rounded-full p-2 shadow-lg border-2 border-amber-200">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={
                  currentStage === "svg_ready"
                    ? "SVGの修正指示を入力..."
                    : "STLの修正指示を入力（厚み調整、サイズ変更など）..."
                }
                className="border-0 bg-transparent focus-visible:ring-0 text-amber-900 placeholder:text-amber-500"
                onKeyPress={(e) => e.key === "Enter" && handleUserMessage()}
                disabled={isGenerating}
              />
              <Button
                onClick={handleUserMessage}
                disabled={!userInput.trim() || isGenerating}
                size="icon"
                className="rounded-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
      {/* Desktop Sidebar - 固定幅 */}
      <div className="w-80 bg-gradient-to-b from-amber-100 to-orange-100 border-r-4 border-amber-200 shadow-xl flex-shrink-0 overflow-y-auto">
        <div className="p-6 border-b-2 border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg">
              🍪
            </div>
            <div>
              <h1 className="font-bold text-amber-900 text-xl">cookieGPT</h1>
              <p className="text-amber-800 text-sm">GPT→SVG→修正→STL→修正</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              拡張ワークフロー
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
                  <p className="font-medium text-sm">SVG確認・修正</p>
                  <p className="text-xs text-gray-600">プレビュー・調整</p>
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
                  <p className="font-medium text-sm">STL確認・修正</p>
                  <p className="text-xs text-gray-600">3D調整・最適化</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  5
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
              <li>• インタラクティブな修正</li>
              <li>• リアルタイムプレビュー</li>
              <li>• STL後修正対応</li>
              <li>• 3Dプリント最適化</li>
              <li>• MCP外部連携</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3">📁 対応ファイル</h3>
            <div className="space-y-2 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">📷</span>
                <span>画像ファイル（JPG, PNG, GIF, WebP）</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">📐</span>
                <span>SVGファイル（.svg）</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">🏗️</span>
                <span>STLファイル（.stl）</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3">🔧 STL修正例</h3>
            <div className="space-y-1 text-xs text-amber-800">
              <div>• 厚みを3mmに調整</div>
              <div>• サイズを20%大きく</div>
              <div>• エッジをもっと鋭く</div>
              <div>• 3Dプリント用に最適化</div>
              <div>• サポート材不要にして</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Main Chat Area - フレックスで残りの幅を使用 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header - 固定位置 */}
        <div className="bg-gradient-to-r from-amber-300 to-orange-300 p-6 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-amber-900 text-2xl">cookieGPT</h2>
              <p className="text-amber-800">画像→SVG→修正→STL→修正 の拡張ワークフロー</p>
            </div>
            <div className="flex items-center gap-2 text-amber-900">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">MCP連携 オンライン</span>
            </div>
          </div>
        </div>

        {/* Desktop Messages - フレックスで残りの高さを使用 */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-amber-200 flex-shrink-0">
                {msg.isMe ? "🧁" : msg.type === "svg" ? "📐" : msg.type === "stl" ? "🏗️" : "🍪"}
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
                  {msg.type === "user-input" && <p className="font-medium">{msg.content}</p>}
                  {msg.type === "svg" && msg.svgContent && (
                    <div className="space-y-4">
                      <p className="font-medium">{msg.content}</p>
                      <SVGViewer svgContent={msg.svgContent} onDownload={() => {}} />
                      {currentStage === "svg_ready" && (
                        <Button
                          onClick={handleGenerateSTL}
                          disabled={isGenerating}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <ArrowRight className="h-5 w-5 mr-2" />
                          )}
                          STL変換を実行
                        </Button>
                      )}
                    </div>
                  )}
                  {msg.type === "stl" && msg.stlContent && (
                    <div className="space-y-4">
                      <p className="font-medium">{msg.content}</p>
                      {msg.showStlViewer && <STLViewer stlContent={msg.stlContent} />}
                      <STLDownload
                        stlContent={msg.stlContent}
                        stlSize={msg.stlSize || ""}
                        processingTime={msg.processingTime || ""}
                      />
                      {currentStage === "stl_ready" && (
                        <Button
                          onClick={handleCompleteWorkflow}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          ✅ 完了
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-sm text-amber-700 mt-2 px-3">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Input - 固定位置 */}
        <div className="p-6 bg-gradient-to-r from-amber-200 to-orange-200 border-t-2 border-amber-300 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            {currentStage === "initial" || currentStage === "stl_final" ? (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.svg,.stl"
                  className="hidden"
                />
                <Button
                  className="w-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg rounded-full py-6 text-lg font-medium"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span>AI処理中... GPT→SVG生成</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Upload className="h-8 w-8" />
                      <span>ファイルをアップロード</span>
                    </div>
                  )}
                </Button>

                {/* ファイル形式の説明 */}
                <div className="bg-white/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-800 font-medium mb-3">対応ファイル形式</p>
                  <div className="flex justify-center gap-6 text-sm text-amber-700">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">📷</span>
                      <span>画像ファイル</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">📐</span>
                      <span>SVGファイル</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">🏗️</span>
                      <span>STLファイル</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentStage === "svg_ready" ? (
              <div className="flex gap-3 bg-white rounded-full p-3 shadow-lg border-2 border-amber-200">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="SVGの修正指示を入力してください（例：もう少し丸くして、線を太くして）"
                  className="border-0 bg-transparent focus-visible:ring-0 text-amber-900 placeholder:text-amber-500"
                  onKeyPress={(e) => e.key === "Enter" && handleUserMessage()}
                  disabled={isGenerating}
                />
                <Button
                  onClick={handleUserMessage}
                  disabled={!userInput.trim() || isGenerating}
                  size="icon"
                  className="rounded-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-md"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            ) : currentStage === "stl_ready" ? (
              <div className="flex gap-3 bg-white rounded-full p-3 shadow-lg border-2 border-amber-200">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="STLの修正指示を入力してください（例：厚みを3mmに、サイズを20%大きく、エッジを鋭く）"
                  className="border-0 bg-transparent focus-visible:ring-0 text-amber-900 placeholder:text-amber-500"
                  onKeyPress={(e) => e.key === "Enter" && handleUserMessage()}
                  disabled={isGenerating}
                />
                <Button
                  onClick={handleUserMessage}
                  disabled={!userInput.trim() || isGenerating}
                  size="icon"
                  className="rounded-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-md"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
