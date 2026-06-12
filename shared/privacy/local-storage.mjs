export const storageRegistry = [
  {
    key: 'open-access-uk:letter-generator:draft',
    tool: 'letter-generator',
    label: 'Letter draft',
    storage: 'localStorage',
    contains: 'Draft letter fields entered by the user'
  },
  {
    key: 'open-access-uk:accessible-forms:review-notes',
    tool: 'accessible-forms',
    label: 'Form review notes',
    storage: 'localStorage',
    contains: 'Local reviewer notes for form examples'
  },
  {
    key: 'open-access-uk:saved-action-plans',
    tool: 'public-service-directory',
    label: 'Saved escalation plans',
    storage: 'localStorage',
    contains: 'Saved route names, evidence checklists, and escalation notes'
  },
  {
    key: 'open-access-uk:legal-templates:favourites',
    tool: 'legal-templates',
    label: 'Favourite templates',
    storage: 'localStorage',
    contains: 'Template ids marked as favourites'
  },
  {
    key: 'open-access-uk:design-system:shortlist',
    tool: 'design-system',
    label: 'Component shortlist',
    storage: 'localStorage',
    contains: 'Design-system component names saved locally'
  },
  {
    key: 'open-access-uk:saved-file-list-examples',
    tool: 'maintainer-helper',
    label: 'Saved maintainer examples',
    storage: 'localStorage',
    contains: 'Repository file-list examples saved by maintainers'
  },
  {
    key: 'open-access-uk:theme',
    tool: 'suite',
    label: 'Theme preference',
    storage: 'localStorage',
    contains: 'Chosen light or dark theme for the suite'
  },
  {
    key: 'open-access-uk:evidence-handoff',
    tool: 'suite',
    label: 'Evidence handoff',
    storage: 'localStorage',
    contains: 'Evidence checklist passed between the letter generator and directory'
  },
  {
    key: 'open-access-uk:legal-templates:collections',
    tool: 'legal-templates',
    label: 'Template collections',
    storage: 'localStorage',
    contains: 'Named local groupings of favourite templates'
  },
  {
    key: 'open-access-uk:foi-tracker:requests',
    tool: 'foi-tracker',
    label: 'FOI request tracker',
    storage: 'localStorage',
    contains: 'Tracked FOI requests, deadlines, response notes, and escalation notes'
  },
  {
    key: 'open-access-uk:foi-tracker:form-draft',
    tool: 'foi-tracker',
    label: 'FOI tracker form draft',
    storage: 'localStorage',
    contains: 'In-progress FOI tracker form fields'
  },
  {
    key: 'open-access-uk:case-builder:cases',
    tool: 'case-builder',
    label: 'Case builder',
    storage: 'localStorage',
    contains: 'Saved cases with evidence, letters, and journey steps'
  },
  {
    key: 'open-access-uk:case-builder:form-draft',
    tool: 'case-builder',
    label: 'Case builder form draft',
    storage: 'localStorage',
    contains: 'In-progress case builder form fields'
  },
  {
    key: 'open-access-uk:case-builder:active',
    tool: 'case-builder',
    label: 'Active case id',
    storage: 'localStorage',
    contains: 'Identifier of the most recently selected case'
  }
];

export function clearKnownStorage(storage, registry = storageRegistry) {
  if (!storage) return { cleared: [], failed: registry.map((item) => item.key) };

  const cleared = [];
  const failed = [];
  for (const item of registry) {
    try {
      storage.removeItem(item.key);
      cleared.push(item.key);
    } catch {
      failed.push(item.key);
    }
  }
  return { cleared, failed };
}

export function describeStorageRegistry(registry = storageRegistry) {
  return registry.map((item) => `${item.label} (${item.tool}): ${item.contains}`);
}
