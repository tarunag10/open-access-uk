export const checks = [
  {
    id: 'readme',
    category: 'Documentation',
    label: 'README',
    matches: ['README.md', 'README'],
    why: 'Explains what the project does, how to run it, and who it helps.',
    policyTodo: 'Add a README with setup, demo, support, and contribution entry points.'
  },
  {
    id: 'contributing',
    category: 'Community',
    label: 'CONTRIBUTING',
    matches: ['CONTRIBUTING.md', 'docs/CONTRIBUTING.md'],
    why: 'Gives new contributors a safe path from issue to pull request.',
    policyTodo:
      'Create CONTRIBUTING.md with local setup, branch naming, tests, and review expectations.'
  },
  {
    id: 'license',
    category: 'Community',
    label: 'LICENSE',
    matches: ['LICENSE', 'LICENSE.md', 'COPYING'],
    why: 'Clarifies whether people can reuse, fork, and contribute.',
    policyTodo: 'Add an OSI-compatible license and note any separate content license.'
  },
  {
    id: 'security',
    category: 'Security',
    label: 'SECURITY',
    matches: ['SECURITY.md', '.github/SECURITY.md'],
    why: 'Shows how to report vulnerabilities privately.',
    policyTodo: 'Add SECURITY.md with supported versions and a private reporting contact.'
  },
  {
    id: 'code-of-conduct',
    category: 'Community',
    label: 'CODE_OF_CONDUCT',
    matches: ['CODE_OF_CONDUCT.md', '.github/CODE_OF_CONDUCT.md'],
    why: 'Sets conduct expectations before community problems appear.',
    policyTodo: 'Add a code of conduct and explain enforcement contact points.'
  },
  {
    id: 'accessibility',
    category: 'Accessibility',
    label: 'Accessibility statement',
    matches: ['ACCESSIBILITY.md', 'accessibility.md', 'docs/accessibility.md'],
    why: 'Makes inclusive contribution and product commitments visible.',
    policyTodo:
      'Add accessibility statement, known limitations, keyboard checks, and reporting route.'
  },
  {
    id: 'issue-templates',
    category: 'Community',
    label: 'Issue templates',
    matches: [
      '.github/ISSUE_TEMPLATE/bug_report.md',
      '.github/ISSUE_TEMPLATE/feature_request.md',
      '.github/ISSUE_TEMPLATE/config.yml'
    ],
    why: 'Collects consistent information without maintainer back-and-forth.',
    policyTodo: 'Add bug, feature, documentation, and good-first-issue templates.'
  },
  {
    id: 'good-first-label',
    category: 'Community',
    label: 'Good-first-issue labels',
    matches: ['labels.yml', '.github/labels.yml', 'good first issue', 'good-first-issue'],
    why: 'Lets beginners find scoped, low-risk work.',
    policyTodo:
      'Create labels for good first issue, documentation, accessibility, tests, and help wanted.'
  },
  {
    id: 'roadmap',
    category: 'Documentation',
    label: 'Roadmap',
    matches: ['ROADMAP.md', 'docs/roadmap.md', 'roadmap'],
    why: 'Shows contributors what direction the project is taking.',
    policyTodo: 'Publish a short roadmap with now, next, later, and non-goals.'
  },
  {
    id: 'screenshots-demo',
    category: 'Demo quality',
    label: 'Screenshots or demo link',
    matches: ['demo', 'screenshot', 'screenshots/', 'public/demo', 'index.html'],
    why: 'Helps contributors understand the product before installing anything.',
    policyTodo: 'Add screenshots, a hosted demo link, or a static local demo path to the README.'
  },
  {
    id: 'beginner-docs',
    category: 'Documentation',
    label: 'Beginner-friendly docs',
    matches: ['docs/getting-started.md', 'GETTING_STARTED.md', 'quickstart', 'first contribution'],
    why: 'Reduces the hidden knowledge needed for a first pull request.',
    policyTodo:
      'Add a getting-started guide with prerequisites, test command, and first task walkthrough.'
  }
];

export const currentGuidance = [
  {
    title: 'Use labels that GitHub can surface',
    detail:
      'GitHub Docs says applying the good first issue label helps public repository issues become easier to find and may increase surfacing to contributors.',
    source: 'GitHub Docs labels guidance',
    url: 'https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/encouraging-helpful-contributions-to-your-project-with-labels'
  },
  {
    title: 'Put contribution guidance where GitHub can show it',
    detail:
      'GitHub Docs says CONTRIBUTING.md can live in the repository root, docs, or .github folder, and GitHub surfaces it when people open issues or pull requests.',
    source: 'GitHub Docs contributor guidelines',
    url: 'https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors'
  },
  {
    title: 'Use structured issue forms',
    detail:
      'GitHub issue forms can collect text inputs, dropdowns, checkboxes, and file uploads from contributors through files in .github/ISSUE_TEMPLATE.',
    source: 'GitHub Docs issue templates',
    url: 'https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository'
  },
  {
    title: 'Make social-impact repos discoverable',
    detail:
      'GitHub for Good First Issue looks for civic or social-impact projects tagged help wanted or good first issue, with detailed README, CONTRIBUTING, and active maintenance.',
    source: 'GitHub Docs open source for good',
    url: 'https://docs.github.com/en/nonprofit/contributing-to-open-source-for-good/adding-an-open-source-project'
  }
];

