# Changelog

All notable changes to SysWatch will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] · 2026-11-19

Desktop 0.5.0 and Android 1.4.0. The Android version reaches Google Play separately and carries everything listed under 1.3.0 below, which was never published there. The tools need both.

### Added

**Both apps**
- Timers shared between PC and phone: start one on either side and both show it. Presets of 1, 5, 10 and 25 minutes, a custom length and a stopwatch. Local and Tailscale only.
- Jobs: commands you save on the PC and start from the phone. The phone only ever sends a job's number, never a command.
- More controls from the phone, all behind the "Controls from the phone" switch on the PC, which is off by default: end a task (also needs "Share processes"), turn the display off, restart and shut down. Restart and shut down wait 15 seconds and can be cancelled from the phone.

**Android**
- Four tabs: Overview, Faces, Tools and Settings. Alerts moved into Tools, with a bell on Overview.
- Faces tab: 35 standby faces in five collections (Clocks, Gauges, Graphs, Art, Music), with favourites, on one screen that adapts to portrait, landscape and tablets.
- New faces: Split, Dots, Cluster, Night, Cassette and Timer. The 16 instrument faces are redrawn to fill the screen, with new numeral fonts.
- Music faces take their colours from the cover and carry a stepped volume control with haptics.
- Tools tab: timers (with a small pill on every screen and a full timer face), volume, processes with end task, jobs and power.
- Settings is an index of pages instead of one long list. First run is five steps.
- A strip of thumbnails in standby to change face.

**Desktop**
- A Tools view with Timers and Jobs.
- A small timer window that stays on top while a timer exists; click it for the full timer face.
- Settings in seven pages: General, Look, Connection, Phone access, Readings, Advanced, About.
- Setup has a step for what the phone may do.

### Changed
- The dark background is neutral graphite in every look, on both apps. No navy.
- The process list sent over the local connection holds 12 entries (5 through the cloud, as before).

### Fixed
- Android: the fixes listed under 0.4.0 reach Google Play with this version.

## [0.4.0] · 2026-11-18

Desktop 0.4.0 and Android 1.3.0. The Android version reaches Google Play separately; the controls need both.

### Added

**Android**
- PC offline screen: when the PC stops answering, Overview shows a sleeping PC drawn in 3D, when it was last seen and what to check, instead of old numbers. It returns to live readings by itself.
- Processes card: the apps using the most CPU or memory, when "Share top processes" is on in the PC's Settings.
- Controls card: volume, mute, lock and sleep, in Local and Tailscale mode, when allowed on the PC. Sleep asks first.
- Both new cards can be hidden or reordered in Settings like the others.

**Desktop**
- System controls from the phone: volume, mute, lock and sleep. Off by default, switched on in Settings, Local and Tailscale only, protected by the pairing code and rate limited. Nothing about it goes through the cloud.
- The window can be made much smaller, down to 720 x 520. Tiles drop detail in steps (secondary rows, then the graph, then everything but the main figure) and nothing overlaps. Under 960 px wide the sidebar becomes an icon rail.

### Fixed
- Android: switching language on a Google Play install, the Overview tab not opening after a language change, and the app unpairing after a stray answer from the network.
- Desktop: double-clicking the tray icon opened the window and closed it again. A left click now always shows the window.
- Desktop: while starting, before the pairing code is loaded, the PC told the phone "wrong code". It now answers "not ready", which the phone waits out.
- Desktop: battery details stay on one line in every language; long labels were cut in half in French, Spanish and Russian.
- Desktop: in the Bold looks a short window cut the Copy and Regenerate buttons off the pairing panel.

## [0.3.0] · 2026-11-11

Desktop 0.3.0 and Android 1.2.0. The Android version reaches Google Play separately; Now playing needs it.

### Added

**Both apps**
- Now playing: what the PC is playing (title, artist, cover, progress), read from Windows media controls and shared over the local connection only, never through the cloud.
- Media control from the phone: play, pause and skip, in Local and Tailscale mode. On by default, switched off in the desktop's Settings. Protected by the pairing code and rate limited.

**Android**
- Now playing card on Overview and five music standby faces: Poster, Ambient, Glossy, Vinyl, Quiet. Their colours come from the cover.
- Standby faces can dim when idle or stay bright, and can fill the whole screen. Both are chosen where you pick a face.
- A new design in six styles: Stickers (the default), Solid, Banner, Tiles, Pills and Classic (the previous look), each in light, dark and true black, chosen in setup or Settings. Cobalt is the new default accent.
- A short guide in setup and in Settings: how SysWatch works, and the pros and limits of each connection.

**Desktop**
- English, German, French, Spanish and Russian, using the same translation files as the phone app. Starts in the Windows language; a picker in setup and Settings; updates over the air.
- Lightweight mode, and the window is closed rather than hidden when SysWatch goes to the tray: about 55 to 73 MB and under 0.5% of one core while hidden.
- Now playing card on the dashboard.
- Three looks: the original glass, Bold light and Bold dark, chosen in setup or Settings. Existing installs keep glass.

### Changed
- Cloud mode publishes at most every 2 seconds.
- Every setting applies at once, including the sample and publish intervals.
- Reduce motion now stops the background animation.

### Fixed
- Android: a pairing link opened during setup was lost; it now pairs at once.
- Android: low resolution covers (browsers send small thumbnails) are no longer stretched into a blur.
- Android: pausing no longer shifts the title and controls.

---

## [0.2.1] · 2026-11-11

Desktop 0.2.1.

### Changed

- First run is a guided choice: Local, Cloud by DevLune or Tailscale, then the steps for that choice, then the pairing code. The app never asks for server details.
- Settings shows the same three choices as cards in place of a dropdown that did not respond.
- Battery health, charge cycles, voltage, temperature and power are shown when the PC reports them.
- Network ping, jitter and loss are measured instead of left blank.
- Rows the PC cannot report are hidden instead of showing a dash. CPU power and storage health were estimates and are removed.
- The app icon fills its space on the taskbar and desktop.
- Links point to the new website, [syswatch.devlune.in](https://syswatch.devlune.in).

### Fixed

- A battery that was draining could be shown as charging.
- The first 0.2.0 installer asked for cloud server details. It was withdrawn within the hour; 0.2.0 as published since, and 0.2.1, do not.

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
- Five languages: English, German, French, Spanish and Russian, chosen on the first screen or in Settings.
- Language updates over the air: a translation merged in this repository reaches the app without an app update.
- Five Overview layouts to choose from: Bridge, Gauges, Strip charts, Ledger, Focus.
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

## [0.1.0] · 2026-05-12

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
