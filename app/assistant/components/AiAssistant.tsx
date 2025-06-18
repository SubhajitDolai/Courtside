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
  const { messages, input, handleInputChange, handleSubmit, status, setMessages, append, error } = useChat({
    api: '/api/chat',
    body: {
      sportsData: initialData
    }
  })

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [rateLimitError, setRateLimitError] = useState<{ show: boolean; message: string; retryAfter?: number; retryCountdown?: number }>({ show: false, message: '' })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  // Keep input focused at all times during conversation
  useEffect(() => {
    if (status === 'ready' && inputRef.current && !rateLimitError.show) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [status, messages, rateLimitError.show])

  // Focus input on mount
  useEffect(() => {
    if (!rateLimitError.show) {
      inputRef.current?.focus()
    }
  }, [rateLimitError.show])

  // Handle rate limit error detection
  useEffect(() => {
    if (error) {
      // Check if it's a rate limit error (429)
      const errorMessage = error.message || error.toString()
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('too many requests')) {
        // Extract retry-after time if available (default to 60 seconds)
        const retryAfterMatch = errorMessage.match(/retry.*?(\d+)/i)
        const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 60
        
        setRateLimitError({
          show: true,
          message: 'You\'ve reached the rate limit. Please wait before sending another message.',
          retryAfter,
          retryCountdown: retryAfter
        })

        // Start countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
        }

        countdownIntervalRef.current = setInterval(() => {
          setRateLimitError(prev => {
            if (prev.retryCountdown && prev.retryCountdown > 1) {
              return { ...prev, retryCountdown: prev.retryCountdown - 1 }
            } else {
              // Auto-hide when countdown reaches 0
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
              }
              return { show: false, message: '' }
            }
          })
        }, 1000)

        // Auto-hide after retry period
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }

        retryTimeoutRef.current = setTimeout(() => {
          setRateLimitError({ show: false, message: '' })
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
          }
        }, retryAfter * 1000)
      }
    }
  }, [error])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedMessageId(messageId)
    setTimeout(() => setCopiedMessageId(null), 2000)
    // Refocus input after copy
    inputRef.current?.focus()
  }

  const quickSuggestions = [
    "What slots are active right now?",
    "I want to book a badminton slot at 5pm",
    "Which sports can I book today?",
    "What time does booking open?",
    "How do I check slot availability?",
    "What's popular today?"
  ]

  const handleSuggestionClick = async (suggestion: string) => {
    // Don't allow suggestions during rate limit
    if (rateLimitError.show) {
      return
    }
    
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
    setRateLimitError({ show: false, message: '' })
    
    // Clear any existing timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
    
    // Refocus input after reload
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Don't submit if rate limited
    if (rateLimitError.show) {
      return
    }
    
    // Use the default handleSubmit
    handleSubmit(e)
  }

  const handleRetryAfterRateLimit = () => {
    setRateLimitError({ show: false, message: '' })
    
    // Clear any existing timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
    
    // Refocus input
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Calculate message bubble width based on content length with proper responsive constraints
  const getMessageWidth = (content: string) => {
    const length = content.length
    if (length < 50) return 'max-w-[85%] sm:max-w-[70%] md:max-w-[60%]'
    if (length < 150) return 'max-w-[90%] sm:max-w-[80%] md:max-w-[75%]'
    return 'max-w-[95%] sm:max-w-[85%] md:max-w-[80%]'
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto relative">
      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 pb-30"
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
        <div className="min-h-full flex flex-col justify-end">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-full">
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
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3">
                    {quickSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={cn(
                          "text-left justify-start h-auto py-2 md:py-3 px-3 md:px-4 text-xs md:text-sm hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 min-h-[2.5rem] md:min-h-[3rem] whitespace-normal",
                          rateLimitError.show && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={rateLimitError.show}
                      >
                        <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-primary flex-shrink-0 mt-0.5" />
                        <span className="leading-tight text-xs md:text-sm">{suggestion}</span>
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
                  <div className="flex-1 space-y-1 min-w-0">
                    <div
                      className={cn(
                        'relative group max-w-fit min-w-0',
                        message.role === 'user'
                          ? 'ml-auto'
                          : 'mr-auto'
                      )}
                    >
                      <div
                        className={cn(
                          'px-3 py-2.5 sm:px-4 sm:py-3 relative overflow-hidden break-words min-w-0',
                          message.role === 'user'
                            ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-2xl rounded-tr-md shadow-md'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-md shadow-sm'
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
                            <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</div>
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
                <div className="flex gap-3 max-w-[85%] sm:max-w-[70%] md:max-w-[60%]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/10">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-md px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
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
      </div>

      {/* Rate Limit Error Banner */}
      {rateLimitError.show && (
        <div className="fixed bottom-20 left-4 right-4 z-50 max-w-5xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Rate Limit Reached
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                    {rateLimitError.message}
                    {rateLimitError.retryCountdown && rateLimitError.retryCountdown > 0 && (
                      <span className="block mt-1 font-mono text-xs">
                        Auto-retry in {rateLimitError.retryCountdown} second{rateLimitError.retryCountdown !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryAfterRateLimit}
                      className="h-8 text-xs bg-white dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/70"
                      disabled={rateLimitError.retryCountdown ? rateLimitError.retryCountdown > 0 : false}
                    >
                      {rateLimitError.retryCountdown && rateLimitError.retryCountdown > 0 ? (
                        <>Wait {rateLimitError.retryCountdown}s</>
                      ) : (
                        <>Try Again</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRateLimitError({ show: false, message: '' })}
                      className="h-8 text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-[#fbfbfa]/95 dark:bg-[#191919]/95 backdrop-blur-sm">
        <div className="p-4 max-w-5xl mx-auto">
          <form onSubmit={handleCustomSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder={
                  rateLimitError.show 
                    ? "Rate limited - please wait..."
                    : (status === 'submitted' || status === 'streaming') 
                      ? "AI is thinking..." 
                      : "Ask anything about Courtside..."
                }
                disabled={status === 'submitted' || status === 'streaming' || rateLimitError.show}
                className={cn(
                  "h-12 text-sm rounded-xl border-2 focus:border-primary/50 pr-12",
                  (status === 'submitted' || status === 'streaming') && "pl-10",
                  rateLimitError.show && "border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                )}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                type="text"
                inputMode="text"
                name="chat-message"
                id="chat-input"
                data-form-type="other"
                data-lpignore="true"
                role="textbox"
                aria-label="Chat message"
                onBlur={() => {
                  // Prevent losing focus when not intended
                  if (status === 'ready' && !rateLimitError.show) {
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
              disabled={status === 'submitted' || status === 'streaming' || !input.trim() || rateLimitError.show}
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

          <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3 px-2">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}