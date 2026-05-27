<div align="center">

<img src="./images/banner.png" alt="SysWatch banner" width="880">

# SysWatch

**Watch your PC from your phone — in real time, without the cloud headache.**

Low-footprint desktop agent that streams your computer's live hardware telemetry
straight to your phone over Supabase Realtime. No accounts. No data pipelines.
Just a 6-character pairing code and you're done.

<table><tr>
<td><a href="https://github.com/Dev-Lune/SysWatch/releases/latest"><img src="./images/btn-download-desktop.svg" alt="Download the desktop app — Windows, macOS, Linux" width="380"></a></td>
<td><a href="https://play.google.com/store/apps/details?id=in.devlune.syswatch"><img src="./images/btn-google-play.svg" alt="Get SysWatch on Google Play" width="380"></a></td>
</tr></table>

<!-- <table><tr>
<td><a href="https://github.com/Dev-Lune/SysWatch"><img src="./images/btn-star-github.svg" alt="Star SysWatch on GitHub" width="260"></a></td>
<td><a href="https://buymeacoffee.com/devlune"><img src="./images/btn-buy-coffee.svg" alt="Buy us a coffee — support SysWatch" width="260"></a></td>
</tr></table> -->

<sub>🛡 MIT License  ·  🪶 Built on Tauri v2 + Rust + React  ·  🏠 Made by <a href="https://devlune.in">DevLune Studio</a>, Hyderabad, IN</sub>

</div>

---

## What is SysWatch?

SysWatch is a two-piece system:

- 🖥 **A tiny desktop agent** that lives in your tray and samples your CPU, GPU,
  RAM, disk, network, and battery a few times a second.
- 📱 **A mobile companion** that shows the same metrics on your phone as live,
  beautiful tiles with sparklines and alerts.

Pair them once with a 6-character code. From then on, glance at your phone to
see if your game PC is thermal-throttling, your render is done, or your laptop
on the other side of the house is still plugged in.

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🎯 Designed for glanceability
- 3×2 grid of **glass tiles** — everything at a glance.
- **Sparklines** on every metric so you see trend, not just a number.
- **Dark-first** UI with optional Material You dynamic color on Android 12+.
- **Reduced-motion** toggle that respects your OS setting.

</td>
<td width="50%" valign="top">

### 📊 Metrics that matter
- **CPU** — per-core utilisation, total, frequency, package temperature.
- **GPU** — NVML when available, `sysinfo` fallback; name + load + temp.
- **RAM** — used / total, with swap.
- **Disk** — per-volume usage + aggregate read/write throughput.
- **Network** — up / down bytes per second.
- **Battery** — percentage, AC-in state, time-to-full / -empty.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🔐 Your data, your backend
- **No SysWatch account.** Ever.
- The only server involved is **your own Supabase project** (free tier is plenty).
- Pairing is an **offline handshake** — your phone never learns your machine's
  IP; it only learns the 6-char code you typed.
- **Row-level security** makes codes un-enumerable from anonymous clients.
- Process-list broadcasting is **off by default**.

</td>
<td width="50%" valign="top">

### 🪶 Built to disappear
- **Tray-first**: main window hides after launch; tray controls Show / Pair /
  Pause / Quit.
- **~30–60 MB RAM, <1% CPU** on a modern laptop while streaming.
- **Autostart-ready** with a one-click "Launch at login" toggle.
- **Native installers** for Windows (MSI), macOS (DMG), and Linux (AppImage /
  deb / rpm).
- **Offline-tolerant**: sampling keeps running; publishing just pauses when the
  network is down.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🔔 Alerts that come to you
- Threshold rules on any metric: "CPU > 90% for 30 s", "Battery < 15%",
  "Disk read < 5 MB/s during export", …
- Severity levels with **per-rule cooldowns** so you don't get spammed.
- **Export / import** rule sets as JSON.

</td>
<td width="50%" valign="top">

### 📱 Phone-first companion
- Same tiles, reshaped for a phone: 2-column on compact, 3 on medium, 4 on
  tablets.
- **Bottom-sheet detail view** for each tile.
- **Deep links**: scan a QR on the desktop or tap
  `syswatch://pair?code=ABC123` from anywhere.
- **Keep-screen-on** and low-power toggles for when the phone is your
  always-on second display.

