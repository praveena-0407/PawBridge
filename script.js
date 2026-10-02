const pets = [
  {id:1,name:"Bruno",breed:"Golden Retriever",type:"Dog",age:"2 Years",gender:"Male",location:"Hyderabad",health:"Vaccinated",price:25000,img:"assets/dog.svg",verified:true},
  {id:2,name:"Luna",breed:"Persian Cat",type:"Cat",age:"1 Year",gender:"Female",location:"Hyderabad",health:"Vaccinated",price:18000,img:"assets/cat.svg",verified:true},
  {id:3,name:"Coco",breed:"Labrador",type:"Dog",age:"10 Months",gender:"Female",location:"Bengaluru",health:"Healthy",price:22000,img:"assets/dog2.svg",verified:true},
  {id:4,name:"Milo",breed:"Lovebird",type:"Bird",age:"8 Months",gender:"Male",location:"Chennai",health:"Health checked",price:3500,img:"assets/bird.svg",verified:false},
  {id:5,name:"Mochi",breed:"Holland Lop",type:"Rabbit",age:"1 Year",gender:"Female",location:"Hyderabad",health:"Healthy",price:4500,img:"assets/rabbit.svg",verified:true},
  {id:6,name:"Oreo",breed:"Indie Dog",type:"Dog",age:"1.5 Years",gender:"Male",location:"Pune",health:"Vaccinated",price:0,img:"assets/dog2.svg",verified:true},
  {id:7,name:"Nala",breed:"Indie Cat",type:"Cat",age:"9 Months",gender:"Female",location:"Mumbai",health:"Vaccinated",price:0,img:"assets/cat.svg",verified:true},
  {id:8,name:"Snowy",breed:"White Rabbit",type:"Rabbit",age:"7 Months",gender:"Male",location:"Chennai",health:"Healthy",price:4000,img:"assets/rabbit.svg",verified:false}
];

const services = {
  "Grooming & Spa": {icon:"✂️",desc:"Bath, haircut, nail trimming, ear cleaning and relaxing spa treatments.",fields:["Pet name","Owner name","Phone number","Breed","Service","Date","Time"]},
  "Veterinary Care": {icon:"🩺",desc:"Request a convenient veterinary consultation for your pet.",fields:["Pet name","Owner name","Phone number","Breed","Reason for consultation","Date","Time"]},
  "Boarding & Daycare": {icon:"🏨",desc:"Safe short-term care for your pet while you are travelling or away.",fields:["Pet name","Owner name","Phone number","Breed","Check-in date","Check-out date","Special instructions"]}
};

document.addEventListener("DOMContentLoaded",()=>{
  renderPets(true); renderDashboard();
  window.addEventListener("pawbridge-auth-ready", (event)=>{
    if (event.detail.user) closeAuth();
    if (event.detail.user) {
      const n=document.getElementById("dashboardUserName");
      const e=document.getElementById("dashboardUserEmail");
      const p=document.getElementById("dashboardUserPhoto");
      if(n) n.textContent=event.detail.user.displayName || (event.detail.user.email||"Pet Parent").split("@")[0];
      if(e) e.textContent=event.detail.user.email || "";
      renderDashboard();
      if(p && event.detail.user.photoURL){p.src=event.detail.user.photoURL;p.style.display="block";}
    }
  });
});

