import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Calendar,
  Building,
  UserCheck,
  FileCheck2,
  MapPin,
  DollarSign,
  Phone,
  Link as LinkIcon,
  Sparkles,
  Send,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ChecklistItem,
  LanguageCode,
  NoticeAnalysisResult,
  QAItem,
  ReadingLevel,
  StructuredNotice,
} from '../types/notice';
import { speechService, SpeechStatus } from '../services/speechService';

interface AnalysisViewProps {
  result: NoticeAnalysisResult;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  readingLevel: ReadingLevel;
  onChangeReadingLevel: (level: ReadingLevel) => void;
  onReset: () => void;
  highContrast: boolean;
  onAskQuestion: (question: string) => Promise<QAItem | void>;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  result,
  language,
  onChangeLanguage,
  readingLevel,
  onChangeReadingLevel,
  onReset,
  highContrast,
  onAskQuestion,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(result.checklist);
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedChecklist, setCopiedChecklist] = useState(false);
  const [expandedExcerpts, setExpandedExcerpts] = useState<Record<string, boolean>>({});
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>(speechService.getStatus());

  // Listen to speech synthesis status
  React.useEffect(() => {
    return speechService.subscribe((status) => {
      setSpeechStatus(status);
    });
  }, []);

  // Update checklist if result changes
  React.useEffect(() => {
    setChecklist(result.checklist);
  }, [result.checklist]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleResetChecklist = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, completed: false })));
  };

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredChecklist = checklist.filter((item) => {
    if (checklistFilter === 'pending') return !item.completed;
    if (checklistFilter === 'completed') return item.completed;
    return true;
  });

  const toggleExcerpt = (key: string) => {
    setExpandedExcerpts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReadSummary = () => {
    const textToRead = `${result.explanation.summary}. ${result.explanation.about}. ${result.explanation.whatReaderNeedsToDo}. ${result.explanation.deadlineSummary}`;
    if (speechStatus.isSpeaking && !speechStatus.isPaused) {
      speechService.pause();
    } else if (speechStatus.isPaused) {
      speechService.resume();
    } else {
      speechService.speak(textToRead, language);
    }
  };

  const handleAsk = async (questionToAsk?: string) => {
    const q = (questionToAsk || questionInput).trim();
    if (!q || isAsking) return;

    setIsAsking(true);
    try {
      const response = await onAskQuestion(q);
      if (response) {
        setQaList((prev) => [response, ...prev]);
        setQuestionInput('');
      }
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyChecklist = () => {
    const text = checklist
      .map(
        (item) =>
          `[${item.completed ? 'X' : ' '}] ${item.action} (${item.isMandatory ? 'Mandatory' : 'Optional'})${
            item.deadline ? ` - Due: ${item.deadline}` : ''
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2000);
  };

  const s = result.structured;
  const isHindi = language === 'hi';

  const defaultQuestions = [
    'What is the application fee?',
    'What is the last date?',
    'Who is eligible?',
    'Which documents are required?',
    'Where should I submit the form?',
  ];

  return (
    <div className="space-y-8" id="main-content">
      {/* Top Banner: Verification Status & Language / Reading Level Quick Switch */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-white text-slate-900 border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            <Check className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Verified Analysis Complete
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-mono">
                {result.providerStatus.mode === 'gemma_inference_api' ? 'Live Gemma 4' : 'Gemma Grounded Rules'}
              </span>
            </div>
            <h2 className="text-lg font-bold mt-0.5">
              {s.noticeTitle.value || 'Analyzed Public Notice'}
            </h2>
          </div>
        </div>

        {/* Quick Language & Reading Level Bar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500">Language:</span>
            <button
              type="button"
              onClick={() => onChangeLanguage('en')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                language === 'en'
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-yellow-500'
                    : 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                language === 'hi'
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-yellow-500'
                    : 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Hindi (हिन्दी)
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-neutral-700 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500">Level:</span>
            {(['standard', 'simple', 'very_simple'] as ReadingLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChangeReadingLevel(level)}
                className={`px-2.5 py-1 rounded-lg border capitalize transition-colors ${
                  readingLevel === level
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-500'
                      : 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {level === 'very_simple' ? 'Very Simple' : level}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1 ml-auto"
            title="Start again with new notice"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Notice</span>
          </button>
        </div>
      </div>

      {/* Floating or Docked Audio Read-Aloud Controller */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
          highContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
        }`}
        role="region"
        aria-label="Speech Synthesis Audio Controller"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReadSummary}
            className={`p-2.5 rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors ${
              speechStatus.isSpeaking && !speechStatus.isPaused
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            aria-label={speechStatus.isSpeaking ? 'Pause reading aloud' : 'Read notice summary aloud'}
          >
            {speechStatus.isSpeaking && !speechStatus.isPaused ? (
              <>
                <Pause className="w-5 h-5" />
                <span className="text-xs">Pause Audio</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span className="text-xs">
                  {speechStatus.isPaused ? 'Resume Reading' : 'Listen / Read Aloud'}
                </span>
              </>
            )}
          </button>

          {speechStatus.isSpeaking && (
            <button
              type="button"
              onClick={() => speechService.stop()}
              className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold flex items-center gap-1"
            >
              <VolumeX className="w-4 h-4 text-red-600" />
              <span>Stop</span>
            </button>
          )}

          <div className="text-xs">
            <span className="font-bold">Audio Accessibility: </span>
            <span>
              {speechStatus.isSpeaking
                ? speechStatus.isPaused
                  ? 'Audio paused'
                  : 'Reading notice summary aloud...'
                : 'Browser Speech Synthesis ready (English & Hindi support)'}
            </span>
          </div>
        </div>

        {/* Speed / Rate control */}
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span className="text-slate-500 mr-1">Speed:</span>
          {[0.8, 1.0, 1.2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => speechService.setRate(r)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                speechStatus.rate === r
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-300 text-slate-700 hover:bg-white'
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Plain-Language Explanation */}
      <section
        aria-labelledby="summary-heading"
        className={`rounded-2xl border p-6 sm:p-7 shadow-xs ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  highContrast ? 'bg-yellow-400 text-black' : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                Reading Level: {readingLevel.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">
                {language === 'hi' ? 'हिन्दी में सरलीकृत' : 'Simplified in English'}
              </span>
            </div>
            <h3 id="summary-heading" className="text-xl font-bold mt-1">
              Plain-Language Notice Summary
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div
            className={`p-4 rounded-xl border leading-relaxed text-base font-medium ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-yellow-100'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            {result.explanation.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                What this notice is about
              </h4>
              <p className="leading-relaxed">{result.explanation.about}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                Who it applies to (Eligibility)
              </h4>
              <p className="leading-relaxed font-semibold text-indigo-700 dark:text-indigo-400">
                {result.explanation.whoItAppliesTo}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                What you need to do
              </h4>
              <p className="leading-relaxed">{result.explanation.whatReaderNeedsToDo}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                Deadline &amp; Timeline
              </h4>
              <p className="leading-relaxed font-bold text-red-700 dark:text-red-400">
                {result.explanation.deadlineSummary}
              </p>
            </div>
          </div>

          {/* Documents to prepare list */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
              Documents to prepare
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-neutral-200 font-medium">
              {result.explanation.documentsToPrepare.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 2: Action Checklist with completion tracking */}
      <section
        aria-labelledby="checklist-heading"
        className={`rounded-2xl border p-6 sm:p-7 shadow-xs ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  progressPercent === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {completedCount} of {totalCount} completed ({progressPercent}%)
              </span>
            </div>
            <h3 id="checklist-heading" className="text-xl font-bold mt-1">
              Ordered Action Checklist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear sequence of required actions. Mandatory steps are separated from optional recommendations.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center rounded-lg border border-slate-300 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChecklistFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  checklistFilter === 'all'
                    ? highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter('pending')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  checklistFilter === 'pending'
                    ? highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({totalCount - completedCount})
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter('completed')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  checklistFilter === 'completed'
                    ? highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Done ({completedCount})
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyChecklist}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              title="Copy checklist to clipboard"
            >
              {copiedChecklist ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedChecklist ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetChecklist}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
              title="Reset all checkboxes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              progressPercent === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="mt-6 space-y-3" role="list">
          {filteredChecklist.map((item) => (
            <div
              key={item.id}
              role="listitem"
              className={`p-4 rounded-xl border transition-all ${
                item.completed
                  ? highContrast
                    ? 'border-neutral-700 bg-neutral-900/60 opacity-70'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                  : highContrast
                  ? 'border-yellow-400 bg-neutral-900'
                  : 'border-slate-300 bg-white hover:border-indigo-400 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className="mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                  aria-label={`Mark "${item.action}" as ${item.completed ? 'incomplete' : 'complete'}`}
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #{item.order}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isMandatory
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {item.isMandatory ? 'MANDATORY REQUIREMENT' : 'OPTIONAL SUGGESTION'}
                    </span>

                    {item.deadline && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-700" />
                        <span>Deadline: {item.deadline}</span>
                      </span>
                    )}
                  </div>

                  <h4
                    className={`text-sm sm:text-base font-bold ${
                      item.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {item.action}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 mt-0.5">
                    {item.requirement}
                  </p>

                  {/* Source Evidence Excerpt Accordion */}
                  {item.sourceExcerpt && (
                    <div className="mt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleExcerpt(item.id)}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                      >
                        {expandedExcerpts[item.id] ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Hide Source Evidence</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>View Source Evidence</span>
                          </>
                        )}
                      </button>

                      {expandedExcerpts[item.id] && (
                        <blockquote className="mt-1.5 p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-l-3 border-indigo-600 font-mono text-xs">
                          &ldquo;{item.sourceExcerpt}&rdquo;
                        </blockquote>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Structured Facts Grid with status badges */}
      <section
        aria-labelledby="facts-heading"
        className={`rounded-2xl border p-6 sm:p-7 shadow-xs ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <div className="pb-4 border-b border-slate-200 dark:border-neutral-800">
          <h3 id="facts-heading" className="text-xl font-bold">
            Extracted Structured Facts &amp; Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Every factual field is classified as STATED (with quote) or NOT STATED. Missing requirements are never fabricated.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Title */}
          <FactCard
            icon={<FileCheck2 className="w-4 h-4 text-indigo-600" />}
            label="Notice Title"
            field={s.noticeTitle}
            highContrast={highContrast}
          />

          {/* 2. Organization */}
          <FactCard
            icon={<Building className="w-4 h-4 text-indigo-600" />}
            label="Issuing Organization"
            field={s.issuingOrganization}
            highContrast={highContrast}
          />

          {/* 3. Purpose */}
          <FactCard
            icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
            label="Notice Purpose"
            field={s.purpose}
            highContrast={highContrast}
          />

          {/* 4. Eligibility */}
          <FactCard
            icon={<UserCheck className="w-4 h-4 text-indigo-600" />}
            label="Eligibility Criteria"
            field={s.eligibility}
            highContrast={highContrast}
          />

          {/* 5. Deadline */}
          <FactCard
            icon={<Calendar className="w-4 h-4 text-red-600" />}
            label="Application Deadline"
            field={s.applicationDeadline}
            highContrast={highContrast}
          />

          {/* 6. Venue */}
          <FactCard
            icon={<MapPin className="w-4 h-4 text-indigo-600" />}
            label="Venue / Submission Office"
            field={s.venueLocation}
            highContrast={highContrast}
          />

          {/* 7. Fees (CRITICAL FACT CHECK) */}
          <FactCard
            icon={<DollarSign className="w-4 h-4 text-amber-600" />}
            label="Application Fee"
            field={s.fees}
            highContrast={highContrast}
            highlightCheck
          />

          {/* 8. Contact Info */}
          <FactCard
            icon={<Phone className="w-4 h-4 text-indigo-600" />}
            label="Contact Information"
            field={s.contactInfo}
            highContrast={highContrast}
          />

          {/* 9. Official URL */}
          <FactCard
            icon={<LinkIcon className="w-4 h-4 text-indigo-600" />}
            label="Official URL / Portal"
            field={s.officialUrl}
            highContrast={highContrast}
          />
        </div>
      </section>

      {/* SECTION 4: Explicit Missing Fields Warning Box */}
      {s.missingFields.length > 0 && (
        <section
          aria-labelledby="missing-heading"
          className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-5 sm:p-6 text-amber-950 dark:text-amber-200"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 id="missing-heading" className="text-base font-bold text-amber-900 dark:text-amber-100">
                Notice Transparency: Missing Information
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                The following key details were <strong>not stated</strong> in the notice. The assistant will never invent or assume them:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.missingFields.map((field, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700"
                  >
                    ✕ {field}: Not Mentioned
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: Follow-up Grounded Q&A Assistant */}
      <section
        aria-labelledby="qa-heading"
        className={`rounded-2xl border p-6 sm:p-7 shadow-xs ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <div className="pb-4 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h3 id="qa-heading" className="text-xl font-bold">
              Follow-up Question Assistant (Strictly Grounded)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Answers are computed exclusively from the confirmed notice text. If information is absent, the assistant states so explicitly.
          </p>
        </div>

        {/* Quick Question Chips (including critical absent fee test) */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2">
            Suggested Verification Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {defaultQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(q)}
                disabled={isAsking}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                  q.includes('fee')
                    ? highContrast
                      ? 'border-yellow-400 bg-neutral-900 text-yellow-300 font-bold'
                      : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold shadow-xs'
                    : highContrast
                    ? 'border-neutral-700 bg-neutral-900 text-white hover:border-yellow-400'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-300'
                }`}
              >
                <span>{q}</span>
                {q.includes('fee') && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    Test Case
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Question Input Form */}
        <div className="mt-5 flex gap-2">
          <label htmlFor="qa-input" className="sr-only">
            Ask a question about the notice
          </label>
          <input
            id="qa-input"
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask anything about the notice (e.g. 'What is the application fee?')..."
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${
              highContrast
                ? 'bg-neutral-900 text-white border-yellow-400 placeholder-neutral-500'
                : 'bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400 focus:bg-white'
            }`}
          />
          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={isAsking || !questionInput.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              isAsking || !questionInput.trim()
                ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-600'
                : highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>

        {/* Q&A Thread */}
        <div className="mt-6 space-y-4" role="region" aria-label="Question and Answer History">
          {qaList.map((qa) => (
            <div
              key={qa.id}
              className={`p-4 rounded-xl border ${
                qa.status === 'not_stated'
                  ? highContrast
                    ? 'border-yellow-400 bg-neutral-900'
                    : 'border-amber-300 bg-amber-50/70 text-amber-950'
                  : highContrast
                  ? 'border-neutral-700 bg-neutral-900'
                  : 'border-slate-200 bg-slate-50/70 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-neutral-400">
                  Question: &ldquo;{qa.question}&rdquo;
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    qa.status === 'stated'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {qa.status === 'stated' ? 'GROUNDED FACT' : 'NOT STATED IN NOTICE'}
                </span>
              </div>

              <p className="text-sm font-semibold leading-relaxed">{qa.answer}</p>

              {qa.sourceExcerpt && (
                <div className="mt-2 text-xs text-slate-600 dark:text-neutral-400">
                  <span className="font-semibold">Source excerpt: </span>
                  <span className="font-mono italic">&ldquo;{qa.sourceExcerpt}&rdquo;</span>
                </div>
              )}
            </div>
          ))}

          {qaList.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500 italic">
              No questions asked yet. Click one of the suggested verification questions above or type your own question.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Fact Card Subcomponent
interface FactCardProps {
  icon: React.ReactNode;
  label: string;
  field: { value: string | string[] | null; status: string; sourceExcerpt: string | null };
  highContrast: boolean;
  highlightCheck?: boolean;
}

const FactCard: React.FC<FactCardProps> = ({ icon, label, field, highContrast, highlightCheck }) => {
  const isStated = field.status === 'stated' && field.value !== null;
  const valueDisplay = Array.isArray(field.value) ? field.value.join(', ') : field.value;

  return (
    <div
      className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
        highlightCheck && !isStated
          ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/20'
          : highContrast
          ? 'border-neutral-700 bg-neutral-900'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-neutral-300">
            {icon}
            <span>{label}</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isStated
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {isStated ? 'STATED' : 'NOT STATED'}
          </span>
        </div>

        <p className={`text-xs sm:text-sm font-semibold leading-snug ${isStated ? '' : 'text-slate-400 italic'}`}>
          {isStated ? valueDisplay : 'Not mentioned in notice'}
        </p>
      </div>

      {isStated && field.sourceExcerpt && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800 text-[11px] text-slate-500 font-mono line-clamp-2">
          &ldquo;{field.sourceExcerpt}&rdquo;
        </div>
      )}
    </div>
  );
};
