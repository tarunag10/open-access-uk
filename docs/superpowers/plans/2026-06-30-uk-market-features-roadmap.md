# UK Market Features — Master Implementation Roadmap

**Date:** 2026-06-30  
**Status:** Draft  
**Owner:** Product & Engineering  
**Review Cycle:** Monthly

---

## Goal

Expand Open Access UK to cover **80%+ of common UK civic scenarios** through 20 targeted features, maintaining our principles of static-first architecture, local-first operation, source-backed content, and WCAG AA compliance.

---

## Architecture Principles

All features must adhere to:

- **Static-first**: Progressive enhancement, works without JavaScript where possible
- **Local-first**: Runs in browser, no backend dependencies for core functionality
- **Source-backed**: Every claim linked to authoritative sources (legislation, tribunal guidance, ombudsman rulings)
- **WCAG AA**: Full keyboard navigation, screen reader support, semantic HTML
- **Privacy-first**: No tracking, minimal data collection, transparent data handling

---

## Timeline Overview

**Total Duration:** 24 months (Q3 2026 — Q2 2028)  
**Total Development Effort:** ~180 dev-weeks  
**Phases:** 5 sequential phases with overlapping QA and infrastructure work

---

## Phase 1: High-Volume Public Services (Months 1-3)

**Duration:** 12 weeks  
**Dev Effort:** 30 dev-weeks  
**Risk Level:** Medium  
**Dependencies:** Core platform stable, source infrastructure ready

### Features

#### 1. NHS Complaints Tracker
- **Effort:** 6 dev-weeks
- **Purpose:** Multi-stage complaint tracking (PALS → complaint → PHSO)
- **Deliverables:**
  - Stage-appropriate templates for each NHS complaint level
  - Deadline calculator for escalation paths
  - Evidence checklist for health-related complaints
  - Integration with existing template system
- **Sources:** NHS Constitution, PHSO guidance, ICO health data rules
- **Success Metrics:** 500+ complaints tracked in first 3 months

#### 2. Benefits Appeals System
- **Effort:** 8 dev-weeks
- **Purpose:** SSCS1 form builder with benefit-specific guidance
- **Deliverables:**
  - Decision notice parser (PIP, ESA, UC, JSA)
  - Mandatory reconsideration letter generator
  - Tribunal grounds builder with case law
  - Medical evidence checklist
- **Sources:** SSCS tribunal guidance, CPAG Welfare Benefits Handbook, Upper Tribunal decisions
- **Success Metrics:** 300+ appeals filed in first quarter

#### 3. Parking Ticket Appeal Generator
- **Effort:** 5 dev-weeks
- **Purpose:** Council and private parking challenge automation
- **Deliverables:**
  - Traffic Penalty Tribunal appeal builder
  - POPLA challenge generator
  - Photo evidence organizer
  - Local authority routing database
- **Sources:** TMA 2004, BPA Code of Practice, TPT guidance
- **Success Metrics:** 1,000+ appeals in first 3 months, 60%+ success rate

#### 4. School Exclusions & SEND Helper
- **Effort:** 7 dev-weeks
- **Purpose:** Challenge school exclusions and navigate SEND system
- **Deliverables:**
  - Exclusion review request generator
  - EHCP needs assessment request builder
  - SEND tribunal case preparation tool
  - School admission appeals helper
- **Sources:** Exclusion guidance 2017, SEND Code of Practice 2015, SEND tribunal decisions
- **Success Metrics:** 200+ families supported in first quarter

#### 5. Right to Repair Tracker
- **Effort:** 4 dev-weeks
- **Purpose:** Social housing repair request and escalation manager
- **Deliverables:**
  - Repair request template with urgency categorization
  - Landlord performance comparison (via Housing Ombudsman data)
  - Escalation timeline calculator
  - Disrepair claim pre-action protocol
- **Sources:** Landlord and Tenant Act 1985, Homes (Fitness for Human Habitation) Act 2018, Housing Ombudsman determinations
- **Success Metrics:** 400+ repair cases tracked

