'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ReactMarkdown from 'react-markdown'
import {
  Loader,
  Send,
  Bot,
  User,
  Copy,
  Check,
  MessageSquare,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssistantData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sportsWithSlots: any[]
  facilityStats: {
    totalSports: number
    totalSlots: number
    todayBookings: number
    currentDate: string
  }
  currentUser: {
    user_type: string
    gender: string
  } | null
  lastUpdated: string
}

interface AiAssistantProps {
  initialData: AssistantData
}

export function AiAssistant({ initialData }: AiAssistantProps) {
  const { messages, input, handleInputChange, handleSubmit, status, setMessages, append } = useChat({
    api: '/api/chat',
    body: {
      sportsData: initialData
    }
  })

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  // Keep input focused at all times during conversation
  useEffect(() => {
    if (status === 'ready' && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [status, messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedMessageId(messageId)
    setTimeout(() => setCopiedMessageId(null), 2000)
    // Refocus input after copy
    inputRef.current?.focus()
  }

  const quickSuggestions = [
    "What sports are available?",
    "Book a court at 3 PM",
    "Show facility status",
    "Find available slots",
    "Help with swimming rules",
    "What's popular today?"
  ]

  const handleSuggestionClick = async (suggestion: string) => {
    // Use append to add the user message and trigger AI response
    await append({
      role: 'user',
      content: suggestion,
    })
    setShowSuggestions(false)
    // Keep focus on input
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleReload = () => {
    setMessages([])
    setShowSuggestions(true)
    setCopiedMessageId(null)
    // Refocus input after reload
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Calculate message bubble width based on content length
  const getMessageWidth = (content: string) => {
    const length = content.length
    if (length < 50) return 'max-w-[60%]'
    if (length < 150) return 'max-w-[75%]'
    return 'max-w-[85%]'
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLElement;
          target.style.scrollbarColor = 'rgba(156, 163, 175, 0.6) transparent';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLElement;
          target.style.scrollbarColor = 'rgba(156, 163, 175, 0.3) transparent';
        }}
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            <div className="text-center mb-8 max-w-md">
              <div className="flex items-center justify-center gap-2 mb-3">
                <h1 className="text-3xl font-bold">Courtside AI</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Your smart assistant for all booking and facility questions
              </p>
            </div>

            {showSuggestions && (
              <div className="w-full max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto py-3 px-4 text-sm hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 min-h-[3rem] whitespace-normal"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <MessageSquare className="w-4 h-4 mr-3 text-primary flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages with Header */}
        {messages.length > 0 && (
          <div className="space-y-6 pb-4">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Courtside AI</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReload}
                className="text-sm text-muted-foreground hover:text-foreground h-7 px-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                New chat
              </Button>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  getMessageWidth(message.content),
                  message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {message.role === 'user' ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 space-y-1">
                  <div
                    className={cn(
                      'relative group max-w-fit',
                      message.role === 'user'
                        ? 'ml-auto'
                        : 'mr-auto'
                    )}
                  >
                    <div
                      className={cn(
                        'px-4 py-3 relative',
                        message.role === 'user'
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-2xl rounded-tr-md shadow-md'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-md shadow-sm',
                        // Dynamic padding based on content length
                        message.content.length < 50 ? 'px-3 py-2.5' : 'px-4 py-3'
                      )}
                    >
                      <div className={cn(
                        'leading-relaxed text-sm',
                        message.role === 'user'
                          ? 'text-white dark:text-neutral-900'
                          : 'text-neutral-900 dark:text-neutral-100'
                      )}>
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              a: ({ href, children, ...props }) => {
                                const isExternal = href?.startsWith('http')
                                const isInternal = href?.startsWith('/')

                                return (
                                  <a
                                    href={href}
                                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-semibold transition-all duration-200 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 py-0.5 rounded"
                                    target={isExternal ? '_blank' : '_self'}
                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                    onClick={(e) => {
                                      if (isInternal) {
                                        e.preventDefault()
                                        if (href) window.location.href = href
                                      }
                                    }}
                                    {...props}
                                  >
                                    {children}
                                    {isExternal && <span className="text-xs">↗</span>}
                                  </a>
                                )
                              },
                              strong: ({ children }) => (
                                <strong className="font-bold text-foreground bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">{children}</strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-none space-y-2 my-3 ml-0">{children}</ul>
                              ),
                              li: ({ children }) => (
                                <li className="flex items-start gap-2 text-sm leading-relaxed">
                                  <span className="text-primary mt-1 font-bold">•</span>
                                  <span className="flex-1">{children}</span>
                                </li>
                              ),
                              p: ({ children }) => (
                                <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold mb-3 text-primary border-b border-primary/20 pb-1">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wide">{children}</h3>
                              ),
                              code: ({ children, className }) => {
                                const isInline = !className
                                return isInline ? (
                                  <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono font-semibold">
                                    {children}
                                  </code>
                                ) : (
                                  <code className={`block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto border-l-4 border-primary`}>
                                    {children}
                                  </code>
                                )
                              },
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-3 italic rounded-r">
                                  {children}
                                </blockquote>
                              ),
                            }}
                            allowedElements={undefined}
                            disallowedElements={['script', 'iframe', 'object', 'embed', 'form']}
                            skipHtml={false}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>

                      {/* Copy button for assistant messages */}
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Message timestamp (optional) */}
                  <div className={cn(
                    'text-xs text-muted-foreground px-1',
                    message.role === 'user' ? 'text-right' : 'text-left'
                  )}>
                    {/* You can add timestamp here if needed */}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator - only show when loading and no assistant message is streaming */}
            {(status === 'submitted' || status === 'streaming') && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
              <div className="flex gap-3 max-w-[60%]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/10">
                  <Bot className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <span className="text-sm text-muted-foreground ml-2 animate-pulse">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t bg-[#fbfbfa]/95 dark:bg-[#191919]/95 backdrop-blur-sm">
        <div className="p-4 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder={(status === 'submitted' || status === 'streaming') ? "AI is thinking..." : "Ask anything about Courtside..."}
                disabled={status === 'submitted' || status === 'streaming'}
                className={cn(
                  "h-12 text-sm rounded-xl border-2 focus:border-primary/50 pr-12",
                  (status === 'submitted' || status === 'streaming') && "pl-10"
                )}
                autoComplete="off"
                onBlur={() => {
                  // Prevent losing focus when not intended
                  if (status === 'ready') {
                    setTimeout(() => inputRef.current?.focus(), 50)
                  }
                }}
              />
              {(status === 'submitted' || status === 'streaming') && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}
              {input.length > 0 && status === 'ready' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {input.length}
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={status === 'submitted' || status === 'streaming' || !input.trim()}
              size="lg"
              className="h-12 w-12 rounded-xl flex-shrink-0"
            >
              {(status === 'submitted' || status === 'streaming') ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-3">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}