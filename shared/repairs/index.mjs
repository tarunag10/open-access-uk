import { addWorkingDays } from '../deadlines/index.mjs';

const REPAIR_CATEGORIES = [
  { id: 'emergency', name: 'Emergency Repair', deadlineHours: 24, description: 'Serious risk to health or safety (gas leak, exposed wiring, flooding, insecure property)', source: 'housing-ombudsman-guidance' },
  { id: 'urgent', name: 'Urgent Repair', deadlineWorkingDays: 5, description: 'Significant impact on daily living (broken heating, toilet not working, minor leaks)', source: 'decents-homes-standard' },
  { id: 'routine', name: 'Routine Repair', deadlineCalendarDays: 28, description: 'Planned maintenance and non-urgent fixes', source: 'housing-ombudsman-guidance' }
];

const OMBUDSMAN_STAGES = [
  { id: 'stage-1', name: 'Stage 1: Investigation', deadlineWorkingDays: 56, description: 'Landlord investigates and responds' },
  { id: 'stage-2', name: 'Stage 2: Review', deadlineWorkingDays: 56, description: 'Independent review of Stage 1 response' },
  { id: 'ombudsman', name: 'Housing Ombudsman', description: 'Escalation after completing landlord process' }
];

const EVIDENCE_CHECKLIST = [
  { id: 'photos', name: 'Photographs', description: 'Clear photos of the disrepair issue' },
  { id: 'dates', name: 'Dates of Issues', description: 'When each issue started and occurred' },
  { id: 'correspondence', name: 'Correspondence', description: 'Letters, emails, and records of communication with landlord' },
  { id: 'medical', name: 'Medical Evidence', description: 'GP letters or medical reports linking health issues to disrepair' },
  { id: 'impact', name: 'Impact Statement', description: 'How the disrepair affects daily life and wellbeing' }
];

export function getRepairCategories() {
  return REPAIR_CATEGORIES;
}

export function getRepairDeadlines(category) {
  const cat = REPAIR_CATEGORIES.find(c => c.id === category);
  return cat || null;
}

export function createRepairRecord(data) {
  if (!data.propertyAddress || !data.landlordName || !data.category || !data.description || !data.reportedDate) {
    throw new Error('Missing required fields: propertyAddress, landlordName, category, description, reportedDate');
  }

  const category = REPAIR_CATEGORIES.find(c => c.id === data.category);
  if (!category) {
    throw new Error(`Invalid category: ${data.category}`);
  }

  const referenceNumber = `RPR-${Date.now().toString(36).toUpperCase()}`;

  return {
    referenceNumber,
    propertyAddress: data.propertyAddress,
    landlordName: data.landlordName,
    category: data.category,
    description: data.description,
    reportedDate: data.reportedDate,
    status: 'reported',
    createdAt: new Date().toISOString()
  };
}

export function getDeadlineStatus(repair, currentDate) {
  const category = REPAIR_CATEGORIES.find(c => c.id === repair.category);
  if (!category) return 'unknown';

  const reported = new Date(repair.reportedDate);
  const now = currentDate ? new Date(currentDate) : new Date();
  const diffMs = now.getTime() - reported.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  let deadlineHours;
  if (category.deadlineHours) {
    deadlineHours = category.deadlineHours;
  } else if (category.deadlineWorkingDays) {
    deadlineHours = category.deadlineWorkingDays * 8;
  } else if (category.deadlineCalendarDays) {
    deadlineHours = category.deadlineCalendarDays * 24;
  }

  const remainingHours = deadlineHours - diffHours;
  const threshold = deadlineHours * 0.25;

  if (remainingHours <= 0) return 'overdue';
  if (remainingHours <= threshold) return 'due-soon';
  return 'on-track';
}

export function generateRepairReport(repair) {
  return `Repair Report: ${repair.referenceNumber}
Property: ${repair.propertyAddress}
Landlord: ${repair.landlordName}
Category: ${repair.category}
Description: ${repair.description}
Reported: ${repair.reportedDate}
Status: ${repair.status}`;
}

export function getDisrepairEvidence() {
  return EVIDENCE_CHECKLIST;
}

export function getHousingOmbudsmanRoute() {
  return OMBUDSMAN_STAGES;
}

export function serializeRepairs(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '[]';
  }
}

export function parseRepairs(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
