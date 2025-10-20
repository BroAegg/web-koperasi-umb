import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative z-50 animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  )
}

export function ModalContent({ className, children, ...props }: ModalContentProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto mx-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModalHeader({ className, children, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 border-b",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ModalTitle({ className, children, ...props }: ModalTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

export function ModalBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}