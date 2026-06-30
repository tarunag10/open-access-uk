const OPERATORS = [
  { id: 'council', name: 'Local Council', type: 'council', appealDays: 28, tribunalEligible: true, source: 'govuk-parking-penalty-notice' },
  { id: 'traffic-penalty-tribunal', name: 'Traffic Penalty Tribunal', type: 'tribunal', source: 'traffic-penalty-tribunal' },
  { id: 'parking-ey', name: 'ParkingEye', type: 'private', appealDays: 28, tribunalEligible: false, source: 'citizens-advice-parking' },
  { id: 'apcoa', name: 'APCOA', type: 'private', appealDays: 28, tribunalEligible: false, source: 'citizens-advice-parking' },
  { id: 'ncp', name: 'National Car Parks', type: 'private', appealDays: 28, tribunalEligible: false, source: 'citizens-advice-parking' },
  { id: 'q-park', name: 'Q-Park', type: 'private', appealDays: 28, tribunalEligible: false, source: 'citizens-advice-parking' },
];

const GROUNDS = [
  'No signage',
  'Incorrect signage',
  'Extenuating circumstances',
  'Procedural errors',
  'Permit valid',
];

export function getParkingOperators() {
  return OPERATORS;
}

export function getAppealDeadlines(operatorId) {
  const operator = OPERATORS.find((o) => o.id === operatorId);
  if (!operator) {
    throw new Error(`Unknown operator: ${operatorId}`);
  }

  if (operator.type === 'tribunal') {
    return { formalAppealDays: null, tribunalDays: 28 };
  }

  return {
    formalAppealDays: operator.appealDays,
    tribunalDays: operator.tribunalEligible ? 28 : null,
  };
}

export function generateAppealText(data) {
  const { operatorType, penaltyNoticeNumber, dateOfViolation, grounds, evidence } = data;
  return `Appeal for ${operatorType} penalty notice\nPCN: ${penaltyNoticeNumber}\nDate of violation: ${dateOfViolation}\nGrounds: ${grounds}\nEvidence: ${evidence}`;
}

export function getGroundsOfAppeal() {
  return GROUNDS;
}

export function getTribunalRoute(operatorId) {
  const operator = OPERATORS.find((o) => o.id === operatorId);
  if (!operator) {
    throw new Error(`Unknown operator: ${operatorId}`);
  }
  return operator.tribunalEligible === true;
}

export function checkNoticeValidity(data) {
  const { noticeDate, pcnNumber } = data;

  const pcnPattern = /^PCN\d{6}$/;
  if (!pcnPattern.test(pcnNumber)) {
    return { valid: false, reason: 'Invalid PCN format' };
  }

  const notice = new Date(noticeDate);
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  if (notice < sixMonthsAgo) {
    return { valid: false, reason: 'Notice date is older than 6 months' };
  }

  return { valid: true };
}

export function serializeParking(value) {
  return JSON.stringify(value);
}

export function parseParking(value) {
  return JSON.parse(value);
}
