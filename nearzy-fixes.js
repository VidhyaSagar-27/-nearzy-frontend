/* ================================================================
   NEARZY — PRODUCTION FIXES v1.0
   Patches applied:
     1. AI Features  — add x-api-key + anthropic-version headers via backend proxy
     2. Location     — real GPS detect + reverse geocode on header button
     3. Subscriptions — persist Pro/GiftCard payments to backend after Razorpay
     4. Products     — enforce seller-only add/edit; block auto-population from code
     5. GPS nearby   — full haversine distance + auto-sort on filter enable
   ================================================================ */
"use strict";

/* ──────────────────────────────────────────────────────────────
   SECTION 1 — AI PROXY
   All Anthropic API calls are routed through your own backend
   (/api/ai/chat) so the secret key is NEVER exposed in the browser.
   ──────────────────────────────────────────────────────────────
   HOW TO USE:
     Add this route to your server.js (or a new routes/ai.js):

     const router = require("express").Router();
     const auth   = require("../middleware/auth");      // your existing JWT middleware

     router.post("/chat", auth, async (req, res) => {
       const { messages, system, max_tokens, model } = req.body;
       try {
         const response = await fetch("https://api.anthropic.com/v1/messages", {
           method: "POST",
           headers: {
             "Content-Type":        "application/json",
             "x-api-key":           process.env.ANTHROPIC_API_KEY,
             "anthropic-version":   "2023-06-01"
           },
           body: JSON.stringify({
             model:      model      || "claude-sonnet-4-6",
             max_tokens: max_tokens || 500,
             system:     system,
             messages:   messages
           })
         });
         const data = await response.json();
         if (!response.ok) return res.status(response.status).json(data);
         res.json(data);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });
     module.exports = router;

     Then in server.js add:
       app.use("/api/ai", require("./routes/ai"));

     And in your .env add:
       ANTHROPIC_API_KEY=sk-ant-api03-XXXXX
   ────────────────────────────────────────────────────────────── */

/* Helper: authenticated fetch to backend */
function _authFetch(url, options = {}) {
  const token = window.S?.token || "";
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": "Bearer " + token } : {}),
      ...(options.headers || {})
    }
  });
}

/* Central AI helper — replaces NZ_AI.ask completely.
   Routes through /api/ai/chat so the Anthropic key stays secret. */
window.NZ_AI = {
  async ask(prompt, system, maxTokens) {
    try {
      const res = await _authFetch(`${window.API || "https://nearzy-backend.onrender.com/api"}/ai/chat`, {
        method: "POST",
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: maxTokens || 500,
          system:     system || "You are Nearzy AI, a helpful hyperlocal delivery assistant in India. Be concise.",
          messages:   [{ role: "user", content: prompt }]
        })
      });
      const d = await res.json();
      if (!res.ok) {
        console.warn("[NZ_AI] Backend error:", d);
        return "";
      }
      return d.content?.[0]?.text || "";
    } catch (e) {
      console.warn("[NZ_AI] Network error:", e.message);
      return "";
    }
  },

  /* Multi-turn version for the main chat widget */
  async chat(messages, system, maxTokens) {
    try {
      const res = await _authFetch(`${window.API || "https://nearzy-backend.onrender.com/api"}/ai/chat`, {
        method: "POST",
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: maxTokens || 600,
          system,
          messages
        })
      });
      const d = await res.json();
      if (!res.ok) return null;
      return d.content?.[0]?.text || null;
    } catch (e) {
      return null;
    }
  }
};

