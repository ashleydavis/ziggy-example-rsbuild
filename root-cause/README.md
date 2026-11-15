# Root cause: Release Android app-build fails linking Android resources

## The failure

- Run: https://github.com/ashleydavis/ziggy-example-rsbuild/actions/runs/43765523329 (Release Android, commit 1844767, "Moved to Ziggy v0.0.25").
- Job: `app-build`, step `Build` (`bun run build:android`).
- Failing line:

```
> Task :app:processDebugResources FAILED
dev.ziggy.examplersbuild.app-mergeDebugResources-5:/values-v31/values-v31.xml:6: error: style attribute 'android:attr/postSplashScreenTheme' not found.
error: failed linking references.
```

- History: `app-build` passed on 58bc283 (run 43679577212) and has failed on every push since, starting with 653433a (run 43680547151). It is a constant break, not an intermittent failure.

## Root cause

Commit 653433a added this line to `native/android/app/src/main/res/values-v31/styles.xml`:

```
<item name="android:postSplashScreenTheme">@android:style/Theme.DeviceDefault.NoActionBar</item>
```

The Android framework has no attribute called `postSplashScreenTheme` (the app compiles against SDK 35), so aapt2 cannot link the style and the build stops. The line was written by Ziggy's `scripts/generate-app-assets.sh` (line 274 in Ziggy v0.0.25), which writes it into every app's `values-v31/styles.xml` when the icons and splash screens are regenerated. `postSplashScreenTheme` belongs to AndroidX's `core-splashscreen` library and is used without the `android:` prefix; the framework's own splash attributes are `windowSplashScreen*` and `splashScreenTheme`.

## The experiment that proves it

`root-cause/repro.sh` runs only `:app:processDebugResources` (the failing task), locally, with JDK 17 and the Android SDK, skipping `checkZiggySync` (it only checks the native library is present, which resource linking does not use).

| Side | Commit | Change | Result |
| --- | --- | --- | --- |
| Cause present | f7e84f2 (1844767 plus the reproducer) | none | `processDebugResources FAILED`, same error as CI |
| Cause removed | 29e5f12 | only the `android:postSplashScreenTheme` line removed | `BUILD SUCCESSFUL` |

Nothing else differs between the two sides.

## Files

- `repro.sh`: the reproducer. Run it from the repository root with JDK 17 and `ANDROID_HOME` set: `bash root-cause/repro.sh`.
- `local-with-attribute.log`: the reproducer's full output on f7e84f2, failing with the CI error.
- `local-without-attribute.log`: the reproducer's full output on 29e5f12, succeeding.
- `framework-splash-attributes.txt`: every splash attribute the framework defines in android-33, 34, 35, 36 and 36.1 (`aapt2 dump resources` of each `android.jar`). None is `postSplashScreenTheme`.
- `ci-43765523329-app-build-failed.log`: the failed job's log from the run under investigation.
- `ci-43680547151-app-build-failed.log`: the first failed run, on 653433a, failing with the same error.
- `ci-43679577212-app-build-passed.log`: the last passing `app-build`, on 58bc283, where `processDebugResources` succeeded.
