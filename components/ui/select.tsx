'use client'

import * as React from 'react'

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  toggleOpen: () => void
  closeDropdown: () => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleOpen = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const closeDropdown = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <SelectContext.Provider value={{ 
      value: value || '', 
      onValueChange, 
      isOpen, 
      toggleOpen,
      closeDropdown
    }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ 
  children, 
  align = 'start',
  className = ''
}: { 
  children: React.ReactNode
  align?: 'start' | 'end'
  className?: string
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within Select')

  return (
    <button
      type="button"
      onClick={context.toggleOpen}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within Select')

  if (!context.value) {
    return <span className="text-gray-500">{placeholder || 'Select...'}</span>
  }

  return <span>{context.value}</span>
}

export function SelectContent({ 
  children,
  align = 'start',
  className = ''
}: { 
  children: React.ReactNode
  align?: 'start' | 'end'
  className?: string
}) {
  const context = React.useContext(SelectContext)
  if (!context) return null

  if (!context.isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={context.closeDropdown}
      />
      <div className={`absolute ${align === 'end' ? 'right-0' : 'left-0'} z-50 mt-1 max-h-60 min-w-[8rem] overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg ${className}`}>
        {children}
      </div>
    </>
  )
}

export function SelectItem({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  const context = React.useContext(SelectContext)
  if (!context) return null

  const handleClick = () => {
    context.onValueChange(value)
    context.closeDropdown()
  }

  const isSelected = context.value === value

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
        isSelected ? 'bg-blue-50 text-blue-600 font-medium' : ''
      }`}
    >
      {children}
    </button>
  )
}