### Phase 1 Success Criteria

- All 5 features live in production
- 2,400+ users across all features
- WCAG AA compliance validated
- Source integrity audit passed (100% claims sourced)
- Performance: <3s page load, <100ms interaction latency

### Phase 1 Infrastructure Requirements

- Enhanced template engine supporting multi-stage workflows
- Deadline calculation service
- Evidence attachment UI component
- Source citation system v1.0
- Analytics infrastructure (privacy-preserving)

---

## Phase 2: Employment & Housing (Months 4-6)

**Duration:** 12 weeks  
**Dev Effort:** 35 dev-weeks  
**Risk Level:** High (complex legal domain)  
**Dependencies:** Phase 1 template infrastructure, legal review capacity

### Features

#### 6. Employment Tribunal Case Builder
- **Effort:** 10 dev-weeks
- **Purpose:** ET1 form builder for unfair dismissal, discrimination, unpaid wages
- **Deliverables:**
  - Claim type triage (unfair dismissal, discrimination, wage claims)
  - ET1 form auto-population
  - ACAS early conciliation tracker
  - Chronology builder for case timeline
  - Remedy calculator (basic award, compensatory award)
- **Sources:** Employment Rights Act 1996, Equality Act 2010, ET Practice Direction, Presidential Guidance, EAT judgments
- **Success Metrics:** 150+ ET1 forms filed, 70%+ conciliation outcomes

#### 7. Section 21/8 Notice Validator
- **Effort:** 6 dev-weeks
- **Purpose:** Check eviction notice validity and generate challenges
- **Deliverables:**
  - Notice validity checker (grounds, timing, format)
  - Challenge letter generator for invalid notices
  - Deposit protection compliance checker
  - Court timeline calculator if case proceeds
- **Sources:** Housing Act 1988, Deregulation Act 2015, Tenant Fees Act 2019, case law on notice validity
- **Success Metrics:** 800+ notices validated, 40%+ found defective

#### 8. Pre-Action Protocol Generator
- **Effort:** 7 dev-weeks
- **Purpose:** Generate court-compliant pre-action letters (housing disrepair, debt, personal injury)
- **Deliverables:**
  - Multi-domain protocol library (housing, debt, PI)
  - Letter of claim generator with required elements
  - Response deadline tracker
  - Compliance checklist per protocol
- **Sources:** CPR Practice Directions (Pre-Action Protocols), specific protocols for housing, debt, PI
- **Success Metrics:** 300+ pre-action letters sent, 60%+ resolved pre-litigation

#### 9. Universal Credit Sanctions Challenge
- **Effort:** 6 dev-weeks
- **Purpose:** Challenge UC sanctions and conditionality decisions
- **Deliverables:**
  - Sanction type identifier (higher-level, standard, lower-level)
  - Good reason arguments library
  - Mandatory reconsideration request builder
  - Hardship payment calculator and request tool
- **Sources:** Welfare Reform Act 2012, UC Regulations 2013, DWP decision-making guidance, case law
- **Success Metrics:** 250+ sanction challenges, 55%+ overturned

#### 10. Welsh Language Integration
- **Effort:** 6 dev-weeks
- **Purpose:** Full Welsh-language support for all features
- **Deliverables:**
  - Complete UI translation (Welsh & English)
  - Bilingual template library
  - Welsh authority routing (recognize Welsh LAs, health boards)
  - Language preference persistence
- **Sources:** Welsh Language Act 1993, Welsh Language Standards, bilingual statutory instruments
- **Success Metrics:** 10%+ Welsh-language usage in Wales, all templates available bilingually

### Phase 2 Success Criteria

- All 5 features live and legally reviewed
- 1,500+ users across employment and housing features
- Legal accuracy review by external solicitors (95%+ approval)
- Zero reported inaccuracies in legal guidance
- Welsh language functionality validated by native speakers

