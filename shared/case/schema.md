# Open Access UK Case Schema — v1

A **Case** is a local-first, client-side representation of a user's public-service problem across the entire toolkit.

## Shape

```typescript
interface CaseV1 {
  schemaVersion: '1';
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  title: string;
  jurisdiction: string; // 'england' | 'wales' | 'scotland' | 'northern-ireland' | 'uk'
  parties: Party[];
  events: TimelineEvent[];
  deadlines: Deadline[];
  documents: Document[];
  letters: Letter[];
  route: Route;
}

interface Party {
  role: string; // 'claimant', 'tenant', 'landlord', 'authority', 'adviser', 'solicitor'
  name?: string;
  org?: string;
  contact?: string;
}

interface TimelineEvent {
  date: string; // YYYY-MM-DD
  type: string; // 'notice-served', 'request-sent', 'response-received', 'hearing', 'deadline'
  summary: string;
  toolId?: string;
  refs?: string[]; // IDs linking to other entities
}

interface Deadline {
  ruleId: string;
  startDate: string;
  targetDate: string;
  status: 'pending' | 'met' | 'missed' | 'upcoming';
  note?: string;
}

interface Document {
  name: string;
  kind: string; // 'letter', 'evidence', 'form', 'checklist'
  addedAt: string;
  note?: string;
}

interface Letter {
  toolId: string;
  templateId: string;
  renderedAt: string;
  fields: Record<string, string>;
}

interface Route {
  pathwayId?: string;
  stage?: string;
}
```

## Storage

- Key: `open-access-uk:cases` (array of CaseV1)
- Privacy registry entry: present
- Per-tool delete affordance: yes

## Merge strategy (v1)

Two tools writing concurrently: last-write-wins per field group. A merge function `mergeCases(existing, incoming)` handles:

- `events`: concatenate, deduplicate by date + type + summary
- `deadlines`: latest status wins per ruleId
- `documents`: deduplicate by name + addedAt
- `letters`: latest renderedAt wins per templateId
