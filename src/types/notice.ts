/**
 * Notice-to-Action Accessibility Assistant
 * Domain data types and schemas
 */

export type FieldStatus = 'stated' | 'not_stated' | 'uncertain' | 'user_confirmed';

export type ReadingLevel = 'standard' | 'simple' | 'very_simple';

export type LanguageCode = 'en' | 'hi';

export interface ExtractedField<T = string> {
  value: T | null;
  status: FieldStatus;
  sourceExcerpt: string | null;
  confidenceNote?: string;
}

export interface StructuredNotice {
  noticeTitle: ExtractedField<string>;
  issuingOrganization: ExtractedField<string>;
  purpose: ExtractedField<string>;
  eligibility: ExtractedField<string>;
  applicationDeadline: ExtractedField<string>;
  eventDateTime: ExtractedField<string>;
  venueLocation: ExtractedField<string>;
  requiredDocuments: ExtractedField<string[]>;
  applicationSteps: ExtractedField<string[]>;
  fees: ExtractedField<string>;
  contactInfo: ExtractedField<string>;
  officialUrl: ExtractedField<string>;
  requiredAction: ExtractedField<string>;
  otherInstructions: ExtractedField<string[]>;
  missingFields: string[];
}

export interface ChecklistItem {
  id: string;
  order: number;
  action: string;
  requirement: string;
  deadline: string | null;
  isMandatory: boolean;
  sourceExcerpt: string | null;
  completed: boolean;
}

export interface NoticeExplanation {
  language: LanguageCode;
  readingLevel: ReadingLevel;
  summary: string;
  about: string;
  whoItAppliesTo: string;
  whatReaderNeedsToDo: string;
  deadlineSummary: string;
  documentsToPrepare: string[];
  whatRemainsUnclear: string[];
}

export interface ProviderStatus {
  provider: string;
  model: string;
  mode: 'gemma_inference_api' | 'rule_based_grounded';
  isLiveGemma: boolean;
  message: string;
  setupInstructions?: string;
}

export interface NoticeAnalysisResult {
  confirmedSourceText: string;
  structured: StructuredNotice;
  explanation: NoticeExplanation;
  checklist: ChecklistItem[];
  providerStatus: ProviderStatus;
  analyzedAt: string;
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  status: 'stated' | 'not_stated' | 'uncertain';
  sourceExcerpt: string | null;
  timestamp: number;
}
