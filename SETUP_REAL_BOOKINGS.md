# PawBridge — Fresh Firebase Setup

## 1. Delete old project
Firebase Console → Project settings → General → scroll to the bottom → Delete project → confirm.

## 2. Create new project
Firebase Console → Add project → create a new PawBridge project.

Then Project settings → Your apps → Web (`</>`) → Register app.
Copy the config values into `PawBridge/firebase-config.js`. You only change that file.

## 3. Authentication
Firebase Console → Authentication → Sign-in method:
- Enable Email/Password
- Enable Google

Authentication → Settings → Authorized domains:
- `localhost`
- `127.0.0.1`
- your real deployed domain after deployment

## 4. Firestore
Firestore Database → Create database.
Then Firestore → Rules → paste `firestore.rules` → Publish.

## 5. Run
Use VS Code Live Server:
`http://localhost:5500/PawBridge/index.html`

Do NOT open the HTML using `file://`.

## 6. Verify account separation
Create Account A → add pet → book service → place order → check Dashboard.
Logout.
Create Account B → Dashboard should be empty.
Add data to B.
Logout and sign back into A → A's original data should still be there.

That proves the real-account behavior is working.

## 7. If login errors
- `auth/unauthorized-domain`: add the exact hostname in Authorized domains.
- `auth/operation-not-allowed`: enable the provider.
- `permission-denied`: publish the Firestore rules.
- `auth/invalid-credential`: email/password does not match.
