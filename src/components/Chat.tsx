"use client"

import { useEffect, useRef, useState } from "react"
import pb from "@/lib/pocketbase"
import type { RecordModel } from "pocketbase"
import "./Chat.css"

interface ChatProps {
  projectId: string
  currentUserId: string
}

export default function Chat({ projectId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<RecordModel[]>([])
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()

    const unsubscribe = pb.collection("messages").subscribe("*", (e) => {
      if (e.record.project === projectId) {
        if (e.action === "create") {
          pb.collection("messages").getOne(e.record.id, { expand: "sender", $autoCancel: false })
            .then((full) => setMessages((prev) => [...prev, full]))
            .catch(() => setMessages((prev) => [...prev, e.record]))
        }
      }
    }, { expand: "sender" })

    return () => {
      unsubscribe.then((fn) => fn())
    }
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadMessages() {
    const list = await pb.collection("messages").getList(1, 200, {
      filter: `project = "${projectId}"`,
      sort: "created",
      expand: "sender",
      $autoCancel: false,
    })
    setMessages(list.items)
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      await pb.collection("messages").create({
        project: projectId,
        sender: currentUserId,
        content: content.trim(),
      })
      setContent("")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat">
      <div className="chat__messages">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUserId
          return (
            <div key={msg.id} className={`chat__bubble ${isMe ? "chat__bubble--me" : "chat__bubble--them"}`}>
              {!isMe && (
                <span className="chat__sender">
                  {msg.expand?.sender?.name || "Seedev"}
                </span>
              )}
              <p className="chat__text">{msg.content}</p>
              <span className="chat__time">
                {new Date(msg.created).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form className="chat__form" onSubmit={send}>
        <input
          className="chat__input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Votre message..."
          disabled={sending}
        />
        <button className="chat__send" type="submit" disabled={sending || !content.trim()}>
          Envoyer
        </button>
      </form>
    </div>
  )
}
