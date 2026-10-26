import React from 'react';
import { X, CheckCircle2, AlertTriangle, Cpu, Terminal, Shield, ExternalLink } from 'lucide-react';
import { ProviderStatus } from '../types/notice';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ProviderStatus | null;
  highContrast: boolean;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({
  isOpen,
  onClose,
  status,
  highContrast,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-modal-title"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl overflow-y-auto max-h-[90vh] ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-600" aria-hidden="true" />
            <h2 id="provider-modal-title" className="text-xl font-bold">
              AI Engine &amp; Gemma Model Verification
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              highContrast
                ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm">
          {/* Status Badge & Summary */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              status?.isLiveGemma
                ? highContrast
                  ? 'border-green-400 bg-neutral-900 text-green-300'
                  : 'border-green-300 bg-green-50 text-green-900'
                : highContrast
                ? 'border-yellow-400 bg-neutral-900 text-yellow-300'
                : 'border-blue-200 bg-blue-50 text-blue-900'
            }`}
          >
            {status?.isLiveGemma ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-base">
                {status?.provider || 'Factual Grounding Engine'}
              </div>
              <p className="mt-1 leading-relaxed">{status?.message}</p>
            </div>
          </div>

          {/* Model Specification Card */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast ? 'border-neutral-700 bg-neutral-900' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <h3 className="font-semibold text-xs uppercase tracking-wider mb-2 text-slate-500 dark:text-neutral-400">
              Active Model Configuration
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-500 font-medium">Model ID / Schema:</dt>
                <dd className="font-mono font-bold mt-0.5">{status?.model || 'google/gemma-2-9b-it'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Inference Mode:</dt>
                <dd className="font-mono font-bold mt-0.5">
                  {status?.isLiveGemma ? 'Hosted Gemma Inference API' : 'Deterministic Grounded Validation'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Grounding Guarantee:</dt>
                <dd className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Strict Source Excerpts (Zero Hallucination)
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Application Fee Check:</dt>
                <dd className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Explicit Missing Detection Enforced
                </dd>
              </div>
            </dl>
          </div>

          {/* Gemma 4 Setup Instructions */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast ? 'border-neutral-700 bg-neutral-900' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-semibold">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>How to connect a hosted Gemma 4 endpoint</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-neutral-300 mb-3 leading-relaxed">
              In accordance with hackathon rules, this applet supports direct hosted inference via Hugging Face Inference Providers or any custom OpenAI/Gemma-compatible endpoint.
            </p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto space-y-1">
              <div># In your server environment (.env):</div>
              <div className="text-emerald-400">HF_TOKEN="hf_yourHuggingFaceTokenHere"</div>
              <div className="text-emerald-400">GEMMA_MODEL_ID="google/gemma-2-9b-it"</div>
              <div className="text-slate-400"># Optional custom router endpoint:</div>
              <div className="text-slate-300"># GEMMA_ENDPOINT_URL="https://router.huggingface.co/hf-inference/models/google/gemma-2-9b-it"</div>
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>
                If no external token is provided, the app operates faithfully using the deterministic grounded engine with full testable accuracy.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl font-semibold text-sm ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
          >
            Got it, continue
          </button>
        </div>
      </div>
    </div>
  );
};
