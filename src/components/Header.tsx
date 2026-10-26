import React from 'react';
import { Volume2, ShieldCheck, Sun, Moon, Sparkles, BookOpen, Settings } from 'lucide-react';
import { ProviderStatus } from '../types/notice';

interface HeaderProps {
  highContrast: boolean;
  onToggleHighContrast: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  providerStatus: ProviderStatus | null;
  onOpenProviderModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  highContrast,
  onToggleHighContrast,
  fontSize,
  onChangeFontSize,
  providerStatus,
  onOpenProviderModal,
}) => {
  return (
    <header
      className={`border-b transition-colors ${
        highContrast
          ? 'bg-black text-white border-yellow-400'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
      role="banner"
    >
      {/* Accessibility skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-indigo-700 focus:text-white focus:rounded focus:outline-none focus:ring-4 focus:ring-yellow-300"
      >
        Skip to main content
      </a>

      {/* Public Service Banner */}
      <div
        className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b ${
          highContrast
            ? 'bg-yellow-400 text-black border-yellow-500'
            : 'bg-blue-50 text-blue-900 border-blue-100'
        }`}
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
          <span>
            <strong>Official Accessibility Tool:</strong> Grounded notice comprehension. Facts verified strictly against source text. Zero hallucination.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Title & Tagline */}
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-indigo-600 text-white shadow-sm'
              }`}
            >
              <BookOpen className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Notice-to-Action Accessibility Assistant
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    highContrast
                      ? 'bg-white text-black'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  Hackathon Ready
                </span>
              </div>
              <p
                className={`text-sm mt-0.5 font-medium ${
                  highContrast ? 'text-yellow-300' : 'text-slate-600'
                }`}
              >
                &ldquo;Understand the notice. Know what to do next.&rdquo;
              </p>
            </div>
          </div>

          {/* Accessibility & Settings Controls */}
          <div className="flex items-center flex-wrap gap-2.5 sm:self-center">
            {/* Font Size Selector */}
            <div
              className={`flex items-center rounded-lg border p-0.5 text-xs font-semibold ${
                highContrast ? 'border-yellow-400 bg-neutral-900' : 'border-slate-300 bg-slate-50'
              }`}
              role="group"
              aria-label="Text Size Adjuster"
            >
              <button
                type="button"
                onClick={() => onChangeFontSize('normal')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  fontSize === 'normal'
                    ? highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-indigo-700 shadow-xs'
                    : highContrast
                    ? 'text-white hover:text-yellow-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={fontSize === 'normal'}
                title="Normal text size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize('large')}
                className={`px-2.5 py-1 rounded text-sm transition-colors ${
                  fontSize === 'large'
                    ? highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-indigo-700 shadow-xs'
                    : highContrast
                    ? 'text-white hover:text-yellow-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={fontSize === 'large'}
                title="Large text size"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize('xlarge')}
                className={`px-2.5 py-1 rounded text-base transition-colors ${
                  fontSize === 'xlarge'
                    ? highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-indigo-700 shadow-xs'
                    : highContrast
                    ? 'text-white hover:text-yellow-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={fontSize === 'xlarge'}
                title="Extra large text size"
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={onToggleHighContrast}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              aria-pressed={highContrast}
            >
              {highContrast ? (
                <>
                  <Sun className="w-4 h-4 text-black" aria-hidden="true" />
                  <span>Standard Contrast</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
                  <span>High Contrast</span>
                </>
              )}
            </button>

            {/* Model Provider Info Button */}
            <button
              type="button"
              onClick={onOpenProviderModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                providerStatus?.isLiveGemma
                  ? highContrast
                    ? 'bg-green-400 text-black border-green-500'
                    : 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'
                  : highContrast
                  ? 'bg-neutral-800 text-yellow-300 border-yellow-400'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
              title="View Model & Inference Engine Status"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>{providerStatus?.isLiveGemma ? 'Live Gemma 4' : 'Gemma Grounded'}</span>
              <Settings className="w-3.5 h-3.5 opacity-60 ml-0.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
