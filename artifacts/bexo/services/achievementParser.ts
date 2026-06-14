type ParsedUpdate = {
  type: 'project' | 'achievement' | 'role' | 'education';
  title: string;
  description: string;
};

export function parseUpdateText(text: string): ParsedUpdate {
  const lower = text.toLowerCase();

  if (
    lower.includes('joined') ||
    lower.includes('hired') ||
    lower.includes('started as') ||
    lower.includes('promoted')
  ) {
    return { type: 'role', title: text.slice(0, 80), description: text };
  }

  if (
    lower.includes('graduated') ||
    lower.includes('degree') ||
    lower.includes('university') ||
    lower.includes('course')
  ) {
    return { type: 'education', title: text.slice(0, 80), description: text };
  }

  if (
    lower.includes('built') ||
    lower.includes('launched') ||
    lower.includes('shipped') ||
    lower.includes('released')
  ) {
    return { type: 'project', title: text.slice(0, 80), description: text };
  }

  return { type: 'achievement', title: text.slice(0, 80), description: text };
}
