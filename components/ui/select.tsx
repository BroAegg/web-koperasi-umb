import * as React from "react"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export function Select({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const context = React.useContext(SelectContext)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        {children}
        <svg
          className="ml-2 h-4 w-4"
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
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <SelectContext.Provider value={{ ...context!, onValueChange: (v) => { context?.onValueChange(v); setOpen(false); } }}>
            <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === SelectContent) {
                  return child
                }
                return null
              })}
            </div>
          </SelectContext.Provider>
        </>
      )}
    </>
  )
}

export function SelectValue() {
  const context = React.useContext(SelectContext)
  return <span>{context?.value || 'Select...'}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="py-1">{children}</div>
}

export function SelectItem({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  const context = React.useContext(SelectContext)

  return (
    <button
      type="button"
      onClick={() => context?.onValueChange(value)}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
        context?.value === value ? 'bg-blue-50 text-blue-600' : ''
      }`}
    >
      {children}
    </button>
  )
}
