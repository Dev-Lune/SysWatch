# SysWatch v0.1.0 — Release Notes

**Release Date:** 2026-05-12  
**Platform:** Windows x64  
**Installers:** MSI, NSIS (exe)

---

## Overview

SysWatch v0.1.0 is the first public release of the low-footprint desktop agent that samples hardware telemetry and streams it to a paired mobile client via Supabase Realtime.

Built on **Tauri v2 + Rust + React**, SysWatch runs silently in the system tray and broadcasts real-time metrics to the Android companion app over a secure, code-based pairing system — no accounts, no cloud auth.

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
2. Run the installer — no admin required for per-user install.
3. On first launch, enter your Supabase project URL and anon key in the onboarding screen.
4. A 6-character pairing code is generated and saved.
5. The tray icon appears and the main window hides.
6. Open the Android companion app and enter the pairing code to start streaming.

---

## Support

- ⭐ Star the repo → [github.com/Dev-Lune/SysWatch](https://github.com/Dev-Lune/SysWatch)
- ☕ Buy us a coffee → [buymeacoffee.com/devlune](https://buymeacoffee.com/devlune)
- 💬 Discord → [discord.gg/BXu9qxgaE8](https://discord.gg/BXu9qxgaE8)
- 🐛 Issues → [github.com/Dev-Lune/SysWatch/issues](https://github.com/Dev-Lune/SysWatch/issues)

---

© 2026 DevLune Studio · [devlune.in](https://devlune.in)