### Phase 2 Infrastructure Requirements

- Legal content review workflow
- Multi-lingual content management system
- Complex form validation engine
- Remedy and deadline calculation library
- Case law citation formatter

---

## Phase 3: Workflow Automation (Months 7-12)

**Duration:** 24 weeks  
**Dev Effort:** 42 dev-weeks  
**Risk Level:** Medium-High (technical complexity)  
**Dependencies:** Phase 1-2 feature adoption data, user feedback integration

### Features

#### 11. Multi-Authority FOI Batch Tool
- **Effort:** 8 dev-weeks
- **Purpose:** Send identical FOI to multiple authorities simultaneously
- **Deliverables:**
  - Authority multi-selector (councils, NHS, police, etc.)
  - Template customization per authority type
  - Batch submission tracker with per-authority deadlines
  - Response aggregator and comparison view
  - Integration with WhatDoTheyKnow API (if available)
- **Sources:** FOIA 2000, ICO guidance, authority contact databases
- **Success Metrics:** 100+ batch requests, avg 8 authorities per batch

#### 12. Deadline Cascade Visualizer
- **Effort:** 7 dev-weeks
- **Purpose:** Visual timeline showing all deadlines across multiple cases
- **Deliverables:**
  - Multi-case timeline view (Gantt-style)
  - Deadline conflict detector
  - Reminder system (browser notifications, email opt-in)
  - Critical path highlighter for time-sensitive actions
- **Sources:** Various statutory deadlines across features
- **Success Metrics:** 500+ users managing 3+ concurrent cases

#### 13. Evidence Upload Readiness Checker
- **Effort:** 9 dev-weeks
- **Purpose:** Validate evidence bundles before tribunal/court submission
- **Deliverables:**
  - File format validator (PDF, image, size limits)
  - Accessibility checker (OCR text extraction, metadata)
  - Bundle page numbering and indexing
  - Redaction assistance (PII, sensitive data)
  - Tribunal-specific packaging (ET, FTT, TPT formats)
- **Sources:** Tribunal practice directions, court rules on evidence
- **Success Metrics:** 400+ bundles validated, 30%+ reduction in rejected submissions

#### 14. Email-to-Case Parser
- **Effort:** 10 dev-weeks
- **Purpose:** Auto-import case updates from email correspondence
- **Deliverables:**
  - Unique case email address generation
  - Email parsing for key dates, decisions, responses
  - Auto-attachment to case timeline
  - Deadline extraction and calendar integration
  - Support for common authority email formats
- **Sources:** N/A (technical infrastructure)
- **Success Metrics:** 300+ cases using email import, 80%+ parse accuracy

#### 15. Multi-Case Management Enhancement
- **Effort:** 8 dev-weeks
- **Purpose:** Dashboard for users managing multiple concurrent cases
- **Deliverables:**
  - Case portfolio overview (status, deadlines, progress)
  - Cross-case search and filtering
  - Tag and categorization system
  - Case archival and export (JSON, PDF)
  - Family/household case sharing (privacy-controlled)
- **Sources:** N/A (technical infrastructure)
- **Success Metrics:** 600+ users managing 2+ cases, 40%+ managing 4+ cases

### Phase 3 Success Criteria

- All 5 workflow features operational
- 1,800+ active users of workflow tools
- 90%+ user satisfaction with multi-case management
- Email parser 80%+ accuracy on testing dataset
- Evidence checker reduces rejection rate by 30%+

### Phase 3 Infrastructure Requirements

- Email ingestion service (privacy-compliant)
- Advanced timeline/calendar visualization library
- File processing pipeline (validation, OCR, redaction assistance)
- Cross-case indexing and search
- Export and archival system

---

## Phase 4: Specialized Services (Months 13-18)

**Duration:** 24 weeks  
**Dev Effort:** 38 dev-weeks  
**Risk Level:** High (niche domains, legal complexity)  
**Dependencies:** Established user base, domain expertise partnerships

### Features

