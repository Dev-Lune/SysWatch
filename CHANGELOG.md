# Changelog

All notable changes to SysWatch will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] · 2026-11-10

Desktop 0.2.0 and Android 1.1.0. The Android version reaches Google Play separately; local mode needs it.

### Added

**Both apps**
- Local mode: the phone connects straight to the PC over Wi-Fi on one fixed port (47800). No account, no internet, instant updates. Chosen when the desktop app first opens, changeable in Settings.
- Tailscale support: the pairing QR carries the PC's Tailscale address too, so local mode works away from home.
- Update notices: the Android app uses Google Play in-app updates and shows what changed; the desktop app checks for a newer release.
- Sponsor link.

**Android**
- New design: one matte panel, big readable numbers, one accent colour, and each alert limit drawn as a red line on its gauge.
- First-run setup: pick accent, theme and layout, then pair.
- Choose your accent colour; light, dark and true black themes.
- Choose which Overview cards show and in what order; roomy or compact layout.
- Phone, tablet and landscape layouts.
- 24 standby faces (16 instruments, 8 art) with a gallery to pick from, in portrait and landscape.
- Home screen widget in four looks: rings, bars, numerals, trace.
- Alerts written as plain sentences, with one-tap starter alerts.
- Targets Android 16 (API 36).

**Desktop**
- Connection choice (Cloud or Local) on first run and in Settings.
- Pairing screen lists the PC's addresses and labels the Tailscale one.

### Fixed

**Desktop**
- Typing 0 as the publish interval could make the app crash at every launch.
- Two tray icons appeared.
- A fresh install could start without a pairing code.
- Cloud settings entered in setup did nothing until a restart.
- The phone saw the PC as offline for the first 30 seconds after launch.
- The close dialog could stay stuck with its buttons disabled.
- "Remember my choice" on close was forgotten after changing a setting.
- Newly plugged drives and network adapters were not noticed.
- Log files grew without limit.
- A startup problem with the system keychain left no window and no message.
- Disk speed was shown eight times too low.
- Fan speed showed a temperature. It is now left out when there is no real reading.
- Pause did not show straight away.

**Android**
- Network alerts compared the wrong unit. A limit in Mbps is now really Mbps.
- "Storage used" alerts now use all drives together, the same figure the card shows.
- Readings the PC does not send (memory type, clock speeds, thread counts) are no longer shown as if known.

### Known limits

- Windows only. Linux and macOS builds are planned; none has been made or tested.
- The Windows installer is not code signed.
- Local mode is not encrypted on the local network. Use it on networks you trust, or over Tailscale.

---

## [0.1.0] — 2026-05-12

### Added

**Desktop Agent**
- System tray operation with left-click toggle and right-click context menu
- CPU sampling: total %, per-core, frequency, temperature, core count, vendor/brand
- RAM sampling: used/total/available, swap
- GPU sampling via NVML (NVIDIA) with sysinfo fallback for AMD/Intel
- Disk usage per volume + aggregate read/write IO throughput
- Network upload/download throughput + lifetime byte counters
- Battery percentage, state, and time remaining
- System uptime, process count, fan speed (RPM + GPU %)
- 6-character Crockford-alphabet pairing code (no ambiguous chars)
- QR code generation for mobile pairing
- 2-second Supabase Realtime broadcast to `watch_code_<CODE>` channel
- 30-second heartbeat to `active_nodes` table
- OS keychain storage for secrets (machine_id, pairing code, Supabase creds)
- Config file for non-sensitive preferences
- Onboarding flow for Supabase configuration
- Compile-time env var support for CI-baked defaults
- Daily rotating log files with configurable verbosity
- Single-instance enforcement
- Pause/resume publishing from tray
- Process-list broadcasting (opt-in privacy toggle)

**Android Companion**
- Premium dark glass dashboard with gradient backgrounds
- 3-column hardware cards (CPU, GPU, Memory) with circular meters
- Real-time waveform sparkline graphs
- Storage + Network cards
- Battery card
- Bottom stat strip (Uptime, Temp, Processes/Battery, Power)
- Landscape standby showcase mode (immersive, keeps screen on)
- Alert system with custom threshold rules and notifications
- Settings: theme, units, sparkline window, power options, pairing
- 6-slot OTP code input with paste + QR scan
- Camera permission request for QR scanning
- Deep link pairing (`syswatch://pair?code=XXXXXX`)
- Glance home screen widget (3 responsive sizes)
- Foreground service for background WebSocket subscription
- Auto-reconnect with connection state indicators
- Export/import alert rules

**Infrastructure**
- Supabase migration: `active_nodes` table with RLS policies
- GitHub Actions release workflow (Windows/macOS/Linux matrix)
- CI pipeline with TypeScript type checking

---

© 2026 DevLune Studio · [devlune.in](https://devlune.in)
