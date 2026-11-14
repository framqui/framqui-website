export const ROUTES = {
  HOME: "/",
  NOTES: "/notes",
  POSTS: "/posts",
} as const;

export const PUBLIC_PATHS = [ROUTES.HOME, ROUTES.POSTS, ROUTES.NOTES] as const;
