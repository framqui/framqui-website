export const ROUTES = {
  HOME: "/",
  POSTS: "/posts",
} as const;

export const PUBLIC_PATHS = [ROUTES.HOME, ROUTES.POSTS] as const;
