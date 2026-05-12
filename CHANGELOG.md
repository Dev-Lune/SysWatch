# Changelog

All notable changes to SysWatch will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
