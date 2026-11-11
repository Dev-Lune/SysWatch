<p align="center">
  <img src="./images/feature-graphic.png" alt="SysWatch: your PC's gauges, on your phone" width="880">
</p>

<h1 align="center">SysWatch</h1>

<p align="center">
  <b>Your PC's gauges, on your phone.</b><br>
  A small desktop app reads your CPU, GPU, memory, network, storage and battery.<br>
  Your phone shows them live, and tells you when one crosses a limit you set.
</p>

<p align="center">
  <a href="https://devlune.in/download/syswatch"><img src="https://img.shields.io/badge/Download_for_Windows-E0A458?style=for-the-badge&logo=windows11&logoColor=111111" alt="Download for Windows"></a>
  <a href="https://play.google.com/store/apps/details?id=in.devlune.syswatch"><img src="https://img.shields.io/badge/Get_it_on_Google_Play-16181B?style=for-the-badge&logo=googleplay&logoColor=E0A458" alt="Get it on Google Play"></a>
</p>

<p align="center">
  <a href="https://github.com/Dev-Lune/SysWatch/releases/latest"><img src="https://img.shields.io/github/v/release/Dev-Lune/SysWatch?label=desktop&color=E0A458&labelColor=16181B" alt="Latest desktop release"></a>
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-E0A458?labelColor=16181B" alt="Windows 10 and 11">
  <img src="https://img.shields.io/badge/Android-7.0%2B-E0A458?labelColor=16181B" alt="Android 7.0 and newer">
  <img src="https://img.shields.io/badge/price-free%2C%20no%20ads-E0A458?labelColor=16181B" alt="Free, no ads">
  <a href="https://github.com/sponsors/Dev-Lune"><img src="https://img.shields.io/badge/Sponsor-16181B?logo=githubsponsors&logoColor=EE8FA8" alt="Sponsor"></a>
</p>

<br>

<table>
  <tr>
    <td align="center" width="25%"><img src="./images/store-01-overview.png" alt="Overview screen with a large CPU reading and its graph" width="210"><br><sub><b>Live readings</b></sub></td>
    <td align="center" width="25%"><img src="./images/store-02-alerts.png" alt="Alert editor" width="210"><br><sub><b>Alerts</b></sub></td>
    <td align="center" width="25%"><img src="./images/store-03-settings.png" alt="Settings with accent colours and card order" width="210"><br><sub><b>Your look</b></sub></td>
    <td align="center" width="25%"><img src="./images/store-04-standby.png" alt="Gallery of standby faces" width="210"><br><sub><b>24 standby faces</b></sub></td>
  </tr>
  <tr>
    <td align="center" width="25%"><img src="./images/store-05-ink.png" alt="Ink standby face" width="210"><br><sub><b>Art faces</b></sub></td>
    <td align="center" width="25%"><img src="./images/store-06-bauhaus.png" alt="Bauhaus standby face" width="210"><br><sub><b>Readings as art</b></sub></td>
    <td align="center" width="25%"><img src="./images/store-07-landscape.png" alt="Overview in landscape" width="210"><br><sub><b>Landscape and tablet</b></sub></td>
    <td align="center" width="25%"><img src="./images/store-08-connection.png" alt="Diagram of local, Tailscale and cloud connection" width="210"><br><sub><b>Three ways to connect</b></sub></td>
  </tr>
</table>

---

## Get started in three steps

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>1 &nbsp; Install on your PC</h3>
      Open the <a href="https://devlune.in/download/syswatch">download page</a>, get the Windows installer and run it. SysWatch sits in the system tray.
    </td>
    <td width="33%" valign="top">
      <h3>2 &nbsp; Install on your phone</h3>
      Get <a href="https://play.google.com/store/apps/details?id=in.devlune.syswatch">SysWatch on Google Play</a> and open it.
    </td>
    <td width="33%" valign="top">
      <h3>3 &nbsp; Scan the code</h3>
      Open <b>Pairing</b> on the PC and scan the QR code with the phone. No account, nothing to type.
    </td>
  </tr>
