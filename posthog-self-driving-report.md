# PostHog Self-driving setup report

## Summary
PostHog Self-driving is configured for this web learning platform. Session Replay was already enabled; Error Tracking and Support were enabled, and native responders for health checks, errors, and support tickets were added. The scout troop, two product-specific scouts, and two Replay Vision monitors are armed; findings will start appearing in the [Self-driving inbox](https://eu.posthog.com/project/193516/inbox) within about 30 minutes once data arrives.

## AI data processing
Approved by the wizard's organization-level gate.

## GitHub
Connected before this setup run through the PostHog GitHub App. GitHub Issues was not selected as a connected-tool responder, so no GitHub Issues warehouse source or responder was added.

## Products enabled

| Product | Result | SDK check / note |
| --- | --- | --- |
| Session Replay | Already enabled | The web `posthog.init` is clean: it does not disable session recording. |
| Error Tracking | Enabled | The web `posthog.init` has `capture_exceptions: true`. |
| Support | Enabled | Connect an inbound email, inbox, or Slack channel in PostHog before support tickets can arrive. |

## Signal sources

| Signal source | Action | Notes |
| --- | --- | --- |
| `signals_scout` / `cross_source_issue` | On by default | No row is required; no previous opt-out existed. |
| `health_checks` / `health_issue` | Enabled | Source config `01a1261a-e4af-7d54-97cd-539f89b5f672`. |
| `error_tracking` / `issue_created` | Enabled | Source config `01a1261a-e621-7a48-b301-2829d32c4eea`. |
| `error_tracking` / `issue_reopened` | Enabled | Source config `01a1261a-e57b-7056-ac6d-0eeb57e48ba4`. |
| `error_tracking` / `issue_spiking` | Enabled | Source config `01a1261a-e50c-72b1-922d-8ba2755765f6`. |
| `conversations` / `ticket` | Enabled | Source config `01a1261a-e587-7dfb-b2a1-b3dc0b111953`; remains idle until an inbound channel is connected. |
| `session_replay` / `session_analysis_cluster` | Skipped | Retired responder; Replay Vision scanners cover session-replay findings. |
| `replay_vision` source row | Skipped | Scanners self-authorize with `emits_signals: true`; no signal-source row is needed. |

## Connected tools

| Tool | Result |
| --- | --- |
| GitHub Issues | Not used — not selected in the connected-tools prompt. |
| Linear | Not used — not selected in the connected-tools prompt. |
| Jira | Not used — not selected in the connected-tools prompt. |
| Sentry | Not used — not selected in the connected-tools prompt. |
| Zendesk | Not used — not selected in the connected-tools prompt. |

No external data warehouse sources were configured when checked.

## Scout troop

**Active (6):**

| Scout | Why it is active |
| --- | --- |
| General | Covers cross-product correlations and gaps outside specialist scopes. |
| Product analytics | Covers learner-flow conversion, retention, lifecycle, and path regressions. |
| Web analytics | Covers acquisition, landing-page, bounce, and 404 health. |
| Observability gaps | Finds high-volume behavior without insight, dashboard, or alert coverage. |
| Learning search health | Custom scout for the platform's core learning-search interaction. |
| Course engagement health | Custom scout for course starts and lesson selection health. |

**Disabled (24):** The remaining specialists are disabled because the repo and project state do not show those surfaces in active use. Error Tracking is covered by its native responder, Session Replay by the Replay Vision monitors, and Inbox validation remains off until there are resolved findings to validate. Re-enable a specialist in the inbox if the relevant product becomes active later.

| Run budget | Value |
| --- | --- |
| Maximum runs per day | 100 |
| Runs used today | 0 |
| Runs remaining today | 100 |
| Announcement | Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more. |

## Custom scouts

| Scout | What it watches | Discriminator and coverage rationale |
| --- | --- | --- |
| `signals-scout-learning-search-health` | Sustained declines in learning-search use. | Search activity falling while broad site traffic is stable or growing; Web analytics watches traffic but does not fire on this product-specific interaction. Evidence: `components/home-search-form.tsx`. |
| `signals-scout-course-engagement-health` | Course starts and lesson selections. | Per-course engagement drops relative to interest in that course; Product analytics is generic and only watches saved flows, while this scout carries course and module context. Evidence: `app/courses/[slug]/page.tsx`. |

The proposals were approved and both scouts were created and registered as enabled daily scouts. Revenue, surveys, AI observability, logs, experiments, feature flags, data pipelines, and customer analytics were considered and ruled out because no active implementation evidence was found. Error and replay surfaces were ruled out because their dedicated responders and scanners already cover them.

If either custom scout proves noisy, set its config's `emit` value to `false` in PostHog to keep it running in dry-run mode without inbox reports.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes qualifying findings to the Self-driving inbox. These are the only components in this setup that spend Replay Vision quota. Findings enter at half weight and require corroboration before they are promoted into a report.

| Scanner | Result | What it watches | Query scope | Sampling | Estimated monthly spend |
| --- | --- | --- | --- | --- | --- |
| [Learning path breakage](https://eu.posthog.com/project/193516/replay-vision/01a1261e-875f-7dbf-befd-4c55276bcf2e) | Created | Visible failures in course browsing and lesson opening: loading failures, non-working Start Learning or lesson selection, and missing course content. | Recordings whose current URL contains `/courses/`; this is the product's course-to-lesson completion path, evidenced by `app/courses/[slug]/page.tsx`. | 50% | 0 observations / 0 credits; 5 credits per observation once recordings match. |
| [Learning journey frustration](https://eu.posthog.com/project/193516/replay-vision/01a1261e-8778-73f8-9c9c-7a71e26cdaa4) | Created | Visible struggle while searching, starting a course, or selecting lessons. | `$rageclick` recordings only, with no URL filter. | 100% | 0 observations / 0 credits; 5 credits per observation once recordings match. |

The current budget has 2,500 credits remaining and is not exhausted. Estimates found no matching recordings in the last seven days, so both scanners are armed and will begin working automatically when recordings arrive.

## Repository changes

| File | Change |
| --- | --- |
| `posthog-self-driving-report.md` | Created this setup report. |

No application source files, dependencies, or environment files were changed.

## Follow-ups

- [ ] Connect an inbound Support channel (email, PostHog inbox, or Slack) so the enabled Support responder can receive tickets.
- [ ] Generate production browser traffic with Session Replay enabled; the two Replay Vision scanners are ready but did not find matching recordings during their seven-day estimates.
- [ ] Reauthorize the PostHog MCP connection with `action:read` and `property_definition:read` scopes if you want future setup or analysis runs to inspect the event/property schema directly.
- [ ] Rate the first useful scanner observations with thumbs up or down and a short note in Replay Vision to improve the monitors.

## What happens next

The scout coordinator picks up fresh configurations within about 30 minutes. Daily scout runs draw from the verified 100-run budget; findings cluster into reports in the Self-driving inbox, and immediately-actionable reports can start coding tasks.
