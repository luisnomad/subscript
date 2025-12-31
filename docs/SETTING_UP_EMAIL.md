# Setting Up Email for SubScript

SubScript monitors your email inbox for receipts and automatically extracts subscription and domain information. To enable this, you need to configure your IMAP settings.

## General Requirements

- **IMAP Access**: Must be enabled in your email provider's settings.
- **App Passwords**: Most modern providers (Gmail, Outlook, iCloud) require an "App Password" instead of your regular login password for security.
- **SSL/TLS**: SubScript requires a secure connection (usually port 993).

---

## 📧 Option 1: Gmail

### 1. Enable IMAP
1. Open [Gmail](https://mail.google.com) in your browser.
2. Click the **Settings (gear icon)** > **See all settings**.
3. Go to the **Forwarding and POP/IMAP** tab.
4. In the "IMAP access" section, select **Enable IMAP**.
5. Click **Save Changes**.

### 2. Create an App Password
1. Go to your [Google Account Security settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned ON.
3. Search for **App passwords** in the search bar at the top.
4. Enter a name (e.g., "SubScript") and click **Create**.
5. **Copy the 16-character password** displayed. You will need this for SubScript.

### 3. SubScript Configuration
- **IMAP Server**: `imap.gmail.com`
- **Port**: `993`
- **Username**: Your full Gmail address
- **Password**: The 16-character App Password you just created
- **Use SSL**: Yes

---

## 📧 Option 2: Outlook / Hotmail / Office 365

### 1. Enable IMAP
1. Open [Outlook.com](https://outlook.live.com).
2. Click **Settings (gear icon)** > **Mail** > **Forwarding and IMAP**.
3. Ensure **IMAP** is set to **Yes**.
4. Click **Save**.

### 2. Create an App Password
1. Go to your [Microsoft Account Security dashboard](https://account.microsoft.com/security).
2. Select **Advanced security options**.
3. Under **App passwords**, click **Create a new app password**.
4. **Copy the password** generated.

### 3. SubScript Configuration
- **IMAP Server**: `outlook.office365.com`
- **Port**: `993`
- **Username**: Your full Outlook/Hotmail address
- **Password**: The App Password you just created
- **Use SSL**: Yes

---

## 🛠 Troubleshooting

### Connection Failed
- Double-check that you are using an **App Password**, not your main account password.
- Ensure your firewall or antivirus isn't blocking port 993.
- Verify that IMAP is explicitly enabled in your provider's web interface.

### No Emails Found
- SubScript only processes **unread** emails.
- If you want to re-process an email, mark it as "Unread" in your inbox.
- Emails with `[test]` in the subject will be routed to the SubScript test database.

### Security Note
SubScript stores your IMAP password securely in your operating system's native keychain (macOS Keychain, Windows Credential Manager, or Linux Secret Service) using the `keyring` library. It is never stored in plain text.
