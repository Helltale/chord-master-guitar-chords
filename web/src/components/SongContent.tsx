import type { TabContent as TabContentType } from '@/api/schemas'

interface SongContentProps {
  content: TabContentType
}

export function SongContent({ content }: SongContentProps) {
  const sections = content.sections ?? []
  return (
    <article className="max-w-none text-gray-800 dark:text-gray-200">
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
                const lineHasChords = segments.some((seg) => seg.chord)
                return (
                  <div className="font-sans leading-snug text-slate-800 dark:text-gray-100">
                    {segments.map((seg, sidx) => (
                      <span
                        key={sidx}
                        className="inline-block min-w-[0.25rem] align-top"
                      >
                        {lineHasChords && (
                          <span className="block h-[1rem] whitespace-nowrap text-xs font-mono font-semibold leading-none text-emerald-700 dark:text-emerald-300">
                            {seg.chord ? (
                              <span className="rounded-md bg-indigo-500/15 px-1.5 py-0 text-[0.65rem] text-emerald-700 shadow-sm shadow-indigo-900/10 dark:bg-indigo-500/20 dark:text-emerald-300 dark:shadow-indigo-900/30">
                                {seg.chord}
                              </span>
                            ) : null}
                          </span>
                        )}
                        <span className="whitespace-pre-wrap break-words text-base text-slate-800 dark:text-slate-100">
                          {seg.text ?? ''}
                        </span>
                      </span>
                    ))}
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
