# REGISTRATION COMPLETION LOCK

Status: locked

Source: Session Log — 11 July 2026 items 4 and 9; 12 July 2026 item 9; 18 July 2026 (confirmed via code check)

Once submitted, a therapist must NEVER re-enter the registration form — only the dashboard. Intentional design, not a side effect.

Enforced on both entry paths:
1. index.html's `resolveIdentity()` returns `verified` and routes straight to dashboard.html.
2. register.html has its own independent defensive redirect as a second guard (see the resume-redirect decision for which signal it keys off).

The gap this closed: the `?phone=` resume path previously only checked `dataConsentGiven`, never completion status — a fully-submitted therapist could reopen the form via an old or bookmarked link and resubmit, overwriting her live suppliers document.

On successful submit the entire accordion (including Section 8) is hidden immediately and replaced by the success screen, then redirects to info.html after 3 seconds. No window exists where post-submit photo edit/delete is reachable.
