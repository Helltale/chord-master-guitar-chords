import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '@/contexts/I18nContext'
import { ChordFingeringPanel } from './ChordFingeringPanel'

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('ChordFingeringPanel', () => {
  it('renders chord names and diagrams for each entry', () => {
    const chordTabs: Record<string, string> = {
      Am: 'x02210',
      C: 'x32010',
    }
    const { container } = renderWithI18n(<ChordFingeringPanel chordTabs={chordTabs} />)
    expect(screen.getByText('Аппликатуры аккордов')).toBeInTheDocument()
    expect(screen.getByText('Am')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(container.querySelectorAll('svg').length).toBe(2)
  })

  it('renders nothing when chordTabs is empty', () => {
    const { container } = renderWithI18n(<ChordFingeringPanel chordTabs={{}} />)
    expect(container.firstChild).toBeNull()
  })
})
