# SysWatch feature list

Current versions: desktop 0.2.0, Android 1.1.0. Added in these versions:

## Connection

| Mode | How it works | Needs |
|---|---|---|
| Cloud | The desktop app sends readings through the SysWatch cloud relay every 2 seconds; the phone subscribes. Works from anywhere. | Internet on both |
| Local | The phone connects straight to the desktop app on port 47800 and receives every sample as it is taken. | Same Wi-Fi, or Tailscale |

- Pair by scanning one QR code. It carries the code, the mode, the PC's addresses and the port.
- In local mode the phone finds the PC again by itself if the router gives it a new address.
- The phone tries each address in order: Wi-Fi first, Tailscale last.
- Read only: the phone cannot control or run anything on the PC.

## Android app 1.1.0

**Overview**
- Cards for CPU, GPU, memory, network, storage, battery and system uptime
- A history graph on every reading
- Your alert limit drawn as a red line on the gauge, bar and graph
- Show, hide and reorder cards; roomy or compact layout
- One column on a phone, a grid on tablets and in landscape

**Look**
- One accent colour, chosen by you: amber, cyan, green, violet, rose, mono, or matched to your wallpaper on Android 12 and newer
- Light, dark and true black themes

**Alerts**
- Rules as sentences: "CPU load above 90%"
- Limits on load, memory, battery, network speed, storage and temperatures
- A quiet period per alert: 1 minute, 5 minutes, 15 minutes or 1 hour
- One-tap starter alerts; export and import as a file

**Standby**
- 24 always-on faces for a phone on a stand: 16 instrument faces and 8 art faces, portrait and landscape, picked from a gallery
- Burn-in protection, optional dim after 30 seconds

**Widget**
- Four looks: rings, bars, numerals, trace
- Three sizes; shows "PC offline" when readings stop

**Updates**
- Google Play in-app updates, and a one-time list of what changed after updating

## Desktop app 0.2.0

- Choose Cloud or Local on first run; change it in Settings without restarting
- Pairing screen lists the PC's addresses and marks the Tailscale one
- Tells you when a newer version is out
- Tray icon with show, pair, pause and quit; optional start with Windows
- Windows 10 and 11, 64-bit

---

The original 0.1.0 catalogue follows.

# SysWatch v0.1.0 — Feature Catalogue

## Desktop Agent (Windows)

### System Tray Operation
- Tray-first design: main window hidden at launch
- Left-click tray icon to toggle dashboard visibility
- Right-click context menu: Show / Pair / Pause / Quit
- Single-instance enforcement — no duplicate processes

### Hardware Telemetry
| Metric | Details |
|--------|---------|
| CPU | Total usage %, per-core usage, frequency (MHz/GHz), temperature (°C/°F), core count, vendor, brand string |
| RAM | Used/Total/Available (MB/GB), swap used/total |
| GPU | Utilization %, VRAM used/total, temperature, power draw (W), fan speed (%), name, source driver |
| Disk | Per-volume used/total (GB), aggregate read/write throughput (KB/s) |
| Network | Download/upload throughput (Kbps), lifetime cumulative bytes |
| Battery | Charge %, state (charging/discharging/full), minutes remaining |
| System | Uptime, process count, fan speed (RPM) |

### GPU Support
- **NVIDIA**: Full metrics via NVML (utilization, VRAM, temp, power, fan)
- **Fallback**: sysinfo Component sensors for AMD/Intel (temp, basic util)

### Pairing System
- 6-character Crockford-alphabet code (no ambiguous chars: I, O, 0, 1)
- No accounts, no cloud auth — just enter the code on your phone
- Code persists in OS keychain via `keyring` crate
- QR code generation for easy mobile scanning

### Publishing
- 2-second broadcast interval to Supabase Realtime channel `watch_code_<CODE>`
- 30-second heartbeat upsert to `active_nodes` table
- REST transport (no WebSocket maintenance on desktop)
- Payload ~800 bytes JSON per tick
- Pause/resume publishing from tray menu

### Storage & Security
- Secrets (machine_id, pairing code, Supabase creds) stored in OS keychain
- Non-sensitive preferences in `%APPDATA%/dev.syswatch.core/config.json`
- Row-level security on Supabase: anonymous readers can only query by exact pairing code
- Process-list broadcasting off by default (privacy toggle in Settings)

### Configuration
- Onboarding flow for Supabase URL + anon key
- Compile-time env vars for CI-baked defaults
- Runtime config file override
- Works locally without Supabase (publishing disabled, dashboard still functional)

### Logging
- Daily rotating log files in app data directory
- Configurable via `SYSWATCH_LOG` environment variable
- Debug builds include stderr output

---

## Android Companion App

### Dashboard (Portrait)
- Premium dark glass UI with gradient backgrounds
- 3-column hardware cards: CPU, GPU, Memory
- Circular meters with accent-colored ring strokes
- Real-time waveform graphs (sparklines) per metric
- Storage + Network side-by-side cards
- Battery card (full width)
- Bottom stat strip: Uptime, System Temp, Processes, Power

### Standby Mode (Landscape)
- Full-screen immersive showcase — turns phone into a desk monitor
- 3-panel layout: CPU, GPU, Memory with large circular meters
- Waveform graphs per panel
- Nav rail with close button
- Auto-locks landscape, hides system bars, keeps screen on
- Bottom stat strip: Uptime, Temp, Battery, Power

### Monitor (Alerts)
- Custom threshold rules (metric > value → notify)
- Per-rule enable/disable toggle
- Cooldown period to prevent notification spam
- Export/import alert rules as JSON
- Premium dark themed cards

### Settings
- Theme: System / Light / Dark / AMOLED
- Dynamic color (Android 12+ Material You)
- Units: Metric / Imperial
- Sparkline window: configurable sample count
- Power: Keep screen on, low-power mode, persistent service
- Pairing management (unpair)

### Pairing
- 6-slot OTP-style code input with animated focus
- Paste from clipboard
- QR code scanner (Google Code Scanner via Play Services)
- Camera permission request on first scan
- Deep link support: `syswatch://pair?code=XXXXXX`
- Error shake animation on invalid codes

### Widget
- Glance-based home screen widget
- 3 responsive layouts: 2×1 compact, 4×1 wide, 4×2 tall
- Live CPU/GPU/RAM percentages with progress bars
- Matches standby mode visual language
- Auto-updates every 2 seconds while service is running
- Stale state detection (shows "Open SysWatch" when offline)

### Connectivity
- Supabase Realtime WebSocket subscription
- Auto-reconnect with exponential backoff
- Connection state indicators: Live, Sync, Retry, Paused, Offline
- Foreground service for background operation
- Presence announcer for active node tracking

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Desktop backend | Rust + Tauri v2 |
| Desktop UI | React + Vite + Tailwind + Zustand |
| Mobile | Kotlin + Jetpack Compose + Hilt + Glance |
| Transport | Supabase Realtime (REST broadcast + WS subscribe) |
| Secrets | OS keychain (keyring crate / Android Keystore) |
| GPU | NVML (NVIDIA) + sysinfo fallback |
| Packaging | NSIS + MSI (Windows), APK (Android) |

---

© 2026 DevLune Studio · [devlune.in](https://devlune.in)
