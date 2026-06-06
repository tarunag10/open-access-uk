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
