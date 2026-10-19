---
title: Google Keep location reminders not working? Here's why, and what to use now
seoTitle: Google Keep Location Reminders Not Working? They're Gone
description: Google Keep location reminders stopped working when Keep moved reminders to Google Tasks in late 2025. What changed, and what works on Android now.
socialDescription: Google removed location reminders from Keep in the move to Google Tasks. What happened, and what still works on Android.
summary: Keep's "Pick place" reminders didn't break on your phone. Google removed them in the move to Google Tasks. Here's what changed and what still works.
keyword: google keep location reminder
tag: How-to
published: 2026-10-19
lede: "If your Google Keep location reminder never went off, your phone isn't broken. Google removed location reminders from Keep when it moved Keep's reminders into Google Tasks, starting in October 2025, and Google Tasks has no location triggers. Below: what changed, what happened to the reminders you already had, and what still works on Android."
cta: "Reembr gives every saved place its own checklist, set to run when you leave, arrive, or both, on Android and iPhone. Detection runs on your phone and your places never leave it. Free to download."
surface: blog_google_keep_location
related:
  - how-to-set-a-location-reminder-iphone-android
  - best-apps-for-remembering-things-before-you-leave-the-house
  - what-is-a-geofence-reminder
faq:
  - q: Did Google remove location reminders from Google Keep?
    a: Yes. When Keep's reminders moved into Google Tasks, starting in October 2025 and reaching all accounts by January 2026, the option to set a reminder for a place went away. Google Tasks only supports date and time reminders, so there is nothing to trigger a place-based alert.
  - q: Does Google Tasks have location reminders?
    a: No. Google Tasks reminders are based on dates and times only. If a migrated Keep reminder had a place, the place name was copied into the task's description as plain text, and it won't send a notification when you get there.
  - q: How do I get location reminders on Android now?
    a: On a Samsung Galaxy phone, the built-in Reminder app can alert you when you arrive at or leave a place. On any other Android phone you need a third-party app with location reminders. Whichever you use, allow location access all the time and set the app's battery use to Unrestricted.
---

## What happened to Google Keep location reminders?

Google moved all of Keep's reminders into Google Tasks, and location reminders didn't survive the move. Tasks only supports reminders tied to a date and time, so the "Pick place" option, along with Home and Work, is gone from Keep.

The change rolled out in stages:

