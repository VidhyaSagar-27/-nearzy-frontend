/* ============================================================
   NEARZY — EXTENDED FEATURES v2.0
   ============================================================ */
"use strict";

const NEARZY_VERSION = "2.0.0";
const LOYALTY_RATE = 2;
const POINT_VALUE = 0.10;
const PRO_MONTHLY = 149;
const PRO_YEARLY = 999;

window.NZ = window.NZ || {};
Object.assign(window.NZ, {
  wallet: { balance: 0, transactions: [] },
  loyalty: { points: 0, tier: "Bronze", history: [] },
  subscription: { active: false, plan: null, expiry: null },
  notifications: [],
  groupOrder: { active: false, orderId: null, members: [], items: [] },
  tableBookings: [],
  giftCards: [],
  priceAlerts: [],
  liveTracking: { active: false, orderId: null },
  stories: [],
  recentSearches: JSON.parse(localStorage.getItem("nz_recent_searches") || "[]"),
  chatSessions: {},
  deliverySchedule: null,
  referrals: { code: "", count: 0, earned: 0 },
});

/* ══ 1. WALLET ══════════════════════════════════════════════ */
async function loadWallet() {
  if (!window.S?.token) return;
  try {
    const res = await fetch(`${window.API}/wallet/balance`, { headers: { Authorization: "Bearer " + S.token } });
    if (!res.ok) return;
    const data = await res.json();
    NZ.wallet.balance = data.balance || 0;
    NZ.wallet.totalCredited = data.totalCredited || 0;
    NZ.wallet.totalDebited = data.totalDebited || 0;
    updateWalletUI();
  } catch (e) { console.warn("Wallet load:", e.message); }
}

async function loadWalletTransactions() {
  if (!window.S?.token) return [];
  try {
    const res = await fetch(`${window.API}/wallet/transactions?limit=50`, { headers: { Authorization: "Bearer " + S.token } });
    const data = await res.json();
    NZ.wallet.transactions = data.transactions || [];
    return NZ.wallet.transactions;
  } catch (e) { return []; }
}

function updateWalletUI() {
  document.querySelectorAll(".wallet-balance-display").forEach(el => {
    el.textContent = "₹" + (NZ.wallet.balance || 0).toFixed(2);
  });
}

async function topUpWallet(amount) {
  if (!window.S?.token) { if (typeof showLoginModal === "function") showLoginModal(); return; }
  if (!amount || amount < 10) { toast("Minimum top-up is ₹10", "error"); return; }
  try {
    showLoader("Creating payment...");
    const res = await fetch(`${window.API}/wallet/topup-create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + S.token },
      body: JSON.stringify({ amount: Number(amount) })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    hideLoader();
    const options = {
      key: window.RAZORPAY_KEY,
      amount: data.order.amount, currency: "INR",
      name: "Nearzy", description: `Wallet Top-up ₹${amount}`,
      order_id: data.order.id,
      handler: async function(response) {
        try {
          showLoader("Verifying...");
          const vRes = await fetch(`${window.API}/wallet/topup-verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + S.token },
            body: JSON.stringify({ ...response, amount: Number(amount) })
          });
          const vData = await vRes.json();
          hideLoader();
          if (vData.success) {
            NZ.wallet.balance = vData.balance;
            updateWalletUI();
            closeAllModals();
            toast(`₹${amount} added to wallet! 💰`, "success");
            renderWalletPage();
          } else { toast(vData.message || "Verification failed", "error"); }
        } catch (e) { hideLoader(); toast("Verification error", "error"); }
      },
      prefill: { name: S.user?.name || "", email: S.user?.email || "", contact: S.user?.phone || "" },
      theme: { color: "#fc8019" },
      modal: { ondismiss: () => { hideLoader(); } }
    };
    new Razorpay(options).open();
  } catch (e) { hideLoader(); toast(e.message || "Top-up failed", "error"); }
}

function showWalletPage() { showPage("walletfull"); }

