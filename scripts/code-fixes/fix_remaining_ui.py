#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט זה מתמקד בתיקון שגיאות פרסינג שנותרו ברכיבי UI
מטפל ספציפית ברכיבים שעדיין מראים שגיאות כמו textarea, input, avatar וכו'
"""

import os
import re
import glob
from typing import List, Dict, Optional

def read_file(file_path):
    """קורא את תוכן הקובץ"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"שגיאה בקריאת הקובץ {file_path}: {e}")
        return None

def write_file(file_path, content):
    """כותב תוכן לקובץ"""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        return True
    except Exception as e:
        print(f"שגיאה בכתיבה לקובץ {file_path}: {e}")
        return False

def get_textarea_template():
    """מחזיר תבנית מתוקנת לרכיב Textarea"""
    return '''
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
'''

def get_input_template():
    """מחזיר תבנית מתוקנת לרכיב Input"""
    return '''
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
'''

def get_avatar_template():
    """מחזיר תבנית מתוקנת לרכיב Avatar"""
    return '''
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
'''

def get_badge_template():
    """מחזיר תבנית מתוקנת לרכיב Badge"""
    return '''
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
'''

def get_label_template():
    """מחזיר תבנית מתוקנת לרכיב Label"""
    return '''
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
'''

def get_simulator_template():
    """מחזיר תבנית מתוקנת לקובץ simulator.ts"""
    return '''
import { ChatMessage, SimulatorScenario } from "@/types/simulator";
import { ApiResponse } from "@/types/api";

export interface SimulatorService {
  sendMessage: (message: string, scenarioId: string) => Promise<ApiResponse<ChatMessage>>;
  getScenarios: () => Promise<ApiResponse<SimulatorScenario[]>>;
  resetChat: (scenarioId: string) => Promise<ApiResponse<boolean>>;
}

export const simulatorService: SimulatorService = {
  async sendMessage(message: string, scenarioId: string) {
    try {
      const response = await fetch("/api/simulator/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, scenarioId }),
      });
      
      const data = await response.json();
      return {
        data: data.data,
        status: response.status,
        error: !response.ok ? data.error : undefined,
      };
    } catch (error) {
      return {
        status: 500,
        error: "שגיאה בשליחת ההודעה",
      };
    }
  },

  async getScenarios() {
    try {
      const response = await fetch("/api/simulator/scenarios");
      const data = await response.json();
      
      return {
        data: data.data,
        status: response.status,
        error: !response.ok ? data.error : undefined,
      };
    } catch (error) {
      return {
        status: 500,
        error: "שגיאה בטעינת התרחישים",
      };
    }
  },

  async resetChat(scenarioId: string) {
    try {
      const response = await fetch("/api/simulator/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scenarioId }),
      });
      
      const data = await response.json();
      return {
        data: true,
        status: response.status,
        error: !response.ok ? data.error : undefined,
      };
    } catch (error) {
      return {
        status: 500,
        error: "שגיאה באיפוס הצ'אט",
      };
    }
  },
};

export default simulatorService;
'''

def get_api_model_template():
    """מחזיר תבנית מתוקנת לקובץ api.ts"""
    return '''
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  status: number;
}

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiOptions {
  method?: ApiMethod;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ApiRequestConfig extends ApiOptions {
  url: string;
}
'''

def get_model_template():
    """מחזיר תבנית מתוקנת לקובץ models.ts"""
    return '''
// User related interfaces
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: UserRole;
  created_at: string;
  updated_at?: string;
}

export type UserRole = "admin" | "user" | "instructor";

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  social_links?: SocialLinks;
  preferences?: UserPreferences;
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}

export interface UserPreferences {
  email_notifications: boolean;
  theme: "light" | "dark" | "system";
  language: string;
}

// Course related interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor_id: string;
  instructor?: User;
  price?: number;
  status: CourseStatus;
  level: CourseLevel;
  tags?: string[];
  categories?: string[];
  created_at: string;
  updated_at?: string;
  lessons_count?: number;
  duration?: number; // in minutes
  ratings_avg?: number;
  ratings_count?: number;
}

export type CourseStatus = "draft" | "published" | "archived";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content: string;
  video_url?: string;
  order: number;
  duration?: number; // in minutes
  is_free?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress?: number; // percentage
  certificate_id?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  progress_percentage: number;
  last_position?: number; // video position in seconds
  updated_at: string;
}

export interface CourseRating {
  id: string;
  course_id: string;
  user_id: string;
  rating: number; // 1-5
  review?: string;
  created_at: string;
  updated_at?: string;
}

// Forum related interfaces
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  comments_count?: number;
  likes_count?: number;
  views_count?: number;
  is_pinned?: boolean;
  is_solved?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  is_solution?: boolean;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  posts_count?: number;
}

export interface ForumTag {
  id: string;
  name: string;
  posts_count?: number;
}
'''

def get_auth_context_template():
    """מחזיר תבנית מתוקנת לקובץ auth-context.tsx"""
    return '''
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/models";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Here you would check for an existing session
    // and set the user accordingly
    const checkSession = async () => {
      try {
        setLoading(true);
        // Replace with your actual session check logic
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setError("Failed to retrieve session");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual login logic
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error: any) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual registration logic
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error: any) {
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual logout logic
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
    } catch (error: any) {
      setError(error.message || "Logout failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual password reset logic
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Password reset failed");
      }
    } catch (error: any) {
      setError(error.message || "Password reset failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual password update logic
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Password update failed");
      }
    } catch (error: any) {
      setError(error.message || "Password update failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
'''

def get_auth_provider_template():
    """מחזיר תבנית מתוקנת לקובץ auth-provider.tsx"""
    return '''
"use client";

import React from "react";
import { AuthProvider as CoreAuthProvider } from "@/contexts/auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <CoreAuthProvider>{children}</CoreAuthProvider>;
}
'''

def fix_remaining_ui_files():
    """מתקן את קבצי UI הנותרים"""
    # רשימת הקבצים והתבניות המתאימות להם
    components = {
        "src/components/ui/textarea.tsx": get_textarea_template(),
        "src/components/ui/input.tsx": get_input_template(),
        "src/components/ui/avatar.tsx": get_avatar_template(),
        "src/components/ui/badge.tsx": get_badge_template(),
        "src/components/ui/label.tsx": get_label_template(),
        "src/lib/services/simulator.ts": get_simulator_template(),
        "src/types/api.ts": get_api_model_template(),
        "src/types/models.ts": get_model_template(),
        "src/contexts/auth-context.tsx": get_auth_context_template(),
        "src/providers/auth-provider.tsx": get_auth_provider_template(),
    }
    
    fixed_count = 0
    
    for file_path, template in components.items():
        # בדיקה אם הקובץ קיים
        if os.path.exists(file_path):
            # כתיבת התבנית החדשה במקום התוכן הקיים
            if write_file(file_path, template.strip()):
                print(f"תוקן: {file_path}")
                fixed_count += 1
        else:
            print(f"קובץ לא קיים: {file_path}")
    
    return fixed_count

if __name__ == "__main__":
    fixed_count = fix_remaining_ui_files()
    print(f"\nסך הכל תוקנו {fixed_count} קבצי UI וסרביס.") 