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
  variants: string[];
}

export interface V4UnitGroup {
  unit: string;
  questions: V4QuestionCard[];
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
  filters: Record<string, any>;
  units: V4UnitGroup[];
}
