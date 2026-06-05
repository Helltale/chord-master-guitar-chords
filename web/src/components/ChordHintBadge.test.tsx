import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { ChordHintBadge } from './ChordHintBadge'

const nearTopRect = {
  top: 20,
  bottom: 36,
  left: 100,
  right: 120,
  width: 20,
  height: 16,
  x: 100,
  y: 20,
  toJSON: () => ({}),
} as DOMRect

describe('ChordHintBadge', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows svg tooltip on hover when shape is provided', () => {
    render(<ChordHintBadge chord="Am" shape="x02210" />)
    const badge = screen.getByText('Am')
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    fireEvent.mouseEnter(badge)
    const tooltip = document.body.querySelector('[role="tooltip"]')
    expect(tooltip).toBeTruthy()
    expect(tooltip?.querySelector('svg')).toBeTruthy()
    fireEvent.mouseLeave(badge)
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
  })

  it('does not show tooltip without shape', () => {
    render(<ChordHintBadge chord="X" />)
    fireEvent.mouseEnter(screen.getByText('X'))
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
  })

  it('flips tooltip below when anchor is near top of viewport', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(nearTopRect)
    render(<ChordHintBadge chord="Am" shape="x02210" />)
    fireEvent.mouseEnter(screen.getByText('Am'))
    const tooltip = document.body.querySelector('[role="tooltip"]') as HTMLElement
    await waitFor(() => {
      expect(tooltip.style.transform).toContain('12px')
      expect(tooltip.style.transform).not.toContain('-100%')
    })
  })
})
