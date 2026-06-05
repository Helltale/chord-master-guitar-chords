import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ChordBarre } from '@/api/schemas'
import { ChordDiagram } from '@/components/ChordDiagram'

interface ChordHintBadgeProps {
  chord: string
  shape?: string
  barre?: ChordBarre
}

type TooltipPlacement = 'above' | 'below'

interface TooltipState {
  x: number
  y: number
  placement: TooltipPlacement
}

const TOOLTIP_GAP = 12
const VIEWPORT_MARGIN = 8

function computeTooltipPosition(
  anchor: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
): TooltipState {
  const centerX = anchor.left + anchor.width / 2
  const halfWidth = tooltipWidth / 2
  const x = Math.max(
    VIEWPORT_MARGIN + halfWidth,
    Math.min(window.innerWidth - VIEWPORT_MARGIN - halfWidth, centerX),
  )

  const spaceAbove = anchor.top - VIEWPORT_MARGIN
  const spaceBelow = window.innerHeight - anchor.bottom - VIEWPORT_MARGIN
  const fitsAbove = spaceAbove >= tooltipHeight + TOOLTIP_GAP
  const fitsBelow = spaceBelow >= tooltipHeight + TOOLTIP_GAP

  let placement: TooltipPlacement = 'above'
  if (!fitsAbove && fitsBelow) {
    placement = 'below'
  } else if (!fitsAbove && !fitsBelow) {
    placement = spaceBelow > spaceAbove ? 'below' : 'above'
  }

  const y = placement === 'above' ? anchor.top : anchor.bottom
  return { x, y, placement }
}

export function ChordHintBadge({ chord, shape, barre }: ChordHintBadgeProps) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const showTooltip = useCallback(() => {
    if (!shape) return
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) return
    // Initial estimate before measure; refined in useLayoutEffect.
    setTooltip(computeTooltipPosition(rect, 208, 260))
  }, [shape])

  const hideTooltip = useCallback(() => {
    setTooltip(null)
  }, [])

  useLayoutEffect(() => {
    if (!tooltip || !anchorRef.current || !tooltipRef.current) return
    const anchorRect = anchorRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    if (tooltipRect.width < 40 || tooltipRect.height < 40) return
    const next = computeTooltipPosition(anchorRect, tooltipRect.width, tooltipRect.height)
    if (
      next.placement !== tooltip.placement ||
      Math.abs(next.x - tooltip.x) > 0.5 ||
      Math.abs(next.y - tooltip.y) > 0.5
    ) {
      setTooltip(next)
    }
  }, [tooltip])

  const hasHint = Boolean(shape)

  const tooltipTransform =
    tooltip?.placement === 'below'
      ? `translate(-50%, ${TOOLTIP_GAP}px)`
      : `translate(-50%, calc(-100% - ${TOOLTIP_GAP}px))`

  return (
    <>
      <span
        ref={anchorRef}
        className={`rounded-md bg-indigo-500/15 px-1.5 py-0 text-base text-emerald-700 shadow-sm shadow-indigo-900/10 dark:bg-indigo-500/20 dark:text-emerald-300 dark:shadow-indigo-900/30 ${
          hasHint ? 'cursor-help' : ''
        }`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={hasHint ? 0 : undefined}
        aria-describedby={tooltip ? `chord-hint-${chord}` : undefined}
      >
        {chord}
      </span>
      {tooltip &&
        shape &&
        createPortal(
          <div
            ref={tooltipRef}
            id={`chord-hint-${chord}`}
            role="tooltip"
            className="pointer-events-none fixed z-[100] rounded-2xl border border-slate-600 bg-slate-900 p-4 shadow-2xl shadow-black/60"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: tooltipTransform,
            }}
          >
            <p className="mb-3 text-center font-mono text-base font-bold text-indigo-300">{chord}</p>
            <ChordDiagram chord={chord} shape={shape} barre={barre} className="h-44 w-36" />
          </div>,
          document.body,
        )}
    </>
  )
}
