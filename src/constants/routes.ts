export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  COURSES: {
    LIST: '/courses',
    DETAILS: (id: string) => `/courses/${id}`,
    CREATE: '/courses/create',
    EDIT: (id: string) => `/courses/${id}/edit`,
  },
  FORUM: {
    LIST: '/forum',
    POST: (id: string) => `/forum/${id}`,
    CREATE: '/forum/create',
  },
  CONTENT: {
    LIST: '/content',
    ARTICLE: (id: string) => `/content/${id}`,
  },
  REFERRALS: '/referrals',
  SETTINGS: '/settings',
} as const

export const PROTECTED_ROUTES = [
  ROUTES.PROFILE,
  ROUTES.COURSES.CREATE,
  ROUTES.COURSES.EDIT('*'),
  ROUTES.FORUM.CREATE,
  ROUTES.SETTINGS,
]

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
] 