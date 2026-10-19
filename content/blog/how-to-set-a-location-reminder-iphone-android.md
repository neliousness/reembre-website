---
title: How to set a location-based reminder on iPhone and Android
seoTitle: How to Set a Location-Based Reminder on iPhone and Android
description: How to set a location-based reminder on iPhone with Apple Reminders, and on Android now that Google Keep dropped them, plus why leave alerts come late.
socialDescription: Current steps for Apple Reminders, what works on Android after Google Keep dropped location reminders, and why leave alerts come a little late.
summary: Current steps for Apple Reminders, what still works on Android after Google Keep dropped location reminders, and what to do once one reminder isn't enough.
keyword: location-based reminder
tag: How-to
published: 2026-09-09
updated: 2026-10-19
lede: "To set a location-based reminder on iPhone, open Reminders, add a reminder, tap the Location button, pick a place, and choose Arriving or Leaving. Android is harder now: Google Keep dropped location reminders in late 2025, so you need Samsung's Reminder app or a third-party app. Steps for both below."
cta: "Reembr picks up where the native options stop: a recurring checklist per place, running on leaving, arriving, or both, with detection that stays entirely on your phone. Free on iOS and Android."
surface: blog_native_howto
related:
  - google-keep-location-reminders
  - ways-to-remember-keys-wallet-charger-before-you-leave
  - best-apps-for-remembering-things-before-you-leave-the-house
faq:
  - q: How do I set a location reminder on iPhone?
    a: Open Reminders, create a reminder, and tap the Location button. Pick a suggested place or tap Custom to search for an address, choose Arriving or Leaving, and adjust the perimeter. Location Services must be on. You can also tell Siri, "Remind me when I leave here to stop by the grocery store."
  - q: Can Google Keep still do location reminders?
    a: No. Google removed location reminders from Keep when it moved Keep's reminders into Google Tasks, starting in October 2025. Google Tasks only supports date and time reminders, so on Android you now need Samsung's Reminder app or a third-party app.
  - q: Why did my leaving reminder go off after I'd already left?
    a: That's how phone geofencing works. The phone has to be confident you've actually crossed the boundary, and Android checks background geofences roughly every two minutes, so a leave reminder usually arrives shortly after you've gone rather than at the door.
---

## How to set a location reminder on iPhone

Apple Reminders has built-in location reminders that can fire when you arrive at or leave a place. These steps follow [Apple's current Reminders guide](https://support.apple.com/en-us/102484):

1. Open the **Reminders** app and tap **New Reminder**, or open an existing reminder.
2. Tap the **Location** button in the toolbar above the keyboard. (You can also tap the info button next to a reminder and turn on **Location** there.)
3. Pick one of the suggested places, such as your current location or the home and work addresses on your Contacts card, or tap **Custom** to search for any address.
4. Choose **Arriving** or **Leaving**.
5. Drag to set the perimeter around the place. A larger area fires earlier on arrival and later on leaving.
6. Tap **Done**.

Location reminders only work if Location Services is on: open Settings, then **Privacy & Security**, then **Location Services**.

### Set one with Siri

You can skip the menus and say it out loud. Apple's examples are "Remind me when I get home to check the mail" and "Remind me when I leave here to stop by the grocery store." For "home" and "work" to work, add those addresses to your own card in Contacts (Contacts, then **My Card**, then **Edit**).

<!-- TODO screenshot: iPhone Reminders, Custom location screen with Arriving and Leaving and the perimeter map -->

## How to set a location reminder on Android

Android no longer has a Google option for this. Google Keep lost its location reminders when Keep's reminders moved into Google Tasks (from October 2025), Google Tasks only does dates and times, and Google Assistant dropped location reminders before that. The full story, and what happened to old reminders, is in [why Google Keep location reminders stopped working](/blog/google-keep-location-reminders).

That leaves two routes.

### Samsung Galaxy: the Reminder app

Samsung's built-in Reminder app supports both arriving and leaving. Menu names can differ slightly between One UI versions.

1. Open **Reminder** (it may be inside the Samsung folder).
2. Tap **+** and type the reminder.
3. Tap **Add location**, then search for the place or choose **Current location**.
4. Choose **Arrive** or **Leave**, adjust the radius, and save.

### Any Android phone: a third-party app

On other phones, install an app that has location reminders. Look for both leave and arrive triggers, background operation with the app closed (Android 10 or newer), and a clear answer on whether your places stay on the phone.

Whichever app you use, give it location access **Allow all the time** and set its battery use to **Unrestricted** in the app's settings. Without those two, Android can stop it from reacting to location changes in the background, which is the most common reason these reminders never fire.

## Why does a leaving reminder go off a little late?

On both iPhone and Android, location reminders use the phone's built-in geofencing: the app registers a boundary around a place, and the operating system watches for you to cross it using GPS, Wi-Fi and cell towers. To avoid false alarms from a jumpy location fix, the phone waits until it's confident you're outside the boundary before firing.

On Android there's an extra delay for apps in the background. Google's documentation says [geofence responsiveness is about two minutes](https://developer.android.com/guide/topics/location/battery) for background apps, instead of tens of seconds. So a "leaving" reminder typically arrives after you've walked or driven a little way, not as you close the door. For more on how this works, see [what a geofence reminder is](/blog/what-is-a-geofence-reminder).

That delay is why a leaving reminder works best for things you can still turn back for: you're a minute or two down the road, not twenty.

## Where one-off reminders run out

A native location reminder is good for one thing, once. It runs out quickly when you want more than that:

- **It isn't a checklist.** Keys, wallet, charger and badge become one long reminder title, or four separate reminders.
- **It doesn't repeat per place.** A reminder for leaving home fires once and then it's done, so you're recreating it for every trip.
- **One trigger per reminder.** There's no way to have a place run one list when you leave and a different one when you arrive.
- **It's easy to lose track of.** There's no overview of which places have reminders attached.

If what you actually want is the same short checklist every time you leave or arrive somewhere, that's a different tool from a one-off reminder.
