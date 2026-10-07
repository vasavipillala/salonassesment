# Part E: Debugging Challenge – "Network Request Failed"

## Scenario
- **Environment**: React Native application running on a **physical mobile device**.
- **Backend**: Node.js + Express backend running on development computer on port `5000`.
- **Symptom**: When the mobile app attempts to call any backend endpoint, fetch/axios throws:
  ```text
  TypeError: Network request failed
  ```
- **Objective**: Detailed, step-by-step diagnostic and resolution methodology.

---

## 1. Root Cause Analysis (Why This Happens)

In React Native, `Network request failed` is a generic client-side exception thrown by the native networking stack (`NSURLSession` on iOS, `OkHttp` on Android) when a network request fails **before** an HTTP response is received.

The 6 most common root causes when targeting a physical mobile device are:

| # | Root Cause | Description |
| :- | :--- | :--- |
| **1** | **`localhost` / `127.0.0.1` Loopback Trap** | In mobile runtimes, `localhost` points to the **phone itself**, not the host development computer. |
| **2** | **Server Bound to Loopback Only** | Express server initialized as `app.listen(5000, 'localhost')` or `127.0.0.1`, ignoring external network adapters. |
| **3** | **Network Isolation / Different Subnets** | Phone is on mobile data (4G/5G) or a separate Wi-Fi network / guest network with AP client isolation enabled. |
| **4** | **Host OS Firewall Blocking Inbound Traffic** | Windows Defender Firewall or macOS firewall blocking inbound TCP traffic on port `5000`. |
| **5** | **Cleartext HTTP Restrictions (OS Security)** | Android 9+ (API 28+) and iOS ATS block unencrypted `http://` traffic by default unless explicitly permitted. |
| **6** | **Dynamic DHCP IP Change** | The development computer was assigned a new IP address by the local router. |

---

## 2. Systematic 6-Step Debugging Protocol

An experienced engineer debugs network issues from the **inside out**: Host -> Network -> Device -> App Code.

```text
[Step 1: Dev Machine]   Is server alive and listening on 0.0.0.0?
        │
        ▼
[Step 2: Dev Machine]   What is the exact host LAN IP (e.g. 192.168.1.48)?
        │
        ▼
[Step 3: Dev Machine]   Is OS Firewall permitting inbound port 5000?
        │
        ▼
[Step 4: Phone Browser] Can mobile browser open http://<IP>:5000/health?
        │
        ▼
[Step 5: App Native]    Are Android/iOS cleartext HTTP security policies enabled?
        │
        ▼
[Step 6: App Code]      Is React Native configured with the dynamic LAN/Tunnel URL?
```

---

### Step 1: Verify Server Process & Host Binding
First, verify that the Node.js server is actively listening on **all network interfaces (`0.0.0.0`)**, not just `127.0.0.1`.

**Check in PowerShell (Windows):**
```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen
# Or
netstat -ano | findstr :5000
```
- If you see `127.0.0.1:5000`, the server is only listening to local loopback and will **reject** all external phone traffic!
- **Fix in Node.js server (`server.js`):**
  ```javascript
  const PORT = process.env.PORT || 5000;
  const HOST = '0.0.0.0'; // Bind to all network interfaces

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
  ```

---

### Step 2: Determine Dev Machine LAN IP Address
Find the IPv4 address assigned to the host computer on the local Wi-Fi router.

**In PowerShell / CMD:**
```powershell
ipconfig
```
Look for `Wireless LAN adapter Wi-Fi` -> `IPv4 Address` (e.g., `192.168.1.48`).

**In macOS / Linux:**
```bash
ifconfig | grep "inet "
```

---

### Step 3: Test Host Firewall
Even if Express binds to `0.0.0.0`, the host firewall may silently drop incoming packets.

**Windows Firewall Fix (Run PowerShell as Admin):**
```powershell
New-NetFirewallRule -DisplayName "NodeJS Dev Server 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```
**macOS Firewall Fix:**
Ensure "Block all incoming connections" is unchecked under System Settings -> Network -> Firewall.

---

