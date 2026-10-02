// PawBridge - real account authentication
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

window.pawCurrentUser = null;
window.pawAuthReady = false;

function displayName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "Pet Parent";
}

async function saveUserProfile(user, extra = {}) {
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: displayName(user),
    email: user.email || "",
    photoURL: user.photoURL || "",
    provider: user.providerData?.[0]?.providerId || "password",
    lastLoginAt: serverTimestamp(),
    ...extra
  }, { merge: true });
}

function updateUI(user) {
  window.pawCurrentUser = user || null;
  window.pawAuthReady = true;

  const nameEl = document.getElementById("dashboardUserName");
  const emailEl = document.getElementById("dashboardUserEmail");
  const photoEl = document.getElementById("dashboardUserPhoto");
  const loginBtn = document.querySelector(".login-btn");

  if (nameEl) nameEl.textContent = displayName(user);
  if (emailEl) emailEl.textContent = user?.email || "Sign in to manage your PawBridge account.";

  if (photoEl) {
    if (user?.photoURL) {
      photoEl.src = user.photoURL;
      photoEl.style.display = "block";
    } else {
      photoEl.style.display = "none";
    }
  }

  if (loginBtn) loginBtn.textContent = user ? "Account" : "Login";
  window.dispatchEvent(new CustomEvent("pawbridge-auth-ready", { detail: { user } }));
}

onAuthStateChanged(auth, async (user) => {
  updateUI(user);
  if (user) {
    try { await saveUserProfile(user); }
    catch (e) { console.error("User profile save failed:", e); }
  }
});

window.loginWithGoogle = async function () {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error(error);
    showToast(formatAuthError(error));
  }
};

getRedirectResult(auth).then(async (result) => {
  if (result?.user) {
    try { await saveUserProfile(result.user); } catch (e) { console.error(e); }
    closeAuth();
    showPage("dashboard");
    showToast(`Welcome to PawBridge, ${displayName(result.user)}! 🐾`);
  }
}).catch((error) => {
  console.error("Google redirect result:", error);
  showToast(formatAuthError(error));
});

window.loginWithEmail = async function () {
  const email = document.getElementById("authEmail")?.value.trim();
  const password = document.getElementById("authPassword")?.value;

  if (!email || !password) return showToast("Enter your email and password.");

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await saveUserProfile(result.user);
    closeAuth();
    showPage("dashboard");
    showToast(`Welcome back, ${displayName(result.user)}! 🐾`);
  } catch (error) {
    console.error(error);
    const messages = {
      "auth/invalid-credential": "Email or password is incorrect.",
      "auth/user-not-found": "No PawBridge account exists with this email.",
      "auth/wrong-password": "Email or password is incorrect.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait and try again.",
      "auth/user-disabled": "This PawBridge account has been disabled."
    };
    showToast(messages[error.code] || "Unable to sign in. Please try again.");
  }
};

window.signupWithEmail = async function () {
  const name = document.getElementById("authName")?.value.trim();
  const email = document.getElementById("authEmail")?.value.trim();
  const password = document.getElementById("authPassword")?.value;
  const confirm = document.getElementById("authConfirmPassword")?.value;

  if (!name) return showToast("Enter your full name.");
  if (!email || !password) return showToast("Enter your email and password.");
  if (password.length < 6) return showToast("Password must contain at least 6 characters.");
  if (password !== confirm) return showToast("Passwords do not match.");

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await saveUserProfile(result.user, { name });
    closeAuth();
    showPage("dashboard");
    showToast(`Welcome to PawBridge, ${name}! 🐾`);
  } catch (error) {
    console.error(error);
    const messages = {
      "auth/email-already-in-use": "This email already has a PawBridge account. Sign in instead.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/weak-password": "Use a stronger password with at least 6 characters."
    };
    showToast(messages[error.code] || "Unable to create your account.");
  }
};

window.resetPawbridgePassword = async function () {
  const email = document.getElementById("authEmail")?.value.trim();
  if (!email) return showToast("Enter your email first, then tap Forgot password.");
  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Password reset email sent. Check your inbox.");
  } catch (error) {
    console.error(error);
    showToast(error.code === "auth/user-not-found"
      ? "No PawBridge account exists with this email."
      : "Unable to send the reset email. Please check the email address.");
  }
};

window.logoutUser = async function () {
  try {
    await signOut(auth);
    showPage("home");
    showToast("You have been logged out.");
  } catch (error) {
    console.error(error);
    showToast("Unable to logout. Please try again.");
  }
};

function formatAuthError(error) {
  const messages = {
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase. Add localhost and your deployed domain in Firebase Authentication → Settings → Authorized domains.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase Authentication.",
    "auth/network-request-failed": "Network error. Check your internet connection."
  };
  return messages[error?.code] || `Google login failed (${error?.code || "unknown error"}).`;
}
