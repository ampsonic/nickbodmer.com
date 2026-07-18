---
title: "Deploying your app on-device after becoming a paid Apple Developer"
date: 2023-07-09
source: microblog
originalUrl: "/2023/07/09/deploying-your-app.html"
---

I’ve been working on an app, and as a ‘free’ Apple Developer, I’ve just been running my app on-device. This leaves the app on my phone for a few days, but you are quickly hit with this error:

### "App Name" is no longer available.

Since my app was starting to come along, I decided it was time to pay the $99 fee and become a full Apple Developer. Took a few days after submiting my application, but soon enough I was approved.

I continued working on my app, and was surprised to quickly run into the same error message. I thought that becoming a paid developer would “automatically” fix this, but there’s a process to deploying your app on a device for testing.

I found my way to the [Distributing your app to registered devices](https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices) guide.

It breaks down into a few steps:

1.  Collect Device identifier
2.  Register device on the Apple Developer website
3.  Update Provisioning profile
4.  Archive the app
5.  Export the app
6.  Install app on the device

To make matters easier, some of these steps were already completed.

My device identifier was already registered (perhaps because the device is tied to my apple id already?)

No provisioning profile was needed, as by default, you get “automatic signing”.

### Steps needed

Archive and distribute:

-   Product > Archive
-   Distribute App > Ad hoc

![CleanShot 2023 07 09 at 20 09 00 2x](/images/posts/deploying-your-app/f11974a638.png "CleanShot 2023-07-09 at 20.09.00@2x.png")

-   Ad hoc distribution options: keep defaults
-   Automatically manage signing
-   Export to a location on disk.

> When you save the exported app, Xcode creates a folder that contains a few files, including the iOS App file, which is a file with an .ipa filename extension. Distribute that file to your users so they can install it on their devices by using Xcode or Apple Configurator 2.

![CleanShot 2023 07 09 at 20 22 47 2x](/images/posts/deploying-your-app/cleanshot-2023-07-09-at-20.22.472x.png "CleanShot 2023-07-09 at 20.22.47@2x.png")

-   Window > Devices and Simulator
-   Select your iOS device
-   Click the + icon under "installed apps" (even if your app is already listed)
-   Select the .ipa file that you exported earlier.
-   Done!
