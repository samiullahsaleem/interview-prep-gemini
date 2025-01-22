// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateRequestBody, GenerateResponse } from "../../type";

export async function POST(request: Request) {
  try {
    const { subject, includeCode } = await request.json() as GenerateRequestBody;

    if (!subject?.trim()) {
      return NextResponse.json<GenerateResponse>(
        { questions: [], error: 'Subject is required' }, 
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate 10 technical interview questions and detailed answers about ${subject}.
${includeCode ? 'Include relevant code examples where appropriate.' : ''}

Requirements:
1. Format each Q&A pair exactly as "Q: [question]" followed by "A: [answer]" Don't Use or add anything else in the Q&A pair. Strictly follow the format provided.
2. Make questions progressively more challenging
3. Include both theoretical and practical aspects
4. For code examples, wrap them in triple backticks
5. Provide detailed, educational explanations in the answers
6. Include real-world applications and examples where relevant
7. Don't Use * anywhere

Please ensure consistent formatting and separate each Q&A pair with a blank line.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // Process the response into well-structured Q&A pairs
    const qaPairs = generatedText
      .split(/(?=Q: )/g)
      .filter(qa => qa.trim())
      .map(qa => qa.trim());

    return NextResponse.json<GenerateResponse>({ questions: qaPairs });
  } catch (error) {
    console.error('Error generating questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate questions';
    return NextResponse.json<GenerateResponse>(
      { questions: [], error: errorMessage },
      { status: 500 }
    );
  }
}