const normalize = (value) => value.toLowerCase().trim();
const roadmapCategories = [
  'Documentation',
  'Accessibility',
  'Security',
  'Community',
  'Demo quality'
];

export const fileListPresets = [
  {
    id: 'empty-static',
    name: 'Empty static starter',
    description:
      'A brand-new static project with only an HTML entry point and no maintainer files yet.',
    files: ['index.html', 'styles.css', 'src/app.js']
  },
  {
    id: 'basic-community',
    name: 'Basic community repo',
    description: 'A small open-source repo with core reuse and contribution documents started.',
    files: ['README.md', 'LICENSE', 'CONTRIBUTING.md', 'index.html']
  },
  {
    id: 'civic-beta',
    name: 'Civic beta project',
    description:
      'A public-service beta with accessibility, security, and issue routing partly in place.',
    files: [
      'README.md',
      'LICENSE',
      'CONTRIBUTING.md',
      'ACCESSIBILITY.md',
      'SECURITY.md',
      '.github/ISSUE_TEMPLATE/bug_report.md',
      'public/demo/index.html'
    ]
  },
  {
    id: 'maintainer-ready',
    name: 'Maintainer-ready repo',
    description:
      'A mature starter state with governance, templates, labels, roadmap, and onboarding docs.',
    files: [
      'README.md',
      'LICENSE',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'CODE_OF_CONDUCT.md',
      'ACCESSIBILITY.md',
      '.github/ISSUE_TEMPLATE/bug_report.md',
      '.github/ISSUE_TEMPLATE/feature_request.md',
      '.github/labels.yml',
      'ROADMAP.md',
      'docs/getting-started.md',
      'index.html'
    ]
  }
];

function hasMatch(files, check) {
  const normalizedFiles = files.map(normalize);
  return check.matches.some((needle) => {
    const normalizedNeedle = normalize(needle);
    return normalizedFiles.some(
      (file) => file === normalizedNeedle || file.includes(normalizedNeedle)
    );
  });
}

export function analyzeRepoReadiness(files) {
  const present = [];
  const missing = [];

  for (const check of checks) {
    const target = hasMatch(files, check) ? present : missing;
    target.push(check);
  }

  return {
    score: Math.round((present.length / checks.length) * 100),
    present,
    missing,
    total: checks.length
  };
}

export function scoreRepoReadiness(files) {
  const analysis = analyzeRepoReadiness(files);
  return {
    score: analysis.score,
    missing: analysis.missing.map((check) => check.label)
  };
}

export function suggestGoodFirstIssues(files) {
  const analysis = analyzeRepoReadiness(files);
  const suggestions = analysis.missing.map((check) => ({
    title: `Add ${check.label} contributor guidance`,
    labels: ['good first issue', 'documentation'],
    body: `${check.why} Suggested task: ${check.policyTodo}`
  }));

  suggestions.push(
    {
      title: 'Write three small starter issues from the roadmap',
      labels: ['good first issue', 'help wanted'],
      body: 'Create beginner-safe issues with context, changed files, acceptance criteria, and test commands.'
    },
    {
      title: 'Add a no-backend demo walkthrough to the README',
      labels: ['good first issue', 'documentation'],
      body: 'Document how to open the static demo, what to click first, and how to verify the browser-only workflow.'
    }
  );

  return suggestions.slice(0, 8);
}

export function suggestPolicyTodos(files) {
  return analyzeRepoReadiness(files).missing.map((check) => check.policyTodo);
}

export function buildMaintainerRoadmap(files) {
  const analysis = analyzeRepoReadiness(files);
  const presentIds = new Set(analysis.present.map((check) => check.id));

  return roadmapCategories.map((category) => {
    const items = checks
      .filter((check) => check.category === category)
      .map((check) => {
        const complete = presentIds.has(check.id);
        return {
          id: check.id,
          title: complete ? `Keep ${check.label} current` : check.policyTodo,
          status: complete ? 'complete' : 'todo',
          labels: ['good first issue', category.toLowerCase().replace(/\s+/g, '-')],
          why: check.why,
          acceptanceCriteria: complete
            ? [
                `${check.label} remains easy to find`,
                'Links and instructions still match the current project'
              ]
            : [
                `Add or update ${check.label}`,
                'Include clear owner, setup, verification, or reporting details'
              ]
        };
      });

    return {
      category,
      complete: items.filter((item) => item.status === 'complete').length,
      total: items.length,
      items
    };
  });
}

