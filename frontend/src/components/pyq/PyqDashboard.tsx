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

const COLORS = ["#F5A524", "#FFA31A", "#FFC107", "#D68A00", "#FFFFFF", "#A1A1AA"];

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
            border: 1px solid #27272D !important;
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
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 no-print pb-6 border-b border-[#27272D]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary font-mono uppercase">
              {analysis.subject}
            </span>
            {analysis.semester && (
              <span className="inline-flex items-center rounded bg-[#16161A] border border-[#27272D] px-2 py-0.5 text-[10px] font-bold text-on-surface-variant font-mono uppercase">
                Sem {analysis.semester}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-2">
            {analysis.paperName}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onReanalyze}
            disabled={reanalyzing}
            className="inline-flex items-center gap-1.5 rounded border border-outline bg-[#16161A] px-4 h-10 text-xs font-semibold text-[#e2e2e2] hover:bg-[#1C1C21] transition disabled:opacity-50 font-mono cursor-pointer"
          >
            <RefreshCw size={13} className={reanalyzing ? "animate-spin" : ""} />
            {reanalyzing ? "Reanalyzing..." : "REANALYZE"}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded border border-outline bg-[#16161A] px-4 h-10 text-xs font-semibold text-[#e2e2e2] hover:bg-[#1C1C21] transition font-mono cursor-pointer"
          >
            <Share2 size={13} />
            {shared ? "COPIED!" : "SHARE LINK"}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded bg-primary hover:opacity-90 px-4 h-10 text-xs font-bold text-black font-mono cursor-pointer"
          >
            <Download size={13} />
            DOWNLOAD PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Difficulty */}
        <div className="panel p-5 print-card">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Difficulty</span>
            <AlertCircle size={16} className="text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {analysis.difficulty}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              ({analysis.difficultyScore}/100)
            </span>
          </div>
          <div className="mt-3 w-full bg-[#09090B] border border-outline rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${
                analysis.difficulty === "Easy"
                  ? "bg-emerald-500"
                  : analysis.difficulty === "Hard"
                  ? "bg-red-500"
                  : "bg-primary"
              }`}
              style={{ width: `${analysis.difficultyScore}%` }}
            />
          </div>
        </div>

        {/* Total Marks */}
        <div className="panel p-5 print-card">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Total Marks</span>
            <Award size={16} className="text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {analysis.totalMarks}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">marks</span>
          </div>
          <p className="text-[9px] text-on-surface-variant mt-2 font-mono uppercase">Max Threshold</p>
        </div>

        {/* Estimated Time */}
        <div className="panel p-5 print-card">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Est. Duration</span>
            <Clock size={16} className="text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {analysis.estimatedTime}
            </span>
          </div>
          <p className="text-[9px] text-on-surface-variant mt-2 font-mono uppercase">Recommended time</p>
        </div>

        {/* Frequently Asked Topic Count */}
        <div className="panel p-5 print-card">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Key Topics</span>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {analysis.importantTopics?.length || 0}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">identified</span>
          </div>
          <p className="text-[9px] text-on-surface-variant mt-2 font-mono uppercase">Focal Areas</p>
        </div>
      </div>

      {/* Summary Box */}
      <div className="panel p-6 print-card">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3 font-mono uppercase tracking-wider">
          <BookOpen size={16} className="text-primary" /> Executive Analysis Summary
        </h2>
        <p className="text-sm text-[#e2e2e2] leading-relaxed print-text">
          {analysis.summary}
        </p>

        {/* Important Topic Tags */}
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mr-2 font-mono">Focus Topics:</span>
          {analysis.importantTopics?.map((topic: any, idx: number) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                topic.importance === "High"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : topic.importance === "Medium"
                  ? "bg-amber-500/10 border-amber-500/20 text-primary"
                  : "bg-[#16161A] border-outline text-[#A1A1AA]"
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
        <div className="panel p-5 print-card">
          <h3 className="text-xs font-bold text-[#A3A3A3] mb-4 uppercase tracking-wider font-mono">Marks Distribution</h3>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272D" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16161A",
                    border: "1px solid #27272D",
                    color: "white"
                  }}
                />
                <Bar dataKey="Marks" fill="#F5A524" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chapter Weightage */}
        <div className="panel p-5 print-card">
          <h3 className="text-xs font-bold text-[#A3A3A3] mb-4 uppercase tracking-wider font-mono">Chapter-wise Weightage (%)</h3>
          <div className="h-64 flex flex-col justify-center sm:flex-row items-center">
            <div className="h-44 w-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
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
            <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col space-y-1.5 text-[10px]">
              {weightageData.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[#e2e2e2] font-semibold">
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic Frequency */}
        <div className="panel p-5 print-card">
          <h3 className="text-xs font-bold text-[#A3A3A3] mb-4 uppercase tracking-wider font-mono">Frequently Asked Topics</h3>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicFrequencyData} layout="vertical" margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272D" />
                <XAxis type="number" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={90} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16161A",
                    border: "1px solid #27272D",
                    color: "white"
                  }}
                />
                <Bar dataKey="Count" fill="#FFA31A" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question Type Distribution */}
        <div className="panel p-5 print-card">
          <h3 className="text-xs font-bold text-[#A3A3A3] mb-4 uppercase tracking-wider font-mono">Question Type Distribution</h3>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={typeData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272D" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16161A",
                    border: "1px solid #27272D",
                    color: "white"
                  }}
                />
                <Area type="monotone" dataKey="Percentage" stroke="#F5A524" fill="url(#colorType)" strokeWidth={2} />
                <defs>
                  <linearGradient id="colorType" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A524" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F5A524" stopOpacity={0}/>
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
        <div className="panel p-6 print-card">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 font-mono uppercase tracking-wider">
            <RefreshCw size={16} className="text-primary" /> Most Repeated Questions
          </h3>
          <div className="space-y-4">
            {analysis.mostRepeatedQuestions?.map((q: any, idx: number) => (
              <div key={idx} className="border-b border-[#27272D] pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-[#e2e2e2]">
                  {q.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-primary font-mono uppercase">
                    Appeared {q.frequency}x
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    Weight: {q.marks} marks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predicted Questions */}
        <div className="panel p-6 print-card">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 font-mono uppercase tracking-wider">
            <Lightbulb size={16} className="text-primary" /> Predicted Questions (Next Exam)
          </h3>
          <div className="space-y-4">
            {analysis.predictedQuestions?.map((q: any, idx: number) => (
              <div key={idx} className="border-b border-[#27272D] pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-[#e2e2e2]">
                  {q.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 font-mono uppercase">
                    {q.probability}% Probability
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    Topic: {q.topic}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Plan and Revision */}
      <div className="panel print-card overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-[#27272D] no-print bg-[#16161A]/40">
          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 md:flex-initial py-4 px-6 text-xs font-bold border-b-2 transition font-mono uppercase cursor-pointer ${
              activeTab === "plan"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-white"
            }`}
          >
            AI Study Plan
          </button>
          <button
            onClick={() => setActiveTab("tips")}
            className={`flex-1 md:flex-initial py-4 px-6 text-xs font-bold border-b-2 transition font-mono uppercase cursor-pointer ${
              activeTab === "tips"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-white"
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
                  <div key={idx} className="rounded border border-outline p-4 space-y-3 bg-[#16161A]/20 print-card">
                    <div className="flex items-center justify-between border-b border-[#27272D] pb-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        {plan.phase}
                      </h4>
                      <span className="inline-flex items-center rounded bg-[#16161A] border border-[#27272D] px-2 py-0.5 text-[9px] font-bold text-on-surface-variant font-mono uppercase">
                        {plan.duration}
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-[#e2e2e2]">
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
                <h4 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Layers size={16} className="text-primary" /> Revision Tips
                </h4>
                <ul className="space-y-3 text-xs text-[#e2e2e2]">
                  {analysis.revisionTips?.map((tip: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold font-mono">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Smart Preparation Suggestions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Lightbulb size={16} className="text-primary" /> Smart Suggestions
                </h4>
                <ul className="space-y-3 text-xs text-[#e2e2e2]">
                  {analysis.preparationSuggestions?.map((sug: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold font-mono">
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
