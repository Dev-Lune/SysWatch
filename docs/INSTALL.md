# Install SysWatch

SysWatch has two parts: the **desktop app** on the PC you want to watch, and the
**Android app** on your phone. Install the desktop app first, then pair the phone.

**Download the desktop app:** <https://github.com/Dev-Lune/SysWatch/releases/latest>

| Your PC | File to download | Status |
|---|---|---|
| Windows 10 / 11 | `SysWatch_<version>_x64-setup.exe` | Available |
| Linux | Not available yet | Planned. The app is written to run on Linux, but no Linux build has been made or tested. |
| macOS | Not available yet | Planned, same as Linux. |

## Windows

1. Download the `-setup.exe` file and run it.
2. Windows SmartScreen may say "Windows protected your PC". Choose **More info**, then
   **Run anyway**. The installer is not yet code signed.
3. Finish the installer and open SysWatch. It lives in the system tray.
4. Pick how your phone connects (see below), then open **Pairing** to show the QR code.

## Choose how your phone connects

| | Cloud | Local |
|---|---|---|
| Works from | Anywhere with internet | Same Wi-Fi, or anywhere with Tailscale |
| Needs | Internet on PC and phone | Nothing else on Wi-Fi. Tailscale for away from home |
| Speed | About 2 seconds per update | Instant, straight from the PC |
| Privacy | Stats pass through the SysWatch cloud relay | Stats never leave your network |

Not sure? Pick **Local** if the phone sits near the PC, **Cloud** if you check your PC
from outside and do not want to set up Tailscale. You can change it later in Settings.

Local mode uses one port, **47800**. The first time, Windows Firewall asks whether to
allow SysWatch on private networks: choose **Allow**. Local mode is not encrypted, and
the 6-character pairing code is the only lock, so use it on networks you trust (your
home Wi-Fi, or Tailscale, which encrypts everything itself).

## Pair the phone

1. Install SysWatch from Google Play and open it.
2. On the PC open **Pairing**. A QR code and a 6-character code appear.
3. On the phone tap **Scan the code on your PC** and point it at the QR.

That is all. The QR carries the mode, the address and the port, so there is nothing
to type.

## If it does not connect

| What you see | What to check |
|---|---|
| "PC not reachable" in local mode | Phone and PC on the same Wi-Fi (not guest Wi-Fi, which isolates devices). Windows Firewall allowed SysWatch. Desktop app is running. |
| Connects at home, not outside | Local mode needs Tailscale away from home. See [TAILSCALE.md](TAILSCALE.md). |
| "Code not found" | The PC made a new code. Open Pairing on the PC and scan again. |
| Stuck on "Paused" | The desktop app is paused. Open it and press Resume. |
| Port already in use | Change the port in desktop Settings, then scan the new QR. |
