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
  variants: { text: string; year: string }[];
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