#### 16. Immigration & Visa Complaint Tool
- **Effort:** 9 dev-weeks
- **Purpose:** Challenge UKVI decisions, navigate immigration complaint process
- **Deliverables:**
  - Decision type router (visa refusal, deportation, asylum)
  - Administrative review request builder
  - Judicial review pre-action protocol (immigration-specific)
  - ICIBI complaint generator
  - Country guidance database search
- **Sources:** Immigration Acts, Immigration Rules, Upper Tribunal (IAC) country guidance, ICIBI reports
- **Success Metrics:** 200+ challenges filed, legal partnership with immigration charity

#### 17. Regulated Professional Complaints Router
- **Effort:** 7 dev-weeks
- **Purpose:** Route complaints to correct regulator (GMC, SRA, HCPC, etc.)
- **Deliverables:**
  - Professional regulator directory (20+ regulators)
  - Complaint triage (fitness to practise vs service complaint)
  - Regulator-specific form generators
  - Dual-route explainer (regulator + Legal Ombudsman/PHSO)
- **Sources:** Individual regulator complaint procedures, Professional Standards Authority guidance
- **Success Metrics:** 300+ complaints routed correctly, 95%+ routing accuracy

#### 18. Court & Tribunal Fees Calculator
- **Effort:** 5 dev-weeks
- **Purpose:** Calculate fees and assess fee remission eligibility (EX160)
- **Deliverables:**
  - Fee calculator for ET, county court, family court, UT
  - Help with Fees (EX160) eligibility checker
  - Fee remission form auto-population
  - Fee waiver arguments library
- **Sources:** Court and tribunal fee schedules, EX160 guidance, fee remission thresholds
- **Success Metrics:** 1,200+ fee calculations, 400+ remission applications

#### 19. Accessible Formats Request Specialist
- **Effort:** 6 dev-weeks
- **Purpose:** Request documents in accessible formats under Equality Act duty
- **Deliverables:**
  - Format specification tool (large print, braille, audio, easy read, BSL)
  - Reasonable adjustment request generator
  - Authority obligations explainer (public sector equality duty)
  - Complaint escalation if refused
- **Sources:** Equality Act 2010, PSED guidance, case law on reasonable adjustments
- **Success Metrics:** 150+ format requests, 90%+ compliance from authorities

#### 20. Ombudsman Outcomes Database
- **Effort:** 11 dev-weeks
- **Purpose:** Searchable database of ombudsman decisions for case research
- **Deliverables:**
  - Structured database of LGSCO, PHSO, Housing Ombudsman decisions
  - Full-text search with filters (year, authority, outcome, remedy)
  - Similar case finder (ML-based or keyword matching)
  - Citation tool for use in complaints
  - Monthly scraping/update pipeline
- **Sources:** Public ombudsman decision databases
- **Success Metrics:** 10,000+ decisions indexed, 500+ searches per month

### Phase 4 Success Criteria

- All 5 specialized features launched
- 1,850+ users across specialized tools
- Partnership agreements with 3+ legal/advice charities
- Ombudsman database indexed with 10,000+ decisions
- Legal review confirms immigration tool accuracy

### Phase 4 Infrastructure Requirements

- Advanced decision database (vector search or keyword indexing)
- Web scraping pipeline for ombudsman decisions
- Regulator directory data model
- Complex fee calculation engine
- Accessibility format specification system

---

## Phase 5: Data & Transparency (Months 19-24)

**Duration:** 24 weeks  
**Dev Effort:** 35 dev-weeks  
**Risk Level:** Medium (data quality dependencies)  
**Dependencies:** Critical mass of users, data partnerships established

### Features

#### 21. Local Authority Performance Lookup
- **Effort:** 8 dev-weeks
- **Purpose:** Compare LA performance on FOI, complaints, housing, social care
- **Deliverables:**
  - LA performance dashboard (response times, complaint volumes, outcomes)
  - Data sources: ICO, LGSCO, Ofsted, CQC, user-submitted outcomes
  - Comparison tool (benchmark LA against national average, similar LAs)
  - Performance trend over time
