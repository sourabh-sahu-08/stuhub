import React, { useState } from "react";
import {
  Download,
  Share2,
  RefreshCw,
  Clock,
  Award,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle,
  Lightbulb
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

interface PyqDashboardProps {
  analysis: any;
  onReanalyze: () => void;
  reanalyzing: boolean;
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"];

export function PyqDashboard({ analysis, onReanalyze, reanalyzing }: PyqDashboardProps) {
  const [activeTab, setActiveTab] = useState<"plan" | "tips">("plan");
  const [shared, setShared] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/dashboard/pyq?id=${analysis._id}`;
    navigator.clipboard.writeText(shareUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  // Safe data conversions for charts
  const marksData = analysis.marksDistribution?.map((item: any) => ({
    name: item.name,
    Marks: item.marks
  })) || [];

  const weightageData = analysis.chapterWeightage?.map((item: any) => ({
    name: item.chapter,
    value: item.weightage
  })) || [];

  const typeData = analysis.questionTypeDistribution?.map((item: any) => ({
    name: item.typeName,
    Percentage: item.percentage
  })) || [];

  const topicFrequencyData = analysis.frequentlyAskedTopics?.map((item: any) => ({
    name: item.topic,
    Count: item.frequencyCount
  })) || [];

  return (
    <div className="space-y-8 print:space-y-4 print:p-0">
      {/* CSS Print Styles override */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          header, aside, button, .no-print {
            display: none !important;
          }
          .lg\\:pl-72 {
            padding-left: 0 !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            background: white !important;
            box-shadow: none !important;
            color: black !important;
            break-inside: avoid;
          }
          .print-text {
            color: black !important;
          }
        }
      `}</style>

      {/* Header controls */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 no-print">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-500 dark:bg-brand-500/20">
              {analysis.subject}
            </span>
            {analysis.semester && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Semester {analysis.semester}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {analysis.paperName}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onReanalyze}
            disabled={reanalyzing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 h-10 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={reanalyzing ? "animate-spin" : ""} />
            {reanalyzing ? "Reanalyzing..." : "Reanalyze"}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 h-10 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm transition"
          >
            <Share2 size={14} />
            {shared ? "Link Copied!" : "Share Link"}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 h-10 text-sm font-bold text-white shadow-soft hover:shadow-[0_5px_15px_rgba(99,102,241,0.3)] transition"
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Difficulty */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-soft backdrop-blur-md print-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Difficulty</span>
            <AlertCircle size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {analysis.difficulty}
            </span>
            <span className="text-xs text-slate-400">
              ({analysis.difficultyScore}/100)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                analysis.difficulty === "Easy"
                  ? "bg-emerald-500"
                  : analysis.difficulty === "Hard"
                  ? "bg-red-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${analysis.difficultyScore}%` }}
            />
          </div>
        </div>

        {/* Total Marks */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-soft backdrop-blur-md print-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Marks</span>
            <Award size={18} className="text-brand-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {analysis.totalMarks}
            </span>
            <span className="text-xs text-slate-400">marks</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate">Maximum score threshold</p>
        </div>

        {/* Estimated Time */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-soft backdrop-blur-md print-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Duration</span>
            <Clock size={18} className="text-violet-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {analysis.estimatedTime}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate">Recommended allocation</p>
        </div>

        {/* Frequently Asked Topic Count */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-soft backdrop-blur-md print-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Key Topics</span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {analysis.importantTopics?.length || 0}
            </span>
            <span className="text-xs text-slate-400">identified</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate">Crucial focal areas</p>
        </div>
      </div>

      {/* Summary Box */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-6 shadow-soft backdrop-blur-md print-card">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-brand-500" /> Executive Analysis Summary
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed print-text">
          {analysis.summary}
        </p>

        {/* Important Topic Tags */}
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Focus Topics:</span>
          {analysis.importantTopics?.map((topic: any, idx: number) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
                topic.importance === "High"
                  ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  : topic.importance === "Medium"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {topic.name} &bull; {topic.importance}
            </span>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marks Distribution */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-soft backdrop-blur-md print-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Marks Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white"
                  }}
                />
                <Bar dataKey="Marks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chapter Weightage */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-soft backdrop-blur-md print-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Chapter-wise Weightage (%)</h3>
          <div className="h-64 flex flex-col justify-center sm:flex-row items-center">
            <div className="h-48 w-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {weightageData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col space-y-1 text-xs">
              {weightageData.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic Frequency */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-soft backdrop-blur-md print-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Topics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicFrequencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={120} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white"
                  }}
                />
                <Bar dataKey="Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question Type Distribution */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-5 shadow-soft backdrop-blur-md print-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Question Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white"
                  }}
                />
                <Area type="monotone" dataKey="Percentage" stroke="#ec4899" fill="url(#colorType)" strokeWidth={2} />
                <defs>
                  <linearGradient id="colorType" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Repeated vs Predicted Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Repeated Questions */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-6 shadow-soft backdrop-blur-md print-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <RefreshCw size={18} className="text-brand-500" /> Most Repeated Questions
          </h3>
          <div className="space-y-4">
            {analysis.mostRepeatedQuestions?.map((q: any, idx: number) => (
              <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {q.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    Appeared {q.frequency}x
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Weight: {q.marks} marks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predicted Questions */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-6 shadow-soft backdrop-blur-md print-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-brand-500" /> Predicted Questions (Next Exam)
          </h3>
          <div className="space-y-4">
            {analysis.predictedQuestions?.map((q: any, idx: number) => (
              <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {q.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {q.probability}% Probability
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Topic: {q.topic}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Plan and Revision */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 shadow-soft backdrop-blur-md print-card overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 no-print bg-slate-50/50 dark:bg-slate-950/20">
          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 md:flex-initial py-4 px-6 text-sm font-bold border-b-2 transition ${
              activeTab === "plan"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            AI Study Plan
          </button>
          <button
            onClick={() => setActiveTab("tips")}
            className={`flex-1 md:flex-initial py-4 px-6 text-sm font-bold border-b-2 transition ${
              activeTab === "tips"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Revision & Tips
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "plan" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analysis.studyPlan?.map((plan: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-white/30 dark:bg-slate-900/20 print-card">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {plan.phase}
                      </h4>
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {plan.duration}
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      {plan.tasks?.map((task: string, taskIdx: number) => (
                        <li key={taskIdx} className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Revision Tips */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={16} className="text-brand-500" /> Revision Tips
                </h4>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                  {analysis.revisionTips?.map((tip: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="h-5 w-5 rounded bg-brand-50 dark:bg-brand-950/20 text-brand-500 flex items-center justify-center flex-shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Smart Preparation Suggestions */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb size={16} className="text-brand-500" /> Smart Suggestions
                </h4>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                  {analysis.preparationSuggestions?.map((sug: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="h-5 w-5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
