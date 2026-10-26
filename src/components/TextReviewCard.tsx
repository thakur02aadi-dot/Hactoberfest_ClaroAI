import React, { useState } from 'react';
import { Check, Edit3, AlertTriangle, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { ExtractedNoticeDocument } from '../services/ocrService';

interface TextReviewCardProps {
  document: ExtractedNoticeDocument;
  onConfirm: (confirmedText: string) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
  highContrast: boolean;
}

export const TextReviewCard: React.FC<TextReviewCardProps> = ({
  document,
  onConfirm,
  onCancel,
  isAnalyzing,
  highContrast,
}) => {
  const [editedText, setEditedText] = useState(document.text);
  const [isEditing, setIsEditing] = useState(false);

  // Scan text for potential ambiguous items (like dates, numbers, currency) to bring to user's attention
  const numbersAndDates = Array.from(
    new Set(
      (document.text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d+%\s*|\$\d+|₹\d+|[A-Z]{3,}\/\w+\/\d+)\b/g) || [])
    )
  ).slice(0, 8);

  const handleConfirm = () => {
    onConfirm(editedText.trim());
  };

  return (
    <div
      role="region"
      aria-label="Extracted Notice Review and Confirmation"
      className={`rounded-2xl border p-5 sm:p-7 shadow-sm transition-colors ${
        highContrast
          ? 'bg-black text-white border-yellow-400'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              Step 2 of 3: Verification
            </span>
            <span className="text-xs font-medium text-slate-500">
              Source: {document.sourceType.toUpperCase()} {document.fileName ? `(${document.fileName})` : ''}
            </span>
          </div>
          <h2 className="text-lg font-bold mt-1">Review &amp; Confirm Source Text</h2>
          <p
            className={`text-xs mt-0.5 ${
              highContrast ? 'text-yellow-200' : 'text-slate-600'
            }`}
          >
            Please review the extracted text before AI interpretation. Correct any OCR typos or missing numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isEditing
                ? highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : highContrast
                ? 'border-yellow-400 text-yellow-300'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing Mode Active' : 'Edit Text'}</span>
          </button>
        </div>
      </div>

      {/* Warnings & Notice Quality alerts */}
      {document.warnings.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>OCR Confidence Attention Items:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1 text-amber-800">
            {document.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Numbers / Dates Verification Chips */}
      {numbersAndDates.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Detected Critical Tokens (Verify against original document):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {numbersAndDates.map((item, idx) => (
              <span
                key={idx}
                className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Editable or Scrollable Source Text Area */}
      <div className="mt-4">
        <label htmlFor="confirmed-source-text" className="sr-only">
          Confirmed source notice text
        </label>
        <textarea
          id="confirmed-source-text"
          rows={10}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className={`w-full rounded-xl border p-4 text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
            isEditing ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-300'
          } ${
            highContrast
              ? 'bg-neutral-900 text-white'
              : 'bg-slate-50 text-slate-900 focus:bg-white'
          }`}
        />
        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <span>{editedText.length} characters</span>
          <span>Tip: You can edit or paste extra details before confirmation.</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isAnalyzing}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            highContrast
              ? 'border-yellow-400 text-yellow-300 hover:bg-neutral-900'
              : 'border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Upload Another Notice</span>
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isAnalyzing || editedText.trim().length === 0}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            isAnalyzing || editedText.trim().length === 0
              ? 'opacity-50 cursor-not-allowed bg-slate-400 text-white'
              : highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
          }`}
        >
          {isAnalyzing ? (
            <span>Extracting Facts &amp; Generating Checklist...</span>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Confirm &amp; Interpret Notice</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