function showPage(page){
  if(page==="dashboard" && window.pawAuthReady && !window.pawCurrentUser){
    openAuth();
    showToast("Sign in to open your personal dashboard.");
    return;
  }
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  document.getElementById(page).classList.add("active-page");
  document.querySelectorAll(".nav-link").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
  window.scrollTo({top:0,behavior:"smooth"});
}
function scrollToId(id){setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}),120)}
let pawAuthMode = "signin";
function setAuthMode(mode){
  pawAuthMode = mode;
  const signup = mode === "signup";
  document.getElementById("authTitle").textContent = signup ? "Create your PawBridge account" : "Welcome back!";
  document.getElementById("authSubtitle").textContent = signup
    ? "Create one account to keep your pets, appointments, orders and requests together."
    : "Sign in to access your pets, bookings, orders and adoption activity.";
  document.getElementById("authNameWrap").classList.toggle("hidden", !signup);
  document.getElementById("authConfirmWrap").classList.toggle("hidden", !signup);
  document.getElementById("forgotPasswordBtn").classList.toggle("hidden", signup);
  document.getElementById("authSubmitBtn").textContent = signup ? "Create account" : "Sign in";
  document.getElementById("signinTab").classList.toggle("active", !signup);
  document.getElementById("signupTab").classList.toggle("active", signup);
  document.getElementById("authSwitchText").innerHTML = signup
    ? "Already have an account? <button class='link-btn' onclick=\"setAuthMode('signin')\">Sign in</button>"
    : "New to PawBridge? <button class='link-btn' onclick=\"setAuthMode('signup')\">Create an account</button>";
}
function submitAuth(){
  if(pawAuthMode==="signup") signupWithEmail();
  else loginWithEmail();
}
function openAuth(){
  setAuthMode("signin");
  document.getElementById("authOverlay").classList.remove("hidden");
}

function openModal(html){
  const overlay=document.getElementById("modalOverlay");
  const content=document.getElementById("modalContent");
  if(!overlay || !content){ console.error("PawBridge modal elements are missing."); return; }
  content.innerHTML=html;
  overlay.classList.remove("hidden");
}
function closeModal(){document.getElementById("modalOverlay")?.classList.add("hidden");}
function showToast(msg){
  const t=document.getElementById("toast");
  if(!t){ alert(msg); return; }
  t.textContent=msg; t.classList.add("show");
  clearTimeout(window.__pawToastTimer);
  window.__pawToastTimer=setTimeout(()=>t.classList.remove("show"),2800);
}
function openSearch(){showPage("services"); setTimeout(()=>document.getElementById("petSearch")?.focus(),150);}
function petCard(p){
  const action=p.price===0?"View Adoption":"View Details";
  return `<article class="pet-card">
    <div class="pet-img"><img src="${p.img}" alt="${escapeHtml(p.name)} - ${escapeHtml(p.breed)}">${p.verified?'<span class="badge">✓ PawBridge Verified</span>':''}</div>
    <div class="pet-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.breed)} • ${escapeHtml(p.location)}</p>
    <div class="pet-meta"><span>${escapeHtml(p.age)}</span><span>${escapeHtml(p.gender)}</span><span>💉 ${escapeHtml(p.health)}</span></div>
    <div class="pet-bottom"><span class="price">${p.price?`₹${p.price.toLocaleString("en-IN")}`:"♡ Adoption"}</span><button class="small-btn" onclick="viewPet(${p.id})">${action}</button></div></div>
  </article>`;
}
function closeAuth(){document.getElementById("authOverlay").classList.add("hidden")}
function requireLogin(actionText="continue"){
  if(window.pawCurrentUser) return true;
  showToast(`Please sign in to ${actionText}.`);
  openAuth();
  return false;
}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));}

