# How to Get Your Google App Password (EMAIL_PASS)

To send emails from the application using your Gmail account, you need an **App Password**. This is more secure than using your real password.

### Step 1: Enable 2-Step Verification
1. Go to your **[Google Account](https://myaccount.google.com/)**.
2. Click on **Security** in the left sidebar.
3. Scroll down to the "How you sign in to Google" section.
4. If **2-Step Verification** is OFF, click it and follow the steps to turn it ON (you'll need your phone).

### Step 2: Generate App Password
1. Once 2-Step Verification is ON, go back to the **Security** page.
2. In the search bar at the top of the page, type **"App passwords"** and click the result.
   - *Note: If you don't see it, go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)*.
3. You may be asked to sign in again.
4. **App name**: Type `TalentScout` (or any name).
5. Click **Create**.

### Step 3: Copy & Paste
1. A popup will show a **16-character code** (e.g., `abcd efgh ijkl mnop`).
2. Copy this code.
3. Go to your `backend/.env` file.
4. Paste it as the value for `EMAIL_PASS` (spaces don't matter, but usually better to remove them).

Example `.env`:
```env
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

### Step 4: Restart Backend
After saving the `.env` file, **restart your backend server** (Ctrl+C in terminal, then `node server.js` or `npm start`) for the changes to apply.
