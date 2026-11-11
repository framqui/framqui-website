export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "GITHUB",
    url: "https://github.com/framqui",
    icon: "simple-icons:github",
  },
  {
    name: "LINKEDIN",
    url: "https://linkedin.com/in/framqui",
    icon: "fa6-brands:linkedin",
    color: "#0A66C2",
  },
  {
    name: "CORREO",
    url: "mailto:andfera201@gmail.com",
    icon: "simple-icons:gmail",
    color: "#EA4335",
  },
  {
    name: "WHATSAPP",
    url: "https://wa.me/573172116762",
    icon: "fa6-brands:whatsapp",
    color: "#25D366",
  },
];