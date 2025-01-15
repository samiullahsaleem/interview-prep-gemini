'use client'

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Question {
  question: string;
  answer: string;
  code?: string; // Optional field for code block
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]); // Default to empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();

      // Ensure the response contains questions
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        setError('Failed to generate questions. Please try again.');
      }
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">
          Interview Preparation Assistant
        </h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter interview topic (e.g., React.js, System Design)"
                className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Generating...' : 'Generate Questions'}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              The number of questions is limited to 5 for better quality.
            </p>
          </div>
        </form>

        {error && (
          <div className="text-red-600 mb-4 text-center p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((q, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <ReactMarkdown className="text-xl font-semibold mb-2 text-black">{q.question}</ReactMarkdown>
                
                {/* Render code block if exists */}
                {q.code && (
                  <pre className="bg-gray-800 text-white p-4 rounded-lg mt-4">
                    <code>{q.code}</code>
                  </pre>
                )}

                <div className="mt-4 text-black prose max-w-none">
                  <ReactMarkdown>{q.answer}</ReactMarkdown>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No questions available.</p>
          )}
        </div>
      </div>
    </main>
  );
}
