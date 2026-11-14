export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color?: string;
  i18nKey?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/framqui",
    icon: "simple-icons:github",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/framqui",
    icon: "fa6-brands:linkedin",
    color: "#0A66C2",
  },
  {
    name: "CORREO",
    i18nKey: "social.email",
    url: "mailto:andfera201@gmail.com",
    icon: "simple-icons:gmail",
    color: "#EA4335",
  },
];