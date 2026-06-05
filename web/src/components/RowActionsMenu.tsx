import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type RowActionsMenuItem = {
  id: string
  label: string
  onSelect: () => void
  variant?: 'default' | 'danger'
}

interface RowActionsMenuProps {
  items: RowActionsMenuItem[]
  ariaLabel: string
}

type MenuPosition = {
  top: number
  right: number
}

const MENU_GAP = 4

export function RowActionsMenu({ items, ariaLabel }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition>({ top: 0, right: 0 })
  const [ready, setReady] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const updatePosition = useCallback(() => {
    const button = buttonRef.current
    const menu = menuRef.current
    if (!button || !menu) return

    const btn = button.getBoundingClientRect()
    const menuHeight = menu.offsetHeight
    const right = window.innerWidth - btn.right
    const spaceBelow = window.innerHeight - btn.bottom - MENU_GAP
    const spaceAbove = btn.top - MENU_GAP

    let top = btn.bottom + MENU_GAP
    if (menuHeight > spaceBelow && spaceAbove >= spaceBelow) {
      top = Math.max(MENU_GAP, btn.top - MENU_GAP - menuHeight)
    }

    setPosition({ top, right })
    setReady(true)
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setReady(false)
      return
    }
    updatePosition()
  }, [open, items, updatePosition])

  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        <span className="text-lg leading-none tracking-widest" aria-hidden>
          ⋯
        </span>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            style={{
              position: 'fixed',
              top: position.top,
              right: position.right,
              zIndex: 9999,
              visibility: ready ? 'visible' : 'hidden',
            }}
            className="min-w-[10.5rem] overflow-visible rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, index) => (
              <div key={item.id}>
                {index > 0 && (
                  <div
                    className="my-1 border-t border-slate-200 dark:border-slate-700"
                    role="separator"
                  />
                )}
                <button
                  type="button"
                  role="menuitem"
                  className={`flex w-full whitespace-nowrap px-3 py-2 text-left text-sm transition ${
                    item.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50'
                      : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-200 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-200'
                  }`}
                  onClick={() => {
                    setOpen(false)
                    item.onSelect()
                  }}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}