async function renderWalletPage() {
  await loadWallet();
  const txns = await loadWalletTransactions();
  const el = document.getElementById("walletPageContent");
  if (!el) return;
  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:16px">
    <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460,#533483);border-radius:20px;padding:28px;margin-bottom:16px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.05)"></div>
      <div style="position:relative;z-index:1">
        <div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;text-transform:uppercase;letter-spacing:.1em">Nearzy Wallet</div>
        <div style="font-size:40px;font-weight:800;color:#fff;margin:6px 0">₹${(NZ.wallet.balance||0).toFixed(2)}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.5)">Available Balance</div>
        <div style="display:flex;gap:10px;margin-top:20px">
          <button onclick="openTopUpModal()" style="flex:1;padding:11px;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.25);border-radius:12px;color:#fff;font-size:13px;font-weight:700;cursor:pointer">+ Add Money</button>
          <button onclick="openSendMoneyModal()" style="flex:1;padding:11px;background:rgba(252,128,25,.4);border:1.5px solid rgba(252,128,25,.6);border-radius:12px;color:#fff;font-size:13px;font-weight:700;cursor:pointer">Send Money</button>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      ${[["⬆️","Added","₹"+(NZ.wallet.totalCredited||0),"#e6f7ee"],["⬇️","Spent","₹"+(NZ.wallet.totalDebited||0),"#fff3e8"],["📋","Txns",txns.length,"#e3f2fd"]].map(([i,l,v,bg])=>`
      <div style="background:${bg};border-radius:12px;padding:14px;text-align:center"><div style="font-size:22px">${i}</div><div style="font-size:14px;font-weight:800;color:var(--ink)">${v}</div><div style="font-size:10px;color:var(--ink3)">${l}</div></div>`).join("")}
    </div>
    <div style="background:var(--white);border-radius:16px;padding:16px;margin-bottom:16px;box-shadow:var(--card-shadow)">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:12px">⚡ Quick Add</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        ${[100,200,500,1000,2000].map(a=>`<button onclick="topUpWallet(${a})" style="padding:9px 16px;background:var(--brand-light);border:1.5px solid var(--brand);border-radius:99px;color:var(--brand);font-size:13px;font-weight:700;cursor:pointer">₹${a}</button>`).join("")}
      </div>
      <div style="display:flex;gap:8px">
        <input type="number" id="customTopUp" placeholder="Custom amount" style="flex:1;padding:10px 12px;border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:13px;color:var(--ink);background:var(--bg)" min="10" max="10000">
        <button onclick="topUpWallet(+document.getElementById('customTopUp').value)" style="padding:10px 18px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:700;cursor:pointer">Add</button>
      </div>
    </div>
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow)">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:14px">📋 Transactions</div>
      ${txns.length === 0 ? `<div style="text-align:center;padding:24px;color:var(--ink3)"><div style="font-size:40px">💳</div><div style="font-weight:700;margin-top:8px">No transactions yet</div></div>` :
      txns.map(tx=>{const c=tx.type==="credit";return`
      <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #f5f5f5">
        <div style="width:38px;height:38px;border-radius:10px;background:${c?"#e6f7ee":"#fff3e8"};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${c?"⬆️":"⬇️"}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--ink)">${tx.description||"Transaction"}</div><div style="font-size:11px;color:var(--ink3)">${new Date(tx.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div></div>
        <div style="text-align:right"><div style="font-size:14px;font-weight:800;color:${c?"var(--green)":"var(--red)"}">${c?"+":"−"}₹${tx.amount}</div><div style="font-size:10px;color:var(--ink3)">₹${tx.balanceAfter?.toFixed(2)||"—"}</div></div>
      </div>`}).join("")}
    </div>
  </div>`;
}

function openTopUpModal() {
  openDynamicModal("Add Money to Wallet", `
    <div style="text-align:center;margin-bottom:16px"><div style="font-size:40px">💳</div><div style="font-size:12px;color:var(--ink2)">Balance: <strong>₹${(NZ.wallet.balance||0).toFixed(2)}</strong></div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
      ${[100,200,500,1000,2000,5000].map(a=>`<button onclick="document.getElementById('topupAmt').value='${a}'" style="padding:11px;background:var(--bg);border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:14px;font-weight:700;color:var(--ink);cursor:pointer">₹${a}</button>`).join("")}
    </div>
    <input type="number" id="topupAmt" placeholder="Enter amount" style="width:100%;padding:12px;border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:15px;text-align:center;font-weight:700;color:var(--ink);background:var(--bg);margin-bottom:12px" min="10" max="10000">
    <button onclick="topUpWallet(+document.getElementById('topupAmt').value)" style="width:100%;padding:14px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer">Add Money via Razorpay</button>
    <div style="text-align:center;margin-top:10px;font-size:11px;color:var(--ink3)">🔒 Secure payment via Razorpay</div>
  `);
}

function openSendMoneyModal() {
  openDynamicModal("Send Money", `
    <div class="fgroup"><label class="flabel">Recipient Phone/Email</label><input class="finput" id="sendTo" placeholder="Phone or email"></div>
    <div class="fgroup" style="margin-top:10px"><label class="flabel">Amount (₹)</label><input class="finput" type="number" id="sendAmt" placeholder="Amount" min="1"></div>
    <div class="fgroup" style="margin-top:10px"><label class="flabel">Note (optional)</label><input class="finput" id="sendNote" placeholder="Add a note..."></div>
    <div style="background:var(--brand-light);border-radius:var(--r-sm);padding:10px;margin:12px 0;font-size:12px;color:var(--brand);font-weight:600">Balance: ₹${(NZ.wallet.balance||0).toFixed(2)}</div>
    <button onclick="toast('Send money feature coming soon!','info')" style="width:100%;padding:13px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer">Send Money</button>
  `);
}

/* ══ 2. LOYALTY ═════════════════════════════════════════════ */
const LOYALTY_TIERS = [
  { name:"Bronze", min:0,    max:999,   color:"#cd7f32", icon:"🥉", perks:["1x points on orders","Birthday bonus"] },
  { name:"Silver", min:1000, max:4999,  color:"#9e9e9e", icon:"🥈", perks:["1.5x points","Free delivery 3x/month","Priority support"] },
  { name:"Gold",   min:5000, max:14999, color:"#ffc107", icon:"🥇", perks:["2x points","5 free deliveries/month","Early access to deals"] },
  { name:"Platinum",min:15000,max:Infinity,color:"#607d8b",icon:"💎",perks:["3x points","Unlimited free delivery","Dedicated support","Exclusive deals"] }
];

function getCurrentTier(pts) { return LOYALTY_TIERS.find(t=>pts>=t.min&&pts<t.max)||LOYALTY_TIERS[0]; }
function getNextTier(pts) { const i=LOYALTY_TIERS.findIndex(t=>pts>=t.min&&pts<t.max); return i<LOYALTY_TIERS.length-1?LOYALTY_TIERS[i+1]:null; }

function addLoyaltyPoints(orderAmount, multiplier=1) {
  const earned = Math.floor(orderAmount * LOYALTY_RATE * multiplier);
  const stored = JSON.parse(localStorage.getItem("nz_loyalty")||'{"points":0,"history":[]}');
  stored.points += earned;
  stored.history.unshift({ action:"Order", points:earned, date:new Date().toISOString() });
  localStorage.setItem("nz_loyalty", JSON.stringify(stored));
  NZ.loyalty.points = stored.points;
  if (earned > 0) toast(`🌟 +${earned} loyalty points earned!`, "success");
  return earned;
}

function loadLoyaltyData() {
  const stored = JSON.parse(localStorage.getItem("nz_loyalty")||'{"points":0,"history":[]}');
  NZ.loyalty.points = stored.points || 0;
  NZ.loyalty.history = stored.history || [];
  NZ.loyalty.tier = getCurrentTier(NZ.loyalty.points).name;
  return stored;
}

function renderLoyaltyPage() {
  loadLoyaltyData();
  const el = document.getElementById("loyaltyPageContent");
  if (!el) return;
  const tier = getCurrentTier(NZ.loyalty.points);
  const nextTier = getNextTier(NZ.loyalty.points);
  const progress = nextTier ? ((NZ.loyalty.points-tier.min)/(nextTier.min-tier.min))*100 : 100;
  const cashValue = (NZ.loyalty.points*POINT_VALUE).toFixed(2);
  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:16px">
    <div style="background:linear-gradient(135deg,${tier.color}22,${tier.color}44);border:2px solid ${tier.color};border-radius:20px;padding:24px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <div style="width:60px;height:60px;border-radius:50%;background:${tier.color};display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">${tier.icon}</div>
        <div style="flex:1"><div style="font-size:11px;color:var(--ink3);text-transform:uppercase;font-weight:700">Current Tier</div><div style="font-size:26px;font-weight:800;color:var(--ink)">${tier.name}</div><div style="font-size:13px;color:var(--ink2)">${NZ.loyalty.points.toLocaleString()} points</div></div>
        <div style="text-align:right"><div style="font-size:11px;color:var(--ink3)">Cash Value</div><div style="font-size:20px;font-weight:800;color:var(--green)">₹${cashValue}</div></div>
      </div>
      ${nextTier?`<div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink3);margin-bottom:5px"><span>${tier.name}</span><span>${nextTier.name} ${nextTier.icon}</span></div><div style="height:8px;background:rgba(0,0,0,.1);border-radius:99px;overflow:hidden"><div style="height:100%;background:${tier.color};border-radius:99px;width:${Math.min(progress,100)}%"></div></div><div style="font-size:11px;color:var(--ink2);margin-top:5px">${(nextTier.min-NZ.loyalty.points).toLocaleString()} more points to ${nextTier.name}</div></div>`:`<div style="font-size:13px;font-weight:700;color:${tier.color};text-align:center">🏆 Top Tier!</div>`}
    </div>
    <div style="background:var(--white);border-radius:16px;padding:16px;margin-bottom:16px;box-shadow:var(--card-shadow)">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:12px">✨ ${tier.name} Benefits</div>
      ${tier.perks.map(p=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f5f5f5"><div style="width:26px;height:26px;border-radius:50%;background:${tier.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fa-solid fa-check" style="color:${tier.color};font-size:10px"></i></div><span style="font-size:13px;color:var(--ink)">${p}</span></div>`).join("")}
    </div>
    <div style="background:var(--white);border-radius:16px;padding:16px;margin-bottom:16px;box-shadow:var(--card-shadow)">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:12px">💡 How to Earn</div>
      ${[["🛒","Place an order","2 pts per ₹1"],["⭐","Write a review","50 pts"],["👥","Refer a friend","200 pts"],["🎂","Birthday bonus","500 pts"],["📱","Install the app","100 pts"]].map(([i,a,p])=>`<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid #f5f5f5"><span style="font-size:20px;width:28px;text-align:center">${i}</span><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--ink)">${a}</div></div><span style="font-size:11px;color:var(--brand);font-weight:700">${p}</span></div>`).join("")}
    </div>
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow)">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:6px">💰 Redeem Points</div>
      <div style="font-size:12px;color:var(--ink3);margin-bottom:14px">100 points = ₹10 discount</div>
      <div style="background:var(--brand-light);border-radius:var(--r-sm);padding:14px;text-align:center;margin-bottom:12px">
        <div style="font-size:12px;color:var(--brand);font-weight:600">Redeemable value</div>
        <div style="font-size:28px;font-weight:800;color:var(--brand)">₹${cashValue}</div>
      </div>
      <button onclick="redeemLoyaltyPoints()" ${NZ.loyalty.points<100?"disabled":""} style="width:100%;padding:13px;background:${NZ.loyalty.points>=100?"var(--brand)":"var(--ink4)"};color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:${NZ.loyalty.points>=100?"pointer":"not-allowed"}">
        ${NZ.loyalty.points>=100?"Redeem at Checkout":"Need "+(100-NZ.loyalty.points)+" more points"}
      </button>
    </div>
  </div>`;
}

function redeemLoyaltyPoints() {
  if (NZ.loyalty.points < 100) { toast("Need at least 100 points", "error"); return; }
  const discount = Math.floor(NZ.loyalty.points/100)*10;
  toast(`₹${discount} loyalty discount ready! Go to cart to apply.`, "success");
  if (typeof PROMO_CODES !== "undefined") PROMO_CODES["LOYALTYREDEEM"] = { type:"flat", value:discount, min:0, desc:`🌟 Loyalty: ₹${discount} off` };
}

/* ══ 3. PRO SUBSCRIPTION ════════════════════════════════════ */
const PRO_BENEFITS = [
  { icon:"🚚", title:"Free Delivery Forever", desc:"Zero delivery charges on every order" },
  { icon:"⚡", title:"Priority Delivery", desc:"Your orders picked first, 20% faster" },
  { icon:"💰", title:"5% Extra Cashback", desc:"On every order, to your wallet" },
  { icon:"🎯", title:"Early Access Deals", desc:"Flash sales 2 hours before everyone" },
  { icon:"🌟", title:"2x Loyalty Points", desc:"Double points on every purchase" },
  { icon:"🎧", title:"Priority Support", desc:"24/7 dedicated customer support" },
  { icon:"🎁", title:"Monthly ₹100 Credit", desc:"Auto-credited every month" },
  { icon:"🍽️", title:"Table Booking Priority", desc:"Skip the queue at restaurants" },
];
let _selectedPlan = "yearly";

function renderProPage() {
  const el = document.getElementById("proPageContent");
  if (!el) return;
  loadProStatus();
  const isActive = NZ.subscription.active;
  const expiry = NZ.subscription.expiry ? new Date(NZ.subscription.expiry).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : null;
  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:16px">
    <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460,#533483);border-radius:24px;padding:28px;text-align:center;margin-bottom:20px">
      <div style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(90deg,#fc8019,#ff9f4a);padding:5px 14px;border-radius:99px;font-size:11px;font-weight:800;color:#fff;margin-bottom:14px"><i class="fa-solid fa-crown"></i> NEARZY PRO</div>
      <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:6px">Unlimited Benefits</div>
      <div style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:20px">Everything you love, with zero limits</div>
      ${isActive ? `<div style="background:rgba(255,255,255,.15);border-radius:12px;padding:14px;display:inline-block"><div style="font-size:12px;color:rgba(255,255,255,.7)">Active until</div><div style="font-size:16px;font-weight:800;color:#fff">${expiry}</div></div>` : `
      <div style="display:flex;justify-content:center;gap:12px;margin-bottom:16px">
        <div id="planMonthly" onclick="selectPlan('monthly')" style="background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);border-radius:14px;padding:14px 20px;cursor:pointer;min-width:130px">
          <div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;text-transform:uppercase">Monthly</div>
          <div style="font-size:26px;font-weight:800;color:#fff">₹${PRO_MONTHLY}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.5)">/month</div>
        </div>
        <div id="planYearly" onclick="selectPlan('yearly')" style="background:rgba(252,128,25,.3);border:2px solid var(--brand);border-radius:14px;padding:14px 20px;cursor:pointer;position:relative;min-width:130px">
          <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--brand);color:#fff;padding:2px 10px;border-radius:99px;font-size:10px;font-weight:800;white-space:nowrap">SAVE 44%</div>
          <div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;text-transform:uppercase">Yearly</div>
          <div style="font-size:26px;font-weight:800;color:#fff">₹${PRO_YEARLY}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.5)">₹${Math.round(PRO_YEARLY/12)}/month</div>
        </div>
      </div>
      <button onclick="subscribePro()" style="width:100%;max-width:280px;padding:15px;background:linear-gradient(135deg,#fc8019,#ff9f4a);border:none;border-radius:14px;font-size:15px;font-weight:800;color:#fff;cursor:pointer;box-shadow:0 8px 24px rgba(252,128,25,.4)"><i class="fa-solid fa-crown" style="margin-right:8px"></i>Get Nearzy Pro</button>
      <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:10px">Cancel anytime · No hidden charges</div>`}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${PRO_BENEFITS.map(b=>`<div style="background:var(--white);border-radius:14px;padding:14px;box-shadow:var(--card-shadow)"><div style="font-size:26px;margin-bottom:6px">${b.icon}</div><div style="font-size:12px;font-weight:800;color:var(--ink);margin-bottom:3px">${b.title}</div><div style="font-size:11px;color:var(--ink3);line-height:1.4">${b.desc}</div></div>`).join("")}
    </div>
  </div>`;
}

function selectPlan(plan) {
  _selectedPlan = plan;
  ["monthly","yearly"].forEach(p => {
    const el = document.getElementById("plan"+p.charAt(0).toUpperCase()+p.slice(1));
    if (el) { el.style.borderColor=p===plan?"var(--brand)":"rgba(255,255,255,.2)"; el.style.background=p===plan?"rgba(252,128,25,.3)":"rgba(255,255,255,.1)"; }
  });
}

async function subscribePro() {
  if (!window.S?.token) { if(typeof showLoginModal==="function") showLoginModal(); return; }
  const amount = _selectedPlan==="yearly"?PRO_YEARLY:PRO_MONTHLY;
  try {
    showLoader("Setting up...");
    const res = await fetch(`${window.API}/payment/create-order`, {
      method:"POST", headers:{"Content-Type":"application/json",Authorization:"Bearer "+S.token},
      body:JSON.stringify({amount,notes:{purpose:"nearzy_pro",plan:_selectedPlan}})
    });
    const data = await res.json();
    hideLoader();
    if (!data.order) { toast(data.message||"Could not create order","error"); return; }
    new Razorpay({
      key:window.RAZORPAY_KEY, amount:data.order.amount, currency:"INR",
      name:"Nearzy", description:`Nearzy Pro ${_selectedPlan}`, order_id:data.order.id,
      handler: async function(resp) {
        try {
          // Persist to backend
          await fetch(`${window.API||"https://nearzy-backend.onrender.com/api"}/subscription/activate`, {
            method:"POST",
            headers:{"Content-Type":"application/json","Authorization":"Bearer "+(window.S?.token||"")},
            body:JSON.stringify({ plan:_selectedPlan, razorpay_order_id:resp.razorpay_order_id, razorpay_payment_id:resp.razorpay_payment_id, razorpay_signature:resp.razorpay_signature })
          });
        } catch(e) { console.warn("Sub sync error:", e.message); }
        // Always update local state regardless of backend response
        NZ.subscription = { active:true, plan:_selectedPlan, expiry:new Date(Date.now()+(_selectedPlan==="yearly"?365:30)*86400000).toISOString(), paymentId:resp.razorpay_payment_id };
        localStorage.setItem("nz_pro",JSON.stringify(NZ.subscription));
        if (typeof addNotification==="function") addNotification("👑 Nearzy Pro Activated!",`Your ${_selectedPlan} plan is active. Enjoy free delivery, 2x points & more!`,"success");
        toast("🎉 Welcome to Nearzy Pro! All benefits are now active.", "success");
        renderProPage();
      },
      prefill:{name:S.user?.name||"",email:S.user?.email||""},theme:{color:"#fc8019"}
    }).open();
  } catch(e) { hideLoader(); toast(e.message||"Error","error"); }
}

function loadProStatus() {
  const stored = localStorage.getItem("nz_pro");
  if (!stored) return;
  const data = JSON.parse(stored);
  if (data.active && data.expiry && new Date(data.expiry)>new Date()) NZ.subscription=data;
  else { NZ.subscription.active=false; localStorage.removeItem("nz_pro"); }
}

/* ══ 4. TABLE BOOKING ═══════════════════════════════════════ */
let _selectedBookingTime = null;

function openTableBooking(shopId, shopName) {
  const times = ["12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM"];
  const today = new Date().toISOString().slice(0,10);
  openDynamicModal(`🍽️ Book Table — ${shopName}`, `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div><label class="flabel">Date</label><input class="finput" type="date" id="tb_date" min="${today}" value="${today}"></div>
      <div><label class="flabel">Guests</label><select class="fselect" id="tb_guests">${[1,2,3,4,5,6,7,8].map(n=>`<option value="${n}">${n} Person${n>1?"s":""}</option>`).join("")}</select></div>
    </div>
    <label class="flabel" style="margin-bottom:8px">Select Time</label>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">
      ${times.map(t=>`<button onclick="selectBookingTime(this,'${t}')" style="padding:7px 12px;background:var(--bg);border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:12px;font-weight:600;color:var(--ink2);cursor:pointer;transition:all .15s">${t}</button>`).join("")}
    </div>
    <div class="fgroup"><label class="flabel">Special Requests</label><textarea class="finput" id="tb_notes" rows="2" placeholder="Allergies, celebrations..."></textarea></div>
    <div style="background:var(--brand-light);border-radius:var(--r-sm);padding:10px;font-size:12px;color:var(--brand);margin:12px 0"><i class="fa-solid fa-info-circle"></i> Free cancellation up to 2 hours before</div>
    <button onclick="confirmTableBooking('${shopId}','${shopName}')" style="width:100%;padding:13px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer"><i class="fa-solid fa-calendar-check" style="margin-right:6px"></i>Confirm Booking</button>
  `);
}

function selectBookingTime(btn, time) {
  document.querySelectorAll("[onclick*='selectBookingTime']").forEach(b=>{ b.style.borderColor="var(--ink4)";b.style.background="var(--bg)";b.style.color="var(--ink2)"; });
  btn.style.borderColor="var(--brand)"; btn.style.background="var(--brand-light)"; btn.style.color="var(--brand)";
  _selectedBookingTime = time;
}

async function confirmTableBooking(shopId, shopName) {
  if (!window.S?.token) { if(typeof showLoginModal==="function") showLoginModal(); return; }
  const date = document.getElementById("tb_date")?.value;
  const guests = document.getElementById("tb_guests")?.value;
  const notes = document.getElementById("tb_notes")?.value;
  if (!date) { toast("Select a date","error"); return; }
  if (!_selectedBookingTime) { toast("Select a time slot","error"); return; }
  const booking = { id:"TB"+Date.now(), shopId, shopName, date, time:_selectedBookingTime, guests:parseInt(guests), notes, status:"confirmed", createdAt:new Date().toISOString() };
  NZ.tableBookings.unshift(booking);
  localStorage.setItem("nz_table_bookings",JSON.stringify(NZ.tableBookings));
  closeAllModals();
  toast(`🍽️ Table booked at ${shopName} for ${guests} on ${date} at ${_selectedBookingTime}!`, "success");
  _selectedBookingTime = null;
}

function renderTableBookingsPage() {
  NZ.tableBookings = JSON.parse(localStorage.getItem("nz_table_bookings")||"[]");
  const el = document.getElementById("bookingsPageContent");
  if (!el) return;
  el.innerHTML = `<div style="max-width:680px;margin:0 auto;padding:16px">
    ${NZ.tableBookings.length===0 ? `<div style="text-align:center;padding:60px 20px;color:var(--ink3)"><div style="font-size:56px">🍽️</div><div style="font-size:16px;font-weight:800;color:var(--ink);margin:12px 0">No Bookings Yet</div><div style="font-size:13px">Visit any restaurant and tap "Book a Table"</div><button onclick="showPage('home')" style="margin-top:16px;padding:11px 24px;background:var(--brand);color:#fff;border:none;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer">Explore Restaurants</button></div>` :
    NZ.tableBookings.map(b=>`
    <div style="background:var(--white);border-radius:14px;padding:16px;margin-bottom:10px;box-shadow:var(--card-shadow);border-left:4px solid var(--brand)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div><div style="font-size:14px;font-weight:800;color:var(--ink)">${b.shopName}</div><div style="font-size:11px;color:var(--ink3)">${b.id}</div></div>
        <span style="padding:3px 9px;background:var(--green-light);color:var(--green);border-radius:99px;font-size:10px;font-weight:700">${b.status}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px">
        ${[["📅",b.date],["🕐",b.time],["👥",b.guests+" guests"]].map(([i,v])=>`<div style="background:var(--bg);border-radius:var(--r-sm);padding:7px;text-align:center"><div style="font-size:14px">${i}</div><div style="font-size:11px;font-weight:600;color:var(--ink)">${v}</div></div>`).join("")}
      </div>
      <button onclick="cancelTableBooking('${b.id}')" style="margin-top:10px;padding:7px 14px;background:var(--bg);color:var(--red);border:1px solid var(--red);border-radius:var(--r-sm);font-size:11px;font-weight:700;cursor:pointer">Cancel</button>
    </div>`).join("")}
  </div>`;
}

function cancelTableBooking(id) {
  if (!confirm("Cancel this booking?")) return;
  NZ.tableBookings = NZ.tableBookings.filter(b=>b.id!==id);
  localStorage.setItem("nz_table_bookings",JSON.stringify(NZ.tableBookings));
  toast("Booking cancelled","success");
  renderTableBookingsPage();
}

/* ══ 5. LIVE TRACKING ═══════════════════════════════════════ */
function openLiveTracking(orderId) {
  const order = window.S?.orders?.find(o=>o._id===orderId);
  const statusSteps = ["placed","confirmed","preparing","ready","picked","on_the_way","delivered"];
  const currentStatus = order?.orderStatus||"placed";
  const currentIdx = statusSteps.indexOf(currentStatus);
  const eta = Math.max(5, 45-currentIdx*8);
  const labels = {placed:"Order Placed",confirmed:"Confirmed",preparing:"Preparing",ready:"Ready",picked:"Picked Up",on_the_way:"On the Way",delivered:"Delivered"};
  openDynamicModal("📍 Live Tracking", `
    <div style="font-size:12px;color:var(--ink3);margin-bottom:14px">Order #${order?.orderNumber||orderId?.slice(-8)||"—"}</div>
    <div style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:12px;height:160px;display:flex;align-items:center;justify-content:center;margin-bottom:14px">
      <div style="text-align:center"><div style="font-size:40px;animation:pulse 2s infinite">🛵</div><div style="font-size:13px;font-weight:700;color:var(--green);margin-top:6px">Delivery Partner En Route</div></div>
    </div>
    <div style="background:var(--brand-light);border-radius:12px;padding:14px;text-align:center;margin-bottom:14px">
      <div style="font-size:11px;color:var(--brand);font-weight:700;text-transform:uppercase;letter-spacing:.08em">ETA</div>
      <div style="font-size:32px;font-weight:800;color:var(--brand)">${eta} min</div>
    </div>
    <div style="margin-bottom:14px">
      ${statusSteps.map((s,i)=>{const done=i<=currentIdx,curr=i===currentIdx;return`
      <div style="display:flex;align-items:center;gap:10px;padding:7px 0">
        <div style="width:26px;height:26px;border-radius:50%;background:${done?"var(--green)":curr?"var(--brand)":"var(--ink4)"};display:flex;align-items:center;justify-content:center;flex-shrink:0;${curr?"box-shadow:0 0 0 4px var(--brand-light)":""}">
          ${done?`<i class="fa-solid fa-check" style="color:#fff;font-size:10px"></i>`:`<div style="width:7px;height:7px;border-radius:50%;background:#fff"></div>`}
        </div>
        <div style="flex:1"><div style="font-size:13px;font-weight:${curr?"800":"600"};color:${done?"var(--ink)":"var(--ink3)"}">${labels[s]}</div>${curr?`<div style="font-size:11px;color:var(--brand);font-weight:600">In progress...</div>`:""}</div>
        ${done?`<i class="fa-solid fa-circle-check" style="color:var(--green);font-size:14px"></i>`:""}
      </div>
      ${i<statusSteps.length-1?`<div style="width:2px;height:10px;background:${done?"var(--green)":"var(--ink4)"};margin-left:12px"></div>`:""}`}).join("")}
    </div>
    <button onclick="closeAllModals()" style="width:100%;padding:12px;background:var(--bg);border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:13px;font-weight:700;color:var(--ink2);cursor:pointer">Close</button>
  `,"tracking-modal");
}

/* ══ 6. FLASH SALE ══════════════════════════════════════════ */
const FLASH_DEALS = [
  { id:"fd1",name:"Hyderabadi Biryani",shop:"Paradise Restaurant",originalPrice:280,salePrice:179,discount:36,emoji:"🍛",stock:15 },
  { id:"fd2",name:"Fresh Fruit Basket",shop:"Green Farms",originalPrice:450,salePrice:249,discount:45,emoji:"🍎",stock:8 },
  { id:"fd3",name:"Dettol Sanitizer 500ml",shop:"MedPlus Pharmacy",originalPrice:180,salePrice:99,discount:45,emoji:"🧴",stock:22 },
  { id:"fd4",name:"Rose Bouquet",shop:"Flower World",originalPrice:350,salePrice:199,discount:43,emoji:"🌹",stock:5 },
  { id:"fd5",name:"Chicken Tikka 1kg",shop:"Al-Baik Chicken",originalPrice:399,salePrice:249,discount:38,emoji:"🍗",stock:11 },
  { id:"fd6",name:"Badam Milk 1L",shop:"Dairy Fresh",originalPrice:120,salePrice:69,discount:43,emoji:"🥛",stock:30 },
];

function renderFlashSalePage() {
  const el = document.getElementById("flashSaleContent");
  if (!el) return;
  el.innerHTML = `<div style="max-width:680px;margin:0 auto;padding:16px">
    <div style="background:linear-gradient(135deg,#ff4757,#ff6b81);border-radius:20px;padding:22px;text-align:center;margin-bottom:20px">
      <div style="font-size:36px">⚡</div>
      <div style="font-size:26px;font-weight:800;color:#fff">Flash Sale</div>
      <div style="font-size:13px;color:rgba(255,255,255,.8)">Limited stock · Best prices</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${FLASH_DEALS.map(d=>{const pct=(d.stock/30)*100;return`
      <div style="background:var(--white);border-radius:14px;overflow:hidden;box-shadow:var(--card-shadow)">
        <div style="background:linear-gradient(135deg,#fff3e8,#ffe0b2);height:95px;display:flex;align-items:center;justify-content:center;position:relative">
          <div style="font-size:48px">${d.emoji}</div>
          <div style="position:absolute;top:7px;left:7px;background:var(--red);color:#fff;padding:2px 7px;border-radius:99px;font-size:10px;font-weight:800">-${d.discount}%</div>
        </div>
        <div style="padding:10px">
          <div style="font-size:12px;font-weight:800;color:var(--ink);margin-bottom:1px">${d.name}</div>
          <div style="font-size:10px;color:var(--ink3);margin-bottom:7px">${d.shop}</div>
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:8px">
            <span style="font-size:15px;font-weight:800;color:var(--brand)">₹${d.salePrice}</span>
            <span style="font-size:10px;color:var(--ink3);text-decoration:line-through">₹${d.originalPrice}</span>
          </div>
          <div style="height:4px;background:#f0f0f0;border-radius:99px;overflow:hidden;margin-bottom:6px"><div style="height:100%;background:${pct<30?"var(--red)":"var(--green)"};width:${pct}%"></div></div>
          <div style="font-size:10px;color:${d.stock<10?"var(--red)":"var(--ink3)"};margin-bottom:7px;font-weight:600">${d.stock} left</div>
          <button onclick="addFlashDealToCart('${d.id}')" style="width:100%;padding:8px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:11px;font-weight:800;cursor:pointer">Add to Cart</button>
        </div>
      </div>`}).join("")}
    </div>
  </div>`;
}

function addFlashDealToCart(dealId) {
  const deal = FLASH_DEALS.find(d=>d.id===dealId);
  if (!deal) return;
  if (!window.S) window.S = {};
  if (!S.cart) S.cart = [];
  const ex = S.cart.find(i=>i.productId===dealId);
  if (ex) ex.qty++;
  else S.cart.push({productId:dealId,qty:1,name:deal.name,price:deal.salePrice,image:"",shopId:"",shopName:deal.shop,isFlashDeal:true,originalPrice:deal.originalPrice});
  if (typeof saveSession==="function") saveSession();
  if (typeof updateHeader==="function") updateHeader();
  toast(`⚡ ${deal.name} added!`, "success");
}

/* ══ 7. AI ASSISTANT ════════════════════════════════════════ */
const AI_CHAT_HISTORY = [];
let _aiTyping = false;

async function sendAIMessage(message) {
  if (!message?.trim() || _aiTyping) return;
  _aiTyping = true;
  const chatEl = document.getElementById("aiChatMessages");
  if (!chatEl) { _aiTyping=false; return; }
  AI_CHAT_HISTORY.push({role:"user",content:message});
  chatEl.insertAdjacentHTML("beforeend",`<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><div style="max-width:75%;background:var(--brand);color:#fff;padding:10px 13px;border-radius:18px 18px 4px 18px;font-size:13px;line-height:1.5">${escapeHtml(message)}</div></div>`);
  const typingId = "ai-typing-"+Date.now();
  chatEl.insertAdjacentHTML("beforeend",`<div id="${typingId}" style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px"><div style="width:30px;height:30px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div><div style="background:var(--bg);padding:10px 13px;border-radius:4px 18px 18px 18px;font-size:13px;color:var(--ink3)"><span style="animation:pulse 1s infinite">Thinking...</span></div></div>`);
  chatEl.scrollTop = chatEl.scrollHeight;
  try {
    const systemPrompt = `You are Nearzy's AI food & shopping assistant. Nearzy is a hyperlocal delivery app in India (Hyderabad, Ramagundam, Warangal area) delivering food, groceries, pharmacy, flowers from nearby shops. Be friendly, concise, use food emojis. Keep responses under 150 words. User: ${window.S?.user?.name||"Guest"}.`;
    const res = await fetch(`${window.API||"https://nearzy-backend.onrender.com/api"}/ai/chat`,{
      method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(window.S?.token||"")},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:500,system:systemPrompt,messages:AI_CHAT_HISTORY.slice(-8)})
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text||"I'm here to help! 🍽️";
    AI_CHAT_HISTORY.push({role:"assistant",content:reply});
    document.getElementById(typingId)?.remove();
    chatEl.insertAdjacentHTML("beforeend",`<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px"><div style="width:30px;height:30px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div><div style="max-width:80%;background:var(--bg);padding:10px 13px;border-radius:4px 18px 18px 18px;font-size:13px;color:var(--ink);line-height:1.6">${reply.replace(/\n/g,"<br>")}</div></div>`);
  } catch(e) {
    document.getElementById(typingId)?.remove();
    const fallback = getLocalAIResponse(message);
    chatEl.insertAdjacentHTML("beforeend",`<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px"><div style="width:30px;height:30px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div><div style="max-width:80%;background:var(--bg);padding:10px 13px;border-radius:4px 18px 18px 18px;font-size:13px;color:var(--ink);line-height:1.6">${fallback}</div></div>`);
  }
  chatEl.scrollTop = chatEl.scrollHeight;
  _aiTyping = false;
  const inp = document.getElementById("aiMessageInput");
  if (inp) { inp.value=""; inp.focus(); }
}