- **Sources:** ICO FOI statistics, LGSCO reports, regulatory inspection reports, user data
- **Success Metrics:** 150+ LAs with performance data, 800+ comparisons per month

#### 22. Community Contribution Platform
- **Effort:** 10 dev-weeks
- **Purpose:** Users submit anonymized case outcomes to improve success rates
- **Deliverables:**
  - Outcome submission form (anonymized, structured)
  - Moderation workflow (review before publishing)
  - Aggregate success rate displays per feature
  - Community insights (common challenges, effective arguments)
- **Sources:** User-contributed data
- **Success Metrics:** 500+ outcomes submitted, 300+ published

#### 23. Advanced Search & Filtering
- **Effort:** 7 dev-weeks
- **Purpose:** Cross-feature search for content, sources, templates, decisions
- **Deliverables:**
  - Global search across all content (templates, guides, ombudsman decisions)
  - Faceted filtering (feature type, date, authority, outcome)
  - Search result ranking (relevance, recency)
  - Saved searches and alerts
- **Sources:** All existing content
- **Success Metrics:** 1,000+ searches per month, 70%+ search success rate

#### 24. Performance Optimization
- **Effort:** 6 dev-weeks
- **Purpose:** Improve load times, reduce bundle size, enhance mobile experience
- **Deliverables:**
  - Code splitting for feature-specific modules
  - Image optimization and lazy loading
  - Service worker for offline functionality
  - Performance budget enforcement (CI/CD)
- **Sources:** N/A (technical infrastructure)
- **Success Metrics:** <2s page load on 3G, <50ms interaction latency, Lighthouse score 90+

#### 25. Analytics & Impact Measurement
- **Effort:** 4 dev-weeks
- **Purpose:** Measure feature adoption, user outcomes, platform impact
- **Deliverables:**
  - Privacy-preserving analytics dashboard
  - Feature usage metrics (adoption, completion rates)
  - Outcome tracking (cases won, complaints resolved)
  - Annual impact report generation
- **Sources:** User interaction data (anonymized)
- **Success Metrics:** 95%+ feature coverage in analytics, quarterly impact reports published

### Phase 5 Success Criteria

- All 5 data/transparency features operational
- LA performance data for 150+ authorities
- 500+ community outcomes contributed
- Platform performance: <2s load time, 90+ Lighthouse score
- Annual impact report shows measurable civic outcomes

### Phase 5 Infrastructure Requirements

- User contribution moderation system
- Advanced search infrastructure (Elasticsearch or similar)
- Performance monitoring and alerting
- Analytics pipeline (privacy-preserving)
- LA performance data aggregation service

---

## Cross-Cutting Infrastructure Improvements

### Throughout All Phases

#### Source Provenance System
- **Timeline:** Months 1-6 (foundation), ongoing maintenance
- **Effort:** 8 dev-weeks initial, 1 dev-week/month maintenance
- **Deliverables:**
  - Centralized source database (legislation, case law, guidance)
  - Source citation component (inline citations in all features)
  - Source freshness monitoring (alert if legislation updated)
  - Citation export (JSON, BibTeX, legal citation format)
- **Success Metrics:** 100% of claims cited, 95%+ source freshness

#### Accessibility Validation
- **Timeline:** Months 1-3 (framework), ongoing validation per feature
- **Effort:** 4 dev-weeks initial, 0.5 dev-weeks per feature
- **Deliverables:**
  - Automated accessibility testing in CI/CD (axe, Pa11y)
  - Manual screen reader testing protocol
  - Keyboard navigation testing
  - WCAG AA compliance audit per feature before launch
- **Success Metrics:** Zero WCAG AA violations in production

