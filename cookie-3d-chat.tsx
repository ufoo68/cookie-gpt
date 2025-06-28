"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Send, Upload, Loader2, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import Cookie3DViewer from "./components/cookie-3d-viewer"

interface Message {
  id: number
  type: "text" | "image" | "3d-model"
  content: string
  modelUrl?: string
  analysis?: string
  time: string
  isMe: boolean
  isLoading?: boolean
}

export default function Component() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "text",
      content:
        "こんにちは！イラストを投稿すると、OpenAI Agents SDKを使ってクッキー型の3Dモデルに変換してお返しします！🍪🤖",
      time: "14:30",
      isMe: false,
    },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        type: "text",
        content: message,
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      }
      setMessages((prev) => [...prev, newMessage])
      setMessage("")
    }
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
      content: "OpenAI Agents SDKで画像を分析中...🤖\nクッキー型3Dモデルを生成しています...🍪✨",
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
        // Add AI analysis message first
        const analysisMessage: Message = {
          id: Date.now() + 2,
          type: "text",
          content: `🤖 AI分析結果:\n${result.analysis}`,
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        }
        setMessages((prev) => [...prev, analysisMessage])

        // Then add 3D model message
        setTimeout(() => {
          const modelMessage: Message = {
            id: Date.now() + 3,
            type: "3d-model",
            content: result.message,
            modelUrl: result.modelUrl,
            analysis: result.analysis,
            time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
            isMe: false,
          }
          setMessages((prev) => [...prev, modelMessage])
        }, 1000)
      } else {
        // Add error message
        const errorMessage: Message = {
          id: Date.now() + 2,
          type: "text",
          content: result.message || "エラーが発生しました。もう一度お試しください。",
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
        content: "ネットワークエラーが発生しました。もう一度お試しください。",
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
                <h1 className="font-bold text-amber-900 text-lg">AI クッキー3D工房</h1>
                <p className="text-amber-800 text-sm">OpenAI Agents SDK搭載</p>
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
                <h2 className="text-xl font-bold text-amber-900">メニュー</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6 text-amber-900" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-md border-2 border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-2">🍪 使い方</h3>
                  <p className="text-sm text-amber-800">画像をアップロードするとAIがクッキー型3Dモデルに変換します</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md border-2 border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-2">🤖 AI機能</h3>
                  <p className="text-sm text-amber-800">OpenAI GPT-4oによる高精度画像解析</p>
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
                {msg.isMe ? "🧁" : msg.type === "3d-model" ? "🤖" : "🍪"}
              </div>
              <div className={`max-w-[75%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}>
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
                  {msg.type === "3d-model" && msg.modelUrl && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{msg.content}</p>
                      <Cookie3DViewer modelUrl={msg.modelUrl} analysis={msg.analysis} />
                      <p className="text-xs text-amber-700">🤖 AI生成 | タッチで回転・ピンチでズーム</p>
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
          <div className="flex items-center gap-2 bg-white rounded-full p-2 shadow-lg border-2 border-amber-200">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 text-amber-600 hover:bg-amber-100 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージまたは画像..."
              className="border-0 bg-transparent focus-visible:ring-0 text-amber-900 placeholder:text-amber-500 text-base"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              size="icon"
              className="rounded-full w-10 h-10 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-md flex-shrink-0"
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
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
              <h1 className="font-bold text-amber-900 text-xl">AI クッキー3D工房</h1>
              <p className="text-amber-800 text-sm">OpenAI Agents SDK搭載</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">🍪 使い方</h3>
            <ul className="text-sm text-amber-800 space-y-2">
              <li>• 画像をアップロード</li>
              <li>• AIが自動解析</li>
              <li>• 3Dクッキーモデル生成</li>
              <li>• マウスで回転・ズーム</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">🤖 AI機能</h3>
            <ul className="text-sm text-amber-800 space-y-2">
              <li>• OpenAI GPT-4o</li>
              <li>• 高精度画像解析</li>
              <li>• リアルタイム生成</li>
              <li>• 詳細分析レポート</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-md border-2 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">✨ 特徴</h3>
            <ul className="text-sm text-amber-800 space-y-2">
              <li>• プロシージャル生成</li>
              <li>• リアルタイム3D</li>
              <li>• レスポンシブ対応</li>
              <li>• 直感的操作</li>
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
              <h2 className="font-bold text-amber-900 text-2xl">チャット</h2>
              <p className="text-amber-800">AIとクッキー作りを楽しもう！</p>
            </div>
            <div className="flex items-center gap-2 text-amber-900">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">AI オンライン</span>
            </div>
          </div>
        </div>

        {/* Desktop Messages */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-amber-200 flex-shrink-0">
                {msg.isMe ? "🧁" : msg.type === "3d-model" ? "🤖" : "🍪"}
              </div>
              <div className={`max-w-[60%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}>
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
                  {msg.type === "3d-model" && msg.modelUrl && (
                    <div className="space-y-3">
                      <p className="font-medium">{msg.content}</p>
                      <div className="h-64">
                        <Cookie3DViewer modelUrl={msg.modelUrl} analysis={msg.analysis} />
                      </div>
                      <p className="text-sm text-amber-700">🤖 AI生成 | マウスで回転・ズーム可能</p>
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
          <div className="flex items-center gap-4 bg-white rounded-full p-3 shadow-lg border-2 border-amber-200 max-w-4xl mx-auto">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 text-amber-600 hover:bg-amber-100 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージを入力するか、画像をアップロードしてください..."
              className="border-0 bg-transparent focus-visible:ring-0 text-amber-900 placeholder:text-amber-500 text-lg"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              size="icon"
              className="rounded-full w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg flex-shrink-0"
              onClick={handleSendMessage}
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Cookie crumbs decoration */}
      <div className="absolute top-32 left-96 w-3 h-3 bg-amber-400 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-48 right-32 w-2 h-2 bg-orange-400 rounded-full opacity-40 animate-bounce"></div>
      <div className="absolute top-64 left-1/2 w-2.5 h-2.5 bg-amber-500 rounded-full opacity-50 animate-pulse"></div>
    </div>
  )
}