function renderPets(featured=false){
  const q=(document.getElementById("petSearch")?.value||"").toLowerCase();
  const type=document.getElementById("petType")?.value||"all";
  const gender=document.getElementById("petGender")?.value||"all";
  let list=pets.filter(p=>(type==="all"||p.type===type)&&(gender==="all"||p.gender===gender)&&`${p.name} ${p.breed} ${p.location}`.toLowerCase().includes(q));
  if(featured) list=pets.slice(0,4);
  const target=document.getElementById(featured?"featuredPets":"allPets");
  if(target) target.innerHTML=list.map(petCard).join("")||`<p class="muted">No pets found. Try another filter.</p>`;
}
function viewPet(id){
  const p=pets.find(x=>x.id===id);
  openModal(`<span class="eyebrow">${p.verified?"PAWBRIDGE VERIFIED":"LISTING"}</span><h2 class="modal-title">${p.name} — ${p.breed}</h2>
  <p class="muted">A demo pet profile for the academic prototype.</p>
  <div class="pet-detail" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px">
    <img src="${p.img}" alt="${p.name}" style="width:100%;height:260px;object-fit:contain;background:#eef2e8;border-radius:18px">
    <div><p><b>Breed:</b> ${p.breed}</p><p><b>Age:</b> ${p.age}</p><p><b>Gender:</b> ${p.gender}</p><p><b>Location:</b> ${p.location}</p><p><b>Health:</b> ${p.health}</p><p><b>Price:</b> ${p.price?`₹${p.price.toLocaleString("en-IN")}`:"Adoption"}</p>
    <button class="primary full" onclick="${p.price?`requestPet(${p.id})`:`openAdoption(${p.id})`}">${p.price?"Request to Buy":"Apply to Adopt"}</button></div></div>`);
}
async function requestPet(id){
  if(!requireLogin("request a pet")) return;
  const p=pets.find(x=>x.id===id);
  closeModal();
  try{
    if(window.pawCreateServiceBooking){
      await window.pawCreateServiceBooking({type:"Pet purchase interest",petId:p.id,petName:p.name,breed:p.breed,phone:"",preferredDate:"",preferredTime:"",paymentMethod:"Contact seller"});
    }
    showToast(`Interest in ${p.name} submitted. PawBridge will contact you.`);
    renderDashboard();
  }catch(err){console.error(err);showToast("Could not submit your request. Please try again.");}
}
function openAdoption(petId=null){
  if(!requireLogin("submit an adoption request")) return;
  const p=petId?pets.find(x=>x.id===petId):null;
  openModal(`<span class="eyebrow">ADOPT & REHOME</span><h2 class="modal-title">Give a pet a forever home ❤️</h2>
  <p class="muted">Tell us about yourself and the home you can provide. Our PawBridge team will review the request.</p>
  <form class="form-grid" onsubmit="submitAdoption(event)">
    <div><label>Your name <span class="required-star">*</span></label><input name="name" value="${escapeHtml(window.pawCurrentUser?.displayName||"")}" required placeholder="Full name"></div>
    <div><label>Phone number <span class="required-star">*</span></label><input name="phone" required placeholder="+91 98765 43210"></div>
    <div><label>Email <span class="required-star">*</span></label><input name="email" type="email" value="${escapeHtml(window.pawCurrentUser?.email||"")}" required placeholder="you@example.com"></div>
    <div><label>Pet name <span class="required-star">*</span></label><input name="pet" value="${p?escapeHtml(p.name):""}" required placeholder="Pet you want to adopt"></div>
    <div><label>Home type</label><select name="homeType"><option>Independent house</option><option>Apartment</option><option>Farm / open space</option></select></div>
    <div><label>Previous pet experience</label><select name="experience"><option>First-time pet parent</option><option>Experienced</option></select></div>
    <div><label>Preferred date <span class="required-star">*</span></label><input name="date" type="date" required></div>
    <div class="full-field"><label>Why would you like to adopt? <span class="required-star">*</span></label><textarea name="reason" required placeholder="Tell us about your home and care plan..."></textarea></div>
    <div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Submit Request</button></div>
  </form>`);
}
async function submitAdoption(e){
  e.preventDefault(); if(!requireLogin("submit an adoption request")) return;
  const f=new FormData(e.target);
  try{
    await window.pawCreateAdoptionRequest({applicantName:f.get("name"),phone:f.get("phone"),email:f.get("email"),petName:f.get("pet"),homeType:f.get("homeType"),experience:f.get("experience"),preferredDate:f.get("date"),reason:f.get("reason")});
    closeModal(); showToast("Adoption request submitted successfully ❤️"); renderDashboard();
  }catch(err){console.error(err);showToast("Unable to submit adoption request. Check Firebase setup.");}
}

