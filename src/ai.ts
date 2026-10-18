import type { Env } from './session';

export type AIProvider = 'openai' | 'azure_openai' | 'anthropic' | 'huggingface' | 'none';

export interface AIDetectedSkill {
  name: string;
  score: number;
  confidence: number;
  type: 'technical' | 'soft' | 'other';
  source: string;
}

export interface AIJobRecommendation {
  title: string;
  company: string;
  type: string;
  salary?: string;
  location: string;
  skills: string[];
  description: string;
  matchPercentage: number;
  fitReason: string;
}

export interface AILearningItem {
  topic: string;
  priority: 'high' | 'medium' | 'low';
  timeEstimate: string;
  explanation: string;
  resources: Array<{ type: string; title: string; provider?: string; url: string; free: boolean }>;
}

export interface AIProfileAnalysis {
  technicalSkills: AIDetectedSkill[];
  softSkills: AIDetectedSkill[];
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  jobRecommendations: AIJobRecommendation[];
  learningPath: AILearningItem[];
  industryRelevanceScore: number;
  atsScore: number;
  atsFeedback: string[];
  industryInsights: string;
  topSkills: string[];
  rawText: string;
}

export function getAIProvider(env: Env): AIProvider {
  if (env.OPENAI_API_KEY) return 'openai';
  if (env.AZURE_OPENAI_API_KEY) return 'azure_openai';
  if (env.ANTHROPIC_API_KEY) return 'anthropic';
  if (env.HF_API_TOKEN) return 'huggingface';
  return 'none';
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeSkillName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9 ._+-]/g, '')
    .replace(/\bjs\b/i, 'JavaScript')
    .replace(/\bts\b/i, 'TypeScript')
    .replace(/\breactjs\b/i, 'React')
    .replace(/\bvuejs\b/i, 'Vue.js')
    .replace(/\bnextjs\b/i, 'Next.js')
    .replace(/\bnodejs\b/i, 'Node.js');
}

function extractJsonObject(output: string): Record<string, unknown> | null {
  const trimmed = output.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = (fenceMatch?.[1] ?? trimmed).trim();

  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');

  if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) {
    return null;
  }

  const jsonString = candidate.slice(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(jsonString);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function mapSkillItems(items: unknown, type: AIDetectedSkill['type']): AIDetectedSkill[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const skill = item as Record<string, unknown>;
      if (typeof skill.name !== 'string' || !skill.name.trim()) return null;

      const confidence = clamp(Number(skill.confidence) || 0.5, 0, 1);
      const numericScore = Number(skill.score);
      const score = clamp(Number.isFinite(numericScore) ? numericScore / 100 : confidence, 0, 1) * 100;

      return {
        name: normalizeSkillName(skill.name),
        score: Math.round(score),
        confidence,
        type,
        source: typeof skill.source === 'string' && skill.source.trim() ? skill.source : 'AI',
      };
    })
    .filter(Boolean) as AIDetectedSkill[];
}