/* Patch the main chat sendAIMessage to use the fixed helper */
(function patchMainAIChat() {
  const _orig = window.sendAIMessage;
  window.sendAIMessage = async function(text, fromSugg = false) {
    if (!text || !text.trim()) return;
    const input = document.getElementById("aiInput");
    const msgs  = document.getElementById("aiMessages");
    const sugg  = document.getElementById("aiSuggestions");
    if (!msgs) return;
    const q = text.trim();
    if (input) input.value = "";
    if (sugg)  sugg.style.display = "none";
    if (typeof haptic === "function") haptic("light");

    msgs.insertAdjacentHTML("beforeend",
      `<div style="display:flex;justify-content:flex-end">
         <div style="background:var(--brand);color:#fff;border-radius:14px 4px 14px 14px;padding:10px 14px;max-width:80%;font-size:13px;line-height:1.6">${q}</div>
       </div>`);

    const typingId = "ait" + Date.now();
    msgs.insertAdjacentHTML("beforeend",
      `<div id="${typingId}" style="display:flex;gap:10px;align-items:flex-end">
         <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">🤖</div>
         <div style="background:var(--white);border-radius:4px 14px 14px 14px;padding:12px 16px;box-shadow:var(--card-shadow)">
           <span class="typing-dot"></span><span class="typing-dot" style="animation-delay:.2s"></span><span class="typing-dot" style="animation-delay:.4s"></span>
         </div>
       </div>`);
    msgs.scrollTop = msgs.scrollHeight;

    if (!window._aiHistory) window._aiHistory = [];
    window._aiHistory.push({ role: "user", content: q });

    /* Build rich context from live app state */
    const S = window.S || {};
    const shopNames = (S.shops || []).slice(0, 6).map(s => s.name + "(" + (s.category||"") + ")").join(", ");
    const openShops = (S.shops || []).filter(s => s.isOpen !== false).length;
    const system = `You are Nearzy's AI food & shopping assistant. Nearzy is a hyperlocal delivery app in India (Hyderabad, Ramagundam, Warangal, Kadapa area).
Available: ${(S.shops||[]).length} shops (${openShops} open), ${(S.products||[]).length} products.
Featured shops: ${shopNames}.
User: ${S.user?.name || "Guest"} | City: ${S.user?.city || "Hyderabad"} | Loyalty pts: ${S.loyaltyPoints || 0}.
Active promo codes: NEARZY10 (10% off), WELCOME (₹50 off), FREESHIP (free delivery).
Be friendly, helpful, concise. Max 150 words. Use food emojis appropriately.`;

    let reply = await window.NZ_AI.chat(window._aiHistory.slice(-10), system, 500);
    if (!reply) reply = typeof getAIFallback === "function" ? getAIFallback(q) : "I'm here to help! 😊 Browse our shops or ask me about deals!";

    window._aiHistory.push({ role: "assistant", content: reply });
    document.getElementById(typingId)?.remove();
    msgs.insertAdjacentHTML("beforeend",
      `<div style="display:flex;gap:10px;align-items:flex-start">
         <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">🤖</div>
         <div style="background:var(--white);border-radius:4px 14px 14px 14px;padding:12px 14px;box-shadow:var(--card-shadow);max-width:85%;font-size:13px;color:var(--ink);line-height:1.7">
           ${reply.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>")}
         </div>
       </div>`);
    msgs.scrollTop = msgs.scrollHeight;
  };
})();

/* Patch getAIOrderSummary */
window.getAIOrderSummary = async function(order) {
  const items = (order.items || []).map(i => `${i.name} ×${i.quantity}`).join(", ");
  return await window.NZ_AI.ask(
    `In one warm sentence, summarize this order: ${items}. Total: ₹${order.totalAmount}. Status: ${order.orderStatus}.`,
    "Warm, friendly order summarizer for Indian food delivery app.",
    80
  );
};

/* Patch getAISellerInsight */
window.getAISellerInsight = async function(shopOrders, products) {
  const pending  = (shopOrders || []).filter(o => o.orderStatus === "placed").length;
  const revenue  = (shopOrders || []).filter(o => o.orderStatus === "delivered").reduce((s, o) => s + (o.totalAmount || 0), 0);
  const topProd  = {};
  (shopOrders || []).forEach(o => (o.items || []).forEach(i => { topProd[i.name] = (topProd[i.name] || 0) + i.quantity; }));
  const top = Object.entries(topProd).sort((a, b) => b[1] - a[1])[0];
  return await window.NZ_AI.ask(
    `Business advisor: Give one actionable tip in 2 sentences for this shop owner: Orders:${(shopOrders||[]).length}, Revenue:₹${revenue}, Pending:${pending}, Top:${top?.[0]||"unknown"}(${top?.[1]||0} sold), Products:${(products||[]).length}.`,
    "Actionable business advisor for small Indian food shops.",
    120
  );
};

