"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const ModalContext = React.createContext<{ isMobile: boolean } | null>(null)

function useModalContext() {
  const ctx = React.useContext(ModalContext)
  if (!ctx) {
    throw new Error("Modal components must be used within <Modal>")
  }
  return ctx
}

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Modal({ open, onOpenChange, children }: ModalProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <ModalContext.Provider value={{ isMobile: true }}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      </ModalContext.Provider>
    )
  }

  return (
    <ModalContext.Provider value={{ isMobile: false }}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </ModalContext.Provider>
  )
}

type ModalTriggerProps = {
  className?: string
  children: React.ReactNode
  asChild?: boolean
}

function ModalTrigger({ className, children, asChild }: ModalTriggerProps) {
  const { isMobile } = useModalContext()
  const Comp = isMobile ? DrawerTrigger : DialogTrigger
  return (
    <Comp className={className} asChild={asChild}>
      {children}
    </Comp>
  )
}

type ModalContentProps = Omit<
  React.ComponentProps<typeof DialogContent>,
  "showCloseButton"
> & {
  showCloseButton?: boolean
}

function ModalContent({
  className,
  children,
  showCloseButton = false,
  ...props
}: ModalContentProps) {
  const { isMobile } = useModalContext()
  if (isMobile) {
    return (
      <DrawerContent className={cn("max-h-[90vh]", className)}>
        {children}
      </DrawerContent>
    )
  }
  return (
    <DialogContent
      className={className}
      showCloseButton={showCloseButton}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

type ModalTitleProps = React.ComponentProps<typeof DialogTitle>

function ModalTitle({ className, children, ...props }: ModalTitleProps) {
  const { isMobile } = useModalContext()
  if (isMobile) {
    return (
      <DrawerTitle className={className} {...props}>
        {children}
      </DrawerTitle>
    )
  }
  return (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  )
}

type ModalDescriptionProps = React.ComponentProps<typeof DialogDescription>

function ModalDescription({
  className,
  children,
  ...props
}: ModalDescriptionProps) {
  const { isMobile } = useModalContext()
  if (isMobile) {
    return (
      <DrawerDescription className={className} {...props}>
        {children}
      </DrawerDescription>
    )
  }
  return (
    <DialogDescription className={className} {...props}>
      {children}
    </DialogDescription>
  )
}

function ModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useModalContext()
  if (isMobile) {
    return <DrawerHeader className={className} {...props} />
  }
  return <DialogHeader className={className} {...props} />
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useModalContext()
  if (isMobile) {
    return <DrawerFooter className={className} {...props} />
  }
  return <DialogFooter className={className} {...props} />
}

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalHeader,
  ModalFooter,
}
