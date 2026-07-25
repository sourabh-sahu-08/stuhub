import React, { useState, useMemo } from "react";
import { ArrowLeft, RefreshCw, ShieldAlert, Network, Sparkles, BookOpen, Brain, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PyqAnalyzerUpload } from "../components/pyq-analyzer/PyqAnalyzerUpload";

// V4 Components
import { OverviewCards } from "../components/pyq-analyzer/v4/OverviewCards";
import { Filters, SortOption, MinRepetitions } from "../components/pyq-analyzer/v4/Filters";
import { UnitAccordion } from "../components/pyq-analyzer/v4/UnitAccordion";
import { HotTopics } from "../components/pyq-analyzer/v4/HotTopics";
import { DeepInsights } from "../components/pyq-analyzer/v4/DeepInsights";
import { PyqAnalyzerLoading } from "../components/pyq-analyzer/v4/PyqAnalyzerLoading";
import { V4DashboardJSON } from "../types/pyq4";

export function PyqAnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<V4DashboardJSON | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState("");

  // V4 States
  const [searchTerm, setSearchTerm] = useState("");
  const [minRepetitions, setMinRepetitions] = useState<MinRepetitions>("all");
  const [sortBy, setSortBy] = useState<SortOption>("highest");
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  const handleAnalyze = async (data: { subject: string; branch: string; semester: number; syllabus: File; pyqs: File[] }) => {
    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("branch", data.branch);
      formData.append("semester", String(data.semester));
      formData.append("syllabus", data.syllabus);
      data.pyqs.forEach((file) => formData.append("pyqs", file));

      const response = await api.post("/pyq-analyzer/validate-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setValidationResult(response.data);
      setCurrentFormData(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || "File validation failed.");
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    if (!currentFormData) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await api.post("/pyq-analyzer/analyze", currentFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(response.data);
      setGeneratedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setAnalysisError(err.response?.data?.message || "AI Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setValidationResult(null);
    setError(null);
    setCurrentFormData(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSearchTerm("");
    setMinRepetitions("all");
    setSortBy("highest");
    setExpandedUnit(null);
  };

  // V4 Filter Logic
  const filteredUnits = useMemo(() => {
    if (!analysisResult) return [];

    let result = JSON.parse(JSON.stringify(analysisResult.units)) as V4DashboardJSON["units"];

    // 1. Min Repetitions
    if (minRepetitions !== "all") {
      const min = parseInt(minRepetitions);
      result.forEach(u => {
        u.topics.forEach(t => {
          t.questions = t.questions.filter(q => q.frequency >= min);
        });
      });
    }

    // 2. Search Term
    if (searchTerm.trim()) {
      const qLower = searchTerm.toLowerCase();
      result.forEach(u => {
        u.topics.forEach(t => {
          t.questions = t.questions.filter(q => 
            t.topic.toLowerCase().includes(qLower) ||
            q.question.toLowerCase().includes(qLower) ||
            q.variants.some(v => v.text.toLowerCase().includes(qLower))
          );
        });
      });
    }

    // 3. Remove empty topics and units
    result.forEach(u => {
      u.topics = u.topics.filter(t => t.questions.length > 0);
    });
    result = result.filter(u => u.topics.length > 0);

    // 4. Sort
    result.forEach(u => {
      u.topics.forEach(t => {
        t.questions.sort((a, b) => {
          if (sortBy === "highest") {
            return b.frequency - a.frequency;
          } else if (sortBy === "alphabetical") {
            return a.question.localeCompare(b.question);
          } else if (sortBy === "recent") {
            const maxYearA = Math.max(...a.papers.map(p => Number(p.year) || 0));
            const maxYearB = Math.max(...b.papers.map(p => Number(p.year) || 0));
            return maxYearB - maxYearA;
          }
          return 0;
        });
      });
    });

    return result;
  }, [analysisResult, searchTerm, minRepetitions, sortBy]);


  // Loading screen during AI analysis
  if (analyzing) {
    return <PyqAnalyzerLoading />;
  }

  // Dashboard Results
  if (analysisResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link to="/tools" className="p-2 hover:bg-[#292929] rounded-lg transition-colors text-gray-400">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#F5A524]" />
                PYQ Analysis Dashboard
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-2 ml-12">
              Generated at {generatedAt} • Deterministic Semantic Pipeline
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors font-medium border border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Analyze Another Set
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-8">
          <OverviewCards data={analysisResult.overview} />
          
          {analysisResult.hotTopics && analysisResult.hotTopics.length > 0 && (
            <>
              {/* Deep Insights & Strategy */}
              <DeepInsights data={analysisResult} />

              {/* Global Hot Topics */}
              <HotTopics hotTopics={analysisResult.hotTopics} />
            </>
          )}

          <div className="pt-4">
            <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#F5A524]" />
              Unit Wise Analysis
            </h2>
            
            <Filters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              minRepetitions={minRepetitions}
              setMinRepetitions={setMinRepetitions}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            <UnitAccordion
              units={filteredUnits}
              expandedUnit={expandedUnit}
              setExpandedUnit={setExpandedUnit}
            />
          </div>
        </div>
      </div>
    );
  }

  // Validation Preview
  if (validationResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#1C1C1C] border border-[#F5A524]/30 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A524]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-100">Files Validated Successfully</h2>
              <p className="text-gray-400 mt-1">Ready for AI processing</p>
            </div>
          </div>

          <div className="space-y-6 bg-[#141414] rounded-xl p-6 border border-gray-800">
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-800">
              <div>
                <p className="text-sm text-gray-500 mb-1">Subject</p>
                <p className="font-medium text-gray-200">{validationResult.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Branch / Sem</p>
                <p className="font-medium text-gray-200">{validationResult.branch} - Sem {validationResult.semester}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Syllabus PDF
              </p>
              <div className="bg-[#1C1C1C] p-3 rounded border border-gray-800 flex justify-between items-center text-sm">
                <span className="text-gray-300 font-medium">{validationResult.syllabus.fileName}</span>
                <span className="text-gray-500">{(validationResult.syllabus.fileSize / 1024).toFixed(0)} KB</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" /> PYQ PDFs ({validationResult.pyqs.length})
              </p>
              <div className="space-y-2">
                {validationResult.pyqs.map((f: any, i: number) => (
                  <div key={i} className="bg-[#1C1C1C] p-3 rounded border border-gray-800 flex justify-between items-center text-sm">
                    <span className="text-gray-300 truncate pr-4">{f.fileName}</span>
                    <span className="text-gray-500 shrink-0">{(f.fileSize / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {analysisError && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 font-medium text-sm flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                {analysisError}
              </p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={startAnalysis}
              className="flex-[2] py-3 px-4 bg-[#F5A524] hover:bg-[#d98f1d] text-[#141414] rounded-lg transition-colors font-bold flex items-center justify-center gap-2"
            >
              <Brain className="w-5 h-5" />
              Begin AI Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Upload Screen
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/tools" className="p-2 hover:bg-[#292929] rounded-lg transition-colors text-gray-400">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-[#F5A524]" />
            PYQ Analyzer
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Upload your syllabus and 3-10 previous year papers. Our AI will group semantically identical questions and present them in a clean unit-wise accordion.
          </p>
        </div>
      </div>

      <div className="bg-[#1C1C1C] border border-gray-800 rounded-xl p-6 sm:p-8 shadow-xl">
        <PyqAnalyzerUpload 
          onAnalyze={handleAnalyze}
          loading={loading}
        />
      </div>
    </div>
  );
}