function getLocalAIResponse(m) {
  m = m.toLowerCase();
  if (m.includes("biryani")) return "🍛 For biryani, Paradise Restaurant in Hyderabad is top-rated! Their Hyderabadi Dum Biryani is legendary. Also try Bawarchi for a great alternative!";
  if (m.includes("pizza")) return "🍕 Check out local pizza shops on Nearzy — many offer great deals on weeknights! Use code NEARZY20 for 20% off your first pizza order.";
  if (m.includes("healthy")||m.includes("diet")) return "🥗 For healthy options, try ordering salads, grilled items, and fresh juices. Check Green Farms for organic groceries delivered fresh!";
  if (m.includes("budget")||m.includes("cheap")) return "💰 Check our Flash Sale for up to 45% off! Orders above ₹299 get free delivery. Use WELCOME50 for ₹50 off your first order!";
  if (m.includes("breakfast")) return "☀️ For breakfast, order idli-sambar or poha from nearby restaurants, or get eggs, bread, milk from our grocery shops — delivered in 20 minutes!";
  if (m.includes("medicine")||m.includes("pharmacy")) return "💊 Our pharmacy section delivers medicines fast! Upload your prescription for prescription drugs. MedPlus is available for OTC medicines.";
  if (m.includes("sweet")||m.includes("dessert")) return "🍮 Sweet cravings? Check our bakery section for cakes, gulab jamun, rasgulla and more. City Bakery makes amazing chocolate truffle cakes! 🎂";
  return "🤖 I'm your Nearzy food assistant! Ask me about food recommendations, deals, or help with your order. What are you craving today? 🍽️";
}

