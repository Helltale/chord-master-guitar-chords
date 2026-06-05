import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/contexts/I18nContext'
import type { ChordDefinition } from '@/api/schemas'
import { ChordCatalogModal } from './ChordCatalogModal'

const mockChords: ChordDefinition[] = [
  { name: 'Am', shape: 'x02210', is_preset: true, sort_order: 50 },
  { name: 'Bb', shape: 'x13331', is_preset: false, sort_order: 160 },
  { name: 'A7', shape: 'x02020', is_preset: false, sort_order: 210 },
]

vi.mock('@/hooks/useChords', () => ({
  useChords: () => ({
    chords: mockChords,
    presets: mockChords.filter((c) => c.is_preset),
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

function renderModal(props: Partial<React.ComponentProps<typeof ChordCatalogModal>> = {}) {
  const onClose = vi.fn()
  const onSelect = vi.fn()
  render(
    <I18nProvider>
      <ChordCatalogModal
        open
        onClose={onClose}
        onSelect={onSelect}
        {...props}
      />
    </I18nProvider>
  )
  return { onClose, onSelect }
}

describe('ChordCatalogModal', () => {
  it('renders catalog chords when open', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Каталог аккордов')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Am' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bb' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A7' })).toBeInTheDocument()
  })

  it('filters chords by search query', async () => {
    const user = userEvent.setup()
    renderModal()
    const search = screen.getByPlaceholderText('Поиск: Am, Bb, A7…')
    await user.type(search, 'bb')
    expect(screen.queryByRole('button', { name: 'Am' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bb' })).toBeInTheDocument()
    expect(screen.getByText('Найдено: 1')).toBeInTheDocument()
  })

  it('calls onSelect when a chord card is clicked', () => {
    const { onSelect, onClose } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Bb' }))
    expect(onSelect).toHaveBeenCalledWith('Bb')
    expect(onClose).toHaveBeenCalled()
  })

  it('renders nothing when closed', () => {
    render(
      <I18nProvider>
        <ChordCatalogModal open={false} onClose={vi.fn()} onSelect={vi.fn()} />
      </I18nProvider>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