#### Testing Strategy
- **Timeline:** Months 1-3 (framework), ongoing per feature
- **Effort:** 6 dev-weeks initial, 1 dev-week per feature
- **Deliverables:**
  - Unit test coverage target: 80%+
  - Integration tests for critical workflows
  - End-to-end tests for each feature
  - User acceptance testing with advice agencies
  - Legal accuracy review for legal content
- **Success Metrics:** 80%+ test coverage, zero post-launch legal inaccuracies

#### Release Process
- **Timeline:** Month 1 (setup), ongoing
- **Effort:** 3 dev-weeks setup, 0.5 dev-weeks per release
- **Deliverables:**
  - Feature flag system (gradual rollout)
  - Staging environment mirroring production
  - Deployment pipeline (CI/CD)
  - Rollback procedure
  - Release notes and changelog
- **Success Metrics:** Zero downtime deployments, <1hr rollback if needed

---

## Resource Requirements Summary

### Development Effort by Phase

| Phase | Duration | Dev-Weeks | Features |
|-------|----------|-----------|----------|
| Phase 1 | 12 weeks | 30 | 5 |
| Phase 2 | 12 weeks | 35 | 5 |
| Phase 3 | 24 weeks | 42 | 5 |
| Phase 4 | 24 weeks | 38 | 5 |
| Phase 5 | 24 weeks | 35 | 5 |
| **Total** | **24 months** | **180** | **25** |

### Team Composition (Recommended)

- **2 Full-Stack Engineers:** Feature development, infrastructure
- **1 Frontend Specialist:** Accessibility, performance, UI/UX
- **0.5 FTE Legal Reviewer:** Content accuracy, source validation
- **0.5 FTE Product Manager:** Prioritization, user research, partnerships
- **0.25 FTE Designer:** UI components, accessibility, user flows

**Total Team Cost:** ~3.25 FTE sustained over 24 months

---

## Risk Assessment & Mitigation

### High-Risk Areas

#### 1. Legal Accuracy
- **Risk:** Inaccurate legal guidance leads to user harm, reputational damage
- **Mitigation:**
  - External legal review for all legal content
  - Conservative disclaimers (not legal advice)
  - Source-backed claims only
  - Partnership with advice agencies for validation

#### 2. Source Freshness
- **Risk:** Legislative changes invalidate content without notification
- **Mitigation:**
  - Automated monitoring of legislation.gov.uk
  - Regular review cycle (quarterly)
  - User reporting mechanism for stale content
  - Version control on all legal content

#### 3. Accessibility Compliance
- **Risk:** WCAG violations exclude disabled users, breach PSED
- **Mitigation:**
  - Automated testing in CI/CD
  - Manual testing with screen readers
  - User testing with disabled users
  - Third-party accessibility audit annually

#### 4. User Data Privacy
- **Risk:** Data breach, GDPR violation, loss of user trust
- **Mitigation:**
  - Local-first architecture (minimal server-side storage)
  - Encryption for stored data
  - Privacy-preserving analytics
  - Regular security audits
  - Transparent privacy policy

#### 5. Technical Debt
- **Risk:** Rapid feature development leads to unmaintainable codebase
- **Mitigation:**
  - 20% time allocation for refactoring
  - Code review requirement
  - Technical debt tracking and remediation sprints
  - Automated testing and linting

---

## Success Metrics by Phase

### Phase 1 (Months 1-3)
- 2,400+ users across 5 features
- 60%+ appeal success rate (parking, benefits)
- WCAG AA compliance validated
- Zero legal inaccuracies reported

### Phase 2 (Months 4-6)
- 1,500+ users for employment/housing features
- Legal review approval: 95%+
- 10%+ Welsh-language usage in Wales
- 70%+ early conciliation success rate (ET)

### Phase 3 (Months 7-12)
- 1,800+ users of workflow tools
- 80%+ email parsing accuracy
- 30%+ reduction in evidence bundle rejections
- 90%+ user satisfaction with multi-case management

### Phase 4 (Months 13-18)
- 1,850+ users of specialized tools
- 10,000+ ombudsman decisions indexed
- 3+ charity partnerships established
- 95%+ routing accuracy (professional complaints)