function renderAIPage() {
  const el = document.getElementById("aiPageContent");
  if (!el) return;
  const quickPrompts = ["What's good for dinner tonight?","Best biryani near me","Healthy breakfast options","I'm on ₹200 budget for lunch","Medicine delivery help","Show me today's deals"];
  el.innerHTML = `
  <div style="display:flex;flex-direction:column;height:calc(100vh-120px);max-width:680px;margin:0 auto">
    <div style="padding:16px;background:linear-gradient(135deg,var(--brand),#7c3aed);color:#fff;border-radius:0 0 20px 20px;margin-bottom:12px;text-align:center">
      <div style="font-size:36px;margin-bottom:6px">🤖</div>
      <div style="font-size:18px;font-weight:800">Nearzy AI Assistant</div>
      <div style="font-size:11px;opacity:.8">Powered by Claude · Ask anything about food & orders</div>
    </div>
    <div id="aiChatMessages" style="flex:1;overflow-y:auto;padding:0 16px;min-height:200px">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:12px">
        <div style="width:30px;height:30px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div>
        <div style="max-width:80%;background:var(--bg);padding:10px 13px;border-radius:4px 18px 18px 18px;font-size:13px;color:var(--ink);line-height:1.6">
          Hey ${window.S?.user?.name?.split(" ")[0]||"there"}! 👋 I'm your Nearzy assistant.<br><br>
          🍽️ Food recommendations<br>💊 Pharmacy help<br>🛒 Grocery planning<br>📦 Order tracking<br><br>What can I help you with?
        </div>
      </div>
    </div>
    <div id="aiQuickPrompts" style="padding:8px 16px;overflow-x:auto;white-space:nowrap;scrollbar-width:none">
      ${quickPrompts.map(p=>`<button onclick="sendAIMessage('${p.replace(/'/g,"\\'")}');document.getElementById('aiQuickPrompts').style.display='none'" style="display:inline-block;margin-right:7px;padding:7px 13px;background:var(--white);border:1.5px solid var(--ink4);border-radius:99px;font-size:12px;font-weight:600;color:var(--ink2);cursor:pointer;white-space:nowrap">${p}</button>`).join("")}
    </div>
    <div style="padding:10px 16px;background:var(--white);border-top:1px solid var(--ink4);display:flex;gap:8px;align-items:center">
      <input id="aiMessageInput" placeholder="Ask about food, orders, health..." style="flex:1;padding:11px 15px;background:var(--bg);border:1.5px solid var(--ink4);border-radius:99px;font-size:13px;color:var(--ink)" onkeydown="if(event.key==='Enter'&&!event.shiftKey){sendAIMessage(this.value);event.preventDefault()}">
      <button onclick="sendAIMessage(document.getElementById('aiMessageInput').value)" style="width:42px;height:42px;border-radius:50%;background:var(--brand);border:none;color:#fff;font-size:16px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  </div>`;
}

