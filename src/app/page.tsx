'use client';

import React, { useState } from 'react';

interface Question {
  question: string;
  answer: string;
}

const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/(```[\s\S]*?```)/);
  return (
    <div style={{ marginTop: '10px' }}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).trim();
          return (
            <pre
              key={index}
              style={{
                backgroundColor: '#282c34',
                color: '#ffffff',
                padding: '10px',
                borderRadius: '5px',
                overflowX: 'auto',
              }}
            >
              <code>{code}</code>
            </pre>
          );
        }
        return <p key={index} style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{part}</p>;
      })}
    </div>
  );
};

const QuestionCard: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <div
    style={{
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '15px',
      marginBottom: '20px',
    }}
  >
    <h3 style={{ margin: '0 0 10px', color: '#222' }}>{question}</h3>
    <ContentRenderer content={answer} />
  </div>
);

export default function InterviewQuestionsPage() {
  const [subject, setSubject] = useState<string>('');
  const [includeCode, setIncludeCode] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const generateQuestions = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, includeCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      const processedQuestions: Question[] = data.questions.map((qa: string) => {
        const [questionPart, ...answerParts] = qa.split('\nA: ');
        return {
          question: questionPart.replace('Q: ', '').trim(),
          answer: answerParts.join('\nA: ').trim(),
        };
      });

      setQuestions(processedQuestions);
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
        Interview Question Generator
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter subject (e.g., React, TypeScript, Node.js)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="checkbox"
            id="include-code"
            checked={includeCode}
            onChange={(e) => setIncludeCode(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          <label htmlFor="include-code" style={{ color: '#555' }}>
            Include Code Examples
          </label>
        </div>
        <button
          onClick={generateQuestions}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating Questions...' : 'Generate Questions'}
        </button>
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
            Generated Questions and Answers
          </h2>
          {questions.map((qa, index) => (
            <QuestionCard key={index} question={qa.question} answer={qa.answer} />
          ))}
        </div>
      )}
    </main>
  );
}