- **October 14, 2025:** Google started moving Keep reminders into Tasks. The reminder sheet in Keep began saying your reminders are saved in Google Tasks, and [9to5Google reported](https://9to5google.com/2025/10/14/google-keep-tasks-reminders-rolling-out/) that location reminders were no longer available.
- **November 2025:** the rollout widened.
- **January 2026:** the change reached all Google accounts, on Android, iPhone and the web at the same time, [according to 9to5Google](https://9to5google.com/2026/01/15/google-keep-reminders-migration-tasks-wide/).

Keep also stopped sending reminder notifications itself. Alerts for Keep reminders now come from the Google Tasks or Google Calendar app, so one of those needs to be installed for even time-based Keep reminders to reach you.

## What happened to the location reminders you already had?

Existing location reminders were converted into ordinary tasks. The place you had picked was copied into the task's description as text, so you can still see where it was meant to fire, but it will never notify you when you get there.

A few other things to know if you're cleaning up:

- Migrated reminders show up in Google Tasks and in the Google Calendar grid with a "From Keep" label that opens the original note.
- One-off reminders older than a year were moved into a separate list called "Old Google Keep reminders."
- Deleting the task in Tasks or Calendar leaves the Keep note in place.

If a reminder only made sense at a place, like "grab the parcel when I leave work," it's worth recreating it somewhere that can still trigger on location. Otherwise it will sit in Tasks with no date and quietly never fire.

## Can Google Tasks, Gemini or Google Assistant do it instead?

No. As of October 2026, none of Google's own reminder tools can trigger on a place:

- **Google Tasks** has date and time reminders only.
- **Google Assistant** lost location reminders earlier. In 2022 Google added a note to its help pages saying the option was going away and suggested time-based reminders or location-based routines instead, [as Android Central reported](https://www.androidcentral.com/apps-software/google-assistant-is-losing-some-features-that-you-may-have-never-used).
- **Gemini** creates and edits reminders in Google Tasks, so it inherits the same limit. Asking it to remind you "when I get home" won't produce a reminder that fires on arrival.

So the fix isn't a setting you missed. On Android, location reminders now come from your phone maker or from a third-party app.

## What still works on Android

### Samsung Galaxy phones: the Reminder app

Samsung's own Reminder app still supports place-based reminders, for both arriving and leaving. The steps below follow [SamMobile's April 2026 guide](https://www.sammobile.com/news/how-do-i-set-a-location-based-reminder-on-my-phone/); menu names can differ slightly between One UI versions.

1. Open **Reminder** (it may be inside the Samsung folder).
2. Tap **+** and type what you need to remember.
3. Tap **Add location** (the location icon).
4. Search for the place, or choose **Current location** if you're there now.
5. Choose **Arrive** or **Leave**.
6. Adjust the radius if you need to, then save.

You can also ask Bixby, for example "remind me to call Mom when I get home."

<!-- TODO screenshot: Samsung Reminder app, location trigger screen showing Arrive and Leave -->

### Any Android phone: a third-party app

If you don't have a Samsung phone, you need an app that registers its own geofences with Android. Things worth checking before you pick one:

- **Leave and arrive triggers.** Plenty of apps only do arrival, and most forgetting happens on the way out.
- **It works with the app closed.** That requires background location permission, which only exists on Android 10 and newer.
- **Where your places are stored.** Some apps keep everything on your phone; others sync places to their servers.

Two options that fit: [Tasks.org](https://tasks.org), an open-source to-do app with arrive and leave reminders in its Play Store version (location reminders don't sync through a Google Tasks account), and Reembr, which attaches a checklist to each place rather than a single reminder. For a wider comparison, see [the best apps for remembering things before you leave](/blog/best-apps-for-remembering-things-before-you-leave-the-house).

## How do you make a location reminder fire reliably on Android?

Most "my location reminder didn't go off" problems on Android come down to permissions and battery settings, not the app. From building Reembr's Android version, these are the settings that matter:

1. **Location: Allow all the time.** Open Settings, then Apps, pick the app, then Permissions, Location, and choose **Allow all the time**. "Only while using the app" means the reminder can't fire when the app is closed.
2. **Battery: Unrestricted.** In the same app settings, open Battery and choose **Unrestricted**. Battery optimization can stop the app from receiving location events in the background.
3. **Samsung only: keep it out of sleeping apps.** On recent One UI versions, go to Settings, Battery, Background usage limits, and add the app to **Never sleeping apps**.
4. **Notifications on.** Check the app's notification permission, especially after restoring a backup to a new phone.

Even with everything set up, expect a short delay. Android's own documentation says that for apps in the background, [geofence responsiveness is about two minutes](https://developer.android.com/guide/topics/location/battery) rather than tens of seconds. In practice that means a leave reminder arrives a little after you've gone, not at your front door. If you want to understand why, our explainer on [what a geofence reminder is](/blog/what-is-a-geofence-reminder) covers how the phone detects this.

## One-off reminder or a leaving checklist?

A single location reminder is fine for something that happens once: "pick up the dry cleaning when I leave work." It's a poor fit for the things you need every time you leave a place, like keys, wallet, charger, badge or gym bag. You'd have to recreate the reminder every day, and a long reminder title is easy to skim past.

That's the gap Reembr is built for. You save a place, attach a short checklist, and choose whether it runs when you leave, arrive, or both. It runs every time, not once.

<figure class="article-figure">
  <img
    src="/blog/inline/inline-trigger-mode.jpg"
    alt="Reembr's checklist trigger settings for a saved place, with Leave, Arrive, and Both options"
    loading="lazy"
    decoding="async"
    width="560"
    height="819"
  />
  <figcaption>Each saved place in Reembr has its own checklist and a Leave, Arrive, or Both setting.</figcaption>
</figure>

If you're also setting this up on an iPhone, Apple Reminders still supports location reminders natively. The steps are in our guide to [setting a location-based reminder on iPhone and Android](/blog/how-to-set-a-location-reminder-iphone-android).
