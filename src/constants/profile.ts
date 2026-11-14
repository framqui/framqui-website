import es from "../i18n/es.json";

const ACCENT = "var(--accent)";

export interface TechItem {
  name: string;
  icon: string;
  color?: string;
}

export interface TechGroup {
  key: keyof typeof es.techGroups;
  title: string;
  items: TechItem[];
}

export const TECH_GROUPS: TechGroup[] = [
  {
    key: "languages",
    title: es.techGroups.languages,
    items: [
      { name: "Python", icon: "simple-icons:python", color: "#3776AB" },
      { name: "JavaScript", icon: "simple-icons:javascript", color: "#F7DF1E" },
      { name: "TypeScript", icon: "simple-icons:typescript", color: "#3178C6" },
      { name: "SQL", icon: "mdi:database", color: "#4479A1" },
      { name: "Bash", icon: "simple-icons:gnubash", color: "#4EAA25" },
    ],
  },
  {
    key: "backend",
    title: es.techGroups.backend,
    items: [
      { name: "Node.js", icon: "simple-icons:nodedotjs", color: "#339933" },
      { name: "NestJS", icon: "simple-icons:nestjs", color: "#E0234E" },
      { name: "REST API", icon: "mdi:api", color: ACCENT },
      { name: "GraphQL", icon: "simple-icons:graphql", color: "#E10098" },
    ],
  },
  {
    key: "frontend",
    title: es.techGroups.frontend,
    items: [
      { name: "React", icon: "simple-icons:react", color: "#61DAFB" },
      { name: "Next.js", icon: "simple-icons:nextdotjs" },
      { name: "HTML5", icon: "simple-icons:html5", color: "#E34F26" },
      { name: "CSS3", icon: "simple-icons:css3", color: "#1572B6" },
    ],
  },
  {
    key: "databases",
    title: es.techGroups.databases,
    items: [
      { name: "PostgreSQL", icon: "simple-icons:postgresql", color: "#4169E1" },
      { name: "MongoDB", icon: "simple-icons:mongodb", color: "#47A248" },
      { name: "Redis", icon: "simple-icons:redis", color: "#DC382D" },
    ],
  },
  {
    key: "cloud",
    title: es.techGroups.cloud,
    items: [
      { name: "AWS", icon: "simple-icons:amazonwebservices", color: "#FF9900" },
      { name: "Docker", icon: "simple-icons:docker", color: "#2496ED" },
      { name: "Linux", icon: "simple-icons:linux", color: "#FCC624" },
      { name: "Git", icon: "simple-icons:git", color: "#F05032" },
      { name: "GitHub", icon: "simple-icons:github" },
    ],
  },
  {
    key: "aws",
    title: es.techGroups.aws,
    items: [
      { name: "S3", icon: "simple-icons:amazons3", color: "#569A31" },
      { name: "EC2", icon: "simple-icons:amazonec2", color: "#FF9900" },
      { name: "Lambda", icon: "simple-icons:awslambda", color: "#FF9900" },
      { name: "RDS", icon: "simple-icons:amazonrds", color: "#527FFF" },
      { name: "IAM", icon: "simple-icons:amazoniam", color: "#DD344C" },
      { name: "CloudWatch", icon: "simple-icons:amazoncloudwatch", color: "#FF4F8B" },
      { name: "API Gateway", icon: "simple-icons:amazonapigateway", color: "#FF4F8B" },
      { name: "SQS", icon: "simple-icons:amazonsqs", color: "#FF4F8B" },
    ],
  },
  {
    key: "tools",
    title: es.techGroups.tools,
    items: [
      { name: "VS Code", icon: "simple-icons:visualstudiocode", color: "#007ACC" },
      { name: "WebStorm", icon: "simple-icons:webstorm" },
      { name: "PyCharm", icon: "simple-icons:pycharm" },
      { name: "Markdown", icon: "simple-icons:markdown" },
      { name: "Cursor", icon: "simple-icons:cursor" },
    ],
  },
  {
    key: "areas",
    title: es.techGroups.areas,
    items: [
      { name: "AI for Development", icon: "mdi:robot-outline", color: ACCENT },
      { name: "Software Architecture", icon: "mdi:sitemap", color: ACCENT },
      { name: "CI/CD", icon: "mdi:source-branch-sync", color: ACCENT },
      { name: "Automation", icon: "mdi:lightning-bolt", color: ACCENT },
      { name: "Scalable Systems", icon: "mdi:chart-line", color: ACCENT },
      { name: "Cloud Computing", icon: "mdi:cloud-outline", color: ACCENT },
      { name: "Testing", icon: "mdi:test-tube", color: ACCENT },
    ],
  },
];

function techIcon(name: string) {
  const item = TECH_GROUPS.flatMap((group) => group.items).find((entry) => entry.name === name);
  if (!item) throw new Error(`Unknown technology: ${name}`);
  return { icon: item.icon, color: item.color };
}

export const CORE_TECH = [
  { name: "Python", icons: [techIcon("Python")] },
  { name: "TypeScript", icons: [techIcon("TypeScript")] },
  { name: "PostgreSQL", icons: [techIcon("PostgreSQL")] },
  { name: "AWS", icons: [techIcon("AWS")] },
  { name: "Linux / Bash", icons: [techIcon("Linux"), techIcon("Bash")] },
];

export const INTEREST_KEYS = ["software", "ai", "products", "learning"] as const;

export const EXPERIENCES = [
  {
    id: "r5",
    company: "R5",
    linkUrl: "https://www.grupor5.com/comprar-soat-en-linea",
  },
  {
    id: "nova",
    company: "Novadynamics",
    linkUrl: "https://nova-dynamics.net/",
  },
] as const;

export const PROFILE_FACTS = [
  {
    labelKey: "details.role",
    label: es.details.role,
    valueKey: "details.roleValue",
    value: es.details.roleValue,
  },
  {
    labelKey: "details.experience",
    label: es.details.experience,
    valueKey: "details.experienceValue",
    value: es.details.experienceValue,
  },
] as const;

export const SIDEBAR_INTERESTS = [
  { key: "details.interestSoftware", text: es.details.interestSoftware },
  { key: "details.interestProducts", text: es.details.interestProducts },
  { key: "details.interestAi", text: es.details.interestAi },
] as const;

export const PROFILE_LOCATION = {
  labelKey: "details.location",
  label: es.details.location,
  valueKey: "details.locationValue",
  value: es.details.locationValue,
} as const;
