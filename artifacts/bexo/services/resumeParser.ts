import type { ParsedResume } from '@/stores/useProfileStore';

const MOCK_RESUME: ParsedResume = {
  headline: 'Full-Stack Software Engineer',
  bio: 'Computer Science student passionate about building products that make a difference. I love clean code, thoughtful design, and shipping things people actually use.',
  location: 'San Francisco, CA',
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      field: 'Computer Science',
      start_year: 2021,
      end_year: 2025,
      gpa: '3.8',
    },
  ],
  experiences: [
    {
      company: 'Stripe',
      role: 'Software Engineering Intern',
      start_date: '2024-06-01',
      end_date: '2024-08-01',
      description: 'Built internal tooling for payment reconciliation using React and Go. Reduced processing time by 40%.',
      is_current: false,
    },
    {
      company: 'Berkeley AI Research',
      role: 'Undergraduate Researcher',
      start_date: '2023-01-01',
      description: 'Contributed to NLP research on low-resource language models.',
      is_current: true,
    },
  ],
  projects: [
    {
      title: 'Clarit',
      description: 'An AI-powered study tool that turns lecture notes into spaced-repetition flashcards. 500+ active users.',
      tech_stack: ['React', 'TypeScript', 'OpenAI', 'Supabase'],
      live_url: 'https://clarit.app',
      github_url: 'https://github.com/example/clarit',
    },
    {
      title: 'Pulse Dashboard',
      description: 'Real-time analytics dashboard for indie SaaS founders. Aggregates Stripe, Posthog, and GitHub data.',
      tech_stack: ['Next.js', 'Recharts', 'PostgreSQL'],
      github_url: 'https://github.com/example/pulse',
    },
  ],
  skills: [
    { name: 'TypeScript', category: 'Languages', level: 'advanced' },
    { name: 'React', category: 'Frontend', level: 'advanced' },
    { name: 'Python', category: 'Languages', level: 'intermediate' },
    { name: 'Node.js', category: 'Backend', level: 'intermediate' },
    { name: 'PostgreSQL', category: 'Databases', level: 'intermediate' },
    { name: 'Go', category: 'Languages', level: 'beginner' },
  ],
};

export async function uploadAndParseResume(
  _fileUri: string,
  _userId: string
): Promise<{ data: ParsedResume | null; error: string | null }> {
  await new Promise((r) => setTimeout(r, 2200));
  return { data: MOCK_RESUME, error: null };
}

export function friendlyResumeAiError(err: unknown): string {
  if (typeof err === 'string') {
    if (err.includes('timeout')) return 'The parse took too long. Please try again.';
    if (err.includes('PDF')) return 'Could not read this PDF. Make sure it has selectable text.';
    if (err.includes('rate')) return 'AI is busy right now. Please wait a moment and retry.';
  }
  return 'Could not parse your resume. You can fill in your details manually instead.';
}
