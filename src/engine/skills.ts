export interface DetectedSkill {
  name: string;
  count: number;
  sources: string[];
  score: number;
}

const TECHNICAL_KEYWORDS: Record<string, string[]> = {
  JavaScript: ['javascript', 'js', 'es6', 'ecmascript'],
  TypeScript: ['typescript', 'ts'],
  React: ['react', 'reactjs', 'react.js'],
  'Next.js': ['nextjs', 'next.js', 'next js'],
  Vue: ['vue', 'vuejs', 'vue.js'],
  Angular: ['angular'],
  'Node.js': ['node', 'nodejs', 'node.js', 'express'],
  Python: ['python', 'django', 'flask', 'fastapi', 'pandas'],
  HTML: ['html', 'html5'],
  CSS: ['css', 'css3', 'sass', 'scss', 'tailwind', 'tailwindcss'],
  'REST APIs': ['rest', 'restful', 'api design', 'api development'],
  GraphQL: ['graphql', 'apollo'],
  SQL: ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mariadb'],
  MongoDB: ['mongodb', 'mongo', 'nosql'],
  Git: ['git', 'github', 'gitlab', 'version control'],
  Docker: ['docker', 'containerization'],
  Kubernetes: ['kubernetes', 'k8s'],
  AWS: ['aws', 'amazon web services'],
  'Cloudflare': ['cloudflare', 'workers', 'pages', 'wrangler'],
  Firebase: ['firebase'],
  Testing: ['testing', 'unit testing', 'integration testing', 'tdd'],
  Jest: ['jest'],
  'Cypress/Playwright': ['cypress', 'playwright', 'selenium'],
  'CI/CD': ['ci/cd', 'cicd', 'github actions', 'jenkins', 'pipelines'],
  Java: ['java', 'spring boot', 'springboot'],
  'C#/.NET': ['c#', '.net', 'dotnet', 'asp.net'],
  'C++': ['c++', 'cpp'],
  Go: ['golang', ' go '],
  Rust: ['rust', 'rustlang'],
  Kotlin: ['kotlin'],
  Swift: ['swift', 'ios'],
  'React Native': ['react native', 'expo'],
  Flutter: ['flutter', 'dart'],
  Redux: ['redux', 'zustand', 'recoil'],
  Webpack: ['webpack', 'vite', 'rollup', 'esbuild'],
  'Microservices': ['microservice', 'microservices'],
  DevOps: ['devops', 'infrastructure', 'terraform', 'ansible'],
  'Data Structures & Algorithms': ['data structures', 'algorithms', 'dsa', 'leetcode'],
  Pandas: ['pandas', 'numpy', 'data analysis'],
  'Machine Learning': ['machine learning', 'ml', 'tensorflow', 'pytorch', 'scikit-learn'],
  LLMs: ['llm', 'large language model', 'openai', 'langchain', 'rag', 'transformers'],
  'Web Security': ['web security', 'xss', 'csrf', 'cors', 'oauth', 'jwt'],
  'System Design': ['system design', 'distributed systems', 'scalability', 'load balancing'],
};

