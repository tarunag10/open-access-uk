# Codex plan: open-access-uk

Status: portfolio planning baseline, 2026-09-26

## Local focus

Legal/civic suite; shared contracts, accessible UI, source freshness, and CI.

## Near-term slice

- Confirm the active branch, remote, product identity, and current release/deployment state.
- Inspect existing tests and workflows before adding abstractions; preserve unrelated work.
- Add the smallest missing quality gate: focused test, typecheck/build, accessibility check, or release-truth evidence.
- Keep user data local by default and make consent, export, deletion, and failure states explicit where data is sensitive.

## Acceptance gate

- Changed files are intentional and free of credentials, caches, build output, and editor metadata.
- A focused verification command or read-only inspection is recorded in the commit/PR description.
- External distribution, App Store, notarisation, deployment, or legal-review claims remain separately labelled.

## Later slices

1. Stabilise core behavior and test fixtures.
2. Improve onboarding, accessibility, privacy, and error recovery.
3. Add release evidence and automate only the verified checks.
4. Decide whether this remains canonical, becomes a satellite, or is archived after reviewing usage and duplication.

Global coordination: [portfolio-global-plan.md](https://github.com/tarunag10/ai-switchboard/blob/main/docs/portfolio-global-plan.md)

## Eviction notice validator reconstruction — 25 October 2026

Implemented in the shared eviction module and regenerated browser bundle:

- The notice selector now exposes all nine engine notice types, including Grounds 1, 1A and revised Ground 8. Conditional inputs collect Form 3A/Form 3 selection, intention evidence, tenancy start and intended possession dates, arrears at notice and hearing, and the issue date for a legacy Section 21 claim.
- Submission mapping passes these fields to the shared validator. Ground 1/1A checks require evidence text, four calendar months between service and required possession, and a possession date at least 12 months after tenancy start. The form selection follows the commencement date. Revised Grounds 8, 10 and 11 check the four-week period; Ground 12 retains two weeks and Ground 14 has no notice period. Revised Ground 8 checks the three-month arrears threshold at notice and hearing; Ground 8 notices served before commencement retain the prior threshold and two-week notice period.
- The old Section 21 transition check now requires the historic court issue date and rejects dates after 31 July 2026. A claim issue date within the deadline is not treated as proof that the claim is valid; the court record and remaining notice requirements still need review.
- Results are labelled as preliminary checklist findings. “No listed issues found” is not shown as a legal validity determination. No server submission or external storage was introduced; records remain in browser localStorage.

Legal sources checked 25 October 2026:

- [GOV.UK: Assured tenancy forms](https://www.gov.uk/guidance/assured-tenancy-forms) — current Form 3A, Form 3 and historical Form 6A availability and use. The validator links to this live official page rather than copying a static form file.
- [GOV.UK: Repossessing your privately rented property after 1 May 2026](https://www.gov.uk/guidance/repossessing-your-privately-rented-property-after-1-may-2026) — Form 3A, full ground/reasons, deposit rules, 12-month protected period, and evidence requirements.
- [GOV.UK: Grounds for possession guidance](https://www.gov.uk/government/publications/grounds-for-possession-guidance-for-landlords-and-letting-agents/grounds-for-possession-guidance-for-landlords-and-letting-agents) — Ground 1/1A four-month notice and protected period; Ground 8 three-month threshold and four-week notice; Ground 10/11 four-week notice; Ground 12 two-week notice; Ground 14 no notice period.
- [Renters’ Rights Act 2025](https://www.legislation.gov.uk/ukpga/2025/26) and [Commencement No. 2 Regulations 2026](https://www.legislation.gov.uk/uksi/2026/421) — statutory basis and commencement.

Automated evidence added: form option coverage and field-mapping tests, Ground 1/1A evidence and date tests, Ground 8 commencement-threshold tests, and Section 21 transition boundary tests. A weekly official-source change watch was also configured; it reports material changes and recommended repository updates but does not modify or publish code automatically. Remaining acceptance is separate: inspect the deployed form in a browser, test actual participant use, and complete mobile-wallet and screen-reader checks. Passing automated checks is not legal or accessibility sign-off.

## Business tenancy renewal workflow — 25 October 2026

Added a separate Business tenancy renewal tab for preliminary Section 25 and Section 26 Part II Landlord and Tenant Act 1954 checks. It captures the parties’ names and addresses, premises, business use, contracting-out uncertainty, notice/form and service details, lease and notice dates, proposed termination or renewal date, opposition grounds, counter-notice date, proposed property and new lease terms. It checks the general six-to-twelve-month date window, prescribed-form pairing, lease expiry ordering, and the two-month counter-notice period. The result stays explicitly preliminary and does not calculate court/tribunal claim deadlines or determine statutory coverage, service validity, or the effect of contracting out.

The interface links to the live official GOV.UK guide and prescribed forms. It highlights the 30 July 2026 telecommunications tribunal change without attempting to decide whether the special jurisdiction applies. It does not generate unofficial statutory notices. The form does not transmit data; results are rendered in-page and are not saved to storage.

Sources checked 25 October 2026:

- [GOV.UK business leases guide](https://www.gov.uk/government/publications/renewing-and-ending-business-leases-a-guide-for-tenants-and-landlords), updated 30 July 2026.
- [GOV.UK prescribed forms under the 1954 Act](https://www.gov.uk/government/publications/renewing-and-ending-business-leases-a-guide-for-tenants-and-landlords/forms-prescribed-under-the-landlord-and-tenant-act-1954-part-2-notices-regulations-2004), updated 30 July 2026. The guidance explains that references to the court in prescribed forms are read as tribunal references for specified legacy telecommunications disputes.
- [Landlord and Tenant Act 1954, sections 25](https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/25), [26](https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/26) and [30](https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/section/30); [2004 prescribed-form Regulations](https://www.legislation.gov.uk/uksi/2004/1005).

## Business tenancy application deadline update — 28 October 2026

Extended the business-tenancy checklist to show a preliminary Section 29A application-period endpoint: for a Section 25 notice this is the stated termination date; for a Section 26 request it is the day immediately before the proposed new tenancy date. A Section 26 result also shows the usual earliest tenant application date two months after the request, or the entered counter-notice date where the landlord has given a Section 26(6) notice. Missing dates leave the estimate uncalculated.

The form records the date and end date of an initial Section 29B agreement and one further extension. It checks the recorded dates against the statutory period and each other, labels extended dates as preliminary, and requires review because dates alone cannot establish the written agreement’s legal effect or an unrecorded further extension. Section 56.3 and Practice Direction 56 paragraph 3.4 require the claim to state the statutory or agreed extended period expiry date; Part 56 specifies Part 8 for unopposed claims and Part 7 for opposed claims.

The telecommunications prompt now asks whether both statutory conditions may apply: a subsisting agreement whose primary purpose is to confer electronic communications code rights. If either condition is unknown or potentially met, the result flags First-tier Tribunal/Upper Tribunal jurisdiction for review and does not decide the forum.

Sources checked 28 October 2026:

- [Landlord and Tenant Act 1954, sections 29A and 29B](https://www.legislation.gov.uk/ukpga/Eliz2/2-3/56/part/II/england/2026-07-30).
- [Civil Procedure Rules Part 56](https://www.justice.gov.uk/courts/procedure-rules/civil/rules/part56) and [Practice Direction 56](https://www.justice.gov.uk/courts/procedure-rules/civil/rules/part56/pd_part56).
- [2026 telecommunications jurisdiction regulations, regulation 3](https://www.legislation.gov.uk/uksi/2026/569/regulation/3/made).
- [GOV.UK business lease guide, updated 30 July 2026](https://www.gov.uk/government/publications/renewing-and-ending-business-leases-a-guide-for-tenants-and-landlords).

Automated regressions cover Section 25 and 26 endpoints, Section 26 early-application boundaries, one and two Section 29B extensions, missing information, telecom jurisdiction flags, and accessible form fields. The browser continues to process details locally and does not save or transmit business-tenancy form data. These estimates do not determine whether an application is valid, in time, correctly issued, or within court or tribunal jurisdiction.

Automated evidence covers Section 25 unopposed/opposed Form 1/Form 2 paths, Section 26 Form 3, date boundaries, contracting-out flags, the telecom update, and accessible form controls. This workflow remains an educational triage aid, not a substitute for checking statutory forms or specialist review.

## Employment Tribunal deadline transition verification — 25 October 2026

The first CI run after the eviction/business-tenancy push exposed a stale shared deadline calculation: it selected the six-month period from the current date rather than the relevant event date. Updated the selection to follow the event date, kept the Employment Tribunal helper browser-safe and self-contained, and added 30 September/1 October 2026 boundary tests. This preserves the three-month period for relevant dates before commencement and applies the general six-month change from 1 October 2026; claim-specific and jurisdictional exceptions still need checking.

Source: [Employment Rights Act 2025 (Commencement No. 5) Regulations 2026](https://www.legislation.gov.uk/uksi/2026/954/made/data.html), regulation 3 brings section 152 and Schedule 12 into force on 1 October 2026, and regulation 4 sets the transition for relevant dates before that date. See also the [GOV.UK implementation timeline](https://www.gov.uk/government/publications/implementing-the-plan-to-make-work-pay-and-employment-rights-act/plan-to-make-work-pay-and-employment-rights-act-timeline-update).
