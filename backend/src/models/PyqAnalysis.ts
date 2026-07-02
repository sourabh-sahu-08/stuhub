import mongoose, { Schema, Document } from "mongoose";

export interface IPyqAnalysis extends Document {
  user: mongoose.Types.ObjectId;
  fileName: string;
  paperName: string;
  subject: string;
  semester?: number;
  difficulty: "Easy" | "Medium" | "Hard";
  difficultyScore: number;
  estimatedTime: string;
  totalMarks: number;
  summary: string;
  importantTopics: { name: string; importance: "High" | "Medium" | "Low" }[];
  marksDistribution: { name: string; marks: number }[];
  frequentlyAskedTopics: { topic: string; frequencyCount: number }[];
  chapterWeightage: { chapter: string; weightage: number }[];
  questionTypeDistribution: { typeName: string; percentage: number }[];
  mostRepeatedQuestions: { question: string; frequency: number; marks: number }[];
  predictedQuestions: { question: string; topic: string; probability: number }[];
  studyPlan: { phase: string; duration: string; tasks: string[] }[];
  revisionTips: string[];
  preparationSuggestions: string[];
  extractedText: string;
  createdAt: Date;
  updatedAt: Date;
}

const pyqAnalysisSchema = new Schema<IPyqAnalysis>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    paperName: { type: String, required: true },
    subject: { type: String, required: true },
    semester: { type: Number },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    difficultyScore: { type: Number, required: true },
    estimatedTime: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    summary: { type: String, required: true },
    importantTopics: [
      {
        name: { type: String, required: true },
        importance: { type: String, enum: ["High", "Medium", "Low"], required: true }
      }
    ],
    marksDistribution: [
      {
        name: { type: String, required: true },
        marks: { type: Number, required: true }
      }
    ],
    frequentlyAskedTopics: [
      {
        topic: { type: String, required: true },
        frequencyCount: { type: Number, required: true }
      }
    ],
    chapterWeightage: [
      {
        chapter: { type: String, required: true },
        weightage: { type: Number, required: true }
      }
    ],
    questionTypeDistribution: [
      {
        typeName: { type: String, required: true },
        percentage: { type: Number, required: true }
      }
    ],
    mostRepeatedQuestions: [
      {
        question: { type: String, required: true },
        frequency: { type: Number, required: true },
        marks: { type: Number, required: true }
      }
    ],
    predictedQuestions: [
      {
        question: { type: String, required: true },
        topic: { type: String, required: true },
        probability: { type: Number, required: true }
      }
    ],
    studyPlan: [
      {
        phase: { type: String, required: true },
        duration: { type: String, required: true },
        tasks: [{ type: String }]
      }
    ],
    revisionTips: [{ type: String }],
    preparationSuggestions: [{ type: String }],
    extractedText: { type: String, required: true }
  },
  { timestamps: true }
);

export const PyqAnalysis = mongoose.model<IPyqAnalysis>("PyqAnalysis", pyqAnalysisSchema);
