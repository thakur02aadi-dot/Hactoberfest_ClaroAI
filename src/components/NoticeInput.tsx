import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  File,
  RotateCcw,
  Sparkles,
  Languages,
  BookOpenCheck,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { DEMO_NOTICES, DemoNotice } from '../data/demoNotices';
import { LanguageCode, ReadingLevel } from '../types/notice';
import { OcrProgress } from '../services/ocrService';

interface NoticeInputProps {
  onExtractFromText: (text: string, title?: string) => void;
  onFileUpload: (file: File) => void;
  onClear: () => void;
  isLoading: boolean;
  ocrProgress: OcrProgress | null;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  readingLevel: ReadingLevel;
  onChangeReadingLevel: (level: ReadingLevel) => void;
  highContrast: boolean;
}

export const NoticeInput: React.FC<NoticeInputProps> = ({
  onExtractFromText,
  onFileUpload,
  onClear,
  isLoading,
  ocrProgress,
  language,
  onChangeLanguage,
  readingLevel,
  onChangeReadingLevel,
  highContrast,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('File size exceeds 10MB limit. Please upload a smaller image or PDF.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      setValidationError('Unsupported file format. Please upload a JPG, PNG, or PDF notice.');
      return;
    }

    setValidationError(null);
    onFileUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setValidationError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadDemo = (demo: DemoNotice) => {
    setValidationError(null);
    setPastedText(demo.rawText);
    onExtractFromText(demo.rawText, demo.name);
  };

  const handleAnalyzePasted = () => {
    if (!pastedText.trim()) {
      setValidationError('Please paste or type notice text before analyzing.');
      return;
    }
    if (pastedText.trim().length < 20) {
      setValidationError('Notice text appears too short. Please provide the full notice text.');
      return;
    }
    setValidationError(null);
    onExtractFromText(pastedText.trim());
  };

  return (
    <section
      aria-label="Notice Input and Configuration"
      className={`rounded-2xl border p-5 sm:p-7 shadow-xs transition-colors ${
        highContrast
          ? 'bg-black text-white border-yellow-400'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
    >
      {/* Configuration Header: Language & Reading Level */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>1. Choose Notice &amp; Preferences</span>
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              highContrast ? 'text-yellow-200' : 'text-slate-500'
            }`}
          >
            Select language and reading level. All facts remain strictly grounded.
          </p>
        </div>

        {/* Language & Reading level selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="language-select"
              className="text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-neutral-200"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>Language:</span>
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
              className={`text-xs font-semibold rounded-lg border px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 ${
                highContrast
                  ? 'bg-neutral-900 text-yellow-300 border-yellow-400'
                  : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Reading Level Selector */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="reading-level-select"
              className="text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-neutral-200"
            >
              <BookOpenCheck className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>Reading Level:</span>
            </label>
            <select
              id="reading-level-select"
              value={readingLevel}
              onChange={(e) => onChangeReadingLevel(e.target.value as ReadingLevel)}
              className={`text-xs font-semibold rounded-lg border px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 ${
                highContrast
                  ? 'bg-neutral-900 text-yellow-300 border-yellow-400'
                  : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              <option value="standard">Standard (Full Details)</option>
              <option value="simple">Simple (Plain Language)</option>
              <option value="very_simple">Very Simple (Core Actions Only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Input Mode Tabs: Upload vs Paste */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            inputMode === 'upload'
              ? highContrast
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'bg-indigo-600 text-white shadow-xs'
              : highContrast
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          aria-pressed={inputMode === 'upload'}
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          <span>Upload Image / PDF</span>
        </button>

        <button
          type="button"
          onClick={() => setInputMode('paste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            inputMode === 'paste'
              ? highContrast
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'bg-indigo-600 text-white shadow-xs'
              : highContrast
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          aria-pressed={inputMode === 'paste'}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>Paste Notice Text</span>
        </button>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div
          role="alert"
          className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Input Body */}
      <div className="mt-5">
        {inputMode === 'upload' ? (
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : highContrast
                  ? 'border-yellow-400 hover:bg-neutral-900'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload file area. Drag and drop a notice or press Enter to browse files."
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div
                  className={`p-3.5 rounded-2xl ${
                    highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <UploadCloud className="w-8 h-8" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-bold">
                    Drop your notice here, or <span className="text-indigo-600 underline">browse files</span>
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      highContrast ? 'text-yellow-200' : 'text-slate-500'
                    }`}
                  >
                    Supports JPG, PNG, WebP images and PDF documents (Max 10MB, up to 5 pages)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-neutral-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tesseract.js OCR
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Scanned PDF rendering
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 100% Client-side privacy
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="paste-textarea" className="sr-only">
              Paste notice text here
            </label>
            <textarea
              id="paste-textarea"
              rows={7}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the raw text of the notice, circular, scholarship announcement, or public advisory here..."
              className={`w-full rounded-xl border p-4 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${
                highContrast
                  ? 'bg-neutral-900 text-white border-yellow-400 placeholder-neutral-500'
                  : 'bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400 focus:bg-white'
              }`}
            />
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-500">
                {pastedText.length} characters ({pastedText.split(/\s+/).filter(Boolean).length} words)
              </span>
              <button
                type="button"
                onClick={handleAnalyzePasted}
                disabled={isLoading || pastedText.trim().length === 0}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                  isLoading || pastedText.trim().length === 0
                    ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-600'
                    : highContrast
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Review &amp; Analyze Notice</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OCR / Processing Progress Bar */}
      {isLoading && (
        <div className="mt-5 p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-950">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{ocrProgress?.status || 'Analyzing notice content...'}</span>
            </span>
            {ocrProgress?.progress !== undefined && <span>{ocrProgress.progress}%</span>}
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${ocrProgress?.progress || 45}%` }}
            />
          </div>
        </div>
      )}

      {/* Demo Notices Section (Prompt requirement: Section 11 Hackathon Demo Mode) */}
      <div className="mt-7 pt-5 border-t border-slate-200 dark:border-neutral-800">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300">
              Preloaded Synthetic Demo Notices (Hackathon Showcase)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 italic">
            *Synthetic sample data for testing grounding and missing fee verification
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEMO_NOTICES.map((demo) => {
            const isScholarship = demo.id === 'campus-scholarship';
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleLoadDemo(demo)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isScholarship
                    ? highContrast
                      ? 'border-yellow-400 bg-neutral-900 hover:bg-neutral-800 ring-2 ring-yellow-400'
                      : 'border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-600 ring-1 ring-indigo-200 shadow-xs'
                    : highContrast
                    ? 'border-neutral-700 bg-neutral-900 hover:border-yellow-400'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isScholarship
                          ? highContrast
                            ? 'bg-yellow-400 text-black'
                            : 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-800 dark:bg-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {demo.category}
                    </span>
                    {isScholarship && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        ⭐ Official Test
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm leading-snug">{demo.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {demo.description}
                  </p>
                </div>
                <div className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span>Load Demo Notice &rarr;</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
