# PawBridge — Real Account-Based Pet Platform

## Login flow
1. Visitor browses PawBridge as a guest.
2. Login opens only when the user chooses Login or tries an account-only action.
3. Sign in supports Email/Password and Google.
4. New users create an account with full name, email and password.
5. Firebase assigns a unique UID to each account.
6. Every pet, appointment/booking, adoption request, order and listing is saved with that UID.
7. After login, Dashboard loads only that UID's records.
8. Returning users remain signed in through Firebase until they log out.
9. Forgot password sends Firebase's reset email.

## Fresh Firebase setup
1. Create a NEW Firebase project.
2. Add a Web App in Project settings.
3. Copy its Firebase configuration into `firebase-config.js`.
4. Authentication → Sign-in method → enable Email/Password and Google.
5. Authentication → Settings → Authorized domains: add `localhost`, `127.0.0.1`, and your deployed domain.
6. Firestore Database → Create database.
7. Firestore → Rules → paste `firestore.rules` and Publish.
8. Run through VS Code Live Server, not `file://`.

## Collections
- `users/{uid}` — account profile
- `userPets` — saved pets
- `serviceBookings` — appointments/service bookings
- `adoptionRequests` — adoption activity
- `orders` — delivery orders
- `petListings` — marketplace listings

The Firebase Auth UID is the ownership key. This keeps one user's records separate from another user's records.
