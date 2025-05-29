import { AiAssistant } from '@/components/AiAssistant'

export default function AssistantPage() {
  return (
    <div className="h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#191919]">
      {/* Spacer for glassmorphic navbar */}
      <div className="h-23 md:h-23 flex-shrink-0" />
      
      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <AiAssistant />
      </div>
    </div>
  )
}
