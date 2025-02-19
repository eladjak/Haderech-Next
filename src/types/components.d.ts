import { HTMLAttributes } from "react";
import type { Course, ForumPost, Lesson, User } from "./api";

// Button component props
export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  disabled?: boolean;
}

// Input component props
export interface InputProps extends HTMLAttributes<HTMLInputElement> {
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Textarea component props
export interface TextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

// Avatar component props
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

// Toast props
export interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
}

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export interface CourseCardProps {
  course: Course;
  className?: string;
}

export interface LessonCardProps {
  lesson: Lesson;
  className?: string;
}

export interface ForumPostCardProps {
  post: ForumPost;
  className?: string;
}

export interface UserCardProps {
  user: User;
  className?: string;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
  title?: string;
}

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  className?: string;
}

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export interface CheckboxProps extends HTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export interface RadioProps extends HTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  value: string;
}

export interface SwitchProps extends HTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
