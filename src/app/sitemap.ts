/**
 * @file sitemap.ts
 * @description Dynamic sitemap generation for SEO
 * Generates sitemap.xml with all static and dynamic routes
 */

import { MetadataRoute } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logger } from "@/lib/utils/logger";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://haderech.co.il';

  // Static pages with their priorities
  const staticRoutes = [
    {
      route: '',
      priority: 1,
      changeFrequency: 'daily' as const,
    },
    {
      route: '/courses',
      priority: 0.9,
      changeFrequency: 'daily' as const,
    },
    {
      route: '/forum',
      priority: 0.8,
      changeFrequency: 'hourly' as const,
    },
    {
      route: '/simulator',
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    },
    {
      route: '/about',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      route: '/community',
      priority: 0.7,
      changeFrequency: 'daily' as const,
    },
    {
      route: '/login',
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    },
    {
      route: '/register',
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    },
  ];

  const routes = staticRoutes.map((item) => ({
    url: `${baseUrl}${item.route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  try {
    // Fetch dynamic course pages
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: courses } = await supabase
      .from('courses')
      .select('id, updated_at, status')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    const coursePages = courses?.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: course.updated_at || new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || [];

    // Fetch forum posts (limit to recent ones to keep sitemap manageable)
    const { data: forumPosts } = await supabase
      .from('posts')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100);

    const forumPages = forumPosts?.map((post) => ({
      url: `${baseUrl}/forum/${post.id}`,
      lastModified: post.updated_at || new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })) || [];

    return [...routes, ...coursePages, ...forumPages];
  } catch (error) {
    logger.error("Error generating sitemap:", error);
    // Return at least static routes if database fetch fails
    return routes;
  }
}
