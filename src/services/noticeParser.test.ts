import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractStructuredNotice,
  generateChecklist,
  generateExplanation,
  answerQuestionGrounded,
  analyzeNoticeLocally,
} from './noticeParser';

const SAMPLE_SCHOLARSHIP_NOTICE = `
Campus Merit Scholarship - Academic Year 2026-27
Apex Institute of Higher Education
Notice Ref: AIHE/SCH/2026/042
Date: October 24, 2026

Applications are invited for the Campus Merit Scholarship 2026.
Eligibility: All undergraduate students enrolled in full-time degree programs who have secured at least 75% marks in their previous semester examination are eligible to apply.

Important Dates:
- Last date to submit applications: 15 November 2026

Required Documents:
1. Valid Student ID card copy
2. Previous semester official marksheet

Application Method:
Eligible students must fill the prescribed application form and submit it in person to the college scholarship office (Room 104, Admin Block).

Note: Late applications will not be entertained under any circumstances.
`.trim();

test('correctly extracts structured fields from sample scholarship notice', () => {
  const structured = extractStructuredNotice(SAMPLE_SCHOLARSHIP_NOTICE);

  // Title
  assert.equal(structured.noticeTitle.status, 'stated');
  assert.match(structured.noticeTitle.value || '', /Campus Merit Scholarship/i);

  // Issuing Organization
  assert.equal(structured.issuingOrganization.status, 'stated');
  assert.match(structured.issuingOrganization.value || '', /Apex Institute of Higher Education/i);

  // Eligibility
  assert.equal(structured.eligibility.status, 'stated');
  assert.match(structured.eligibility.value || '', /75% marks/i);

  // Deadline
  assert.equal(structured.applicationDeadline.status, 'stated');
  assert.match(structured.applicationDeadline.value || '', /15 November 2026/i);

  // Venue
  assert.equal(structured.venueLocation.status, 'stated');
  assert.match(structured.venueLocation.value || '', /college scholarship office/i);

  // Required Documents
  assert.equal(structured.requiredDocuments.status, 'stated');
  assert.ok(structured.requiredDocuments.value && structured.requiredDocuments.value.length >= 2);

  // Fees - MUST BE NOT STATED
  assert.equal(structured.fees.status, 'not_stated');
  assert.equal(structured.fees.value, null);

  // Contact Info - MUST BE NOT STATED
  assert.equal(structured.contactInfo.status, 'not_stated');
  assert.equal(structured.contactInfo.value, null);

  // Missing fields list contains fee and contact
  assert.ok(structured.missingFields.some((f) => f.toLowerCase().includes('fee')));
  assert.ok(structured.missingFields.some((f) => f.toLowerCase().includes('contact')));
});

test('critical demonstration question: What is the application fee? returns required text', () => {
  const structured = extractStructuredNotice(SAMPLE_SCHOLARSHIP_NOTICE);
  const result = answerQuestionGrounded('What is the application fee?', SAMPLE_SCHOLARSHIP_NOTICE, structured, 'en');

  assert.equal(result.status, 'not_stated');
  assert.equal(
    result.answer,
    'The notice does not state an application fee. Please contact the issuing organization if you need confirmation.'
  );
});

test('deadline question returns stated deadline with source excerpt', () => {
  const structured = extractStructuredNotice(SAMPLE_SCHOLARSHIP_NOTICE);
  const result = answerQuestionGrounded('What is the last date?', SAMPLE_SCHOLARSHIP_NOTICE, structured, 'en');

  assert.equal(result.status, 'stated');
  assert.match(result.answer, /15 November 2026/);
  assert.ok(result.sourceExcerpt !== null);
});

test('checklist separates mandatory from optional suggestion', () => {
  const structured = extractStructuredNotice(SAMPLE_SCHOLARSHIP_NOTICE);
  const checklist = generateChecklist(structured, SAMPLE_SCHOLARSHIP_NOTICE);

  assert.ok(checklist.length >= 3);
  const mandatoryItems = checklist.filter((c) => c.isMandatory);
  const optionalItems = checklist.filter((c) => !c.isMandatory);

  assert.ok(mandatoryItems.length >= 2);
  assert.ok(optionalItems.length >= 1); // fee check suggestion
});

test('multilingual explanation produces Hindi text with correct reading level', () => {
  const structured = extractStructuredNotice(SAMPLE_SCHOLARSHIP_NOTICE);
  const hindiExplanation = generateExplanation(structured, 'hi', 'simple');

  assert.equal(hindiExplanation.language, 'hi');
  assert.ok(hindiExplanation.summary.length > 10);
  assert.match(hindiExplanation.deadlineSummary, /15 November 2026/);
});

test('end-to-end analyzeNoticeLocally returns complete analysis result', () => {
  const analysis = analyzeNoticeLocally(SAMPLE_SCHOLARSHIP_NOTICE, 'en', 'standard');

  assert.equal(analysis.structured.noticeTitle.status, 'stated');
  assert.ok(analysis.checklist.length > 0);
  assert.ok(analysis.explanation.summary.length > 0);
  assert.equal(analysis.providerStatus.isLiveGemma, false);
});
