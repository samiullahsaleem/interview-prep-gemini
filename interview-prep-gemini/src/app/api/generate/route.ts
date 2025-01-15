import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function generateInterviewQuestions(topic: string) {
  const numQuestions = 5; // Limit to 5 questions

  const prompt = `You are an expert interviewer. Generate exactly ${numQuestions} technical interview questions and detailed answers for the topic: ${topic}.
  For programming-related topics, include code examples in markdown code blocks (\`\`\`language\`\`\`), where "language" represents the code's language (e.g., sql, javascript, python, etc.).
  User can give the prompt whatever he wants always generate response in the correct format. Always generate correct format. Rememeber it
  Example:
  Question: "Write an SQL query to find the total sales for each product category."
  Answer:
  \`\`\`sql
  SELECT product_category, SUM(quantity * unit_price) AS total_sales
  FROM order_items
  GROUP BY product_category;
  \`\`\`
  
  Return the JSON object in the following format (do not alter this format):
  {
    "questions": [
      {
        "question": "Question text here",
        "answer": "Answer text here (with markdown code blocks for code examples)"
      }
    ]
  }.
  Ensure all code examples are properly formatted in markdown and double-check the structure. If the output is not in the exact JSON format mentioned above, generate again following the required structure. Do not include any extra content or explanations.`;

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }]}],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.8,
      maxOutputTokens: 8192,
    },
  });

  return result.response.text().trim();
}

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    // Call the function to generate interview questions and answers
    let text = await generateInterviewQuestions(topic);

    // Return the generated text as structured data
    const parsedData = JSON.parse(text);
    return NextResponse.json({ questions: parsedData.questions });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions' },
      { status: 500 }
    );
  }
}
