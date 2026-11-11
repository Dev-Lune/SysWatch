# SysWatch 0.3.0 release notes

**Released:** 11 Nov 2026 · **Desktop:** Windows 10 / 11, 64-bit · **Android app:** 1.2.0 · **Website:** [syswatch.devlune.in](https://syswatch.devlune.in)

## Download

| File | For |
|---|---|
| `SysWatch_0.3.0_x64-setup.exe` | Most people. Run it and follow the installer. |
| `SysWatch_0.3.0_x64_en-US.msi` | IT-managed PCs that need an MSI. |

Windows SmartScreen will warn that the installer is unrecognised, because it is not code signed yet. Choose **More info**, then **Run anyway**.

## What is new since 0.2.1

- **Now playing.** The phone shows what your PC is playing, with its cover, on Overview and in five music standby faces. Local and Tailscale only: it never goes through the cloud.
- **Play, pause and skip from the phone**, in Local and Tailscale mode. On by default; switch it off in Settings on the PC.
- **Your language.** The Windows app is now in English, German, French, Spanish and Russian. It starts in your Windows language; change it in setup or Settings. New text arrives without an update.
- **Three looks.** Keep the original glass, or pick Bold light or Bold dark in setup or Settings. If you are updating, nothing changes until you choose.
- **Lightweight mode.** Hidden in the tray, SysWatch now uses about 55 to 73 MB instead of about 500 MB, and under half a percent of one CPU core.
- **Cloud sends at most every 2 seconds.**
- **The tray menu** follows your language, even when the window has never been opened.

The full list is in the [changelog](./CHANGELOG.md).

## Updating

Install 0.3.0 over the old version. Your pairing code and settings are kept.

**Now playing needs Android app 1.2.0**, which reaches Google Play separately. Everything else works with the Android app you have.

---

# SysWatch 0.2.1 release notes

**Released:** 11 Nov 2026 · **Desktop:** Windows 10 / 11, 64-bit · **Website:** [syswatch.devlune.in](https://syswatch.devlune.in)

## Download

| File | For |
|---|---|
| `SysWatch_0.2.1_x64-setup.exe` | Most people. Run it and follow the installer. |
| `SysWatch_0.2.1_x64_en-US.msi` | IT-managed PCs that need an MSI. |

Windows SmartScreen will warn that the installer is unrecognised, because it is not code signed yet. Choose **More info**, then **Run anyway**.

## What is new since 0.2.0

- **Guided first run.** Choose Local, Cloud by DevLune or Tailscale, follow the steps, scan the code.
- **More real readings.** Battery health, cycles, voltage and temperature; network ping, jitter and loss.
- **No more blanks.** A reading your PC cannot give is hidden, not shown as a dash.
- **A proper icon** on the taskbar and desktop.

The full list is in the [changelog](./CHANGELOG.md).

## Updating

Install 0.2.1 over the old version. Your pairing code and settings are kept.

**Local and Tailscale need the newest Android app** (1.1.0), which reaches Google Play separately. Until it does, Cloud by DevLune works with the Android app you already have.

---

# SysWatch 0.2.0 release notes

**Released:** 10 Nov 2026 · **Desktop:** Windows 10 / 11, 64-bit · **Android app:** 1.1.0, not on Google Play yet at the time of this release

## Download

| File | For |
|---|---|
| `SysWatch_0.2.0_x64-setup.exe` | Most people. Run it and follow the installer. |
| `SysWatch_0.2.0_x64_en-US.msi` | IT-managed PCs that need an MSI. |

Step by step guide: <https://devlune.in/download/syswatch>

Windows SmartScreen will warn that the installer is unrecognised, because it is not code signed yet. Choose **More info**, then **Run anyway**.

## What is new

- **Local mode.** Connect the phone straight to the PC over Wi-Fi. Instant, private, no internet needed.
- **Tailscale.** Use local mode from anywhere.
- **A redesigned Android app** with your own accent colour, themes, card order, standby faces and widget looks.
- **Thirteen desktop reliability fixes**, including a crash loop and a missing pairing code on fresh installs.
- **Update notices** in both apps.

The full list is in the [changelog](./CHANGELOG.md).

## Updating from 0.1.0

Install 0.2.0 over the old version. Your pairing code and settings are kept, and the app stays in Cloud mode, exactly as before. To try Local mode, open Settings, switch the connection to Local, and scan the new QR code with the phone.

**Local mode needs Android app 1.1.0 or newer.** Until that version reaches Google Play, stay on Cloud mode: the current Play version (1.0) does not understand local pairing codes.

## Known limits

- Windows only for now.
- Not code signed.
- Local mode is unencrypted on the local network.

---

# SysWatch v0.1.0 release notes

**Release Date:** 2026-05-12  
**Platform:** Windows x64  
**Installers:** MSI, NSIS (exe)

---

## Overview

SysWatch v0.1.0 is the first public release of the low-footprint desktop agent that samples hardware telemetry and streams it to a paired mobile client via Supabase Realtime.

Built on **Tauri v2 + Rust + React**, SysWatch runs silently in the system tray and broadcasts real-time metrics to the Android companion app over a secure, code-based pairing system: no accounts, no cloud auth.

---

## Downloads

| Installer | File |
|-----------|------|
| NSIS Setup | `SysWatch_0.1.0_x64-setup.exe` |
| MSI Package | `SysWatch_0.1.0_x64_en-US.msi` |

---

## What's New

This is the initial release. All features listed in `FEATURES.md` are shipping for the first time.

---

## System Requirements

- Windows 10 (1809+) or Windows 11
- x64 architecture
- ~50 MB disk space
- Internet connection (for Supabase streaming to mobile)
- WebView2 runtime (bundled with Windows 11; auto-installed on Windows 10)

---

## Known Limitations

- CPU temperature may show as unavailable on some systems where sysinfo cannot access WMI sensors without admin privileges.
- Fan speed requires hardware sensor support (common on laptops, less so on desktops without fan headers reporting to OS).
- GPU metrics require NVIDIA GPU with NVML driver; AMD/Intel GPUs fall back to sysinfo component sensors.

---

## Installation

1. Download the NSIS installer (`SysWatch_0.1.0_x64-setup.exe`) or MSI package.
2. Run the installer. No admin required for per-user install.
3. On first launch, enter your Supabase project URL and anon key in the onboarding screen.
4. A 6-character pairing code is generated and saved.
5. The tray icon appears and the main window hides.
6. Open the Android companion app and enter the pairing code to start streaming.

---

## Support

- ⭐ Star the repo → [github.com/Dev-Lune/SysWatch](https://github.com/Dev-Lune/SysWatch)
- 💬 Discord → [discord.gg/BXu9qxgaE8](https://discord.gg/BXu9qxgaE8)
- 🐛 Issues → [github.com/Dev-Lune/SysWatch/issues](https://github.com/Dev-Lune/SysWatch/issues)

---

© 2026 DevLune Studio · [devlune.in](https://devlune.in)
