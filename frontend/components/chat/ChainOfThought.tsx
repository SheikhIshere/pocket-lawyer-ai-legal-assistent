import { useEffect, useState } from "react"
import {
  BookOpen, ListChecks, Search, Map as MapIcon, FileSearch,
  Layers, Scale, Gavel, MessageCircleQuestion, Ban, Circle,
} from "lucide-react"
import {
  Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger,
  TraceIcon, TraceLine, TraceTitle,
} from "@/components/ui/trace"
import { StepRecord } from "../../types"

const ICONS: Record<string, typeof Circle> = {
  load: BookOpen,
  know: ListChecks,
  search: Search,
  map: MapIcon,
  drill: FileSearch,
  coverage: Layers,
  gate: Scale,
  plan: Gavel,
  ask: MessageCircleQuestion,
  safety: Ban,
  classify: MessageCircleQuestion,
  learn: BookOpen,
}

interface ChainOfThoughtProps {
  records: StepRecord[]
  running?: boolean
  startedAt?: number | null
  defaultOpen?: boolean
}

export function ChainOfThought({ records, running = false, startedAt = null, defaultOpen }: ChainOfThoughtProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [running])

  if (!records?.length) return null

  const first = records[0]?.at
  const last = records[records.length - 1]?.at
  const seconds = running
    ? (startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : null)
    : (first && last ? Math.max(0, Math.round(last - first)) : null)
  const header = running
    ? `Thinking · ${seconds ?? 0}s`
    : seconds !== null
      ? `Thought for ${seconds} seconds`
      : "Thought process"

  return (
    <div className="rounded-xl border p-4">
      <Trace>
        <TraceCollapsible defaultOpen={defaultOpen ?? running}>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceTitle>{header}</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent keepMounted>
            <Trace>
              {records.map((record, index) => {
                const Icon = ICONS[record.name] || Circle
                const status =
                  record.status === "failed"
                    ? "error"
                    : running && index === records.length - 1
                      ? "running"
                      : undefined
                return (
                  <TraceLine key={`${record.step}-${index}`} status={status}>
                    <TraceIcon><Icon /></TraceIcon>
                    <TraceTitle>{record.name} — {record.detail}</TraceTitle>
                  </TraceLine>
                )
              })}
            </Trace>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    </div>
  )
}
