"use client"

import { useEffect, useRef, useState } from "react"
import { askChat, type ChatTurn } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"

// Homepage help chat — bottom-right bubble. Anonymous, ephemeral (nothing stored), answers
// only Gigahoo questions; the server holds the knowledge and the rate limit.
export function ChatWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatTurn[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Noticeability: an Intercom-style teaser pill appears after a few seconds unless the
  // visitor has already opened or dismissed it this session.
  const [teaser, setTeaser] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("gigahoo_chat_teaser") === "seen") return
    const id = setTimeout(() => setTeaser(true), 4000)
    return () => clearTimeout(id)
  }, [])

  function dismissTeaser() {
    setTeaser(false)
    try { sessionStorage.setItem("gigahoo_chat_teaser", "seen") } catch {}
  }

  useEffect(() => {
    // Desktop only: iOS zooms + opens the keyboard when an input is programmatically
    // focused, which overflowed the panel off-screen on iPhone.
    if (open && !window.matchMedia("(pointer: coarse)").matches) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, busy])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    setInput("")
    setFailed(false)
    const next: ChatTurn[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setBusy(true)
    try {
      const { reply } = await askChat(next)
      setMessages((cur) => [...cur, { role: "assistant", content: reply }])
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[min(28rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary-foreground">
              <span className="h-[6px] w-[6px] rounded-full bg-green-400 motion-safe:[animation:heroLiveBlink_0.7s_ease-in-out_infinite]" />
              {t("chat.title")}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("chat.close")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground/80 cursor-pointer transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-sm text-foreground">
              {t("chat.greeting")}
            </div>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-sm text-foreground">
                  {m.content}
                </div>
              ),
            )}
            {busy && (
              <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
            )}
            {failed && <p className="text-xs text-destructive">{t("chat.error")}</p>}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); void send() }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              maxLength={1000}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={busy || input.trim().length === 0}
              aria-label={t("chat.send")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground cursor-pointer transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {teaser && !open && (
        <div className="flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-4 pr-2 shadow-lg">
          <button
            type="button"
            onClick={() => { dismissTeaser(); setOpen(true) }}
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            {t("chat.teaser")}
          </button>
          <button
            type="button"
            onClick={dismissTeaser}
            aria-label={t("chat.close")}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground cursor-pointer transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => { dismissTeaser(); setOpen((o) => !o) }}
        aria-label={t("chat.title")}
        className={"inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg cursor-pointer transition-transform hover:scale-105" + (teaser && !open ? " animate-pulse" : "")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  )
}
