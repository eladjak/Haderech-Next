// This file marks the login page as a dynamic page
// It ensures the page is rendered at request time instead of build time
// This is required because the page uses client-side authentication which
// isn't compatible with static site generation

export const dynamic = "force-dynamic";
