import type {
  JobRecommendation,
  LearningPathItem,
  LearningResource,
  SkillData,
  SocialLinks,
  UserProfile,
} from '../../lib/types';
import type { DetectedSkill } from './skills';

export type FocusArea = 'frontend' | 'backend' | 'fullstack' | 'devops' | 'data' | 'mobile' | 'general';

const FOCUS_SKILLS: Record<Exclude<FocusArea, 'general' | 'fullstack'>, string[]> = {
  frontend: ['React', 'Next.js', 'Vue', 'Angular', 'HTML', 'CSS', 'TypeScript', 'JavaScript', 'Redux', 'Webpack'],
  backend: ['Node.js', 'Python', 'Java', 'Go', 'Rust', 'GraphQL', 'SQL', 'MongoDB', 'REST APIs', 'Microservices'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Cloudflare', 'CI/CD', 'DevOps'],
  data: ['Pandas', 'Machine Learning', 'Python', 'SQL', 'LLMs'],
  mobile: ['React Native', 'Flutter', 'Kotlin', 'Swift'],
};

export function detectFocusArea(technical: DetectedSkill[]): FocusArea {
  const names = new Set(technical.map((s) => s.name));
  let best: FocusArea = 'general';
  let bestHits = 0;

  for (const [area, skills] of Object.entries(FOCUS_SKILLS)) {
    const hits = skills.filter((skill) => names.has(skill)).length;
    if (hits > bestHits) {
      best = area as FocusArea;
      bestHits = hits;
    }
  }

  if (
    bestHits >= 3
    && best !== 'general'
    && best !== 'fullstack'
    && FOCUS_SKILLS.frontend.some((s) => names.has(s))
    && FOCUS_SKILLS.backend.some((s) => names.has(s))
    && (names.has('React') || names.has('Next.js') || names.has('Vue'))
    && (names.has('Node.js') || names.has('Python') || names.has('SQL'))
  ) {
    return 'fullstack';
  }

  return best;
}

export function toSkillData(detected: DetectedSkill[]): SkillData[] {
  return detected.map((skill) => ({ skill: skill.name, value: skill.score, fullMark: 100 }));
}

const FOCUS_LABEL: Record<FocusArea, string> = {
  frontend: 'frontend engineering',
  backend: 'backend engineering',
  fullstack: 'full-stack development',
  devops: 'DevOps and cloud infrastructure',
  data: 'data and ML engineering',
  mobile: 'mobile development',
  general: 'software engineering',
};

const GAPS_BY_FOCUS: Record<FocusArea, Array<{ skill: string; gap: string }>> = {
  frontend: [
    { skill: 'Testing', gap: 'Testing frameworks (Jest, Playwright) for frontend confidence' },
    { skill: 'System Design', gap: 'Scalability and system design fundamentals' },
    { skill: 'GraphQL', gap: 'GraphQL for flexible data fetching' },
  ],
  backend: [
    { skill: 'Docker', gap: 'Containerization with Docker for reproducible deployments' },
    { skill: 'Testing', gap: 'Automated testing practices (unit + integration)' },
    { skill: 'CI/CD', gap: 'CI/CD pipelines for automated delivery' },
  ],
  fullstack: [
    { skill: 'Testing', gap: 'End-to-end testing across the stack' },
    { skill: 'Docker', gap: 'Containerization and deployment tooling' },
    { skill: 'System Design', gap: 'System design for scale-out applications' },
  ],
  devops: [
    { skill: 'Kubernetes', gap: 'Kubernetes orchestration at scale' },
    { skill: 'System Design', gap: 'Distributed systems design principles' },
    { skill: 'Python', gap: 'Scripting/automation depth with Python' },
  ],
  data: [
    { skill: 'Machine Learning', gap: 'Production ML deployment (MLOps)' },
    { skill: 'Docker', gap: 'Containerized data/ML workflows' },
    { skill: 'System Design', gap: 'Data pipeline architecture' },
  ],
  mobile: [
    { skill: 'Testing', gap: 'Mobile testing and CI for app releases' },
    { skill: 'REST APIs', gap: 'Robust API integration patterns' },
    { skill: 'CI/CD', gap: 'Automated mobile build and release pipelines' },
  ],
  general: [
    { skill: 'Git', gap: 'Version control workflows with Git' },
    { skill: 'REST APIs', gap: 'REST API design and integration' },
    { skill: 'Testing', gap: 'Automated testing foundations' },
  ],
};

const RESOURCE_CATALOG: Record<string, LearningResource[]> = {
  Testing: [
    { type: 'course', title: 'JavaScript Testing Course', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', free: true },
    { type: 'documentation', title: 'Jest Getting Started', provider: 'Jest', url: 'https://jestjs.io/docs/getting-started', free: true },
    { type: 'documentation', title: 'Playwright Docs', provider: 'Microsoft', url: 'https://playwright.dev/docs/intro', free: true },
  ],
  Docker: [
    { type: 'documentation', title: 'Docker Get Started', provider: 'Docker', url: 'https://docs.docker.com/get-started/', free: true },
    { type: 'course', title: 'Docker for Beginners', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/docker-tutorial-for-beginners/', free: true },
  ],
  Kubernetes: [
    { type: 'documentation', title: 'Kubernetes Basics Tutorial', provider: 'Kubernetes', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', free: true },
    { type: 'course', title: 'Kubernetes Crash Course', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/kubernetes-course/', free: true },
  ],
  'CI/CD': [
    { type: 'documentation', title: 'GitHub Actions Documentation', provider: 'GitHub', url: 'https://docs.github.com/en/actions', free: true },
    { type: 'course', title: 'CI/CD Full Course', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/continuous-integration-and-continuous-delivery-ci-cd-explained/', free: true },
  ],
  'System Design': [
    { type: 'course', title: 'System Design Primer', provider: 'GitHub', url: 'https://github.com/donnemartin/system-design-primer', free: true },
    { type: 'book', title: 'Designing Data-Intensive Applications', provider: 'O\u2019Reilly', url: 'https://dataintensive.net/', free: false },
  ],
  GraphQL: [
    { type: 'documentation', title: 'GraphQL Official Tutorial', provider: 'GraphQL', url: 'https://graphql.org/learn/', free: true },
    { type: 'documentation', title: 'Apollo GraphQL Docs', provider: 'Apollo', url: 'https://www.apollographql.com/docs/', free: true },
  ],
  AWS: [
    { type: 'course', title: 'AWS Cloud Practitioner Essentials', provider: 'AWS', url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials', free: true },
    { type: 'documentation', title: 'AWS Free Tier', provider: 'AWS', url: 'https://aws.amazon.com/free/', free: true },
  ],
  Cloudflare: [
    { type: 'documentation', title: 'Cloudflare Workers Docs', provider: 'Cloudflare', url: 'https://developers.cloudflare.com/workers/', free: true },
    { type: 'documentation', title: 'Cloudflare D1 Docs', provider: 'Cloudflare', url: 'https://developers.cloudflare.com/d1/', free: true },
  ],
  Python: [
    { type: 'documentation', title: 'Python Official Tutorial', provider: 'Python', url: 'https://docs.python.org/3/tutorial/', free: true },
    { type: 'course', title: 'Python for Everybody', provider: 'Coursera', url: 'https://www.coursera.org/specializations/python', free: true },
  ],
  SQL: [
    { type: 'documentation', title: 'SQLBolt Interactive Lessons', provider: 'SQLBolt', url: 'https://sqlbolt.com/', free: true },
    { type: 'course', title: 'MySQL Tutorial', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/mysql-tutorial-for-beginners/', free: true },
  ],
  'Machine Learning': [
    { type: 'course', title: 'Machine Learning by Andrew Ng', provider: 'Coursera', url: 'https://www.coursera.org/learn/machine-learning', free: true },
    { type: 'documentation', title: 'PyTorch Tutorials', provider: 'PyTorch', url: 'https://pytorch.org/tutorials/', free: true },
  ],
  LLMs: [
    { type: 'documentation', title: 'OpenAI API Docs', provider: 'OpenAI', url: 'https://platform.openai.com/docs', free: false },
    { type: 'course', title: 'LLM Application Development', provider: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/courses/', free: false },
  ],
  'Data Structures & Algorithms': [
    { type: 'course', title: 'Data Structures & Algorithms in JavaScript', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', free: true },
    { type: 'documentation', title: 'VisuAlgo Visualizations', provider: 'VisuAlgo', url: 'https://visualgo.net/', free: true },
  ],
  'React Native': [
    { type: 'documentation', title: 'React Native Docs', provider: 'Meta', url: 'https://reactnative.dev/docs/getting-started', free: true },
  ],
  Flutter: [
    { type: 'documentation', title: 'Flutter Docs', provider: 'Google', url: 'https://docs.flutter.dev/get-started/install', free: true },
  ],
  Redux: [
    { type: 'documentation', title: 'Redux Toolkit Docs', provider: 'Redux', url: 'https://redux-toolkit.js.org/tutorials/quick-start', free: true },
  ],
  Webpack: [
    { type: 'documentation', title: 'Vite Docs', provider: 'Vite', url: 'https://vitejs.dev/guide/', free: true },
  ],
  MongoDB: [
    { type: 'documentation', title: 'MongoDB University', provider: 'MongoDB', url: 'https://learn.mongodb.com/', free: true },
  ],
  'REST APIs': [
    { type: 'documentation', title: 'MDN Web APIs', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/API', free: true },
    { type: 'course', title: 'REST API Design Course', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/rest-api-design-course/', free: true },
  ],
  Git: [
    { type: 'documentation', title: 'Git Official Documentation', provider: 'Git', url: 'https://git-scm.com/doc', free: true },
    { type: 'course', title: 'Git & GitHub Crash Course', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/git-and-github-for-beginners/', free: true },
  ],
  TypeScript: [
    { type: 'documentation', title: 'TypeScript Handbook', provider: 'Microsoft', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', free: true },
    { type: 'course', title: 'TypeScript Full Course', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/learn-typescript-full-course/', free: true },
  ],
  React: [
    { type: 'documentation', title: 'React Learn', provider: 'Meta', url: 'https://react.dev/learn', free: true },
    { type: 'documentation', title: 'Next.js Learn', provider: 'Vercel', url: 'https://nextjs.org/learn', free: true },
  ],
  'Next.js': [
    { type: 'documentation', title: 'Next.js Learn', provider: 'Vercel', url: 'https://nextjs.org/learn', free: true },
    { type: 'documentation', title: 'Next.js Docs', provider: 'Vercel', url: 'https://nextjs.org/docs', free: true },
  ],
  'Node.js': [
    { type: 'documentation', title: 'Node.js Docs', provider: 'Node.js', url: 'https://nodejs.org/en/docs', free: true },
    { type: 'documentation', title: 'Express Guide', provider: 'OpenJS', url: 'https://expressjs.com/en/guide/routing.html', free: true },
  ],
  Java: [
    { type: 'course', title: 'Java Programming', provider: 'Coursera', url: 'https://www.coursera.org/learn/java-programming', free: true },
  ],
  Go: [
    { type: 'documentation', title: 'A Tour of Go', provider: 'Go', url: 'https://go.dev/tour/', free: true },
  ],
  Rust: [
    { type: 'documentation', title: 'The Rust Book', provider: 'Rust', url: 'https://doc.rust-lang.org/book/', free: true },
  ],
  Microservices: [
    { type: 'course', title: 'Microservices with NodeJS and React', provider: 'Udemy', url: 'https://www.udemy.com/course/microservices-with-node-js-and-react/', free: false },
  ],
  DevOps: [
    { type: 'course', title: 'DevOps for Beginners', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/devops-course/', free: true },
  ],
  Pandas: [
    { type: 'documentation', title: 'Pandas User Guide', provider: 'Pandas', url: 'https://pandas.pydata.org/docs/user_guide/index.html', free: true },
  ],
  Firebase: [
    { type: 'documentation', title: 'Firebase Docs', provider: 'Google', url: 'https://firebase.google.com/docs', free: true },
  ],
  'Web Security': [
    { type: 'documentation', title: 'OWASP Top Ten', provider: 'OWASP', url: 'https://owasp.org/www-project-top-ten/', free: true },
  ],
};

const GENERIC_RESOURCES: LearningResource[] = [
  { type: 'documentation', title: 'MDN Web Docs', provider: 'MDN', url: 'https://developer.mozilla.org/', free: true },
  { type: 'course', title: 'freeCodeCamp Curriculum', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn', free: true },
];

function resourcesFor(topic: string): LearningResource[] {
  return RESOURCE_CATALOG[topic] ?? GENERIC_RESOURCES;
}

interface RoleTemplate {
  title: string;
  focus: FocusArea[];
  required: string[];
  niceToHave: string[];
  description: string;
  type: string;
  salary: string;
  internSalary?: string;
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    title: 'Frontend Engineer',
    focus: ['frontend', 'fullstack'],
    required: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
    niceToHave: ['Next.js', 'Redux', 'Testing', 'Webpack'],
    description: 'Build and ship polished user interfaces, own component architecture, and collaborate with design and backend teams.',
    type: 'Full-time',
    salary: '\u20b96\u201312 LPA / $60k\u2013$110k',
  },
  {
    title: 'Full-Stack Developer',
    focus: ['fullstack', 'frontend', 'backend'],
    required: ['JavaScript', 'React', 'Node.js', 'REST APIs', 'SQL'],
    niceToHave: ['TypeScript', 'MongoDB', 'Docker', 'CI/CD'],
    description: 'Own features end-to-end across the frontend and API layers, with responsibility for data modeling and delivery.',
    type: 'Full-time',
    salary: '\u20b98\u201316 LPA / $80k\u2013$130k',
  },
  {
    title: 'Backend Engineer',
    focus: ['backend', 'fullstack'],
    required: ['Node.js', 'Python', 'REST APIs', 'SQL', 'Microservices'],
    niceToHave: ['Docker', 'GraphQL', 'MongoDB', 'AWS'],
    description: 'Design and operate APIs and services, optimize data access, and keep systems reliable under load.',
    type: 'Full-time',
    salary: '\u20b98\u201315 LPA / $90k\u2013$140k',
  },
  {
    title: 'DevOps / Cloud Engineer',
    focus: ['devops'],
    required: ['Docker', 'CI/CD', 'AWS', 'Cloudflare', 'Kubernetes'],
    niceToHave: ['Terraform', 'Python', 'Go'],
    description: 'Own CI/CD pipelines, cloud infrastructure, and observability so teams can ship safely and frequently.',
    type: 'Full-time',
    salary: '\u20b910\u201318 LPA / $100k\u2013$150k',
  },
  {
    title: 'Data / ML Engineer',
    focus: ['data'],
    required: ['Python', 'Pandas', 'SQL', 'Machine Learning'],
    niceToHave: ['LLMs', 'Docker', 'AWS'],
    description: 'Build data pipelines and models, evaluate performance, and productionize ML-powered features.',
    type: 'Full-time',
    salary: '\u20b99\u201318 LPA / $95k\u2013$150k',
  },
  {
    title: 'Mobile Developer (React Native)',
    focus: ['mobile', 'frontend'],
    required: ['React Native', 'React', 'JavaScript', 'TypeScript'],
    niceToHave: ['Testing', 'CI/CD', 'REST APIs'],
    description: 'Build cross-platform mobile experiences with React Native and ship to the App Store and Play Store.',
    type: 'Full-time',
    salary: '\u20b97\u201314 LPA / $80k\u2013$130k',
  },
  {
    title: 'Software Engineering Intern',
    focus: ['frontend', 'backend', 'fullstack', 'devops', 'data', 'mobile', 'general'],
    required: ['JavaScript', 'Python', 'React', 'Git', 'SQL'],
    niceToHave: ['Testing', 'Docker', 'REST APIs'],
    description: 'Contribute to production features with mentorship, learn the codebase, and ship small improvements weekly.',
    type: 'Internship (Paid)',
    salary: '\u20b925k\u201350k/month',
    internSalary: '\u20b925k\u201350k/month',
  },
  {
    title: 'Open Source Contributor Intern',
    focus: ['frontend', 'backend', 'fullstack', 'general', 'devops', 'data', 'mobile'],
    required: ['Git', 'JavaScript', 'Python', 'React', 'Testing'],
    niceToHave: ['TypeScript', 'Docker', 'CI/CD'],
    description: 'Collaborate with an open-source team on real issues, ship reviewed pull requests, and grow in a public codebase.',
    type: 'Internship (Unpaid)',
    salary: 'Unpaid \u00b7 remote \u00b7 flexible hours',
  },
];

function scoreRole(role: RoleTemplate, userSkills: Set<string>): number {
  const all = [...role.required, ...role.niceToHave];
  let hits = 0;
  let weight = 0;
  for (const skill of role.required) {
    weight += 2;
    if (userSkills.has(skill)) hits += 2;
  }
  for (const skill of role.niceToHave) {
    weight += 1;
    if (userSkills.has(skill)) hits += 1;
  }
  if (weight === 0) return 0;
  const base = Math.round((hits / weight) * 100);
  return Math.max(35, Math.min(97, base));
}

function buildJobSearchUrl(title: string): string {
  const query = encodeURIComponent(`${title} jobs`);
  return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
}

export function buildJobRecommendations(
  technical: DetectedSkill[],
  focus: FocusArea,
): JobRecommendation[] {
  const userSkills = new Set(technical.map((s) => s.name));
  userSkills.add('Git');
  userSkills.add('REST APIs');

  return ROLE_TEMPLATES
    .map((role) => ({ role, match: scoreRole(role, userSkills) }))
    .filter(({ role, match }) => role.focus.includes(focus) || match >= 65)
    .sort((a, b) => b.match - a.match)
    .slice(0, 5)
    .map(({ role, match }, index) => {
      const matchedSkills = [...userSkills].filter((skill) => role.required.includes(skill) || role.niceToHave.includes(skill));
      const displaySkills = [...new Set([...matchedSkills, ...role.required])].slice(0, 5);
      return {
        id: index + 1,
        title: role.title,
        company: role.type.startsWith('Internship') ? 'Open-source & startup community' : 'Top hiring companies',
        matchPercentage: match,
        salary: role.salary,
        location: 'Remote / Hybrid',
        type: role.type,
        skills: displaySkills,
        description: role.description,
        applyUrl: buildJobSearchUrl(role.title),
        fitReason: matchedSkills.length
          ? `Matches your skills in ${matchedSkills.slice(0, 3).join(', ')}`
          : 'Broad match based on your focus area \u2014 add more profile signals to improve fit',
      };
    });
}

export function buildLearningPath(
  technical: DetectedSkill[],
  soft: DetectedSkill[],
  focus: FocusArea,
): LearningPathItem[] {
  const present = new Set(technical.map((s) => s.name));
  const gaps = GAPS_BY_FOCUS[focus].filter((gap) => !present.has(gap.skill));

  const items: LearningPathItem[] = gaps.map((gap, index) => ({
    id: index + 1,
    topic: gap.skill,
    priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
    timeEstimate: index === 0 ? '2\u20134 weeks' : index === 1 ? '3\u20135 weeks' : '2\u20133 weeks',
    explanation: gap.gap,
    resources: resourcesFor(gap.skill),
  }));

  const stretchTopics: Array<{ topic: string; explanation: string; priority: 'medium' | 'low' }> = [];
  if (!present.has('System Design')) {
    stretchTopics.push({ topic: 'System Design', explanation: 'Practice designing scalable systems for senior-level interviews.', priority: 'medium' });
  }
  if (!present.has('Data Structures & Algorithms')) {
    stretchTopics.push({ topic: 'Data Structures & Algorithms', explanation: 'Sharpen DSA fundamentals for coding interviews.', priority: 'low' });
  }
  if (!present.has('Web Security')) {
    stretchTopics.push({ topic: 'Web Security', explanation: 'Learn common web vulnerabilities and secure coding practices.', priority: 'low' });
  }
  if (soft.length < 3) {
    stretchTopics.push({ topic: 'Communication', explanation: 'Structured writing and presentation skills improve collaboration and interviews.', priority: 'low' });
  }

  for (const stretch of stretchTopics) {
    if (items.length >= 6) break;
    items.push({
      id: items.length + 1,
      topic: stretch.topic,
      priority: stretch.priority,
      timeEstimate: '2\u20134 weeks',
      explanation: stretch.explanation,
      resources: resourcesFor(stretch.topic),
    });
  }

  return items.map((item, index) => ({ ...item, id: index + 1 }));
}

export interface BuildProfileInput {
  links: SocialLinks;
  technical: DetectedSkill[];
  soft: DetectedSkill[];
  sourceCount: number;
  hasResume: boolean;
  resumeChars: number;
  focus: FocusArea;
}

export function buildProfile(input: BuildProfileInput): UserProfile {
  const { links, technical, soft, sourceCount, hasResume, resumeChars, focus } = input;

  const technicalSkills = toSkillData(technical);
  const softSkills = toSkillData(soft);
  const topSkills = [...technical, ...soft].sort((a, b) => b.score - a.score).slice(0, 6).map((s) => s.name);

  const technicalAvg = technicalSkills.length
    ? Math.round(technicalSkills.reduce((sum, s) => sum + s.value, 0) / technicalSkills.length)
    : 0;
  const softAvg = softSkills.length
    ? Math.round(softSkills.reduce((sum, s) => sum + s.value, 0) / softSkills.length)
    : 0;

  const sourceBonus = Math.min(15, Math.max(0, (sourceCount - 1) * 5));
  const industryRelevanceScore = Math.max(15, Math.min(98, Math.round(technicalAvg * 0.75 + softAvg * 0.15 + sourceBonus)));

  const gaps = GAPS_BY_FOCUS[focus]
    .filter((gap) => !technical.some((s) => s.name === gap.skill))
    .map((gap) => gap.gap);

  const strengths: string[] = [];
  if (topSkills.length) strengths.push(`Core strengths in ${topSkills.slice(0, 3).join(', ')}`);
  if (technical.length >= 6) strengths.push(`Broad technical toolkit (${technical.length} distinct skills detected)`);
  if (soft.length >= 3) strengths.push(`Collaboration signals: ${soft.slice(0, 3).map((s) => s.name).join(', ')}`);
  if (sourceCount >= 2) strengths.push(`Evidence across ${sourceCount} independent profile sources`);
  if (hasResume) strengths.push('Uploaded resume parsed for keyword coverage');

  const sourceNames = technical.slice(0, 5).map((s) => s.name).join(', ') || 'your profile signals';
  const focusLabel = FOCUS_LABEL[focus];
  const overview = `Analysis of ${sourceCount} profile source${sourceCount === 1 ? '' : 's'}${hasResume ? ' plus your uploaded resume' : ''} points to ${focusLabel} as your primary direction. Strongest signals: ${sourceNames}.`;

  const atsScore = hasResume
    ? Math.max(35, Math.min(97, Math.round(30 + Math.min(40, technical.length * 4) + Math.min(20, resumeChars / 400) + (soft.length >= 2 ? 8 : 0))))
    : Math.max(20, Math.min(70, Math.round(20 + Math.min(30, technical.length * 3) + (soft.length >= 2 ? 8 : 0))));

  const atsFeedback: string[] = [];
  if (!hasResume) {
    atsFeedback.push('Upload a plain-text resume to get a precise ATS score.');
  } else {
    atsFeedback.push('Mirror exact keywords from target job descriptions in your skills section.');
    atsFeedback.push('Quantify impact with metrics (%, time saved, users reached) in each role.');
  }
  atsFeedback.push('Group skills into clear sections: languages, frameworks, tools, practices.');
  if (topSkills.length < 5) atsFeedback.push('Add more profile evidence (GitHub repos, articles) to strengthen keyword coverage.');
  atsFeedback.push('Keep formatting simple: standard headings, consistent date formats, no tables.');

  const jobRecommendations = buildJobRecommendations(technical, focus);
  const learningPath = buildLearningPath(technical, soft, focus);

  const industryInsights = technical.length
    ? `Your stack (${topSkills.slice(0, 4).join(', ') || sourceNames}) maps strongly to ${focusLabel} roles. Demand for this mix is driven by product teams shipping AI-enabled web applications; strengthening ${gaps[0]?.split(' (')[0] ?? 'testing and system design'} would round out your profile.`
    : 'Add profile links or a resume so Skillforge can map your stack to current market demand.';

  return {
    links,
    technicalSkills,
    softSkills,
    jobRecommendations,
    aiSummary: {
      overview,
      strengths: strengths.slice(0, 5),
      gaps: gaps.slice(0, 5),
      industryRelevanceScore,
      atsScore,
      atsFeedback: atsFeedback.slice(0, 6),
      industryInsights,
      topSkills,
    },
    learningPath,
  };
}
