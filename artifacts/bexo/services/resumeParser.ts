import { uploadFile } from '@/services/upload';
import type { ParsedResume } from '@/stores/useProfileStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function uploadAndParseResume(
  fileUri: string,
  userId: string,
  filename?: string
): Promise<{ data: ParsedResume | null; url: string | null; error: string | null }> {
  try {
    const { url, error: uploadError } = await uploadFile(userId, fileUri, 'resumes', filename || 'resume.pdf');
    if (uploadError || !url) {
      return { data: null, url: null, error: uploadError || 'Failed to upload resume' };
    }

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Read local file as base64 for Gemini inline data
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert resume parser. Extract the resume information into a structured JSON object exactly matching this interface:
{
  "headline": "string (optional short professional headline)",
  "bio": "string (optional professional summary)",
  "location": "string (optional)",
  "education": [{"institution": "string", "degree": "string", "field": "string", "start_year": number, "end_year": number (optional), "gpa": "string (optional)"}],
  "experiences": [{"company": "string", "role": "string", "start_date": "string YYYY-MM-DD", "end_date": "string YYYY-MM-DD (optional)", "description": "string", "is_current": boolean}],
  "projects": [{"title": "string", "description": "string", "tech_stack": ["string"]}],
  "skills": [{"name": "string", "category": "string (optional)", "level": "beginner|intermediate|advanced|expert"}]
}
Return ONLY valid JSON without any markdown formatting or backticks.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      }
    ]);

    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText) as ParsedResume;

    return { data: parsedData, url, error: null };
  } catch (err: any) {
    console.error('[ResumeParser] error:', err);
    return { data: null, url: null, error: err.message || 'Upload or parse failed' };
  }
}

export function friendlyResumeAiError(err: unknown): string {
  if (typeof err === 'string') {
    if (err.includes('timeout')) return 'The parse took too long. Please try again.';
    if (err.includes('PDF')) return 'Could not read this PDF. Make sure it has selectable text.';
    if (err.includes('rate')) return 'AI is busy right now. Please wait a moment and retry.';
    if (err.includes('configured')) return 'AI services are currently unconfigured on the server.';
  }
  return 'Could not parse your resume. You can fill in your details manually instead.';
}