</td>
</tr>
</table>

---

## 📥 Download

<div align="center">

<table><tr>
<td width="50%" align="center">
<a href="https://github.com/Dev-Lune/SysWatch/releases/latest"><img src="./images/btn-download-desktop.svg" alt="Download the desktop app — Windows, macOS, Linux" width="380"></a>
<br><sub>All installers live in the latest GitHub release.</sub>
</td>
<td width="50%" align="center">
<a href="https://play.google.com/store/apps/details?id=in.devlune.syswatch"><img src="./images/btn-google-play.svg" alt="Get SysWatch on Google Play" width="380"></a>
<br><sub>Android 7.0 (API 24) and newer.</sub>
</td>
</tr></table>

</div>

### Desktop — pick your installer

| Platform | Installer |
| --- | --- |
| **Windows** 10 / 11 (x64) | `SysWatch_x.y.z_x64_en-US.msi` |
| **macOS** (Apple Silicon + Intel) | `SysWatch_x.y.z_universal.dmg` |
| **Linux** | `SysWatch_x.y.z.AppImage` · `syswatch_x.y.z_amd64.deb` · `.rpm` |

> All release artefacts: [github.com/Dev-Lune/SysWatch/releases](https://github.com/Dev-Lune/SysWatch/releases)

---

## 🚀 Getting started in 60 seconds

1. **Install the desktop app** from the link above and launch it.
2. On first run, paste your Supabase URL + anon key (or use the build that
   already has them baked in). Onboarding walks you through it.
3. The tray icon appears. Open the **Pairing** tab — you'll see a big
   6-character code like `A3K9X7`.
4. **Install the Android app** from Google Play.
5. Type the code into your phone (or scan the QR). Tap **Connect**.
6. That's it — your phone is now a live dashboard for your PC.

Want to stop streaming? Right-click the tray icon → **Pause**. Want to quit?
**Quit**. Close the window by mistake? SysWatch asks the first time — pick
"move to tray" and it never bothers you again.

---

## 🔒 Privacy at a glance

- SysWatch does not ship any data to us. Ever.
- The desktop app makes outbound HTTPS requests **only** to the Supabase project
  you configured. Typical payload: ~800 bytes of JSON every 2 seconds.
- Credentials (pairing code + Supabase keys) live in your **OS keychain**
  (Windows Credential Manager, macOS Keychain, Secret Service on Linux).
- Process names and PIDs are **never** broadcast unless you explicitly flip
  the toggle in Settings → Privacy.

Full policy: [privacy policy](https://github.com/Dev-Lune/SysWatch/blob/main/PRIVACY.md) ·
[terms of use](https://github.com/Dev-Lune/SysWatch/blob/main/TERMS.md).

---

## 💚 Support the project

SysWatch is free, ad-free, and tracker-free. If it earns a spot on your second
monitor or saves you a trip upstairs, here's how you can help:

- ⭐ **[Star the repo](https://github.com/Dev-Lune/SysWatch)** — it's the
  single biggest signal for hobby projects.
- ☕ **[Buy us a coffee](https://buymeacoffee.com/devlune)** — pays for code
  signing certs, Play Console, and the occasional late-night debugging snack.
- 💬 **[Join the Discord](https://discord.gg/BXu9qxgaE8)** — feature ideas,
  release chatter, and screenshots welcome.
- 🐛 **[File an issue](https://github.com/Dev-Lune/SysWatch/issues)** — bug
  reports with logs are gold.
- 🛠 **[Hire the studio](https://devlune.in)** — we ship web, Android, and
  end-to-end products for startups.

---

## 📜 License

Released under the [MIT License](https://github.com/Dev-Lune/SysWatch/blob/main/LICENSE).
© **DevLune Studio**, Hyderabad, IN — [devlune.in](https://devlune.in).

Hardware vendor marks (NVIDIA, AMD, Intel, Apple, Samsung, etc.) are trademarks
of their respective owners. SysWatch displays them solely to identify detected
hardware and is not affiliated with nor endorsed by these vendors. Vendor icon
paths are from [simpleicons.org](https://simpleicons.org) (CC0).

<div align="center">

**Made with ❤ by [DevLune Studio](https://devlune.in).**

</div>
