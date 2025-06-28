"use client"

import { useState } from "react"
import { Send, Smile, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Component() {
  const [message, setMessage] = useState("")

  const messages = [
    {
      id: 1,
      user: "あかり",
      avatar: "🍪",
      message: "今日のクッキー作り、とても楽しかったです！",
      time: "14:30",
      isMe: false,
    },
    {
      id: 2,
      user: "私",
      avatar: "🧁",
      message: "チョコチップクッキーが一番美味しかったね〜",
      time: "14:32",
      isMe: true,
    },
    {
      id: 3,
      user: "みお",
      avatar: "🍰",
      message: "次回はマカロンに挑戦してみない？",
      time: "14:35",
      isMe: false,
    },
    {
      id: 4,
      user: "私",
      avatar: "🧁",
      message: "いいアイデア！今度みんなでやろう 🎉",
      time: "14:36",
      isMe: true,
    },
  ]

  return (
    <div className="max-w-md mx-auto h-[600px] bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-300 to-orange-300 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-md">🍪</div>
          <div>
            <h1 className="font-bold text-amber-900 text-lg">スイーツ仲間</h1>
            <p className="text-amber-800 text-sm">オンライン中</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 h-[400px] overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow-md border-2 border-amber-200">
              {msg.avatar}
            </div>
            <div className={`max-w-[70%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}>
              <div
                className={`px-4 py-3 rounded-2xl shadow-md ${
                  msg.isMe
                    ? "bg-gradient-to-r from-orange-300 to-amber-300 text-amber-900 rounded-br-md"
                    : "bg-white text-amber-900 rounded-bl-md border-2 border-amber-100"
                }`}
              >
                <p className="text-sm font-medium">{msg.message}</p>
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
          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-amber-600 hover:bg-amber-100">
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="border-0 bg-transparent focus-visible:ring-0 text-amber-900 placeholder:text-amber-500"
          />
          <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-amber-600 hover:bg-amber-100">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="rounded-full w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