export function buildIssueMarkdown(item) {
  return [
    '## Summary',
    item.title,
    '',
    '## Why this helps',
    item.why,
    '',
    '## Acceptance criteria',
    ...item.acceptanceCriteria.map((criterion) => `- [ ] ${criterion}`),
    '',
    '## Suggested labels',
    `Labels: ${item.labels.join(', ')}`
  ].join('\n');
}

export function buildCategoryIssueMarkdown(group) {
  const categoryLabel = group.category.toLowerCase().replace(/\s+/g, '-');
  return [
    `## ${group.category} starter backlog`,
    `${group.complete}/${group.total} maintainer signals are already present. Use this issue to split or track beginner-safe improvements in this category.`,
    '',
    '## Recommendations',
    ...group.items.map((item) => `- [ ] ${item.title}`),
    '',
    '## Acceptance criteria',
    '- [ ] Each selected task has a clear owner, changed files, and verification command',
    '- [ ] Completed items link to merged pull requests or follow-up issues',
    '',
    '## Suggested labels',
    `Labels: good first issue, ${categoryLabel}`
  ].join('\n');
}

export function buildContributorOnboardingPack(files, options = {}) {
  const projectName =
    String(options.projectName || 'Open-source project').trim() || 'Open-source project';
  const roadmap = buildMaintainerRoadmap(files);
  const todoItems = roadmap
    .flatMap((group) => group.items.map((item) => ({ ...item, category: group.category })))
    .filter((item) => item.status === 'todo');
  const starterSequence = todoItems.slice(0, Number(options.limit || 5)).map((item, index) => ({
    step: index + 1,
    title: item.title,
    category: item.category,
    labels: item.labels,
    acceptanceCriteria: item.acceptanceCriteria,
    why: item.why
  }));
  const readiness = analyzeRepoReadiness(files);
  const firstIssue = starterSequence[0] || {
    step: 1,
    title: 'Refresh starter contributor documentation',
    category: 'Documentation',
    labels: ['good first issue', 'documentation'],
    acceptanceCriteria: ['Confirm setup commands still work', 'Link to the hosted or local demo'],
    why: 'Even mature repositories need current beginner documentation.'
  };

  return {
    projectName,
    readinessScore: readiness.score,
    starterSequence,
    suggestedFirstIssue: firstIssue,
    markdown: [
      `# ${projectName} contributor onboarding pack`,
      '',
      `Readiness score: ${readiness.score}%`,
      '',
      '## Start here',
      '1. Read the README and open the local or hosted demo.',
      '2. Pick one small issue from the sequence below.',
      '3. Comment with the files you expect to touch and the verification command you will run.',
      '',
      '## Suggested first issue',
      `Title: ${firstIssue.title}`,
      `Labels: ${firstIssue.labels.join(', ')}`,
      '',
      '## Beginner-safe issue sequence',
      ...(starterSequence.length
        ? starterSequence.flatMap((item) => [
            `${item.step}. ${item.title}`,
            `   Category: ${item.category}`,
            `   Labels: ${item.labels.join(', ')}`,
            `   Acceptance: ${item.acceptanceCriteria.join('; ')}`
          ])
        : ['1. Keep maintainer files current and verify the demo still works.']),
      '',
      '## Maintainer note',
      'Keep each starter task small, name the expected files, and include one clear verification command.'
    ].join('\n')
  };
}

export function buildMaintainerLaunchPack(files, options = {}) {
  const projectName =
    String(options.projectName || 'Open-source project').trim() || 'Open-source project';
  const analysis = analyzeRepoReadiness(files);
  const onboarding = buildContributorOnboardingPack(files, {
    projectName,
    limit: options.limit || 5
  });
  const roadmap = buildMaintainerRoadmap(files);
  const missingLabels = [
    ...new Set(
      roadmap
        .flatMap((group) => group.items)
        .filter((item) => item.status === 'todo')
        .flatMap((item) => item.labels)
    )
  ].sort();

  return {
    title: `${projectName} maintainer launch pack`,
    missingLabels,
    markdown: [
      `# ${projectName} maintainer launch pack`,
      '',
      'Generated locally in the browser. Nothing was sent to a server.',
      '',
      `Readiness score: ${analysis.score}%`,
      '',
      '## Launch checklist',
      '- [ ] Confirm README setup and demo instructions.',
      '- [ ] Publish contribution, accessibility, security, and conduct routes.',
      '- [ ] Add beginner-safe issues with labels and acceptance criteria.',
      '- [ ] Link screenshots, hosted demo, or local demo path.',
      '- [ ] Add repository topics, such as civic-tech, accessibility, legaltech, or public-services, when they accurately describe the project.',
      '',
      '## Current source notes',
      ...currentGuidance.map((item) => `- ${item.title}: ${item.detail} Source: ${item.url}`),
      '',
      '## Suggested labels',
      ...missingLabels.map((label) => `- ${label}`),
      '',
      '## Contributor onboarding',
      onboarding.markdown
    ].join('\n')
  };
}
