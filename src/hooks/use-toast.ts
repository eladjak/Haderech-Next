import { toast } from "sonner"

interface ToastProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  return {
    toast: ({ title, description, action }: ToastProps) => {
      toast(title, {
        description,
        action: action ? {
          label: action.label,
          onClick: action.onClick,
        } : undefined,
      })
    },
  }
} 