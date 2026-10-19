---
title: Does a geofence reminder app track your location?
seoTitle: Does a Geofence Reminder App Track Your Location?
description: How on-device geofence detection actually works, what data (if any) leaves your phone, and the specific questions worth asking before you trust an app with your location.
socialDescription: How on-device geofence detection actually works, and the specific questions worth asking before you trust an app with your location.
summary: How on-device detection works, what "0 coordinates on our servers" actually means, and the questions worth asking about any location app.
tag: Privacy
published: 2026-09-09
lede: "Fair question, and the honest answer is: it depends entirely on how the app is built. Here's what's actually happening under the hood, and how to tell the difference between an app that watches your boundaries and one that logs your life."
cta: "Reembr answers all three questions plainly: detection is on-device, nothing about your comings and goings leaves your phone, and every saved place is visible and deletable right in the app. Free on iOS and Android."
surface: blog_privacy_explainer
related:
  - what-is-a-geofence-reminder
  - best-apps-for-remembering-things-before-you-leave-the-house
faq:
  - q: Does Reembr upload my location to a server?
    a: No. Every boundary check happens on your phone, using the OS's own geofencing system. Your saved places and every arrival or departure event stay on your device and are never uploaded to Reembr's servers.
  - q: What questions should I ask before trusting a location app with my data?
    a: "Ask three things: does the detection happen on the device or on a server, does anything about where you've been ever leave your phone, and can you see exactly what data the app is keeping. A privacy-serious app should be able to answer all three plainly."
---

We covered the basic mechanics of geofencing in [a separate explainer](/blog/what-is-a-geofence-reminder), worth reading first if you want the fundamentals. This post goes deeper on the specific privacy question, because it's the one people actually worry about, and it deserves a real answer rather than a reassurance.

## On-device detection vs. server-side tracking

There are two fundamentally different ways an app can implement "notify me when I leave a place." The first: the app registers your saved locations with your phone's operating system, and the OS itself, running entirely on your device, checks whether you've crossed a boundary. Nothing about where you are needs to leave your phone for this to work.

The second: the app sends your live GPS coordinates to a server on some interval, and the server does the boundary math and pushes a notification back. This works too, but it means your location, and a timestamped history of it, exists somewhere outside your phone.

These produce the same user experience, a notification when you leave. They are not the same thing from a privacy standpoint. Nothing in the app's marketing copy will necessarily tell you which one you're getting; you have to ask, or check the privacy policy for specifics rather than platitudes.

## What "0 coordinates on our servers" actually means

Reembr's homepage makes this claim directly, and it's worth being specific about what it means technically rather than just trusting the phrase. It means: your saved place coordinates, the polygon or radius that defines each boundary, and the timestamped record of when you crossed one, all of that lives in local storage on your phone. It is never transmitted to Reembr's backend, not in a request log, not in an analytics event, not anywhere. The app can function entirely offline for this core feature because there's no server round-trip required to check a boundary.

## Questions worth asking about any location app

Instead of asking the vague question "does this app use my location," which almost every location-aware app will answer "yes" to honestly, ask these three, more specific questions:

- **Does the boundary check happen on the device, or on a server?** On-device means your coordinates don't need to travel anywhere for the core feature to work.
- **Does anything about where you've been leave your phone?** A history of your arrivals and departures is a different, more sensitive thing than a single boundary check, and some apps that do on-device detection still upload a log for "insights" or "sync" features.
- **Can you see exactly what data the app is keeping?** A settings screen that shows your saved places and lets you delete them is a good sign. An app that's vague about what it stores, or makes it hard to find, usually is hiding something worth asking about.

Any app that takes privacy seriously should be able to answer all three plainly, without hedging. If an app can't or won't, that's the answer.