async function postJSON(url: string, headers: Record<string, string>, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function callOpenAI(env: Env, prompt: string): Promise<string> {
  const key = env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY missing');

  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  const response = await postJSON(
    'https://api.openai.com/v1/chat/completions',
    { Authorization: `Bearer ${key}` },
    {
      model,
      temperature: 0.05,
      max_tokens: 2200,
      messages: [
        { role: 'system', content: 'You are a helpful AI that analyzes professional profiles and returns strict JSON.' },
        { role: 'user', content: prompt },
      ],
    },
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI error ${response.status} ${errBody}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data?.choices?.[0]?.message?.content ?? '';
}

async function callAzureOpenAI(env: Env, prompt: string): Promise<string> {
  const key = env.AZURE_OPENAI_API_KEY;
  const endpoint = env.AZURE_OPENAI_ENDPOINT;
  const deployment = env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
  if (!key || !endpoint) throw new Error('Azure OpenAI env keys missing');

  const response = await postJSON(
    `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-12-01`,
    { 'api-key': key },
    {
      messages: [
        { role: 'system', content: 'You are a helpful AI that analyzes professional profiles and returns strict JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.05,
      max_tokens: 2200,
    },
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Azure OpenAI error ${response.status} ${errBody}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data?.choices?.[0]?.message?.content ?? '';
}

async function callAnthropic(env: Env, prompt: string): Promise<string> {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY missing');

  const model = env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  const response = await postJSON(
    'https://api.anthropic.com/v1/messages',
    { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    {
      model,
      max_tokens: 2200,
      temperature: 0.05,
      messages: [{ role: 'user', content: prompt }],
    },
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic error ${response.status} ${errBody}`);
  }

  const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const content = Array.isArray(data?.content) ? data.content : [];
  const firstTextChunk = content.find((item) => item?.type === 'text' && typeof item?.text === 'string');
  return firstTextChunk?.text ?? '';
}

async function callHuggingFace(env: Env, prompt: string): Promise<string> {
  const token = env.HF_API_TOKEN;
  if (!token) throw new Error('HF_API_TOKEN missing');

  const model = env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.1';
  const formattedPrompt = `[INST] ${prompt} [/INST]`;

  const response = await postJSON(
    `https://api-inference.huggingface.co/models/${model}`,
    { Authorization: `Bearer ${token}` },
    {
      inputs: formattedPrompt,
      parameters: {
        max_new_tokens: 2200,
        temperature: 0.05,
        return_full_text: false,
      },
    },
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`HuggingFace error ${response.status} ${errBody}`);
  }

  const data = await response.json() as Array<{ generated_text?: string }> & { generated_text?: string };

  let generatedText = '';
  if (Array.isArray(data) && data[0]?.generated_text) {
    generatedText = data[0].generated_text;
  } else if (data?.generated_text) {
    generatedText = data.generated_text;
  }

  return generatedText
    .replace(/^\[INST\]\s*/, '')
    .replace(/\s*\[\/INST\]\s*/, '')
    .trim();
}

export async function callModel(env: Env, prompt: string): Promise<string> {
  const provider = getAIProvider(env);

  if (provider === 'openai') return await callOpenAI(env, prompt);
  if (provider === 'azure_openai') return await callAzureOpenAI(env, prompt);
  if (provider === 'anthropic') return await callAnthropic(env, prompt);
  if (provider === 'huggingface') return await callHuggingFace(env, prompt);

  throw new Error('No AI provider configured.');
}

function parseJobRecommendations(value: unknown): AIJobRecommendation[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 8)
    .map((job, index) => {
      if (!job || typeof job !== 'object') return null;
      const j = job as Record<string, unknown>;
      if (typeof j.title !== 'string' || typeof j.company !== 'string') return null;
      return {
        title: j.title,
        company: j.company,
        type: typeof j.type === 'string' ? j.type : 'Full-time',
        salary: j.salary ? String(j.salary) : undefined,
        location: typeof j.location === 'string' ? j.location : 'Remote',
        skills: Array.isArray(j.skills) ? j.skills.map(String).slice(0, 5) : [],
        description: typeof j.description === 'string' ? j.description : '',
        matchPercentage: Math.min(100, Math.max(0, Number(j.matchPercentage) || 50)),
        fitReason: typeof j.fitReason === 'string' ? j.fitReason : 'Good match for your skills',
      } as AIJobRecommendation;
    })
    .filter((job): job is AIJobRecommendation => job !== null && Boolean(job.title) && Boolean(job.company));
}

function parseLearningPath(value: unknown): AILearningItem[] {
  if (!Array.isArray(value)) return [];
  const allowedPriorities = new Set(['high', 'medium', 'low']);
  const allowedTypes = new Set(['course', 'book', 'video', 'documentation']);
  return value
    .slice(0, 8)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const i = item as Record<string, unknown>;
      if (typeof i.topic !== 'string' || !i.topic.trim()) return null;
      return {
        topic: i.topic,
        priority: typeof i.priority === 'string' && allowedPriorities.has(i.priority)
          ? (i.priority as 'high' | 'medium' | 'low')
          : 'medium',
        timeEstimate: typeof i.timeEstimate === 'string' ? i.timeEstimate : '2-4 weeks',
        explanation: typeof i.explanation === 'string' ? i.explanation : '',
        resources: Array.isArray(i.resources)
          ? i.resources
            .map((r) => {
              if (!r || typeof r !== 'object') return null;
              const res = r as Record<string, unknown>;
              if (typeof res.title !== 'string' || typeof res.url !== 'string') return null;
              return {
                type: typeof res.type === 'string' && allowedTypes.has(res.type) ? res.type : 'documentation',
                title: res.title,
                provider: typeof res.provider === 'string' ? res.provider : undefined,
                url: res.url,
                free: Boolean(res.free),
              };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null)
          : [],
      } as AILearningItem;
    })
    .filter((item): item is AILearningItem => item !== null);
}

export async function analyzeProfileText(env: Env, rawText: string): Promise<AIProfileAnalysis> {
  const prompt = `Analyze the profile text and return ONLY valid JSON with this exact shape:
{
  "technicalSkills": [{"name":"string","confidence":0.0,"score":0,"source":"string"}],
  "softSkills": [{"name":"string","confidence":0.0,"score":0,"source":"string"}],
  "summary":"string",
  "gaps":["string"],
  "recommendations":["string"],
  "atsScore": 0,
  "atsFeedback": ["string"],
  "jobRecommendations": [
    {
      "title":"string",
      "company":"string",
      "type":"Full-time|Internship (Paid)|Internship (Unpaid)|Contract",
      "salary":"string or null",
      "location":"string",
      "skills":["string"],
      "description":"string",
      "matchPercentage":80,
      "fitReason":"string"
    }
  ],
  "learningPath": [
    {
      "topic":"string",
      "priority":"high|medium|low",
      "timeEstimate":"string",
      "explanation":"string",
      "resources": [{"type":"course|book|video|documentation","title":"string","provider":"string","url":"string","free":true}]
    }
  ]
}

Rules:
- Do not wrap the response in markdown fences.
- Do not include any extra keys or commentary.
- confidence must be between 0 and 1.
- score must be between 0 and 100.
- Generate 4-6 job recommendations based on the user's specific skills.
- Generate 4-6 learning path topics that close the user's skill gaps.
- matchPercentage must reflect how well the job aligns with the user's skills (0-100).
- atsScore must be between 0 and 100.
- atsFeedback should contain 3-6 concise, actionable points.
- location can be "Remote", "Hybrid", or a specific city.

Profile text:
${rawText}`;

  const aiResponse = await callModel(env, prompt);
  const parsed = extractJsonObject(aiResponse);
  const skills = parseSkillsFromAI(aiResponse);

  const technicalSkills = Array.isArray(parsed?.technicalSkills)
    ? mapSkillItems(parsed.technicalSkills, 'technical')
    : skills.filter((s) => s.type === 'technical');
  const softSkills = Array.isArray(parsed?.softSkills)
    ? mapSkillItems(parsed.softSkills, 'soft')
    : skills.filter((s) => s.type === 'soft');

  let summary = '';
  let gaps: string[] = [];
  let recommendations: string[] = [];
  let atsScore = 0;
  let atsFeedback: string[] = [];
  const jobRecommendations = parseJobRecommendations(parsed?.jobRecommendations);
  const learningPath = parseLearningPath(parsed?.learningPath);

  if (parsed) {
    summary = typeof parsed.summary === 'string' ? parsed.summary : '';
    gaps = Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 6).map(String) : [];
    recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 6).map(String) : [];
    atsScore = Math.min(100, Math.max(0, Number(parsed.atsScore) || 0));
    atsFeedback = Array.isArray(parsed.atsFeedback) ? parsed.atsFeedback.slice(0, 6).map(String) : [];
  } else {
    summary = aiResponse.slice(0, 600);
  }

  const technicalAvg = technicalSkills.length
    ? technicalSkills.reduce((sum, skill) => sum + skill.score, 0) / technicalSkills.length
    : 0;
  const softAvg = softSkills.length ? softSkills.reduce((sum, skill) => sum + skill.score, 0) / softSkills.length : 0;
  const industryRelevanceScore = Math.round((technicalAvg + softAvg) / 2);

  const topSkills = [...technicalSkills, ...softSkills]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((skill) => skill.name);

  const industryInsights = `Technical average ${Math.round(technicalAvg)}, soft average ${Math.round(softAvg)}. Prioritize upskilling in ${topSkills.slice(0, 3).join(', ')}.`;

  const computedAtsScore = atsScore > 0
    ? Math.round(atsScore)
    : Math.round((technicalAvg * 0.55) + (softAvg * 0.2) + (topSkills.length >= 5 ? 15 : topSkills.length * 3));

  const normalizedAtsScore = Math.max(0, Math.min(100, computedAtsScore));

  const normalizedAtsFeedback = atsFeedback.length > 0
    ? atsFeedback
    : [
        'Tailor resume keywords to match target role descriptions.',
        'Highlight measurable project outcomes (metrics, impact, scale).',
        'Use clear section headers and consistent role-based skill grouping.',
      ];

  return {
    technicalSkills,
    softSkills,
    summary,
    strengths: topSkills.slice(0, 5).map((skill) => `Strong signal in ${skill}`),
    gaps,
    recommendations,
    jobRecommendations,
    learningPath,
    industryRelevanceScore,
    atsScore: normalizedAtsScore,
    atsFeedback: normalizedAtsFeedback,
    industryInsights,
    topSkills,
    rawText,
  };
}

export function parseSkillsFromAI(output: string): AIDetectedSkill[] {
  const parsed = extractJsonObject(output);
  if (!parsed) return [];

  if (Array.isArray(parsed.skills)) {
    return parsed.skills
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const skill = item as Record<string, unknown>;
        if (typeof skill.name !== 'string' || !skill.name.trim()) return null;

        const type = skill.type === 'soft' ? 'soft' : skill.type === 'technical' ? 'technical' : 'other';
        const confidence = clamp(Number(skill.confidence) || 0.5, 0, 1);
        const numericScore = Number(skill.score);
        const score = clamp(Number.isFinite(numericScore) ? numericScore / 100 : confidence, 0, 1) * 100;

        return {
          name: normalizeSkillName(skill.name),
          score: Math.round(score),
          confidence,
          type,
          source: typeof skill.source === 'string' && skill.source.trim() ? skill.source : 'AI',
        };
      })
      .filter(Boolean) as AIDetectedSkill[];
  }

  return [...mapSkillItems(parsed.technicalSkills, 'technical'), ...mapSkillItems(parsed.softSkills, 'soft')];
}