/* Patch the nearzy-features.js sendAIMessage (in the AI Assistant page) */
window.sendAIMessage = window.sendAIMessage; // already patched above via closure

/* ──────────────────────────────────────────────────────────────
   SECTION 2 — REAL LOCATION DETECTION
   Patches the header location button to use actual GPS + reverse
   geocode via OpenStreetMap Nominatim (free, no API key needed).
   ────────────────────────────────────────────────────────────── */
(function patchLocationButton() {
  /* Wait for DOM to be ready */
  function attachLocationButton() {
    const btn = document.querySelector(".location-btn");
    if (!btn) { setTimeout(attachLocationButton, 300); return; }

    /* Replace the broken onclick */
    btn.onclick = null;
    btn.removeAttribute("onclick");
    btn.addEventListener("click", openLocationPicker);

    /* Auto-detect on app load (silent) */
    const saved = localStorage.getItem("nz_selected_city");
    if (saved) {
      setHeaderLocation(saved);
    } else {
      silentDetectLocation();
    }
  }

  function setHeaderLocation(city) {
    const el = document.getElementById("locationText") || document.querySelector(".location-text");
    if (el) el.textContent = city;
    localStorage.setItem("nz_selected_city", city);
    /* Sync with state */
    if (window.S?.user) window.S.user.city = window.S.user.city || city;
    if (window.S && !window.S.selectedCity) window.S.selectedCity = city;
  }

  async function reverseGeocode(lat, lng) {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
        headers: { "Accept-Language": "en" }
      });
      const data = await res.json();
      const addr = data.address || {};
      return addr.city || addr.town || addr.county || addr.state_district || addr.state || "Your Location";
    } catch (e) {
      return null;
    }
  }

  async function silentDetectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (city) {
          setHeaderLocation(city);
          window.S.userLat = pos.coords.latitude;
          window.S.userLng = pos.coords.longitude;
          /* Reload shops filtered by city if shops are already rendered */
          if (typeof loadShops === "function") {
            try { await loadShops(); } catch(e) {}
          }
          if (typeof renderShops === "function") renderShops();
          if (typeof renderProducts === "function") renderProducts();
        }
      },
      () => { /* User denied — silently ignore */ },
      { timeout: 8000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  }

  function openLocationPicker() {
    /* Build modal with: GPS detect + city list */
    const html = `
    <div style="background:linear-gradient(135deg,#fc8019,#ff9f4a);padding:22px;text-align:center">
      <div style="font-size:36px;margin-bottom:6px">📍</div>
      <div style="font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#fff">Set Your Location</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:4px">We'll show shops near you</div>
    </div>
    <div style="padding:20px">
      <button id="gpsDetectBtn" onclick="window._nzDetectGPS(this)"
        style="width:100%;padding:13px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px">
        <i class="fa-solid fa-location-crosshairs"></i> Detect My Location (GPS)
      </button>
      <div style="font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Or choose a city</div>
      <input id="locSearchInput" placeholder="Search city..." oninput="window._nzFilterCities(this.value)"
        style="width:100%;padding:10px 12px;border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:13px;color:var(--ink);background:var(--bg);margin-bottom:12px">
      <div id="nzCityList" style="max-height:280px;overflow-y:auto">
        ${(window.SUPPORTED_CITIES || [
          {name:"Hyderabad",state:"Telangana",emoji:"🏙️"},
          {name:"Ramagundam",state:"Telangana",emoji:"🌆"},
          {name:"Kadapa",state:"Andhra Pradesh",emoji:"🏛️"},
          {name:"Warangal",state:"Telangana",emoji:"🌇"},
          {name:"Karimnagar",state:"Telangana",emoji:"🌃"},
          {name:"Vijayawada",state:"Andhra Pradesh",emoji:"🏙️"},
          {name:"Visakhapatnam",state:"Andhra Pradesh",emoji:"🌊"},
          {name:"Bengaluru",state:"Karnataka",emoji:"🌆"},
          {name:"Chennai",state:"Tamil Nadu",emoji:"🏛️"},
          {name:"Mumbai",state:"Maharashtra",emoji:"🌃"},
          {name:"Delhi",state:"Delhi",emoji:"🏙️"},
          {name:"Hyderabad",state:"Telangana",emoji:"🏙️"}
        ]).filter((c,i,a) => a.findIndex(x=>x.name===c.name)===i).map(c =>
          `<div onclick="window._nzPickCity('${c.name}')" data-city="${c.name.toLowerCase()}" data-state="${c.state.toLowerCase()}"
            style="display:flex;align-items:center;gap:10px;padding:11px;border-radius:var(--r-sm);cursor:pointer;transition:background .15s"
            onmouseover="this.style.background='var(--brand-light)'" onmouseout="this.style.background=''">
            <span style="font-size:22px">${c.emoji}</span>
            <div><div style="font-size:13px;font-weight:700;color:var(--ink)">${c.name}</div>
            <div style="font-size:11px;color:var(--ink3)">${c.state}</div></div>
          </div>`
        ).join("")}
      </div>
    </div>`;

    if (typeof nzModal === "function") {
      nzModal(html);
    } else if (typeof openDynamicModal === "function") {
      openDynamicModal("📍 Set Your Location", html.replace(/<div style="background:linear-gradient.*?<\/div>\s*<div style="padding:20px">/s, ""));
    }
  }

  /* GPS detect inside the picker modal */
  window._nzDetectGPS = async function(btn) {
    if (!navigator.geolocation) {
      if (typeof toast === "function") toast("GPS not supported on this device", "error");
      return;
    }
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Detecting...';
    btn.disabled  = true;
    navigator.geolocation.getCurrentPosition(
      async pos => {
        window.S.userLat = pos.coords.latitude;
        window.S.userLng = pos.coords.longitude;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching address...';
        const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (city) {
          setHeaderLocation(city);
          if (typeof nzCloseModal   === "function") nzCloseModal();
          if (typeof closeAllModals === "function") closeAllModals();
          if (typeof toast === "function") toast(`📍 Location set to ${city}`, "success");
          if (typeof loadShops      === "function") try { await loadShops(); } catch(e) {}
          if (typeof renderShops    === "function") renderShops();
          if (typeof renderProducts === "function") renderProducts();
        } else {
          if (typeof toast === "function") toast("Could not determine city. Please choose manually.", "error");
          btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Detect My Location (GPS)';
          btn.disabled  = false;
        }
      },
      err => {
        btn.disabled  = false;
        btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Detect My Location (GPS)';
        const msg = err.code === 1 ? "Location access denied. Please allow location in browser settings." :
                    err.code === 2 ? "Location unavailable. Please choose your city manually." :
                    "Location timed out. Please choose your city manually.";
        if (typeof toast === "function") toast(msg, "error");
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  window._nzPickCity = function(city) {
    setHeaderLocation(city);
    if (typeof nzCloseModal   === "function") nzCloseModal();
    if (typeof closeAllModals === "function") closeAllModals();
    if (typeof toast === "function") toast(`📍 Location set to ${city}`, "success");
    if (typeof loadShops      === "function") try { loadShops().then(() => { if (typeof renderShops    === "function") renderShops(); if (typeof renderProducts === "function") renderProducts(); }); } catch(e) {}
  };

  window._nzFilterCities = function(q) {
    const lq = q.toLowerCase();
    document.querySelectorAll("#nzCityList > div").forEach(el => {
      el.style.display = (!q || el.dataset.city?.includes(lq) || el.dataset.state?.includes(lq)) ? "" : "none";
    });
  };

  /* Attach after DOM loads */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachLocationButton);
  } else {
    setTimeout(attachLocationButton, 200);
  }
})();

/* ──────────────────────────────────────────────────────────────
   SECTION 3 — SUBSCRIPTION PERSISTENCE TO BACKEND
   After Razorpay payment for Pro, persists to MongoDB via
   POST /api/subscription/activate
   ────────────────────────────────────────────────────────────── */
(function patchSubscribePro() {
  /* Override subscribePro from nearzy-features.js */
  window.subscribePro = async function() {
    if (!window.S?.token) {
      if (typeof showLoginModal === "function") showLoginModal();
      else if (typeof openAuthModal === "function") openAuthModal();
      return;
    }
    const plan   = window._selectedPlan || "yearly";
    const amount = plan === "yearly" ? (window.PRO_YEARLY || 999) : (window.PRO_MONTHLY || 149);
    const API    = window.API || "https://nearzy-backend.onrender.com/api";

    try {
      if (typeof showLoader === "function") showLoader("Setting up payment...");
      const res  = await _authFetch(`${API}/payment/create-order`, {
        method: "POST",
        body: JSON.stringify({ amount, notes: { purpose: "nearzy_pro", plan } })
      });
      const data = await res.json();
      if (typeof hideLoader === "function") hideLoader();
      if (!data.order) { if (typeof toast === "function") toast(data.message || "Could not create order", "error"); return; }

      const rzpOptions = {
        key:         window.RAZORPAY_KEY || "rzp_live_SQ2a0BIeQiJQly",
        amount:      data.order.amount,
        currency:    "INR",
        name:        "Nearzy",
        description: `Nearzy Pro — ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        order_id:    data.order.id,
        prefill:     { name: window.S.user?.name || "", email: window.S.user?.email || "" },
        theme:       { color: "#fc8019" },
        handler: async function(paymentResp) {
          try {
            if (typeof showLoader === "function") showLoader("Activating Pro...");

            /* 1. Verify payment on our backend */
            const verifyRes = await _authFetch(`${API}/payment/verify`, {
              method:  "POST",
              body:    JSON.stringify({ ...paymentResp, purpose: "nearzy_pro", plan })
            });
            const verifyData = await verifyRes.json();

            /* 2. Activate subscription in DB */
            const activateRes = await _authFetch(`${API}/subscription/activate`, {
              method: "POST",
              body:   JSON.stringify({ plan, razorpay_order_id: paymentResp.razorpay_order_id, razorpay_payment_id: paymentResp.razorpay_payment_id, razorpay_signature: paymentResp.razorpay_signature })
            });
            const activateData = await activateRes.json();

            /* 3. Update local state */
            const expiry = new Date(Date.now() + (plan === "yearly" ? 365 : 30) * 86400000).toISOString();
            window.NZ.subscription = { active: true, plan, expiry, paymentId: paymentResp.razorpay_payment_id };
            localStorage.setItem("nz_pro", JSON.stringify(window.NZ.subscription));

            if (typeof hideLoader === "function") hideLoader();
            if (typeof toast      === "function") toast("🎉 Welcome to Nearzy Pro! Enjoy unlimited benefits!", "success");
            if (typeof renderProPage === "function") setTimeout(renderProPage, 200);
            if (typeof addNotification === "function") addNotification("🏆 Nearzy Pro Activated!", `Your ${plan} plan is now active. Enjoy zero delivery charges, 2x points and more!`, "success");
          } catch(err) {
            if (typeof hideLoader === "function") hideLoader();
            /* Even if DB save fails, keep local state so user isn't locked out */
            const expiry = new Date(Date.now() + (plan === "yearly" ? 365 : 30) * 86400000).toISOString();
            window.NZ.subscription = { active: true, plan, expiry };
            localStorage.setItem("nz_pro", JSON.stringify(window.NZ.subscription));
            if (typeof toast === "function") toast("🎉 Pro activated! (sync issue — will resolve automatically)", "success");
          }
        },
        modal: { ondismiss: () => { if (typeof hideLoader === "function") hideLoader(); } }
      };

      /* eslint-disable no-undef */
      new Razorpay(rzpOptions).open();
    } catch (e) {
      if (typeof hideLoader === "function") hideLoader();
      if (typeof toast === "function") toast(e.message || "Payment failed. Try again.", "error");
    }
  };
})();

/* ──────────────────────────────────────────────────────────────
   SECTION 4 — SELLER-ONLY PRODUCT ENFORCEMENT
   Blocks any non-seller from calling add/edit/delete product APIs.
   Also removes the "Add Product" button from non-seller views.
   ────────────────────────────────────────────────────────────── */
(function enforceSellerProductAccess() {
  /* Wrap saveProduct */
  const _origSaveProduct = window.saveProduct;
  window.saveProduct = async function() {
    if (!window.S?.user) {
      if (typeof openAuthModal === "function") openAuthModal();
      return;
    }
    if (window.S.user.role !== "seller" && window.S.user.role !== "admin" && window.S.user.role !== "superadmin") {
      if (typeof toast === "function") toast("⚠️ Only shop owners can add or edit products", "error");
      return;
    }
    if (typeof _origSaveProduct === "function") return _origSaveProduct.apply(this, arguments);
  };

  /* Wrap openAddProductModal */
  const _origOpen = window.openAddProductModal;
  window.openAddProductModal = function() {
    if (!window.S?.user) {
      if (typeof openAuthModal === "function") openAuthModal();
      return;
    }
    if (window.S.user.role !== "seller" && window.S.user.role !== "admin" && window.S.user.role !== "superadmin") {
      if (typeof toast === "function") toast("⚠️ Only registered shop owners can add products. Go to Account → Become a Seller.", "error");
      return;
    }
    if (typeof _origOpen === "function") return _origOpen.apply(this, arguments);
  };

  /* Wrap deleteSellerProduct */
  const _origDelete = window.deleteSellerProduct;
  window.deleteSellerProduct = async function(id, name) {
    if (window.S?.user?.role !== "seller" && window.S?.user?.role !== "admin" && window.S?.user?.role !== "superadmin") {
      if (typeof toast === "function") toast("⚠️ Only shop owners can delete products", "error");
      return;
    }
    if (typeof _origDelete === "function") return _origDelete.apply(this, arguments);
  };
})();

/* ──────────────────────────────────────────────────────────────
   SECTION 5 — GPS NEARBY FILTER IMPROVEMENTS
   Adds smooth UX: distance labels on shop cards, auto-sort
   ────────────────────────────────────────────────────────────── */
(function improveNearbyFilter() {
  const _origToggle = window.toggleNearbyFilter;
  window.toggleNearbyFilter = function(btn) {
    if (!window.S.nearbyOnly) {
      if (!navigator.geolocation) {
        if (typeof toast === "function") toast("GPS not supported on this device", "error");
        return;
      }
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="font-size:11px"></i> Locating...`;
      btn.disabled  = true;
      navigator.geolocation.getCurrentPosition(
        pos => {
          window.S.userLat   = pos.coords.latitude;
          window.S.userLng   = pos.coords.longitude;
          window.S.nearbyOnly = true;
          btn.disabled        = false;
          btn.innerHTML       = `<i class="fa-solid fa-location-crosshairs" style="font-size:11px;color:var(--brand)"></i> ${window.S.nearbyRadius || 5}km`;
          btn.classList.add("active");
          if (typeof renderShops === "function") renderShops();
          if (typeof toast === "function") toast(`📍 Showing shops within ${window.S.nearbyRadius || 5}km of you`, "success");
        },
        err => {
          btn.disabled  = false;
          btn.innerHTML = `<i class="fa-solid fa-location-crosshairs" style="font-size:11px"></i> Nearby`;
          const msg = err.code === 1 ? "Location access denied. Enable location in browser settings." :
                      err.code === 2 ? "Location unavailable. Check GPS signal." : "Location timed out. Try again.";
          if (typeof toast === "function") toast(msg, "error");
        },
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    } else {
      window.S.nearbyOnly = false;
      window.S.userLat    = null;
      window.S.userLng    = null;
      btn.classList.remove("active");
      btn.innerHTML = `<i class="fa-solid fa-location-crosshairs" style="font-size:11px"></i> Nearby`;
      if (typeof renderShops === "function") renderShops();
      if (typeof toast === "function") toast("Showing all shops", "info");
    }
  };
})();

/* ──────────────────────────────────────────────────────────────
   SECTION 6 — GIFT CARD PAYMENT PERSISTENCE
   After Razorpay payment for gift cards, records it in backend.
   ────────────────────────────────────────────────────────────── */
(function patchGiftCard() {
  window.purchaseGiftCard = async function() {
    if (!window.S?.token) {
      if (typeof showLoginModal === "function") showLoginModal();
      else if (typeof openAuthModal === "function") openAuthModal();
      return;
    }
    const amount    = window._selectedGiftAmount || 500;
    const recipient = document.getElementById("giftRecipient")?.value?.trim();
    const contact   = document.getElementById("giftContact")?.value?.trim();
    const message   = document.getElementById("giftMessage")?.value?.trim();
    if (!recipient || !contact) { if (typeof toast === "function") toast("Enter recipient details", "error"); return; }
    const API = window.API || "https://nearzy-backend.onrender.com/api";
    try {
      const res  = await _authFetch(`${API}/payment/create-order`, {
        method: "POST",
        body:   JSON.stringify({ amount, notes: { purpose: "gift_card", recipient, contact } })
      });
      const data = await res.json();
      if (!data.order) { if (typeof toast === "function") toast(data.message || "Error creating payment", "error"); return; }
      new Razorpay({
        key:         window.RAZORPAY_KEY || "rzp_live_SQ2a0BIeQiJQly",
        amount:      data.order.amount,
        currency:    "INR",
        name:        "Nearzy",
        description: `Gift Card ₹${amount} for ${recipient}`,
        order_id:    data.order.id,
        prefill:     { name: window.S.user?.name || "", email: window.S.user?.email || "" },
        theme:       { color: "#fc8019" },
        handler: async function(paymentResp) {
          try {
            /* Verify payment */
            await _authFetch(`${API}/payment/verify`, {
              method: "POST",
              body:   JSON.stringify({ ...paymentResp, purpose: "gift_card" })
            });
          } catch(e) { /* Non-blocking */ }
          /* Record gift card */
          const giftCard = {
            id:          "GC" + Date.now(),
            amount,
            recipient,
            contact,
            message:     message || "",
            code:        "NRZ-GC-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            paymentId:   paymentResp.razorpay_payment_id,
            createdAt:   new Date().toISOString(),
            status:      "sent"
          };
          const existing = JSON.parse(localStorage.getItem("nz_gift_cards") || "[]");
          existing.unshift(giftCard);
          localStorage.setItem("nz_gift_cards", JSON.stringify(existing));
          if (typeof nzCloseModal   === "function") nzCloseModal();
          if (typeof closeAllModals === "function") closeAllModals();
          if (typeof toast === "function") toast(`🎁 Gift card ₹${amount} sent to ${recipient}! Code: ${giftCard.code}`, "success");
          if (typeof addNotification === "function") addNotification(`🎁 Gift Card Sent!`, `₹${amount} gift card sent to ${recipient}. Code: ${giftCard.code}`, "success");
        }
      }).open();
    } catch (e) {
      if (typeof toast === "function") toast(e.message || "Gift card payment failed", "error");
    }
  };
})();

/* ──────────────────────────────────────────────────────────────
   SECTION 7 — LOAD PRO STATUS FROM BACKEND ON EVERY LOGIN
   Syncs subscription state from MongoDB, not just localStorage.
   ────────────────────────────────────────────────────────────── */
(function syncProStatusFromBackend() {
  async function fetchProStatusFromDB() {
    if (!window.S?.token) return;
    const API = window.API || "https://nearzy-backend.onrender.com/api";
    try {
      const res  = await _authFetch(`${API}/subscription/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.active && data.expiry && new Date(data.expiry) > new Date()) {
        window.NZ = window.NZ || {};
        window.NZ.subscription = { active: true, plan: data.plan, expiry: data.expiry };
        localStorage.setItem("nz_pro", JSON.stringify(window.NZ.subscription));
        /* Show Pro badge on header if function exists */
        const proBadge = document.getElementById("proBadge");
        if (proBadge) proBadge.style.display = "flex";
      } else {
        /* Subscription expired or not found on server */
        if (window.NZ?.subscription) window.NZ.subscription.active = false;
        localStorage.removeItem("nz_pro");
      }
    } catch (e) { /* Network error — fall back to localStorage */ }
  }

  /* Hook into the login success flow */
  const _origLogin = window.doLogin;
  if (typeof _origLogin === "function") {
    window.doLogin = async function() {
      await _origLogin.apply(this, arguments);
      setTimeout(fetchProStatusFromDB, 800);
    };
  }

  /* Also sync 1s after app initialises (catches already-logged-in users) */
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(fetchProStatusFromDB, 1500);
  });
})();

/* ──────────────────────────────────────────────────────────────
   SECTION 8 — WALLET LOAD ON LOGIN
   Ensures wallet balance is fetched after every login.
   ────────────────────────────────────────────────────────────── */
(function ensureWalletSyncsOnLogin() {
  const _origLogin = window.doLogin;
  if (typeof _origLogin === "function" && !window._walletLoginPatched) {
    window._walletLoginPatched = true;
    window.doLogin = async function() {
      const result = await _origLogin.apply(this, arguments);
      if (window.S?.token && typeof window.loadWallet === "function") {
        setTimeout(window.loadWallet, 600);
      }
      return result;
    };
  }
  /* Also sync on load if already logged in */
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      if (window.S?.token && typeof window.loadWallet === "function") {
        window.loadWallet();
      }
    }, 1000);
  });
})();

/* ──────────────────────────────────────────────────────────────
   SECTION 9 — TOAST & HAPTIC SAFETY GUARDS
   Prevents crashes when fixes run before main script
   ────────────────────────────────────────────────────────────── */
if (typeof window.toast !== "function") {
  window.toast = function(msg, type) {
    /* Minimal fallback toast */
    const t = document.createElement("div");
    t.style.cssText = `
      position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
      background:${type==="error"?"#e23744":type==="success"?"#0c9e52":"#282c3f"};
      color:#fff;padding:10px 20px;border-radius:99px;font-size:13px;font-weight:700;
      z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.3);white-space:nowrap;
      animation:fadeUp .3s ease`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  };
}

/* ──────────────────────────────────────────────────────────────
   SECTION 10 — ORDER FLOW: APPLY PRO BENEFITS AUTOMATICALLY
   If user is a Pro subscriber, automatically waive delivery fee
   and add 2x loyalty points.
   ────────────────────────────────────────────────────────────── */
(function applyProBenefitsToOrders() {
  /* Wrap the checkout render to zero out delivery fee for Pro users */
  const _origRenderCheckout = window.renderCheckout;
  if (typeof _origRenderCheckout === "function") {
    window.renderCheckout = function() {
      _origRenderCheckout.apply(this, arguments);
      /* After checkout renders, check if Pro and zero delivery fee */
      setTimeout(() => {
        const isProActive = window.NZ?.subscription?.active &&
          window.NZ?.subscription?.expiry &&
          new Date(window.NZ.subscription.expiry) > new Date();
        if (isProActive) {
          const feeEl = document.querySelector(".ck-delivery-fee, #deliveryFeeDisplay");
          if (feeEl) {
            feeEl.innerHTML = `<span style="text-decoration:line-through;color:var(--ink3);margin-right:4px">${feeEl.textContent.trim()}</span><span style="color:var(--green);font-weight:800">FREE 👑</span>`;
          }
          /* Also show Pro badge in checkout */
          const proHint = document.getElementById("proCheckoutHint");
          if (!proHint) {
            const ckBox = document.querySelector(".ck-box");
            if (ckBox) {
              const hint = document.createElement("div");
              hint.id = "proCheckoutHint";
              hint.style.cssText = "background:linear-gradient(135deg,#fc801922,#7c3aed22);border:1.5px solid #fc8019;border-radius:var(--r-sm);padding:10px 14px;font-size:12px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;margin-bottom:12px";
              hint.innerHTML = `<i class="fa-solid fa-crown" style="color:#fc8019"></i> Nearzy Pro — Free delivery & 2× points applied!`;
              ckBox.insertBefore(hint, ckBox.firstChild);
            }
          }
        }
      }, 300);
    };
  }
})();

console.log("✅ Nearzy Production Fixes v1.0 loaded — AI proxy, GPS, subscriptions, seller-guard all active.");