function openSellPet(){
  if(!requireLogin("list a pet")) return;
  openModal(`<span class="eyebrow">SELL / REHOME</span><h2 class="modal-title">Create a pet listing 🐾</h2>
  <p class="muted">Add accurate details so interested families can understand the pet before PawBridge reviews the listing.</p>
  <form class="form-grid" onsubmit="submitSellPet(event)">
    <div><label>Pet name <span class="required-star">*</span></label><input name="petName" required placeholder="e.g. Bruno"></div>
    <div><label>Pet type <span class="required-star">*</span></label><select name="type" required><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></div>
    <div><label>Breed <span class="required-star">*</span></label><input name="breed" required placeholder="e.g. Golden Retriever"></div>
    <div><label>Age <span class="required-star">*</span></label><input name="age" required placeholder="e.g. 2 years"></div>
    <div><label>Gender</label><select name="gender"><option>Male</option><option>Female</option></select></div>
    <div><label>City / Location <span class="required-star">*</span></label><input name="location" required placeholder="e.g. Kakinada"></div>
    <div><label>Health status <span class="required-star">*</span></label><select name="health"><option>Vaccinated</option><option>Healthy</option><option>Health checked</option><option>Needs medical attention</option></select></div>
    <div><label>Price (₹) <span class="required-star">*</span></label><input name="price" type="number" min="0" required placeholder="Enter amount or 0 for adoption"></div>
    <div class="full-field"><label>Photo URL (optional)</label><input name="imageUrl" type="url" placeholder="https://.../pet-photo.jpg"><small class="secure-note">For the student prototype, a public image URL is used. Firebase Storage can be added later for direct uploads.</small></div>
    <div class="full-field"><label>Pet description</label><textarea name="description" placeholder="Temperament, vaccination details, special care, reason for rehoming..."></textarea></div>
    <div class="form-note">🔎 New listings are saved in Firestore with <b>Pending Review</b> status so your PawBridge team can verify them before publishing.</div>
    <div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Submit Listing</button></div>
  </form>`);
}
async function submitSellPet(e){
  e.preventDefault(); if(!requireLogin("list a pet")) return;
  const f=new FormData(e.target);
  try{
    await window.pawCreatePetListing({petName:f.get("petName"),type:f.get("type"),breed:f.get("breed"),age:f.get("age"),gender:f.get("gender"),location:f.get("location"),health:f.get("health"),price:Number(f.get("price")||0),imageUrl:f.get("imageUrl")||"",description:f.get("description")||""});
    closeModal(); showToast("Pet listing submitted for PawBridge review 🐾"); renderDashboard();
  }catch(err){console.error(err);showToast("Unable to save listing. Check Firebase setup.");}
}

