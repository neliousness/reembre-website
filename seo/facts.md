# Reembr: product facts for blog posts

The only source of product claims for blog copy. If a post needs a fact that is not here,
check the app repo (`docs/SPEC.md`, `docs/product-backlog.md`) and ask the founder before
publishing; then add it here. Last checked: 2026-10-19.

Sources: `docs/SPEC.md` §1 to §3, `marketing/launch-content-pack/copy/do-not-post.md`,
the live landing page, and the published posts.

## What it is

- **Reembr** shows a checklist after you leave a saved place, so you can turn back for what you
  forgot while it is still easy. It was called *Don't Forget* until June 2026.
- The name is often read as a misspelling of "remember". Write "Reembr" exactly.
- One-line description: "A checklist that shows up after you leave a saved place."

## How it works (safe to state)

- You save places ("spots") on a map and attach a checklist to each one.
- Each place has a **Runs when** setting: **Leave**, **Arrive**, or **Both**. Arrival checklists
  are for chores that only make sense once you are home (laundry, plants, trash night).
- A place can have more than one checklist.
- A place can be a circle or a custom perimeter you draw on the map.
- When the checklist appears, you confirm items with a hold-to-confirm row.
- During onboarding the app asks what you usually forget and seeds a first checklist from it.
- Detection uses the phone's built-in geofencing (iOS and Android OS services), not continuous GPS.
- Sign in with Apple, Google, or email.

## Timing (be careful)

- The reminder fires **after you have moved some real distance from the place**, with buffers and
  confirmation delays on top. It is not instant and not at the doorway.
- Say: "after you leave, while turning back is still easy", "notices you've left".

## Privacy (non-negotiable, do not soften)

- Saved places, their coordinates and perimeters, and every arrival or departure **stay on the
  phone**. They are never uploaded.
- The backend holds accounts, purchase status, support tickets, and analytics identity. It never
  holds place locations or movement history.
- Do not say "we collect no data" or "no account needed": there are accounts and anonymous
  product analytics. The accurate claim is about **location data**.

## Platforms and price

- iPhone (App Store) and Android (Google Play).
  - App Store: https://apps.apple.com/us/app/reembr/id6777085237
  - Google Play: https://play.google.com/store/apps/details?id=dev.dicemz.reembrapp
- Android: background location needs Android 10 or newer. Some Samsung (One UI) phones need
  battery optimization turned off for the app so reminders fire reliably.
- **Free to download and use.** Do not quote prices, tiers, or what is "Pro" in posts until the
  founder confirms the current paywall state.

## Who makes it

- Built by a solo founder. Small, honest, and specific beats corporate.
- Posts are currently published as the organization "Reembr" (no personal byline yet).

## Claims we never make

The automated check (`npm run blog:check`) fails a post that contains any phrase below
(case-insensitive). Add phrases here as new mistakes are found.

```banned
the moment you leave
the moment you head out
the second you leave
the instant you leave
instantly
before the door clicks
at the doorway
at your doorway
never forget
never leave without
perfect reminder
always works
100% private
we collect no data
no data collected
```

Also avoid, by judgement (not machine-checked):

- Overpromising: "never", "always", "perfect", "foolproof".
- Leading with "productivity" or with "geofencing" in intros and CTAs. Geofencing is fine in
  explainer posts about the technology.
- Fake social proof: no invented quotes, reviews, user counts, or testimonials.
- Medical claims: ADHD content stays general, cites reputable sources, and never diagnoses or
  promises treatment.
- Emoji and em dashes in any copy.
