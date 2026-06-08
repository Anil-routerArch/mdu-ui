"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const chartId = React.useId()
  const resolvedId = `chart-${id ?? chartId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={resolvedId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-slate-400 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-[#e7eef8] [&_.recharts-curve.recharts-tooltip-cursor]:stroke-[#d7e3f6] [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-[#e7eef8] [&_.recharts-radial-bar-background-sector]:fill-[#eff4fb] [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[#f5f8fd] [&_.recharts-reference-line_[stroke='#ccc']]:stroke-[#e7eef8] flex aspect-video justify-center text-xs",
          className,
        )}
        {...props}
      >
        <ChartStyle id={resolvedId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, value]) => value.color,
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {${colorConfig
          .map(([key, value]) => `--color-${key}: ${value.color};`)
          .join("")}}`,
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipPayloadItem = {
  dataKey?: string | number
  value?: string | number
  color?: string
}

function ChartTooltipContent({
  active,
  payload,
  className,
  hideLabel = false,
}: {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  className?: string
  hideLabel?: boolean
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "min-w-[148px] rounded-xl border border-[#e4ecf7] bg-white px-3 py-2 text-xs shadow-[0_16px_36px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${item.dataKey ?? "value"}`
        const itemConfig = config[key]

        return (
          <div key={key} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color ?? `var(--color-${key})` }}
              />
              {!hideLabel ? (
                <span className="truncate text-slate-500">
                  {itemConfig?.label ?? key}
                </span>
              ) : null}
            </div>
            <span className="font-medium text-[#0f1f46]">
              {Number(item.value ?? 0).toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
