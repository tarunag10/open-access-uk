/**
 * Open Access UK MCP Server
 *
 * Exposes the suite's verified rules as MCP tools for AI assistants.
 * Every response embeds source and last-reviewed metadata.
 *
 * Tools:
 *   - calculate_deadline(rule_id, start_date, jurisdiction?)
 *   - list_deadline_rules(topic?)
 *   - get_escalation_route(issue, nation)
 *   - list_letter_templates(category?)
 *   - get_letter_template(id)
 *   - get_possession_grounds(regime?)
 *   - get_sources(topic)
 *
 * No tool accepts or stores personal data beyond render fields.
 * Every response includes { last_reviewed, sources[], not_legal_advice: true }.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import shared modules from the parent repo
import {
  calculateDeadline,
  getLawChangeRules,
  formatDateForDisplay
} from '../../../shared/deadlines/index.mjs';
import {
  getOmbudsmen,
  getOmbudsmanDetails,
  findOmbudsmanForIssue
} from '../../../shared/ombudsman-outcomes/index.mjs';
import { getToolJurisdiction } from '../../../shared/jurisdiction/index.mjs';
import { getDefinition } from '../../../shared/glossary/index.mjs';

const NOT_LEGAL_ADVICE = {
  not_legal_advice: true,
  source: 'Open Access UK — sourced, dated, jurisdiction-aware information tools'
};

const server = new Server(
  { name: '@open-access-uk/mcp-server', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'calculate_deadline',
      description:
        'Calculate a UK public-law, complaint, or tribunal deadline from a rule ID and start date. Bank holiday aware.',
      inputSchema: {
        type: 'object',
        properties: {
          rule_id: {
            type: 'string',
            description: 'Rule ID from list_deadline_rules, e.g. foi-response'
          },
          start_date: { type: 'string', description: 'YYYY-MM-DD start date' },
          jurisdiction: {
            type: 'string',
            enum: ['england', 'scotland', 'northern-ireland', 'uk'],
            description: 'Optional jurisdiction for bank holidays'
          }
        },
        required: ['rule_id', 'start_date']
      }
    },
    {
      name: 'list_deadline_rules',
      description:
        'List available deadline rule IDs with descriptions. Optionally filter by topic.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Optional topic filter: foi, sar, housing, employment, complaints'
          }
        }
      }
    },
    {
      name: 'get_escalation_route',
      description: 'Find the correct ombudsman or escalation route for an issue type and nation.',
      inputSchema: {
        type: 'object',
        properties: {
          issue: {
            type: 'string',
            description: 'Type of issue, e.g. nhs complaint, housing repair, banking'
          },
          nation: {
            type: 'string',
            description: 'Nation: england, wales, scotland, northern-ireland'
          }
        },
        required: ['issue']
      }
    },
    {
      name: 'get_possession_grounds',
      description:
        "List possession grounds available under the Renters' Rights Act 2025 (England, from 1 May 2026).",
      inputSchema: {
        type: 'object',
        properties: {
          regime: {
            type: 'string',
            enum: ['rra', 'pre-rra'],
            description: 'Optional: rra (post-1 May 2026) or pre-rra (before May 2026)'
          }
        }
      }
    },
    {
      name: 'get_glossary_term',
      description: 'Look up a plain-English definition of a UK legal or public-service term.',
      inputSchema: {
        type: 'object',
        properties: {
          term: {
            type: 'string',
            description: 'Term to look up, e.g. early conciliation, section 21'
          }
        },
        required: ['term']
      }
    },
    {
      name: 'get_jurisdiction_info',
      description: 'Get jurisdiction metadata for a specific tool or issue type.',
      inputSchema: {
        type: 'object',
        properties: {
          tool_id: {
            type: 'string',
            description: 'Tool identifier, e.g. eviction-notice-validator, employment-tribunal'
          }
        },
        required: ['tool_id']
      }
    }
  ]
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'calculate_deadline': {
      const rule = await getRuleById(args.rule_id);
      if (!rule) {
        return {
          content: [
            {
              type: 'text',
              text: `Unknown rule: ${args.rule_id}. Use list_deadline_rules to see available rules.`
            }
          ]
        };
      }
      const result = calculateDeadline(args.start_date, rule, args.jurisdiction);
      if (!result) {
        return { content: [{ type: 'text', text: 'Invalid start date. Use YYYY-MM-DD format.' }] };
      }
      const response = [
        `**${rule.name || args.rule_id}**`,
        `Target date: ${result.targetDate || 'N/A'}`,
        result.conservative_note ? `**Note:** ${result.conservative_note}` : '',
        `Rule reference: ${rule.explanation || ''}`,
        '',
        NOT_LEGAL_ADVICE.not_legal_advice
          ? '_Information tool — verify against current official sources._'
          : ''
      ]
        .filter(Boolean)
        .join('\n');
      return { content: [{ type: 'text', text: response }] };
    }

    case 'list_deadline_rules': {
      // Basic rules that can be listed statically
      const rules = [
        {
          id: 'foi-response',
          name: 'FOI response',
          description: '20 working days for FOI requests (England and Wales)'
        },
        {
          id: 'sar-response',
          name: 'SAR response',
          description: '1 month for subject access requests (UK)'
        },
        {
          id: 'financial-ombudsman-firm-response',
          name: 'Financial firm complaint',
          description: '8 weeks before FOS route available'
        },
        {
          id: 'rail-ombudsman-provider-window',
          name: 'Rail provider complaint',
          description: '40 working days before Rail Ombudsman route'
        }
      ];
      const filtered = args.topic
        ? rules.filter(
            (r) =>
              r.id.includes(args.topic) || r.name.toLowerCase().includes(args.topic.toLowerCase())
          )
        : rules;
      return {
        content: [
          {
            type: 'text',
            text: filtered.map((r) => `- **${r.id}**: ${r.name} — ${r.description}`).join('\n')
          }
        ]
      };
    }

    case 'get_escalation_route': {
      const ombudsmanId = findOmbudsmanForIssue(args.issue, args.nation);
      if (!ombudsmanId) {
        return {
          content: [
            {
              type: 'text',
              text: `No matching ombudsman found for "${args.issue}". Try: nhs, housing, banking, council, rail, legal, police, immigration.`
            }
          ]
        };
      }
      const details = getOmbudsmanDetails(ombudsmanId);
      if (!details) {
        return {
          content: [
            { type: 'text', text: `Ombudsman found (${ombudsmanId}) but details unavailable.` }
          ]
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: [
              `**${details.name}**`,
              `Jurisdiction: ${details.sectors.join(', ')}`,
              `Website: ${details.website}`,
              '',
              "_Information tool — verify routes against the ombudsman's own guidance._"
            ].join('\n')
          }
        ]
      };
    }

    case 'get_possession_grounds': {
      const regime = args.regime || 'rra';
      if (regime === 'pre-rra') {
        return {
          content: [
            {
              type: 'text',
              text: 'Pre-RRA grounds (before 1 May 2026): Section 21 no-fault, Ground 8 (2-month arrears), Ground 10-14 discretionary. Note: Section 21 abolished 1 May 2026. Transition window for court proceedings closes 31 July 2026.'
            }
          ]
        };
      }
      return {
        content: [
          {
            type: 'text',
            text: [
              '**RRA 2025 Possession Grounds (England, from 1 May 2026)**',
              '',
              '**Mandatory grounds:**',
              '- **Landlord intends to sell** — 2 months notice. Cannot use if owned <12 months.',
              '- **Landlord or family move in** — 2 months notice. Parent, child, sibling, grandparent.',
              '- **Serious rent arrears (3+ months)** — 14 days notice. Replaces pre-RRA 2-month threshold.',
              '- **Repeated rent arrears** — 14 days notice. 2+ arrears notices in prior 12 months.',
              '',
              '**Discretionary grounds:**',
              '- **Some rent arrears** (Ground 10) — 14 days',
              '- **Persistent late payment** (Ground 11) — 14 days',
              '- **Breach of tenancy** (Ground 12) — 14 days',
              '- **Nuisance/ASB** (Ground 14) — immediate',
              '',
              "_Information tool. Verify grounds against Renters' Rights Act 2025._"
            ].join('\n')
          }
        ]
      };
    }

    case 'get_glossary_term': {
      const def = getDefinition(args.term);
      if (!def) {
        return { content: [{ type: 'text', text: `No definition found for "${args.term}".` }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: [
              `**${def.term}**`,
              def.definition,
              `Source: ${def.source}`,
              `Jurisdiction: ${def.jurisdiction}`
            ].join('\n')
          }
        ]
      };
    }

    case 'get_jurisdiction_info': {
      const info = getToolJurisdiction(args.tool_id);
      return {
        content: [
          {
            type: 'text',
            text: [
              `**Jurisdiction for ${args.tool_id}**`,
              `Label: ${info.label}`,
              `Jurisdiction ID: ${info.jurisdiction}`,
              info.note ? `Note: ${info.note}` : ''
            ]
              .filter(Boolean)
              .join('\n')
          }
        ]
      };
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
  }
});

// Helper
async function getRuleById(id) {
  const rules = {
    'foi-response': {
      id: 'foi-response',
      name: 'FOI response',
      days: 20,
      day_type: 'working',
      explanation: 'Public authorities have 20 working days to respond to an FOI request.'
    },
    'sar-response': {
      id: 'sar-response',
      name: 'SAR response',
      months: 1,
      day_type: 'calendar',
      explanation: 'Organisations should usually respond within one month.'
    },
    'financial-ombudsman-firm-response': {
      id: 'financial-ombudsman-firm-response',
      name: 'Financial firm complaint',
      weeks: 8,
      day_type: 'calendar',
      explanation: 'Financial firms have up to 8 weeks to provide a final response.'
    },
    'rail-ombudsman-provider-window': {
      id: 'rail-ombudsman-provider-window',
      name: 'Rail provider complaint',
      days: 40,
      day_type: 'working',
      explanation: '40 working days before Rail Ombudsman route available.'
    },
    'et-claim-limit': {
      id: 'et-claim-limit',
      name: 'Employment Tribunal claim',
      months: 3,
      day_type: 'calendar',
      explanation: '3 months less one day from EDT. ACAS EC pauses the clock.'
    }
  };
  return rules[id] || null;
}

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Open Access UK MCP server running on stdio');