</table>

> [!TIP]
> Never installed software from outside a store before? The **[download and setup guide](https://devlune.in/download/syswatch)** walks through every screen, including the Windows warning you will see and what to click.

## Download

| Your PC | Status | Where |
|---|---|---|
| **Windows 10 / 11** (64-bit) | Available | [Download page](https://devlune.in/download/syswatch) · [GitHub release](https://github.com/Dev-Lune/SysWatch/releases/latest) |
| **Linux** | Not available yet | Planned. No Linux build has been made or tested. |
| **macOS** | Not available yet | Planned, same as Linux. |
| **Android phone** | Available | [Google Play](https://play.google.com/store/apps/details?id=in.devlune.syswatch) |

> [!NOTE]
> The Windows installer is not code signed yet, so Windows SmartScreen shows "Windows protected your PC". Choose **More info**, then **Run anyway**.

## Three ways to connect

Both apps ask the same question the first time they open. Pick the same answer on each; the QR code on the PC carries it anyway. You can change it later in Settings.

| | Local | Cloud by DevLune | Tailscale |
|---|---|---|---|
| **Works from** | The same Wi-Fi | Anywhere with internet | Anywhere |
| **Set up** | Nothing | Nothing | About five minutes, once |
| **Speed** | Instant, straight from the PC | About 2 seconds per update | Instant, straight from the PC |
| **Where the readings go** | Never leave your network | Through DevLune's relay | Through your own private Tailscale link |

Not sure? Pick **Local** if the phone usually sits near the PC.

```mermaid
flowchart LR
  PC["Your PC<br>SysWatch desktop"]
  Phone["Your phone<br>SysWatch app"]
  Relay(["DevLune relay"])
  PC -- "Cloud by DevLune" --> Relay --> Phone
  PC == "Local mode: Wi-Fi or Tailscale, port 47800" ==> Phone
```

<details>
<summary><b>Setting up Tailscale</b></summary>

<br>

Tailscale gives your PC and phone a private, encrypted link that works from anywhere, as if they shared one Wi-Fi. It is a separate product with a free personal plan.

1. Install Tailscale on your PC from [tailscale.com/download](https://tailscale.com/download) and sign in.
2. Install Tailscale on your phone and sign in with the **same account**.
3. In SysWatch on the PC, set the connection to **Local** and open **Pairing**. An address labelled **Tailscale** appears.
4. Scan the QR code with the phone.

At home the phone uses your Wi-Fi address. Away from home, with Tailscale on, it switches by itself.

</details>

## What it does

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>See everything at a glance</h3>
      <ul>
        <li>CPU, GPU, memory, network, storage, battery and uptime</li>
        <li>History graph on every reading</li>
        <li>Five Overview layouts, phone and tablet</li>
        <li>Only real readings: nothing is shown that your PC does not report</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>Alerts that come to you</h3>
      <ul>
        <li>"CPU load above 90%", "Battery level below 20%"</li>
        <li>Each limit is drawn as a red line on its gauge</li>
        <li>Quiet period per alert, so one spike is one notification</li>
        <li>Export and import your rules</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Make it yours</h3>
      <ul>
        <li>Pick your accent colour</li>
        <li>Light, dark or true black</li>
        <li>Choose which cards show and in what order</li>
        <li>Roomy or compact layout</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>A second screen on your desk</h3>
      <ul>
        <li>24 standby faces, instruments and art, portrait and landscape</li>
        <li>Burn-in protection and auto dim</li>
        <li>Home screen widget in four looks</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Light on your PC</h3>
      <ul>
        <li>Lives in the tray, starts with Windows if you want</li>
        <li>Pause and resume from the tray</li>
        <li>NVIDIA GPUs read through NVML; other GPUs show what the system exposes</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>Stays up to date</h3>
      <ul>
        <li>The phone app updates through Google Play and tells you what changed</li>
        <li>Five languages built in; new ones arrive without an app update</li>
        <li>The desktop app tells you when a new version is out</li>
      </ul>
    </td>
  </tr>
</table>

## Privacy, plainly

- **No account.** A 6-character pairing code is the only thing linking phone and PC.
- **Read only.** The phone can see readings. It cannot control, change or run anything on your PC.
- **Local mode** keeps readings on your own network. It is not encrypted there, so use it on networks you trust, or over Tailscale, which encrypts everything.
- **Cloud by DevLune** relays readings through DevLune's relay so the phone can reach the PC from anywhere. You never enter any server details.
- Running program names are not sent unless you switch that on.

Full policy: [devlune.in/privacy](https://devlune.in/privacy) · [Terms](https://devlune.in/terms)

## If it does not connect

| What you see | What to check |
|---|---|
| "PC not reachable" in local mode | Phone and PC on the same Wi-Fi (guest Wi-Fi isolates devices). Windows Firewall allowed SysWatch. Desktop app running. |
| Connects at home, not outside | Local mode needs Tailscale away from home. |
| "Code not found" | The PC made a new code. Open Pairing on the PC and scan again. |
| Stuck on "Paused" | The desktop app is paused. Open it and press Resume. |

Still stuck? [Open an issue](https://github.com/Dev-Lune/SysWatch/issues) or ask on [Discord](https://discord.gg/BXu9qxgaE8).

## Languages

SysWatch for Android speaks **English, Deutsch, Français, Español and Русский**. You pick the language on the first screen, and can change it any time in Settings.

**Add your language, or fix a wording.** Each language is one text file in the [`translations`](./translations) folder. No programming needed:

1. Fork this repository.
2. Copy `translations/en.xml` to a file named after your language code, for example `hi.xml`.
3. Translate the text between the tags.
4. Open a pull request. A check runs by itself and tells you in plain words if anything needs fixing.

When a translation is merged, **every SysWatch app picks it up by itself**, usually within a day. No app update is needed: the app downloads the new text, checks it on the phone, and saves it. A language that is not built in yet simply appears in the app's language list.

The full guide, with the five rules that matter, is in [`translations/README.md`](./translations/README.md).

| Language | File | Status |
|---|---|---|
| English | [`en.xml`](./translations/en.xml) | Source |
| Deutsch | [`de.xml`](./translations/de.xml) | Complete |
| Français | [`fr.xml`](./translations/fr.xml) | Complete |
| Español | [`es.xml`](./translations/es.xml) | Complete |
| Русский | [`ru.xml`](./translations/ru.xml) | Complete |

These four were translated by us and have not yet been reviewed by native speakers. If something reads wrong in your language, a correction is very welcome.

## About this repository

This repository is SysWatch's public home: releases, the changelog and these docs. Installers are attached to each [release](https://github.com/Dev-Lune/SysWatch/releases).

- [Changelog](./CHANGELOG.md)
- [Release notes](./RELEASE_NOTES.md)
- [Feature list](./FEATURES.md)
- [Install guide](./docs/INSTALL.md) · [Tailscale guide](./docs/TAILSCALE.md)
- [Translate SysWatch](./translations/README.md)

## Support SysWatch

SysWatch is free and has no ads. If it earns a place on your desk:

<p>
  <a href="https://github.com/sponsors/Dev-Lune"><img src="https://img.shields.io/badge/Sponsor_on_GitHub-16181B?style=for-the-badge&logo=githubsponsors&logoColor=EE8FA8" alt="Sponsor on GitHub"></a>
  <a href="https://github.com/Dev-Lune/SysWatch"><img src="https://img.shields.io/badge/Star_this_repo-16181B?style=for-the-badge&logo=github&logoColor=ECEDEF" alt="Star this repo"></a>
</p>

<p align="center">
  <sub>Made by <a href="https://devlune.in">DevLune</a>, Hyderabad. Crafted in the dark. Shipped to the world.</sub>
</p>
