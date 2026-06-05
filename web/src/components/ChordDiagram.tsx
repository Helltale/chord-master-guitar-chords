import type { ChordBarre } from '@/api/schemas'
import { parseChordShape } from '@/utils/chordShape'

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'] as const

function buildFretboardGeometry() {
  const W = 100
  const H = 100
  const padX = 8
  const padTop = 10
  const padBottom = 10
  const fretLines = 5
  const yStep = (H - padTop - padBottom) / (fretLines - 1)
  const yLines = Array.from({ length: fretLines }, (_, i) => padTop + i * yStep)
  const stringCount = STRING_LABELS.length
  const xStep = (W - padX * 2) / (stringCount - 1)
  const xStrings = Array.from({ length: stringCount }, (_, i) => padX + i * xStep)
  return { W, H, yLines, xStrings }
}

interface ChordDiagramProps {
  chord: string
  shape: string
  barre?: ChordBarre
  compact?: boolean
  className?: string
}

export function ChordDiagram({ chord, shape, barre, compact, className }: ChordDiagramProps) {
  const frets = parseChordShape(shape)
  if (!frets) {
    return (
      <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap break-all rounded-lg bg-slate-100 p-2 font-mono text-[11px] text-slate-800 custom-scrollbar dark:bg-slate-950/70 dark:text-slate-100">
        {shape}
      </pre>
    )
  }

  let baseFret = 1
  let showNut = true
  const usedFrets = frets.filter((f) => f > 0)
  if (usedFrets.length > 0) {
    const max = Math.max(...usedFrets)
    const min = Math.min(...usedFrets)
    if (max > 3) {
      baseFret = min
      showNut = false
    }
  }

  const barreSegments = barre ? [barre] : []
  const isInBarre = (fret: number, stringIdx: number) =>
    barreSegments.some((b) => b.fret === fret && stringIdx >= b.from && stringIdx <= b.to)

  const { W, H, yLines, xStrings } = buildFretboardGeometry()
  const yTop = yLines[0]
  const yBottom = yLines[yLines.length - 1]
  const stringMarkers = frets.map((f) => (f < 0 ? 'x' : f === 0 ? 'o' : ''))

  return (
    <div className={className ?? (compact ? 'h-16 w-12' : 'h-32 w-24')}>
      <div className="relative h-full w-full rounded-md bg-slate-100 dark:bg-slate-950/80">
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${chord} chord fingering`}
        >
          <rect x="0" y="0" width={W} height={H} rx="8" fill="transparent" />

          {stringMarkers.map((mark, idx) =>
            mark ? (
              <text
                key={`m-${idx}`}
                x={xStrings[idx]}
                y={yTop - 4}
                textAnchor="middle"
                fontSize="11"
                fill="rgb(203 213 225)"
              >
                {mark}
              </text>
            ) : null,
          )}

          {xStrings.map((x) => (
            <line
              key={`s-${x}`}
              x1={x}
              x2={x}
              y1={yTop}
              y2={yBottom}
              stroke="rgb(51 65 85)"
              strokeWidth="1"
              shapeRendering="geometricPrecision"
            />
          ))}

          {yLines.map((y, idx) => (
            <line
              key={`f-${y}`}
              x1={xStrings[0]}
              x2={xStrings[xStrings.length - 1]}
              y1={y}
              y2={y}
              stroke={idx === 0 && showNut ? 'rgb(226 232 240)' : 'rgb(30 41 59)'}
              strokeWidth={idx === 0 && showNut ? 4 : 1}
              strokeLinecap="round"
              shapeRendering="geometricPrecision"
            />
          ))}

          {Array.from(new Set(barreSegments.map((b) => b.fret)))
            .filter((fret) => fret > 1)
            .map((fret) => {
              const rowIndex = Math.max(1, Math.min(4, fret - baseFret + 1))
              const y = (yLines[rowIndex - 1] + yLines[rowIndex]) / 2
              return (
                <text
                  key={`barre-label-${fret}`}
                  x={W - 4}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="rgb(148 163 184)"
                >
                  {fret}
                </text>
              )
            })}

          {barreSegments.map((b) => {
            const rowIndex = Math.max(1, Math.min(4, b.fret - baseFret + 1))
            const y = (yLines[rowIndex - 1] + yLines[rowIndex]) / 2
            const xStart = xStrings[b.from]
            const xEnd = xStrings[b.to]
            const barHeight = 10
            const paddingX = 5
            return (
              <rect
                key={`barre-${b.fret}-${b.from}-${b.to}`}
                x={xStart - paddingX}
                y={y - barHeight / 2}
                width={xEnd - xStart + paddingX * 2}
                height={barHeight}
                rx={barHeight / 2}
                fill="rgb(165 180 252)"
                filter="drop-shadow(0px 0px 8px rgba(129,140,248,0.95))"
              />
            )
          })}

          {frets.map((fret, stringIdx) => {
            if (fret <= 0 || isInBarre(fret, stringIdx)) return null
            const rowIndex = Math.max(1, Math.min(4, fret - baseFret + 1))
            const y = (yLines[rowIndex - 1] + yLines[rowIndex]) / 2
            const x = xStrings[stringIdx]
            return (
              <circle
                key={`${stringIdx}-${fret}`}
                cx={x}
                cy={y}
                r="5.5"
                fill="rgb(165 180 252)"
                filter="drop-shadow(0px 0px 6px rgba(129,140,248,0.9))"
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
