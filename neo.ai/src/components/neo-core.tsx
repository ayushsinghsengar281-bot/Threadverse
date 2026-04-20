"use client"
import { useState, useEffect, useRef } from "react"

export interface ChatMessage {
  role: "user" | "ai"
  text: string
}

export interface ChatSession {
  id: number
  title: string
  messages: ChatMessage[]
}

export function useNeo() {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  // load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("neo-chats")
    if (saved) {
      const parsed = JSON.parse(saved)
      setChats(parsed)
      if (parsed.length > 0) setCurrentChatId(parsed[0].id)
    } else {
      createNewChat()
    }
  }, [])

  // save chats
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("neo-chats", JSON.stringify(chats))
    }
  }, [chats])

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  const sendMessage = () => {
    if (!message.trim()) return

    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        const newMessages: ChatMessage[] = [
          ...chat.messages,
          { role: "user", text: message },
          {
            role: "ai",
            text: "Neo AI processing... Response generated."
          }
        ]

        return {
          ...chat,
          title: chat.messages.length === 0 ? message.slice(0, 20) : chat.title,
          messages: newMessages
        }
      }
      return chat
    })

    setChats(updatedChats)
    setMessage("")
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats])

  // Fix: Return empty mock chat if currentChat is undefined during initialization
  const currentChat = chats.find(c => c.id === currentChatId) || {
      id: 0,
      title: "",
      messages: []
  }

  return {
    chats,
    currentChat,
    setCurrentChatId,
    createNewChat,
    sendMessage,
    message,
    setMessage,
    chatEndRef
  }
}