function openService(name){
  if(!requireLogin("book a service")) return;
  const s=services[name];
  const extra = name==="Grooming & Spa" ? `<div><label>Service <span class="required-star">*</span></label><select name="service"><option>Full Grooming</option><option>Bath & Blow Dry</option><option>Haircut & Styling</option><option>Nail Trimming</option><option>Spa Treatment</option></select></div><div><label>Service mode</label><select name="mode"><option>At PawBridge partner centre</option><option>Home service</option></select></div>` : name==="Veterinary Care" ? `<div><label>Consultation mode</label><select name="mode"><option>Clinic visit</option><option>Home visit request</option><option>Online consultation request</option></select></div>` : `<div><label>Care plan</label><select name="mode"><option>Daycare</option><option>Overnight boarding</option></select></div>`;
  openModal(`<span class="eyebrow">${name.toUpperCase()}</span><h2 class="modal-title">${s.icon} ${name}</h2><p class="muted">${s.desc}</p>
  <form class="form-grid" onsubmit="submitService(event,'${name}')">
    <div><label>Owner name <span class="required-star">*</span></label><input name="owner" value="${escapeHtml(window.pawCurrentUser?.displayName||"")}" required></div>
    <div><label>Phone number <span class="required-star">*</span></label><input name="phone" required placeholder="+91 98765 43210"></div>
    <div><label>Pet name <span class="required-star">*</span></label><input name="petName" required placeholder="Your pet's name"></div>
    <div><label>Breed <span class="required-star">*</span></label><input name="breed" required placeholder="e.g. Labrador"></div>
    ${extra}
    <div><label>Date <span class="required-star">*</span></label><input name="date" type="date" required></div>
    <div><label>Time <span class="required-star">*</span></label><input name="time" type="time" required></div>
    <div class="full-field"><label>Address / special instructions</label><textarea name="notes" placeholder="Address for home service, health notes, special care instructions..."></textarea></div>
    <div class="payment"><label>Payment method:</label><label><input type="radio" name="pay" value="UPI / Online" checked> UPI / Online</label><label><input type="radio" name="pay" value="Cash / Pay at centre"> Cash / Pay at centre</label><small class="secure-note">Online payment is recorded as your selected preference. A live payment gateway such as Razorpay can be connected in the next step using your merchant/test key.</small></div>
    <div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Confirm Booking</button></div>
  </form>`);
}
async function submitService(e,name){
  e.preventDefault(); if(!requireLogin("book a service")) return;
  const f=new FormData(e.target);
  try{
    await window.pawCreateServiceBooking({service:name,ownerName:f.get("owner"),phone:f.get("phone"),petName:f.get("petName"),breed:f.get("breed"),subService:f.get("service")||"",mode:f.get("mode")||"",date:f.get("date"),time:f.get("time"),notes:f.get("notes")||"",paymentMethod:f.get("pay")||"UPI / Online"});
    closeModal(); showToast(`${name} booked successfully! 🐾`); renderDashboard();
  }catch(err){console.error(err);showToast("Unable to book service. Check Firebase setup.");}
}
function openDelivery(){
  if(!requireLogin("shop for pet essentials")) return;
  const products=[["Premium Dog Food","₹599","assets/food.svg"],["Chew Toy","₹199","assets/toy.svg"],["Pet Shampoo","₹249","assets/shampoo.svg"],["Comfort Collar","₹299","assets/collar.svg"]];
  openModal(`<div class="delivery-modal"><span class="eyebrow">PAWBRIDGE SHOP</span><h2 class="modal-title">Pet essentials at your door 🛵</h2><p class="muted">Add items to your cart, then choose UPI or Cash on Delivery.</p>
  <div class="shop-grid">${products.map((x,i)=>`<div class="product"><img src="${x[2]}" alt="${x[0]}"><b>${x[0]}</b><small>${x[1]}</small><button class="small-btn" onclick="addToCart(${i},'${x[0]}','${x[1]}')">Add to cart</button></div>`).join("")}</div>
  <div id="cartBar" class="cart-bar"><span>Cart is empty</span><button class="secondary" disabled>Checkout</button></div></div>`);
}
let cart=[];
function addToCart(i,name,price){cart.push({name,price});const total=cart.reduce((s,x)=>s+parseInt(x.price.replace(/[₹,]/g,"")),0);document.getElementById("cartBar").innerHTML=`<span>🛒 ${cart.length} item(s) • ₹${total.toLocaleString("en-IN")}</span><button class="secondary" onclick="checkout(${total})">Checkout</button>`;showToast(`${name} added to cart`)}
function checkout(total){closeModal();openModal(`<span class="eyebrow">CHECKOUT</span><h2 class="modal-title">Complete your order</h2><p class="muted">Total payable: <b>₹${total.toLocaleString("en-IN")}</b></p><form class="form-grid" onsubmit="placeOrder(event,${total})"><div class="full-field"><label>Delivery address</label><textarea name="address" required placeholder="House no., street, city, PIN"></textarea></div><div><label>Phone</label><input name="phone" required placeholder="+91 98765 43210"></div><div><label>Payment</label><select name="payment"><option>UPI / Online Payment</option><option>Cash on Delivery</option></select></div><div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Place Order</button></div></form>`)}
async function placeOrder(e,total){
  e.preventDefault(); if(!requireLogin("place an order")) return;
  const f=new FormData(e.target);
  try{
    const orderId="PB"+Math.floor(100000+Math.random()*900000);
    await window.pawCreateOrder({orderId,total:Number(total),items:cart.map(x=>({name:x.name,price:x.price})),address:f.get("address"),phone:f.get("phone"),paymentMethod:f.get("payment")||"Cash on Delivery"});
    cart=[]; closeModal(); showToast(`Order ${orderId} placed successfully! 🛵`); renderDashboard();
  }catch(err){console.error(err);showToast("Unable to place order. Check Firebase setup.");}
}
function formatDate(value){
  if(!value) return "Date pending";
  try{
    if(typeof value === "object" && value.seconds) value = new Date(value.seconds*1000);
    const d = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  }catch{return String(value);}
}
function statusClass(status){
  const s=String(status||"").toLowerCase();
  if(s.includes("deliver")||s.includes("complete")||s.includes("confirm")) return "done";
  if(s.includes("transit")||s.includes("process")||s.includes("received")) return "transit";
  return "pending";
}
function petImage(type){
  const t=String(type||"").toLowerCase();
  if(t.includes("cat")) return "assets/cat.svg";
  if(t.includes("bird")) return "assets/bird.svg";
  if(t.includes("rabbit")) return "assets/rabbit.svg";
  return "assets/dog.svg";
}
function openAddPet(){
  if(!requireLogin("add your pet")) return;
  openModal(`<span class="eyebrow">MY PETS</span><h2 class="modal-title">Add your pet 🐾</h2>
  <p class="muted">Save your pet profile once and reuse it when booking PawBridge services.</p>
  <form class="form-grid" onsubmit="submitUserPet(event)">
    <div><label>Pet name <span class="required-star">*</span></label><input name="petName" required placeholder="e.g. Bruno"></div>
    <div><label>Pet type <span class="required-star">*</span></label><select name="type" required><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></div>
    <div><label>Breed</label><input name="breed" placeholder="e.g. Golden Retriever"></div>
    <div><label>Age</label><input name="age" placeholder="e.g. 2 years"></div>
    <div><label>Gender</label><select name="gender"><option>Male</option><option>Female</option><option>Not specified</option></select></div>
    <div><label>Health status</label><select name="health"><option>Healthy</option><option>Vaccinated</option><option>Health checked</option><option>Needs medical attention</option></select></div>
    <div class="full-field"><label>Notes</label><textarea name="notes" placeholder="Temperament, allergies, special care, etc."></textarea></div>
    <div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save Pet</button></div>
  </form>`);
}
async function submitUserPet(e){
  e.preventDefault(); if(!requireLogin("add your pet")) return;
  const f=new FormData(e.target);
  try{
    await window.pawCreateUserPet({petName:f.get("petName"),type:f.get("type"),breed:f.get("breed")||"",age:f.get("age")||"",gender:f.get("gender")||"",health:f.get("health")||"",notes:f.get("notes")||""});
    closeModal(); showToast("Pet profile saved to your PawBridge account 🐾"); renderDashboard();
  }catch(err){console.error(err);showToast("Unable to save your pet. Check Firestore rules/setup.");}
}
async function renderDashboard(){
  const orderEl=document.getElementById("ordersList"), bookingEl=document.getElementById("bookingsList");
  if(!orderEl || !bookingEl) return;
  const adoptionEl=document.getElementById("adoptionsList"), petsEl=document.getElementById("myPetsList"), listingsEl=document.getElementById("listingsList");
  const user=window.pawCurrentUser;
  if(!user){
    ["statPets","statOrders","statBookings","statAdoptions"].forEach(id=>document.getElementById(id)?.replaceChildren(document.createTextNode("0")));
    orderEl.innerHTML='<div class="empty-state">Sign in to see your orders.</div>';
    bookingEl.innerHTML='<div class="empty-state">Sign in to see your bookings.</div>';
    if(adoptionEl) adoptionEl.innerHTML='<div class="empty-state">Sign in to see adoption requests.</div>';
    if(petsEl) petsEl.innerHTML='<div class="empty-state">Sign in to manage your pets.</div>';
    if(listingsEl) listingsEl.innerHTML='<div class="empty-state">Sign in to see your listings.</div>';
    return;
  }
  [orderEl,bookingEl,adoptionEl,petsEl,listingsEl].forEach(el=>{if(el) el.innerHTML='<div class="loading-state">Loading your PawBridge data…</div>';});
  try{
    const [orders,bookings,adoptions,pets,listings]=await Promise.all([
      window.pawGetUserOrders?.()||[], window.pawGetUserBookings?.()||[], window.pawGetUserAdoptions?.()||[], window.pawGetUserPets?.()||[], window.pawGetMyListings?.()||[]
    ]);
    document.getElementById("statPets")?.replaceChildren(document.createTextNode(String(pets.length)));
    document.getElementById("statOrders")?.replaceChildren(document.createTextNode(String(orders.length)));
    document.getElementById("statBookings")?.replaceChildren(document.createTextNode(String(bookings.length)));
    document.getElementById("statAdoptions")?.replaceChildren(document.createTextNode(String(adoptions.length)));

    orderEl.innerHTML=orders.slice(0,5).map(o=>`<div class="order"><div><b>#${escapeHtml(o.orderId||o.id||"Order")}</b><small>${o.items?.length||0} item(s) • ₹${Number(o.total||0).toLocaleString("en-IN")}</small></div><span class="status ${statusClass(o.status)}">${escapeHtml(o.status||"Received")}</span></div>`).join("")||'<div class="empty-state">No orders yet. <button class="text-btn" onclick="showPage(\'services\');scrollToId(\'delivery\')">Shop essentials</button></div>';
    bookingEl.innerHTML=bookings.slice(0,5).map(b=>`<div class="booking-row"><div><b>${escapeHtml(b.service||b.type||"Booking")}</b><small>${escapeHtml(b.petName||"Pet")} • ${escapeHtml(b.date||b.preferredDate||"Date pending")} ${escapeHtml(b.time||b.preferredTime||"")}</small></div><span class="status ${statusClass(b.status)}">${escapeHtml(b.status||"Confirmed")}</span></div>`).join("")||'<div class="empty-state">No bookings yet. <button class="text-btn" onclick="showPage(\'services\');scrollToId(\'care\')">Book a service</button></div>';
    if(adoptionEl) adoptionEl.innerHTML=adoptions.slice(0,4).map(a=>`<div class="booking-row"><div><b>${escapeHtml(a.petName||a.pet||"Adoption request")}</b><small>Submitted ${formatDate(a.createdAt?.toDate?a.createdAt.toDate():a.createdAt)} • ${escapeHtml(a.homeType||"Application")}</small></div><span class="status ${statusClass(a.status)}">${escapeHtml(a.status||"Under review")}</span></div>`).join("")||'<div class="empty-state">No adoption requests yet. <button class="text-btn" onclick="openAdoption()">Find a forever home</button></div>';
    if(petsEl) petsEl.innerHTML=pets.slice(0,4).map(p=>`<div class="pet-mini"><img src="${escapeHtml(petImage(p.type))}" alt="${escapeHtml(p.petName||"Pet")}"><b>${escapeHtml(p.petName||"Unnamed pet")}</b><small>${escapeHtml([p.breed,p.age].filter(Boolean).join(" • ")||p.type||"Pet")}</small></div>`).join("")||'<div class="empty-state">You haven\'t added any pets yet.<br><button class="primary small-btn" onclick="openAddPet()">+ Add my pet</button></div>';
    if(listingsEl) listingsEl.innerHTML=listings.slice(0,4).map(l=>`<div class="booking-row"><div><b>${escapeHtml(l.petName||"Pet listing")}</b><small>${escapeHtml(l.breed||l.type||"Pet")} • ${escapeHtml(l.location||"Location not set")}</small></div><span class="status ${statusClass(l.status)}">${escapeHtml(l.status||"Pending review")}</span></div>`).join("")||'<div class="empty-state">No listings created yet. <button class="text-btn" onclick="showPage(\'services\');scrollToId(\'marketplace\')">Sell / Rehome</button></div>';
  }catch(err){
    console.error("Dashboard load error:",err);
    orderEl.innerHTML='<div class="empty-state">Unable to load orders. Please refresh.</div>';
    bookingEl.innerHTML='<div class="empty-state">Unable to load bookings. Please refresh.</div>';
    if(adoptionEl) adoptionEl.innerHTML='<div class="empty-state">Unable to load adoption requests.</div>';
    if(petsEl) petsEl.innerHTML='<div class="empty-state">Unable to load your pets.</div>';
    if(listingsEl) listingsEl.innerHTML='<div class="empty-state">Unable to load your listings.</div>';
  }
}
function filterServices(type,el){document.querySelectorAll(".pill").forEach(x=>x.classList.remove("active"));el.classList.add("active");const market=document.getElementById("marketplace"),delivery=document.getElementById("delivery");if(type==="market")market.style.display="block";else if(type==="delivery")delivery.scrollIntoView({behavior:"smooth"});else if(type==="care")document.querySelector(".booking-grid").scrollIntoView({behavior:"smooth"});else if(type==="stay")openService("Boarding & Daycare")}
