/**
 * Synthetic Demo Notices for demonstration and evaluation
 * Note: Clearly labeled as synthetic notices, not actual university/government announcements.
 */

export interface DemoNotice {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  rawText: string;
  suggestedQuestions: string[];
}

export const DEMO_NOTICES: DemoNotice[] = [
  {
    id: 'campus-scholarship',
    name: 'Campus Merit Scholarship 2026',
    category: 'University Scholarship',
    badge: 'Official Hackathon Test Notice (Synthetic)',
    description:
      'Synthetic demonstration notice with strict eligibility, stated deadline, required documents, and explicitly unmentioned fee and contact information.',
    suggestedQuestions: [
      'What is the application fee?',
      'What is the last date?',
      'Who is eligible?',
      'Which documents are required?',
      'Where should I submit the form?',
      'What is the contact number?',
    ],
    rawText: `Campus Merit Scholarship - Academic Year 2026-27
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

Note: Late applications will not be entertained under any circumstances.`,
  },
  {
    id: 'municipal-water',
    name: 'Municipal Water Pipeline Maintenance',
    category: 'Public Utility',
    badge: 'Synthetic Public Notice',
    description:
      'Civic notice informing residents about supply disruption, emergency tankers, and conservation guidelines.',
    suggestedQuestions: [
      'When is the water supply interrupted?',
      'Which areas are affected?',
      'Is there an application fee mentioned?',
      'How to request an emergency tanker?',
    ],
    rawText: `METROPOLITAN WATER SUPPLY & SEWERAGE BOARD
PUBLIC ADVISORY NOTICE - REF: MWSSB/MAINT/2026/88
Dated: October 20, 2026

Subject: Scheduled 24-Hour Water Pipeline Maintenance in Sector 4 & 5

This is to inform all residents of Sector 4 and Sector 5 that urgent maintenance work on the main feeder pipeline will be undertaken.

Schedule & Timing:
- Start Time: Saturday, 28 October 2026 at 06:00 AM
- End Time: Sunday, 29 October 2026 at 06:00 AM

Action Required:
Residents are requested to store adequate water for domestic use in advance.
Emergency water tankers may be requested free of charge through the municipal helpline: 1800-425-9988.

Note: Regular supply will resume with normal pressure on Sunday morning after testing.`,
  },
  {
    id: 'research-grant',
    name: 'National Clean Energy Innovation Grant',
    category: 'Research & Funding',
    badge: 'Synthetic Research Grant',
    description:
      'Grant announcement with submission portal, mandatory peer-review proposal, and funding ceiling.',
    suggestedQuestions: [
      'What is the deadline for proposals?',
      'What is the maximum grant amount?',
      'Is there a registration fee?',
      'Where do I upload the proposal?',
    ],
    rawText: `COUNCIL FOR SCIENTIFIC INNOVATION & RESEARCH (CSIR)
CALL FOR PROPOSALS: CLEAN ENERGY ACCELERATION GRANT 2026
Notice No: CSIR/CEAG/2026/09

Purpose: Financial assistance for academic researchers working on scalable solar, hydrogen, and battery storage solutions.

Key Dates:
- Proposal Submission Deadline: 30 November 2026, 11:59 PM IST
- Announcement of Shortlisted Projects: 15 January 2027

Eligibility:
Faculty members and doctoral researchers affiliated with recognized universities or government research laboratories.

Submission Process:
All project proposals, CVs of investigators, and institutional endorsement letters must be uploaded via the official portal: https://portal.cleanenergygrant.gov.in

Application Fee:
There is no application fee for submitting proposals under this scheme.

Helpline: energy-grant@csir.res.in`,
  },
];