### Phase 5 (Months 19-24)
- 150+ LAs with performance data
- 500+ community outcomes contributed
- <2s page load time, 90+ Lighthouse score
- Annual impact report published

### Overall (Month 24)
- **20,000+ registered users**
- **50,000+ cases managed**
- **80%+ coverage of common UK civic scenarios**
- **70%+ case success rate across features**
- **95%+ source freshness**
- **Zero WCAG AA violations**

---

## Dependencies & Sequencing

### Critical Path

1. **Phase 1 Template Infrastructure** → Required for all subsequent features
2. **Phase 2 Legal Review Process** → Required for Phase 4 specialized services
3. **Phase 3 Multi-Case Management** → Required for Phase 5 analytics
4. **Phase 4 Ombudsman Database** → Informs Phase 5 performance comparison
5. **Phase 5 Performance Optimization** → Enables scale for user growth

### Parallel Workstreams

- **Source Provenance System:** Developed alongside Phase 1-2 features
- **Accessibility Infrastructure:** Implemented in Phase 1, validated per feature
- **Welsh Language Support:** Phase 2 foundation, extended to all features by Phase 3
- **Analytics Pipeline:** Instrumented in Phase 1, fully operational by Phase 5

---

## Go/No-Go Decision Points

### After Phase 1 (Month 3)
- **Criteria:** 2,000+ users, 60%+ success rates, zero legal issues
- **Decision:** Proceed to Phase 2 or iterate on Phase 1 features

### After Phase 2 (Month 6)
- **Criteria:** 3,500+ total users, legal review approval, Welsh language functional
- **Decision:** Proceed to Phase 3 or consolidate Phase 1-2

### After Phase 3 (Month 12)
- **Criteria:** 5,000+ users, workflow tools adopted by 30%+ multi-case users
- **Decision:** Proceed to Phase 4 or optimize Phase 1-3

### After Phase 4 (Month 18)
- **Criteria:** 7,000+ users, 3+ charity partnerships, ombudsman DB operational
- **Decision:** Proceed to Phase 5 or deepen Phase 4 features

### After Phase 5 (Month 24)
- **Criteria:** 20,000+ users, 80%+ scenario coverage, measurable impact
- **Decision:** Sustain & scale or expand to new domains

---

## Maintenance & Sustainability

### Post-Launch Sustainability Plan

#### Ongoing Maintenance (Post-Month 24)
- **0.5 FTE Engineer:** Bug fixes, security patches, dependency updates
- **0.25 FTE Legal Reviewer:** Quarterly source freshness review
- **0.1 FTE Product:** User feedback monitoring, roadmap adjustments

#### Content Updates
- **Quarterly:** Legislation review, source freshness audit
- **Annual:** Major case law review, ombudsman database refresh
- **Ad-hoc:** Emergency updates for breaking legal changes

#### Community Governance
- **User Advisory Group:** Quarterly meetings with power users, advice agencies
- **Open Source Contributions:** Accept community PRs for templates, sources
- **Transparency Reports:** Annual impact reports, quarterly metrics

---

## Conclusion

This 24-month roadmap delivers 25 features across 5 phases, targeting 80%+ coverage of common UK civic scenarios. By maintaining static-first, source-backed, accessible design throughout, Open Access UK will become the trusted digital companion for navigating UK public services, legal processes, and civic challenges.

**Next Steps:**
1. Secure funding and team for 24-month commitment
2. Establish legal review partnership
3. Initiate Phase 1 planning and infrastructure buildout
4. Launch Phase 1 features by Month 3
5. Iterate based on user feedback and success metrics

**Review & Approval:**
- Product Lead: [Pending]
- Engineering Lead: [Pending]
- Legal Advisor: [Pending]
- Accessibility Consultant: [Pending]

---

*This roadmap is a living document and will be updated quarterly based on user feedback, legal developments, and technical constraints.*