### Step 4: Verify Connectivity Directly on the Mobile Device
Before debugging React Native code, test the network pipe in isolation:
1. Ensure the physical phone is on the **exact same Wi-Fi SSID** (disable mobile data temporarily).
2. Open **Google Chrome** or **Safari** on the physical phone.
3. Type the address:
   ```text
   http://192.168.1.48:5000/health
   ```
- **If it loads `{"status":"healthy"}`:** The network, IP, server, and firewall are verified. The issue is purely inside the React Native application configuration (see Step 5 & 6).
- **If it hangs or times out:**
  - Check if the router has "Client Isolation / Guest Mode" enabled.
  - Or switch to USB reverse tethering / tunnel (see Section 4).

---

### Step 5: Check Cleartext HTTP Security Policies (Native Layer)

Modern mobile operating systems prohibit unencrypted `http://` network traffic by default.

#### A. Android (`android/app/src/main/AndroidManifest.xml`)
Android 9 (API level 28) and above require `usesCleartextTraffic="true"` for development:
```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:usesCleartextTraffic="true">
    ...
</application>
```
Or configure a Network Security Config (`res/xml/network_security_config.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.48</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

#### B. iOS (`ios/Podfile` or `ios/<Project>/Info.plist`)
Apple App Transport Security (ATS) blocks plain `http://`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

---

### Step 6: Fix API URL Configuration in React Native Code

Never hardcode `http://localhost:5000` in React Native! Use an adaptive network configuration:

```javascript
// src/api/salonApi.js
import { Platform } from 'react-native';

const DEV_LAN_IP = '192.168.1.48'; // Host PC Wi-Fi IPv4 address
const PORT = 5000;

export const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    // Android Emulator loopback alias: 10.0.2.2
    // Physical device: Use Host LAN IP
    return `http://${DEV_LAN_IP}:${PORT}`;
  }
  if (Platform.OS === 'ios') {
    // iOS Simulator can use localhost; Physical iPhone must use LAN IP
    return `http://${DEV_LAN_IP}:${PORT}`;
  }
  // Web browser
  return `http://localhost:${PORT}`;
};
```

---

## 3. Bulletproof Development Alternatives

When office Wi-Fi networks block peer-to-peer traffic between devices, use either of these industry-standard solutions:

### Option A: USB Tethering with Reverse Port Forwarding (Android)
If the device is connected via USB with Developer Mode / USB Debugging enabled:
```bash
adb reverse tcp:5000 tcp:5000
```
This maps the phone's internal port `5000` directly to the development computer's port `5000`. You can now safely use `http://localhost:5000` on the physical phone!

### Option B: Cloud Tunnel via Ngrok or Localtunnel (HTTPS)
Creates a secure public HTTPS tunnel to port 5000, bypassing all local Wi-Fi, firewall, and cleartext HTTP restrictions:
```bash
# Using localtunnel (no account needed)
npx localtunnel --port 5000

# Or using ngrok
ngrok http 5000
```
**Example Output:**
```text
your url is: https://salon-api-demo.loca.lt
```
Simply set `EXPO_PUBLIC_API_URL=https://salon-api-demo.loca.lt` in the React Native `.env` file!

---

## 4. Summary Diagnostic Matrix

| Observation | Root Cause | Immediate Action |
| :--- | :--- | :--- |
| `netstat` shows `127.0.0.1:5000` | Host listening only on loopback | Change `app.listen` host to `'0.0.0.0'` |
| Phone browser cannot open `http://<IP>:5000/health` | Firewall or different Wi-Fi subnet | Check Windows Firewall rule; verify phone and PC are on same Wi-Fi |
| Phone browser opens `/health`, but RN app fails | Cleartext HTTP blocked by OS | Add `usesCleartextTraffic="true"` to AndroidManifest.xml |
| App worked yesterday, fails today | PC IP changed via router DHCP | Run `ipconfig`, update `DEV_LAN_IP` in app config |
| Strict corporate Wi-Fi blocks LAN traffic | Wi-Fi client isolation enabled | Run `npx localtunnel --port 5000` or `adb reverse` |
