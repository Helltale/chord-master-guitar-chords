import type { ChordDefinition, TabContent as TabContentType } from '@/api/schemas'
import { ChordHintBadge } from '@/components/ChordHintBadge'
import {
  getHangingLeadChord,
  segmentChordForDisplay,
  segmentTextForDisplay,
} from '@/utils/lyricsLineLayout'
import { catalogByName } from '@/utils/resolveChordTabs'

interface SongContentProps {
  content: TabContentType
  chordTabs?: Record<string, string>
  catalog?: ChordDefinition[]
}

function ChordBadge({
  chord,
  chordTabs,
  catalog,
}: {
  chord: string
  chordTabs?: Record<string, string>
  catalog?: ChordDefinition[]
}) {
  const shape = chordTabs?.[chord]
  const barre = catalog ? catalogByName(catalog).get(chord)?.barre : undefined
  return <ChordHintBadge chord={chord} shape={shape} barre={barre} />
}

export function SongContent({ content, chordTabs, catalog }: SongContentProps) {
  const sections = content.sections ?? []
  return (
    <article className="max-w-none pl-10 text-gray-800 dark:text-gray-200">
      {sections.map((section, idx) => (
        <section key={idx} className="mb-10">
          {section.label && (
            <h3 className="mb-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-300">
              {section.label}
            </h3>
          )}
          {(section.blocks ?? []).map((block, bidx) => (
            <div key={bidx} className="mb-1">
              {block.kind === 'lyrics' && (() => {
                const segments = block.segments ?? []
                const hanging = getHangingLeadChord(segments)
                const lineHasChords = segments.some((seg) => seg.chord)
                return (
                  <div className="relative font-sans leading-snug text-slate-800 dark:text-gray-100">
                    {hanging && (
                      <span
                        className="absolute top-0 flex min-h-[1.25rem] items-start justify-end pr-0.5 text-base font-mono font-semibold leading-snug"
                        style={{ right: '100%', width: `${hanging.leadingSpaces}ch` }}
                      >
                        <ChordBadge chord={hanging.chord} chordTabs={chordTabs} catalog={catalog} />
                      </span>
                    )}
                    {segments.map((seg, sidx) => {
                      const chord = segmentChordForDisplay(seg, sidx, hanging)
                      const text = segmentTextForDisplay(seg, sidx, hanging)
                      return (
                        <span
                          key={sidx}
                          className="inline-block min-w-[0.25rem] align-top"
                        >
                          {lineHasChords && (
                            <span className="block min-h-[1.25rem] whitespace-nowrap text-base font-mono font-semibold leading-snug text-emerald-700 dark:text-emerald-300">
                              {chord ? (
                                <ChordBadge chord={chord} chordTabs={chordTabs} catalog={catalog} />
                              ) : null}
                            </span>
                          )}
                          <span className="whitespace-pre-wrap break-words text-base text-slate-800 dark:text-slate-100">
                            {text}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                )
              })()}
              {block.kind === 'instrumental' && (
                <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-4 text-sm text-slate-700 dark:border-indigo-400/40 dark:bg-indigo-900/20 dark:text-gray-200">
                  {block.label && (
                    <span className="mb-1 block font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                      {block.label}
                    </span>
                  )}
                  {block.chords && block.chords.length > 0 && (
                    <p className="font-mono text-sm text-emerald-800 dark:text-emerald-200">
                      {(block.chords ?? []).join(' ')}
                    </p>
                  )}
                  {block.tab && (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-800 dark:bg-gray-950/60 dark:text-gray-100">
                      {block.tab}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
  )
}
