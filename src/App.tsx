import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NoticeInput } from './components/NoticeInput';
import { TextReviewCard } from './components/TextReviewCard';
import { AnalysisView } from './components/AnalysisView';
import { ProviderModal } from './components/ProviderModal';
import {
  ExtractedNoticeDocument,
  extractTextFromImage,
  extractTextFromPdf,
  OcrProgress,
} from './services/ocrService';
import {
  LanguageCode,
  NoticeAnalysisResult,
  ProviderStatus,
  QAItem,
  ReadingLevel,
} from './types/notice';
import { DEMO_NOTICES } from './data/demoNotices';
import { analyzeNoticeLocally, generateExplanation } from './services/noticeParser';

export default function App() {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('standard');
  const [step, setStep] = useState<'input' | 'review' | 'analyzed'>('input');

  const [extractedDoc, setExtractedDoc] = useState<ExtractedNoticeDocument | null>(null);
  const [analysisResult, setAnalysisResult] = useState<NoticeAnalysisResult | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Fetch server-side model provider status on mount
  useEffect(() => {
    fetch('/api/model-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status) {
          setProviderStatus(data.status);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch model status, using local fallback:', err);
      });
  }, []);

  // Check URL query parameters for ?autostart=1 or ?demo=campus-scholarship
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('demo')) {
      const demoNotice = DEMO_NOTICES[0];
      handleExtractFromText(demoNotice.rawText, demoNotice.name);
    }
  }, []);

  // Handle direct text paste or demo notice selection
  const handleExtractFromText = (text: string, title?: string) => {
    setExtractedDoc({
      text,
      sourceType: 'demo',
      fileName: title || 'Notice Document',
      confidenceScore: 100,
      warnings: [],
    });
    setStep('review');
  };

  // Handle file upload (Image / PDF)
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setOcrProgress({ status: 'Initiating file processing...', progress: 10 });

    try {
      let doc: ExtractedNoticeDocument;
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        doc = await extractTextFromPdf(file, (p) => setOcrProgress(p));
      } else {
        doc = await extractTextFromImage(file, (p) => setOcrProgress(p));
      }

      setExtractedDoc(doc);
      setStep('review');
    } catch (error: any) {
      alert(`Error extracting document: ${error.message || error}`);
    } finally {
      setIsLoading(false);
      setOcrProgress(null);
    }
  };

  // Confirm extracted text and trigger analysis
  const handleConfirmText = async (
    confirmedText: string,
    targetLanguage: LanguageCode = language,
    targetReadingLevel: ReadingLevel = readingLevel
  ) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: confirmedText,
          language: targetLanguage,
          readingLevel: targetReadingLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
        setStep('analyzed');
      } else {
        throw new Error(data.error || 'Failed to interpret notice');
      }
    } catch (err: any) {
      console.warn('API error, falling back to local factual grounding engine:', err.message);
      // Fallback guarantees high-precision response even if backend is temporarily disconnected
      const fallbackResult = analyzeNoticeLocally(confirmedText, targetLanguage, targetReadingLevel, providerStatus || undefined);
      setAnalysisResult(fallbackResult);
      setStep('analyzed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle changing language or reading level dynamically when on analysis view
  const handleChangeLanguage = (newLang: LanguageCode) => {
    setLanguage(newLang);
    if (analysisResult) {
      const updatedExplanation = generateExplanation(analysisResult.structured, newLang, readingLevel);
      setAnalysisResult({
        ...analysisResult,
        explanation: updatedExplanation,
      });
    }
  };

  const handleChangeReadingLevel = (newLevel: ReadingLevel) => {
    setReadingLevel(newLevel);
    if (analysisResult) {
      const updatedExplanation = generateExplanation(analysisResult.structured, language, newLevel);
      setAnalysisResult({
        ...analysisResult,
        explanation: updatedExplanation,
      });
    }
  };

  // Grounded question answering
  const handleAskQuestion = async (question: string): Promise<QAItem | void> => {
    if (!analysisResult) return;

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          confirmedSourceText: analysisResult.confirmedSourceText,
          structured: analysisResult.structured,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.qa) {
        return data.qa as QAItem;
      }
    } catch (err) {
      console.warn('Backend ask error, using local grounding:', err);
      // Local fallback guarantees answering strictly without hallucinating
      const { answerQuestionGrounded } = await import('./services/noticeParser');
      return answerQuestionGrounded(
        question,
        analysisResult.confirmedSourceText,
        analysisResult.structured,
        language
      );
    }
  };

  const handleClear = () => {
    setStep('input');
    setExtractedDoc(null);
    setAnalysisResult(null);
    setOcrProgress(null);
  };

  // Determine font size CSS class
  const fontSizeClass =
    fontSize === 'large'
      ? 'text-lg [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_p]:text-base [&_.text-xs]:text-sm'
      : fontSize === 'xlarge'
      ? 'text-xl [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_p]:text-lg [&_.text-xs]:text-base'
      : '';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${
        highContrast
          ? 'bg-black text-white selection:bg-yellow-400 selection:text-black'
          : 'bg-slate-100 text-slate-900 selection:bg-indigo-600 selection:text-white'
      } ${fontSizeClass}`}
    >
      {/* Header */}
      <Header
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        providerStatus={providerStatus}
        onOpenProviderModal={() => setIsProviderModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {step === 'input' && (
          <NoticeInput
            onExtractFromText={handleExtractFromText}
            onFileUpload={handleFileUpload}
            onClear={handleClear}
            isLoading={isLoading}
            ocrProgress={ocrProgress}
            language={language}
            onChangeLanguage={setLanguage}
            readingLevel={readingLevel}
            onChangeReadingLevel={setReadingLevel}
            highContrast={highContrast}
          />
        )}

        {step === 'review' && extractedDoc && (
          <TextReviewCard
            document={extractedDoc}
            onConfirm={handleConfirmText}
            onCancel={handleClear}
            isAnalyzing={isAnalyzing}
            highContrast={highContrast}
          />
        )}

        {step === 'analyzed' && analysisResult && (
          <AnalysisView
            result={analysisResult}
            language={language}
            onChangeLanguage={handleChangeLanguage}
            readingLevel={readingLevel}
            onChangeReadingLevel={handleChangeReadingLevel}
            onReset={handleClear}
            highContrast={highContrast}
            onAskQuestion={handleAskQuestion}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-xs text-center transition-colors ${
          highContrast
            ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>Notice-to-Action Accessibility Assistant</strong> &bull; Grounded Fact Verification &bull; Gemma 4 Architecture
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsProviderModalOpen(true)}
              className="text-indigo-600 dark:text-yellow-300 underline font-medium hover:opacity-80"
            >
              Model Config &amp; Schema
            </button>
            <span>WCAG 2.1 AAA Contrast Ready</span>
          </div>
        </div>
      </footer>

      {/* Provider Details Modal */}
      <ProviderModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        status={providerStatus}
        highContrast={highContrast}
      />
    </div>
  );
}
