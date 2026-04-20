"use client"

import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

// ✅ Panel Group
const ResizablePanelGroup = React.forwardRef<
  ResizablePrimitive.GroupImperativeHandle,
  ResizablePrimitive.GroupProps & {
    direction?: "horizontal" | "vertical"
  }
>(({ className, direction, ...props }, ref) => (
  <ResizablePrimitive.Group
    {...props}
    direction={direction}
    groupRef={ref as any}
    className={cn("flex h-full w-full", className)}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

// ✅ Panel
const ResizablePanel = React.forwardRef<
  ResizablePrimitive.PanelImperativeHandle,
  ResizablePrimitive.PanelProps
>(({ className, onCollapse, onExpand, ...props }, ref) => (
  <ResizablePrimitive.Panel
    {...props}
    panelRef={ref as any}
    onCollapse={onCollapse}
    onExpand={onExpand}
    className={className}
  />
))
ResizablePanel.displayName = "ResizablePanel"

// ✅ Handle
const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  ResizablePrimitive.SeparatorProps & {
    withHandle?: boolean
  }
>(({ withHandle, className, ...props }, ref) => (
  <ResizablePrimitive.Separator
    {...props}
    elementRef={ref as any}
    className={cn(
      "relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
      className
    )}
  >
    {withHandle && (
      <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />
    )}
  </ResizablePrimitive.Separator>
))
ResizableHandle.displayName = "ResizableHandle"

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }