---
title: "SwiftData errors in Xcode 15 Beta 6: Type 'PropertyOptions' has no member 'cascade'"
date: 2023-08-10
source: microblog
originalUrl: "/2023/08/10/swiftdata-errors-in.html"
---

EDIT: As of XCode Beta 7, you need to add the default value back in.

![CleanShot 2023 08 22 at 15 54 39 2x](/images/posts/swiftdata-errors-in/cleanshot-2023-08-22-at-15.54.392x.png "CleanShot 2023-08-22 at 15.54.39@2x.png") Original Post:

I upgraded to Xcode 15 Beta 6, and found some new errors in my SwiftData Project.

![Xcode error: Type 'PropertyOptions' has no member 'cascade'](/images/posts/swiftdata-errors-in/cleanshot-2023-08-10-at-13.13.432x.png "CleanShot 2023-08-10 at 13.13.43@2x.png")

On my @Relationship macros, using .cascade, I now have the error “Type ‘PropertyOptions’ has no member ‘cascade’”

We need to add deleteRule: .cascade instead.

![CleanShot 2023 08 10 at 13 19 45 2x](/images/posts/swiftdata-errors-in/cleanshot-2023-08-10-at-13.19.452x.png "CleanShot 2023-08-10 at 13.19.45@2x.png")

But now we see a new error. “Variable ‘self.\_$backingData’ used before being initialized”

We can no longer set default values where we declare the variables. Removing the = \[\] takes care of the error. (And I did not need to add it to the initializer.)

Final, working code:

![CleanShot 2023 08 10 at 13 23 40 2x](/images/posts/swiftdata-errors-in/cleanshot-2023-08-10-at-13.23.402x.png "CleanShot 2023-08-10 at 13.23.40@2x.png")
