export interface RawQuestion {
  paperName: string;
  paperYear?: string;
  exam?: string;
  questionNumber?: string;
  rawQuestion: string;
  marks?: number;
  questionType: string;
}

export interface NormalizedQuestion extends RawQuestion {
  normalizedQuestion: string;
  topic: string;
  unit: string;
}

export interface TopicGroup {
  topic: string;
  unit: string;
  appearances: NormalizedQuestion[];
  timesAsked: number;
  totalMarks: number;
  yearsAppeared: string[];
}

export interface UnitWeightage {
  unit: string;
  totalMarks: number;
  percentage: number;
  topics: TopicGroup[];
}

export interface FuturePrediction {
  topic: string;
  unit: string;
  probability: number;
  reason: string;
  expectedMarks: number;
  trend: "Very High Probability" | "High Probability" | "Medium Probability" | "Low Probability";
}

export interface DashboardJSON {
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
    timeline: Record<string, boolean>; // e.g., { "2020": true, "2021": false }
  }[];
  futurePredictions: FuturePrediction[];
  allQuestions: NormalizedQuestion[];
}

export interface V4PaperMetadata {
  year: number | string;
  exam: string;
}

export interface V4QuestionCard {
  question: string;
  topic: string;
  frequency: number;
  confidence: number;
  papers: V4PaperMetadata[];
  variants: { text: string; year: string; }[];
}

export interface V4TopicGroup {
  topic: string;
  questions: V4QuestionCard[];
}

export interface V4UnitGroup {
  unit: string;
  topics: V4TopicGroup[];
}

export interface V4HotTopic {
  topic: string;
  unit: string;
  frequency: number;
}

export interface V4DashboardJSON {
  overview: {
    papersAnalyzed: number;
    totalQuestions: number;
    uniqueQuestions: number;
    unitsDetected: number;
    mostRepeatedQuestion: string;
    mostImportantUnit: string;
  };
  filters: any;
  hotTopics?: V4HotTopic[];
  units: V4UnitGroup[];
}
