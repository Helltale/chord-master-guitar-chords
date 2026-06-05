import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChordDiagram } from './ChordDiagram'

describe('ChordDiagram', () => {
  it('renders svg for valid shape', () => {
    const { container } = render(<ChordDiagram chord="C" shape="x32010" />)
    expect(container.querySelector('svg')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'C chord fingering' })).toBeInTheDocument()
  })

  it('renders fallback pre for invalid shape', () => {
    render(<ChordDiagram chord="X" shape="not-a-shape" />)
    expect(screen.getByText('not-a-shape')).toBeInTheDocument()
  })
})