/* ══ 8. NOTIFICATIONS ═══════════════════════════════════════ */
async function renderNotificationsPage() {
  const el = document.getElementById("notificationsPageContent");
  if (!el) return;
  let notifications = [];
  if (window.S?.token) {
    try {
      const res = await fetch(`${window.API}/notifications`,{headers:{Authorization:"Bearer "+S.token}});
      const data = await res.json();
      notifications = data.notifications || [];
    } catch(e) {}
  }
  const icons = {order:"🛍️",payment:"💳",delivery:"🛵",promo:"🎁",system:"📢",wallet:"💰"};
  el.innerHTML = `<div style="max-width:680px;margin:0 auto;padding:16px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:15px;font-weight:800;color:var(--ink)">Notifications</div>
      ${notifications.some(n=>!n.isRead)?`<button onclick="markAllRead()" style="padding:6px 12px;background:var(--bg);border:1px solid var(--ink4);border-radius:var(--r-sm);font-size:11px;font-weight:700;color:var(--ink2);cursor:pointer">Mark all read</button>`:""}
    </div>
    ${notifications.length===0?`<div style="text-align:center;padding:60px 20px;color:var(--ink3)"><div style="font-size:56px">🔔</div><div style="font-size:16px;font-weight:800;color:var(--ink);margin:12px 0">All caught up!</div><div style="font-size:13px">No notifications yet</div></div>`:
    notifications.map(n=>`<div style="background:var(--white);border-radius:12px;padding:13px;margin-bottom:7px;display:flex;gap:10px;${!n.isRead?"border-left:3px solid var(--brand)":""}box-shadow:var(--card-shadow)">
      <div style="width:42px;height:42px;border-radius:10px;background:${!n.isRead?"var(--brand-light)":"var(--bg)"};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${icons[n.type]||"📢"}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:${!n.isRead?"800":"600"};color:var(--ink)">${n.title}</div><div style="font-size:12px;color:var(--ink2);line-height:1.4">${n.body||""}</div><div style="font-size:10px;color:var(--ink3);margin-top:3px">${new Date(n.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div></div>
      ${!n.isRead?`<div style="width:8px;height:8px;border-radius:50%;background:var(--brand);flex-shrink:0;margin-top:4px"></div>`:""}
    </div>`).join("")}
  </div>`;
}

async function markAllRead() {
  if (!window.S?.token) return;
  try { await fetch(`${window.API}/notifications/read-all`,{method:"PUT",headers:{Authorization:"Bearer "+S.token}}); } catch(e) {}
  renderNotificationsPage();
}

/* ══ 9. REFERRAL ════════════════════════════════════════════ */
function renderReferralPage() {
  const el = document.getElementById("referralPageContent");
  if (!el) return;
  const user = window.S?.user;
  const code = user ? "NRZ"+(user.name||"").slice(0,3).toUpperCase()+(user._id||user.id||"").slice(-4).toUpperCase() : "NRZGUEST";
  const shareUrl = window.location.origin+"?ref="+code;
  el.innerHTML = `<div style="max-width:680px;margin:0 auto;padding:16px">
    <div style="background:linear-gradient(135deg,#fc8019,#ff9f4a);border-radius:20px;padding:24px;text-align:center;margin-bottom:16px">
      <div style="font-size:40px;margin-bottom:10px">🎁</div>
      <div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:6px">Invite & Earn</div>
      <div style="font-size:13px;color:rgba(255,255,255,.85);margin-bottom:18px">You get ₹50, your friend gets ₹50!</div>
      <div style="background:rgba(255,255,255,.2);border-radius:12px;padding:12px;margin-bottom:14px">
        <div style="font-size:11px;color:rgba(255,255,255,.7);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Your Referral Code</div>
        <div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:3px;font-family:monospace">${code}</div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button onclick="navigator.clipboard.writeText('${shareUrl}');toast('Link copied!','success')" style="padding:10px 18px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.4);border-radius:var(--r-sm);font-size:12px;font-weight:700;color:#fff;cursor:pointer"><i class="fa-solid fa-copy"></i> Copy</button>
        <a href="https://wa.me/?text=Use my Nearzy code ${code} and get ₹50 off! ${shareUrl}" target="_blank" style="padding:10px 18px;background:#25d366;border:none;border-radius:var(--r-sm);font-size:12px;font-weight:700;color:#fff;cursor:pointer;text-decoration:none;display:flex;align-items:center;gap:5px"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      </div>
    </div>
    <div style="background:var(--white);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:var(--card-shadow)">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:12px">How it Works</div>
      ${[["📤","Share your code","Share with friends"],["🛍️","Friend orders","They register & place first order"],["💰","Both get ₹50","Instant wallet credit for both"]].map(([i,t,d])=>`<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f5f5f5"><div style="width:38px;height:38px;border-radius:50%;background:var(--brand-light);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${i}</div><div><div style="font-size:13px;font-weight:700;color:var(--ink)">${t}</div><div style="font-size:11px;color:var(--ink3);margin-top:2px">${d}</div></div></div>`).join("")}
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      ${[["👥","Referrals",NZ.referrals.count||0],["💰","Earned","₹"+(NZ.referrals.earned||0)],["⏳","Pending",0]].map(([i,l,v])=>`<div style="background:var(--white);border-radius:12px;padding:14px;text-align:center;box-shadow:var(--card-shadow)"><div style="font-size:22px;margin-bottom:4px">${i}</div><div style="font-size:18px;font-weight:800;color:var(--ink)">${v}</div><div style="font-size:11px;color:var(--ink3)">${l}</div></div>`).join("")}
    </div>
  </div>`;
}

/* ══ 10. GIFT CARDS ═════════════════════════════════════════ */
let _selectedGiftAmount = 500;
function renderGiftCardsPage() {
  const el = document.getElementById("giftCardsContent");
  if (!el) return;
  const designs = [
    {name:"Birthday",emoji:"🎂",bg:"linear-gradient(135deg,#ff6b6b,#feca57)"},
    {name:"Anniversary",emoji:"💍",bg:"linear-gradient(135deg,#a29bfe,#fd79a8)"},
    {name:"Thank You",emoji:"🙏",bg:"linear-gradient(135deg,#00b894,#00cec9)"},
    {name:"Congrats",emoji:"🎉",bg:"linear-gradient(135deg,#fdcb6e,#e17055)"},
    {name:"Diwali",emoji:"🪔",bg:"linear-gradient(135deg,#f9ca24,#f0932b)"},
    {name:"Just Because",emoji:"❤️",bg:"linear-gradient(135deg,#e84393,#fd79a8)"},
  ];
  el.innerHTML = `<div style="max-width:680px;margin:0 auto;padding:16px">
    <div style="text-align:center;margin-bottom:22px"><div style="font-size:40px">🎁</div><div style="font-size:22px;font-weight:800;color:var(--ink)">Gift Cards</div><div style="font-size:12px;color:var(--ink3);margin-top:4px">Perfect gift for food lovers</div></div>
    <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:10px">Choose Design</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px" id="giftDesigns">
      ${designs.map((d,i)=>`<div onclick="selectGiftDesign(${i},this)" style="border-radius:10px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:all .2s"><div style="background:${d.bg};height:72px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">${d.emoji}</span></div><div style="background:var(--white);padding:5px;text-align:center;font-size:10px;font-weight:700;color:var(--ink)">${d.name}</div></div>`).join("")}
    </div>
    <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:10px">Select Amount</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px" id="giftAmounts">
      ${[100,200,500,1000,2000,5000].map(a=>`<button onclick="selectGiftAmount(${a},this)" style="padding:12px;background:var(--bg);border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:14px;font-weight:800;color:var(--ink);cursor:pointer">₹${a}</button>`).join("")}
    </div>
    <div class="fgroup"><label class="flabel">Recipient Name</label><input class="finput" id="giftRecipient" placeholder="Friend's name"></div>
    <div class="fgroup" style="margin-top:10px"><label class="flabel">Their Phone/Email</label><input class="finput" id="giftContact" placeholder="Phone or email"></div>
    <div class="fgroup" style="margin-top:10px"><label class="flabel">Message</label><textarea class="finput" id="giftMessage" rows="2" placeholder="Write a message..."></textarea></div>
    <button onclick="purchaseGiftCard()" style="margin-top:16px;width:100%;padding:14px;background:linear-gradient(135deg,#fc8019,#ff9f4a);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(252,128,25,.4)"><i class="fa-solid fa-gift" style="margin-right:7px"></i>Purchase Gift Card</button>
  </div>`;
}

let _selectedGiftDesign = 0;
function selectGiftDesign(idx, el) {
  _selectedGiftDesign=idx;
  document.querySelectorAll("#giftDesigns>div").forEach(d=>d.style.borderColor="transparent");
  el.style.borderColor="var(--brand)";
}
function selectGiftAmount(amt, el) {
  _selectedGiftAmount=amt;
  document.querySelectorAll("#giftAmounts button").forEach(b=>{b.style.borderColor="var(--ink4)";b.style.background="var(--bg)";b.style.color="var(--ink)";});
  el.style.borderColor="var(--brand)"; el.style.background="var(--brand-light)"; el.style.color="var(--brand)";
}

async function purchaseGiftCard() {
  if (!window.S?.token) { if(typeof showLoginModal==="function") showLoginModal(); return; }
  const amount = _selectedGiftAmount;
  const recipient = document.getElementById("giftRecipient")?.value?.trim();
  const contact = document.getElementById("giftContact")?.value?.trim();
  if (!recipient||!contact) { toast("Enter recipient details","error"); return; }
  try {
    const res = await fetch(`${window.API}/payment/create-order`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+S.token},body:JSON.stringify({amount,notes:{purpose:"gift_card",recipient}})});
    const data = await res.json();
    if (!data.order) { toast(data.message||"Error","error"); return; }
    new Razorpay({key:window.RAZORPAY_KEY,amount:data.order.amount,currency:"INR",name:"Nearzy",description:`Gift Card ₹${amount} for ${recipient}`,order_id:data.order.id,
      handler:function(){toast(`🎁 Gift card sent to ${recipient}!`,"success");closeAllModals();},
      prefill:{name:S.user?.name||""},theme:{color:"#fc8019"}}).open();
  } catch(e) { toast(e.message||"Error","error"); }
}

