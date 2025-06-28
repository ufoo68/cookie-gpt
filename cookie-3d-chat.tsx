"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Send, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="max-w-md mx-auto h-[700px] bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-orange-300 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-md">🍪</div>
          <div>
            <h1 className="font-bold text-amber-900 text-lg">AI クッキー3D工房</h1>
            <p className="text-amber-800 text-sm">OpenAI Agents SDK搭載</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 h-[500px] overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow-md border-2 border-amber-200">
              {msg.isMe ? "🧁" : msg.type === "3d-model" ? "🤖" : "🍪"}
            </div>
            <div className={`max-w-[80%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}>
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
                      className="max-w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-xs">イラストをアップロードしました</p>
                  </div>
                )}
                {msg.type === "3d-model" && msg.modelUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{msg.content}</p>
                    <Cookie3DViewer modelUrl={msg.modelUrl} analysis={msg.analysis} />
                    <p className="text-xs text-amber-700">🤖 AI生成 | マウスで回転・ズーム可能</p>
                  </div>
                )}
              </div>
              <span className="text-xs text-amber-700 mt-1 px-2">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cookie crumbs decoration */}
      <div className="absolute top-20 left-6 w-2 h-2 bg-amber-400 rounded-full opacity-60"></div>
      <div className="absolute top-32 right-8 w-1 h-1 bg-orange-400 rounded-full opacity-40"></div>
      <div className="absolute top-48 left-12 w-1.5 h-1.5 bg-amber-500 rounded-full opacity-50"></div>

      {/* Input */}
      <div className="p-4 bg-gradient-to-r from-amber-200 to-orange-200 border-t-2 border-amber-300">
        <div className="flex items-center gap-2 bg-white rounded-full p-2 shadow-lg border-2 border-amber-200">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 text-amber-600 hover:bg-amber-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージまたは画像をアップロード..."
            className="border-0 bg-transparent focus-visible:ring-0 text-amber-900 placeholder:text-amber-500"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            size="icon"
            className="rounded-full w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-md"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
