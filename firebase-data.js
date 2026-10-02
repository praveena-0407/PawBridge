// PawBridge - Firestore data layer
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

function userOrThrow() {
  const user = auth.currentUser;
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}

export async function createPetListing(data) {
  const user = userOrThrow();
  return addDoc(collection(db, "petListings"), {
    ...data,
    sellerUid: user.uid,
    sellerName: user.displayName || user.email?.split("@")[0] || "PawBridge user",
    sellerEmail: user.email || "",
    createdAt: serverTimestamp(),
    status: "pending_review"
  });
}

export async function createUserPet(data) {
  const user = userOrThrow();
  return addDoc(collection(db, "userPets"), {
    ...data,
    uid: user.uid,
    ownerName: user.displayName || user.email?.split("@")[0] || "PawBridge user",
    ownerEmail: user.email || "",
    createdAt: serverTimestamp()
  });
}

export async function createAdoptionRequest(data) {
  const user = userOrThrow();
  return addDoc(collection(db, "adoptionRequests"), {
    ...data,
    uid: user.uid,
    userName: user.displayName || "",
    userEmail: user.email || "",
    createdAt: serverTimestamp(),
    status: "under_review"
  });
}

export async function createServiceBooking(data) {
  const user = userOrThrow();
  return addDoc(collection(db, "serviceBookings"), {
    ...data,
    uid: user.uid,
    userName: user.displayName || "",
    userEmail: user.email || "",
    createdAt: serverTimestamp(),
    status: "confirmed"
  });
}

export async function createOrder(data) {
  const user = userOrThrow();
  return addDoc(collection(db, "orders"), {
    ...data,
    uid: user.uid,
    userName: user.displayName || "",
    userEmail: user.email || "",
    createdAt: serverTimestamp(),
    status: "order_received"
  });
}

async function userDocs(collectionName) {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const q = query(
      collection(db, collectionName),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    // If the composite index is not ready yet, retry without orderBy.
    const q = query(collection(db, collectionName), where("uid", "==", user.uid), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

export const getUserBookings = () => userDocs("serviceBookings");
export const getUserOrders = () => userDocs("orders");
export const getUserAdoptions = () => userDocs("adoptionRequests");
export const getUserPets = () => userDocs("userPets");

export async function getMyListings() {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(collection(db, "petListings"), where("sellerUid", "==", user.uid), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


// Expose safe actions to the existing PawBridge UI.
window.pawCreatePetListing = createPetListing;
window.pawCreateAdoptionRequest = createAdoptionRequest;
window.pawCreateUserPet = createUserPet;
window.pawCreateServiceBooking = createServiceBooking;
window.pawCreateOrder = createOrder;
window.pawGetUserBookings = getUserBookings;
window.pawGetUserOrders = getUserOrders;
window.pawGetUserAdoptions = getUserAdoptions;
window.pawGetUserPets = getUserPets;
window.pawGetMyListings = getMyListings;