/* ══ 11. PRICE ALERTS ═══════════════════════════════════════ */
function setPriceAlert(productId, productName, currentPrice) {
  openDynamicModal("🔔 Price Alert", `
    <div style="margin-bottom:14px"><div style="font-size:14px;font-weight:800;color:var(--ink)">${productName}</div><div style="font-size:12px;color:var(--ink3)">Current price: <strong>₹${currentPrice}</strong></div></div>
    <label class="flabel">Alert when price drops to</label>
    <div style="display:flex;align-items:center;gap:8px;margin:8px 0 14px"><span style="font-size:18px;font-weight:800">₹</span><input class="finput" type="number" id="alertPrice" placeholder="Target price" max="${currentPrice-1}" style="font-size:18px;font-weight:700"></div>
    <button onclick="saveAlert('${productId}','${productName}',${currentPrice})" style="width:100%;padding:13px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer"><i class="fa-solid fa-bell" style="margin-right:7px"></i>Set Alert</button>
  `);
}

function saveAlert(productId, productName, currentPrice) {
  const targetPrice = +document.getElementById("alertPrice")?.value;
  if (!targetPrice||targetPrice>=currentPrice) { toast("Set a price lower than current","error"); return; }
  const alerts = JSON.parse(localStorage.getItem("nz_price_alerts")||"[]");
  alerts.push({productId,productName,currentPrice,targetPrice,createdAt:new Date().toISOString()});
  localStorage.setItem("nz_price_alerts",JSON.stringify(alerts));
  closeAllModals();
  toast(`🔔 Alert set! Notify when ${productName} drops to ₹${targetPrice}!`,"success");
}