const SOFT_KEYWORDS: Record<string, string[]> = {
  Communication: ['communication', 'written communication', 'presenting', 'presentation'],
  Leadership: ['leadership', 'led a team', 'team lead', 'mentoring', 'mentor'],
  Teamwork: ['teamwork', 'collaboration', 'collaborate', 'cross-functional', 'cross functional'],
  'Problem Solving': ['problem solving', 'problem-solving', 'troubleshooting', 'debugging'],
  Adaptability: ['adaptability', 'adapted', 'fast-paced', 'fast paced'],
  Ownership: ['ownership', 'end-to-end', 'end to end', 'self-driven', 'initiative'],
  Creativity: ['creativity', 'creative', 'design thinking'],
  'Time Management': ['time management', 'prioritized', 'prioritization', 'deadlines'],
  'Attention to Detail': ['attention to detail', 'detail-oriented', 'quality'],
  'Analytical Thinking': ['analytical', 'data-driven', 'data driven', 'critical thinking'],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countOccurrences(haystack: string, needle: string): number {
  const escaped = escapeRegExp(needle.trim());
  if (!escaped) return 0;
  // Leading boundary excludes '.' so short aliases (e.g. "js") don't match
  // inside dotted names like "node.js"; trailing boundary allows '.' so
  // sentence-final keywords ("Docker.") still count.
  const matches = haystack.match(new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#]|$)`, 'g'));
  return matches ? matches.length : 0;
}

function scoreFromCount(count: number, maxCount: number): number {
  if (maxCount <= 0 || count <= 0) return 0;
  const relative = count / maxCount;
  if (relative >= 0.75) return 94;
  if (relative >= 0.5) return 84;
  if (relative >= 0.3) return 72;
  if (relative >= 0.15) return 60;
  return 48;
}

function detectFromDictionary(
  text: string,
  dictionary: Record<string, string[]>,
  source: string,
): Map<string, DetectedSkill> {
  const lower = ` ${text.toLowerCase()} `;
  const found = new Map<string, DetectedSkill>();

  for (const [canonical, aliases] of Object.entries(dictionary)) {
    let count = 0;
    for (const alias of aliases) {
      count += countOccurrences(lower, alias);
    }
    if (count <= 0) continue;

    const existing = found.get(canonical);
    if (existing) {
      existing.count += count;
      if (!existing.sources.includes(source)) existing.sources.push(source);
    } else {
      found.set(canonical, { name: canonical, count, sources: [source], score: 0 });
    }
  }

  return found;
}

function finalize(map: Map<string, DetectedSkill>, limit: number): DetectedSkill[] {
  const maxCount = Array.from(map.values()).reduce((max, s) => Math.max(max, s.count), 0);
  return Array.from(map.values())
    .map((skill) => ({ ...skill, score: scoreFromCount(skill.count, maxCount) }))
    .sort((a, b) => b.score - a.score || b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function detectSkills(
  text: string,
  source = 'profile',
): { technical: DetectedSkill[]; soft: DetectedSkill[] } {
  return {
    technical: finalize(detectFromDictionary(text, TECHNICAL_KEYWORDS, source), 14),
    soft: finalize(detectFromDictionary(text, SOFT_KEYWORDS, source), 8),
  };
}

export function mergeDetected(
  batches: Array<{ text: string; source: string }>,
): { technical: DetectedSkill[]; soft: DetectedSkill[] } {
  const technical = new Map<string, DetectedSkill>();
  const soft = new Map<string, DetectedSkill>();

  for (const batch of batches) {
    const detected = detectSkills(batch.text, batch.source);
    for (const skill of detected.technical) {
      const existing = technical.get(skill.name);
      if (existing) {
        existing.count += skill.count;
        for (const src of skill.sources) {
          if (!existing.sources.includes(src)) existing.sources.push(src);
        }
      } else {
        technical.set(skill.name, skill);
      }
    }
    for (const skill of detected.soft) {
      const existing = soft.get(skill.name);
      if (existing) {
        existing.count += skill.count;
        for (const src of skill.sources) {
          if (!existing.sources.includes(src)) existing.sources.push(src);
        }
      } else {
        soft.set(skill.name, skill);
      }
    }
  }

  const technicalList = Array.from(technical.values());
  const softList = Array.from(soft.values());
  const maxTechnical = technicalList.reduce((max, s) => Math.max(max, s.count), 0);
  const maxSoft = softList.reduce((max, s) => Math.max(max, s.count), 0);

  return {
    technical: technicalList
      .map((s) => ({ ...s, score: scoreFromCount(s.count, maxTechnical) }))
      .sort((a, b) => b.score - a.score || b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 12),
    soft: softList
      .map((s) => ({ ...s, score: scoreFromCount(s.count, maxSoft) }))
      .sort((a, b) => b.score - a.score || b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 6),
  };
}
