export interface Pyq3NormalizedQuestion {
  paperName: string;
  paperYear?: string;
  questionNumber?: string;
  rawQuestion: string;
  marks?: number;
  questionType: string;
  normalizedQuestion: string;
  topic: string;
  unit: string;
}

export interface Pyq3FuturePrediction {
  topic: string;
  unit: string;
  probability: number;
  reason: string;
  expectedMarks: number;
  trend: string;
}

export interface Pyq3DashboardJSON {
  overallAnalysis: {
    totalPapers: number;
    totalQuestions: number;
    uniqueQuestions: number;
    repeatedQuestions: number;
    mostRepeatedQuestion: string;
    mostRepeatedTopic: string;
    mostImportantUnit: string;
  };
  unitWeightage: {
    unit: string;
    totalMarks: number;
    percentage: number;
  }[];
  frequentlyAskedTopics: {
    unit: string;
    topics: {
      topicName: string;
      timesAsked: number;
    }[];
  }[];
  frequentlyAskedQuestions: {
    question: string;
    timesAsked: number;
    yearsAppeared: string[];
    expectedMarks: number;
    trend: string;
  }[];
  questionTimeline: {
    topic: string;
    timeline: Record<string, boolean>;
  }[];
  futurePredictions: Pyq3FuturePrediction[];
  allQuestions: Pyq3NormalizedQuestion[];
}