/* ══ 12. SCHEDULED DELIVERY ═════════════════════════════════ */
let _selectedSchedule = null;
function openScheduledDelivery() {
  const slots = []; const now = new Date();
  for (let d=0;d<3;d++) {
    const date = new Date(now); date.setDate(date.getDate()+d);
    const dateStr = d===0?"Today":d===1?"Tomorrow":date.toLocaleDateString("en-IN",{weekday:"short",month:"short",day:"numeric"});
    const dateVal = date.toISOString().slice(0,10);
    for (let h=9;h<=21;h++) {
      if (d===0&&h<=now.getHours()+1) continue;
      const timeStr = `${h>12?h-12:h}:00 ${h>=12?"PM":"AM"}`;
      slots.push({dateStr,dateVal,timeStr});
    }
  }
  const grouped = {};
  slots.forEach(s=>{if(!grouped[s.dateStr])grouped[s.dateStr]=[];grouped[s.dateStr].push(s);});
  openDynamicModal("📅 Schedule Delivery", `
    <div style="font-size:12px;color:var(--ink2);margin-bottom:14px">Choose when you want your order delivered</div>
    ${Object.entries(grouped).map(([day,daySlots])=>`<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px">${day}</div><div style="display:flex;flex-wrap:wrap;gap:6px">${daySlots.map(s=>`<button onclick="selectScheduleSlot('${s.dateVal}','${s.timeStr}',this)" style="padding:7px 12px;background:var(--bg);border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:12px;font-weight:600;color:var(--ink2);cursor:pointer;transition:all .15s">${s.timeStr}</button>`).join("")}</div></div>`).join("")}
    <div style="background:var(--brand-light);border-radius:var(--r-sm);padding:10px;font-size:12px;color:var(--brand);font-weight:600;margin-bottom:12px" id="scheduleSelectedSlot">No slot selected</div>
    <button onclick="confirmSchedule()" style="width:100%;padding:13px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer">Confirm Schedule</button>
  `);
}

function selectScheduleSlot(date, time, btn) {
  document.querySelectorAll("[onclick*='selectScheduleSlot']").forEach(b=>{b.style.borderColor="var(--ink4)";b.style.background="var(--bg)";b.style.color="var(--ink2)";});
  btn.style.borderColor="var(--brand)"; btn.style.background="var(--brand-light)"; btn.style.color="var(--brand)";
  _selectedSchedule={date,time};
  const el=document.getElementById("scheduleSelectedSlot");
  if(el) el.textContent=`📅 ${date} at ${time}`;
}

function confirmSchedule() {
  if (!_selectedSchedule) { toast("Select a time slot","error"); return; }
  NZ.deliverySchedule = _selectedSchedule;
  closeAllModals();
  toast(`📅 Delivery scheduled for ${_selectedSchedule.date} at ${_selectedSchedule.time}`,"success");
}

/* ══ 13. PHARMACY ═══════════════════════════════════════════ */
function renderPharmacySection() {
  const el = document.getElementById("pharmacyContent");
  if (!el) return;
  // Keep existing pharmacy content if already rendered by main app
  if (el.innerHTML.trim().length > 100) return;
  const cats = [{icon:"💊",name:"Medicines",sub:"Prescription & OTC"},{icon:"🩺",name:"Devices",sub:"BP, Sugar monitors"},{icon:"💆",name:"Personal Care",sub:"Skincare, hair"},{icon:"🍼",name:"Baby Care",sub:"Diapers, formula"},{icon:"🌿",name:"Vitamins",sub:"Supplements"},{icon:"🩹",name:"First Aid",sub:"Bandages"},{icon:"👁️",name:"Eye Care",sub:"Eye drops"},{icon:"🦷",name:"Dental",sub:"Toothpaste"}];
  el.innerHTML = `<div style="max-width:680px;margin:0 auto;padding:16px">
    <div style="background:linear-gradient(135deg,#e3f2fd,#bbdefb);border-radius:14px;padding:18px;margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div style="font-size:36px">📋</div>
      <div style="flex:1"><div style="font-size:14px;font-weight:800;color:var(--ink)">Upload Prescription</div><div style="font-size:11px;color:var(--ink2);margin-top:2px">Get prescription medicines delivered</div></div>
      <button onclick="uploadPrescription()" style="padding:9px 14px;background:#1a73e8;color:#fff;border:none;border-radius:var(--r-sm);font-size:12px;font-weight:700;cursor:pointer">Upload</button>
    </div>
    <div style="background:#fff3e8;border-left:4px solid var(--brand);border-radius:0 var(--r-sm) var(--r-sm) 0;padding:10px 12px;margin-bottom:16px;font-size:11px;color:var(--ink2)"><strong style="color:var(--brand)">⚠️ Disclaimer:</strong> Consult a doctor before purchasing medicines. Nearzy only delivers — no medical advice.</div>
    <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:10px">Browse Categories</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">
      ${cats.map(c=>`<div style="background:var(--white);border-radius:10px;padding:12px 6px;text-align:center;cursor:pointer;box-shadow:var(--card-shadow)"><div style="font-size:24px;margin-bottom:5px">${c.icon}</div><div style="font-size:10px;font-weight:700;color:var(--ink)">${c.name}</div><div style="font-size:9px;color:var(--ink3)">${c.sub}</div></div>`).join("")}
    </div>
  </div>`;
}

function uploadPrescription() {
  openDynamicModal("📋 Upload Prescription", `
    <div style="border:2px dashed var(--ink4);border-radius:var(--r-sm);padding:28px;text-align:center;margin-bottom:14px;cursor:pointer" onclick="document.getElementById('prescFile').click()">
      <div style="font-size:36px;margin-bottom:6px">📷</div>
      <div style="font-size:13px;font-weight:700;color:var(--ink)">Click to upload</div>
      <div style="font-size:11px;color:var(--ink3);margin-top:3px">JPG, PNG, PDF · Max 5MB</div>
      <input type="file" id="prescFile" accept="image/*,.pdf" style="display:none" onchange="this.parentElement.innerHTML='<div style=font-size:28px>✅</div><div style=font-size:12px;font-weight:700;color:var(--green)>'+this.files[0].name+'</div>'">
    </div>
    <div class="fgroup"><label class="flabel">Notes for pharmacist</label><textarea class="finput" rows="2" placeholder="Any specific instructions..."></textarea></div>
    <button onclick="toast('✅ Prescription uploaded! Pharmacist will contact you within 30 minutes.','success');closeAllModals()" style="margin-top:12px;width:100%;padding:13px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer">Submit</button>
  `);
}

/* ══ 14. CITY SELECTOR ══════════════════════════════════════ */
const SUPPORTED_CITIES = [
  {name:"Hyderabad",state:"Telangana",emoji:"🏙️"},{name:"Ramagundam",state:"Telangana",emoji:"🌆"},
  {name:"Warangal",state:"Telangana",emoji:"🏛️"},{name:"Karimnagar",state:"Telangana",emoji:"🌇"},
  {name:"Nizamabad",state:"Telangana",emoji:"🌃"},{name:"Khammam",state:"Telangana",emoji:"🌆"},
  {name:"Vijayawada",state:"Andhra Pradesh",emoji:"🏙️"},{name:"Visakhapatnam",state:"Andhra Pradesh",emoji:"🌊"},
  {name:"Bengaluru",state:"Karnataka",emoji:"🌆"},{name:"Chennai",state:"Tamil Nadu",emoji:"🏛️"},
  {name:"Mumbai",state:"Maharashtra",emoji:"🌃"},{name:"Delhi",state:"Delhi",emoji:"🏙️"},
];

function openCitySelector() {
  openDynamicModal("📍 Choose Your City", `
    <input placeholder="Search city..." style="width:100%;padding:10px 12px;border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:13px;color:var(--ink);background:var(--bg);margin-bottom:14px" oninput="filterCities(this.value)" id="citySearchInput">
    <div id="cityList" style="display:flex;flex-direction:column;gap:5px;max-height:350px;overflow-y:auto">
      ${SUPPORTED_CITIES.map(c=>`<div onclick="selectCity('${c.name}')" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-sm);cursor:pointer;transition:background .15s" onmouseover="this.style.background='var(--brand-light)'" onmouseout="this.style.background=''" data-city="${c.name.toLowerCase()}" data-state="${c.state.toLowerCase()}">
        <div style="font-size:22px">${c.emoji}</div>
        <div><div style="font-size:13px;font-weight:700;color:var(--ink)">${c.name}</div><div style="font-size:11px;color:var(--ink3)">${c.state}</div></div>
      </div>`).join("")}
    </div>
  `);
}

function filterCities(q) {
  const lq=q.toLowerCase();
  document.querySelectorAll("#cityList>div").forEach(el=>{
    el.style.display=(el.dataset.city?.includes(lq)||el.dataset.state?.includes(lq))?"":"none";
  });
}

function selectCity(city) {
  if (window.S?.user) S.user.city=city;
  localStorage.setItem("nz_selected_city",city);
  const locBtn=document.querySelector(".location-text");
  if(locBtn) locBtn.textContent=city;
  closeAllModals();
  toast(`📍 Switched to ${city}`,"success");
  if(typeof loadShops==="function") loadShops();
  if(typeof loadProducts==="function") loadProducts();
}

/* ══ 15. RATINGS ════════════════════════════════════════════ */
let _currentRating=0;
const RATING_LABELS={1:"Poor 😞",2:"Fair 😐",3:"Good 🙂",4:"Great 😊",5:"Amazing! 🤩"};
const _selectedTags=new Set();

function openRatingModal(orderId, shopName) {
  _currentRating=0; _selectedTags.clear();
  openDynamicModal(`⭐ Rate order from ${shopName}`, `
    <div style="text-align:center;margin-bottom:16px"><div style="font-size:40px;margin-bottom:8px">⭐</div><div style="font-size:15px;font-weight:800;color:var(--ink)">How was your experience?</div></div>
    <div style="display:flex;justify-content:center;gap:6px;margin-bottom:16px">
      ${[1,2,3,4,5].map(i=>`<button onclick="setRating(${i})" id="star-${i}" style="font-size:36px;background:none;border:none;cursor:pointer;filter:grayscale(1) opacity(.4)">⭐</button>`).join("")}
    </div>
    <div id="ratingLabel" style="text-align:center;font-size:13px;font-weight:700;color:var(--ink3);margin-bottom:14px">Tap to rate</div>
    <div class="fgroup"><label class="flabel">Write a review</label><textarea class="finput" id="reviewText" rows="2" placeholder="Tell us about your experience..."></textarea></div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin:10px 0">
      ${["Great taste 😋","Fast delivery ⚡","Fresh food 🌿","Good packaging 📦","Value for money 💰"].map(tag=>`<button onclick="toggleReviewTag(this)" style="padding:6px 11px;background:var(--bg);border:1.5px solid var(--ink4);border-radius:99px;font-size:11px;font-weight:600;color:var(--ink2);cursor:pointer">${tag}</button>`).join("")}
    </div>
    <button onclick="submitRating('${orderId}')" style="width:100%;padding:13px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer;margin-top:8px">Submit Review</button>
  `);
}

function setRating(val) {
  _currentRating=val;
  [1,2,3,4,5].forEach(i=>{const s=document.getElementById("star-"+i);if(s)s.style.filter=i<=val?"":"grayscale(1) opacity(.4)";});
  const lbl=document.getElementById("ratingLabel");
  if(lbl){lbl.textContent=RATING_LABELS[val];lbl.style.color="var(--brand)";}
}

function toggleReviewTag(btn) {
  const sel=btn.dataset.selected==="1";
  if(sel){btn.style.borderColor="var(--ink4)";btn.style.background="var(--bg)";btn.style.color="var(--ink2)";btn.dataset.selected="0";_selectedTags.delete(btn.textContent);}
  else{btn.style.borderColor="var(--brand)";btn.style.background="var(--brand-light)";btn.style.color="var(--brand)";btn.dataset.selected="1";_selectedTags.add(btn.textContent);}
}

async function submitRating(orderId) {
  if (!_currentRating) { toast("Please select a star rating","error"); return; }
  const review = document.getElementById("reviewText")?.value?.trim();
  if (window.S?.token) {
    try {
      await fetch(`${window.API}/reviews`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+S.token},body:JSON.stringify({orderId,rating:_currentRating,review,tags:[..._selectedTags]})});
    } catch(e) {}
  }
  addLoyaltyPoints(25,1);
  toast(`⭐ Thank you! ${_currentRating} star review submitted!`,"success");
  _currentRating=0; _selectedTags.clear();
  closeAllModals();
}

/* ══ 16. GROUP ORDER ════════════════════════════════════════ */
function startGroupOrder() {
  if (!window.S?.token) { if(typeof showLoginModal==="function") showLoginModal(); return; }
  const groupId = "GRP"+Date.now();
  NZ.groupOrder={active:true,id:groupId,members:[{name:S.user.name,items:[],isHost:true}],items:[]};
  localStorage.setItem("nz_group_order",JSON.stringify(NZ.groupOrder));
  const shareUrl=`${window.location.origin}?group=${groupId}`;
  openDynamicModal("👥 Group Order Started!", `
    <div style="text-align:center;padding:16px 0">
      <div style="font-size:40px;margin-bottom:10px">👥</div>
      <div style="font-size:16px;font-weight:800;color:var(--ink);margin-bottom:6px">Share with friends!</div>
      <div style="font-size:12px;color:var(--ink2);margin-bottom:16px">Each person can add their items to the order</div>
      <div style="background:var(--bg);border-radius:var(--r-sm);padding:10px;font-family:monospace;font-size:12px;font-weight:700;color:var(--ink);margin-bottom:14px;word-break:break-all">${shareUrl}</div>
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button onclick="navigator.clipboard.writeText('${shareUrl}');toast('Link copied!','success')" style="flex:1;padding:10px;background:var(--bg);border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:12px;font-weight:700;color:var(--ink);cursor:pointer"><i class="fa-solid fa-copy"></i> Copy</button>
        <a href="https://wa.me/?text=Join my Nearzy group order! ${shareUrl}" target="_blank" style="flex:1;padding:10px;background:#25d366;border:none;border-radius:var(--r-sm);font-size:12px;font-weight:700;color:#fff;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:5px"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      </div>
      <button onclick="closeAllModals();showPage('home')" style="width:100%;padding:12px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:700;cursor:pointer">Start Adding Items</button>
    </div>
  `);
}

/* ══ UTILITY FUNCTIONS ══════════════════════════════════════ */
function openDynamicModal(title, content, id="dynamicModal") {
  let modal = document.getElementById(id);
  if (!modal) {
    modal = document.createElement("div");
    modal.id = id;
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease";
    modal.innerHTML = `<div style="background:var(--white);border-radius:24px 24px 0 0;padding:22px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;animation:slideUp .3s cubic-bezier(0.34,1.56,0.64,1)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <div style="font-family:'Sora',sans-serif;font-size:17px;font-weight:800;color:var(--ink)" id="${id}-title">${title}</div>
        <button onclick="document.getElementById('${id}').remove()" style="width:30px;height:30px;border-radius:50%;background:var(--bg);border:none;color:var(--ink2);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">×</button>
      </div>
      <div id="${id}-body">${content}</div>
    </div>`;
    modal.addEventListener("click",e=>{if(e.target===modal)modal.remove();});
    document.body.appendChild(modal);
  } else {
    document.getElementById(`${id}-title`).innerHTML=title;
    document.getElementById(`${id}-body`).innerHTML=content;
  }
}

function closeModal(id) { document.getElementById(id)?.remove(); }

function closeAllModals() {
  document.querySelectorAll("[id$='Modal'],[id$='-modal'],[id='dynamicModal'],[id='tracking-modal']").forEach(m=>m.remove());
}

function showLoader(text="Loading...") {
  let el = document.getElementById("globalLoader");
  if (!el) {
    el = document.createElement("div"); el.id="globalLoader";
    el.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center";
    el.innerHTML=`<div style="background:var(--white);border-radius:14px;padding:22px 28px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)"><div style="width:36px;height:36px;border:4px solid var(--brand);border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 10px"></div><div id="loaderText" style="font-size:13px;font-weight:600;color:var(--ink)">${text}</div></div>`;
    document.body.appendChild(el);
  } else document.getElementById("loaderText").textContent=text;
}

function hideLoader() { document.getElementById("globalLoader")?.remove(); }

function escapeHtml(str) {
  const d=document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

/* ══ INIT ══════════════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    loadProStatus();
    loadLoyaltyData();
    loadWallet();
    NZ.tableBookings = JSON.parse(localStorage.getItem("nz_table_bookings")||"[]");
    const savedCity = localStorage.getItem("nz_selected_city");
    if (savedCity && window.S?.user) S.user.city = S.user.city || savedCity;
    console.log("Nearzy Extended Features v"+NEARZY_VERSION+" loaded ✅");
  }, 800);
});

/* ══ EXPORTS ════════════════════════════════════════════════ */
Object.assign(window, {
  loadWallet, topUpWallet, showWalletPage, renderWalletPage, openTopUpModal, openSendMoneyModal,
  loadLoyaltyData, renderLoyaltyPage, redeemLoyaltyPoints, addLoyaltyPoints,
  renderProPage, selectPlan, subscribePro, loadProStatus,
  openTableBooking, selectBookingTime, confirmTableBooking, renderTableBookingsPage, cancelTableBooking,
  openLiveTracking,
  FLASH_DEALS, renderFlashSalePage, addFlashDealToCart,
  sendAIMessage, getLocalAIResponse, renderAIPage,
  renderNotificationsPage, markAllRead,
  renderReferralPage,
  renderGiftCardsPage, selectGiftDesign, selectGiftAmount, purchaseGiftCard,
  openScheduledDelivery, selectScheduleSlot, confirmSchedule,
  setPriceAlert, saveAlert,
  renderPharmacySection, uploadPrescription,
  openCitySelector, filterCities, selectCity,
  openRatingModal, setRating, toggleReviewTag, submitRating,
  startGroupOrder,
  openDynamicModal, closeModal, closeAllModals, showLoader, hideLoader, escapeHtml,
  LOYALTY_TIERS, getCurrentTier, getNextTier,
  SUPPORTED_CITIES,
});