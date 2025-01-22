// types.ts
export interface Question {
    question: string;
    answer: string;
  }
  
  export interface GenerateRequestBody {
    subject: string;
    includeCode: boolean;
  }
  
  export interface GenerateResponse {
    questions: string[];
    error?: string;
  }