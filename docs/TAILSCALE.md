# SysWatch over Tailscale

Tailscale gives your PC and phone a private, encrypted link that works from anywhere,
as if they were on the same Wi-Fi. With it, SysWatch local mode works away from home:
instant updates, nothing sent through the SysWatch cloud.

Tailscale is a separate product with a free personal plan. SysWatch does not include
it and does not need your Tailscale password.

## Set up, about five minutes

1. **PC:** install Tailscale from <https://tailscale.com/download> and sign in.
2. **Phone:** install Tailscale from Google Play and sign in with the **same account**.
3. Check both show **Connected** in Tailscale. Each device now has an address that
   starts with `100.`.
4. **SysWatch on the PC:** open Settings, set the connection to **Local**.
5. Open **Pairing**. Under addresses you should see one labelled **Tailscale**.
6. **SysWatch on the phone:** scan the QR code.

Done. At home the phone uses your Wi-Fi address. Away from home, with Tailscale on, it
switches to the Tailscale address by itself.

## Good to know

- Keep Tailscale switched on on the phone when you are out. If it is off, SysWatch
  shows "PC not reachable" until you turn it back on.
- On Android, Tailscale counts as the phone's VPN. Only one VPN can run at a time.
- If you already paired before installing Tailscale, scan the QR again so the phone
  learns the Tailscale address.
- No Tailscale address in the Pairing screen? Tailscale is not connected on the PC.
  Open it from the tray and sign in, then reopen Pairing.
- The PC must be awake. Tailscale cannot reach a sleeping computer.
