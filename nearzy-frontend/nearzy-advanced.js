/* ============================================================
   NEARZY ADVANCED FEATURES v3.0
   Features that NO other app has:
   - AI Meal Planner | Social Feed | Carbon Tracker
   - Mystery Box | Split Bill | Nutrition Tracker
   - Live Auction | Pet Care | Corporate | Price History
   - Community Wall | AR Food Preview | Weather Intelligence
   - Emotion-based reordering | Heatmap | Gamification
   ============================================================ */
"use strict";

/* ══ 1. AI MEAL PLANNER ═══════════════════════════════════════ */
function renderMealPlanner() {
  const el = document.getElementById("mealPlannerContent");
  if (!el) return;
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const meals = {
    Mon:  {b:"Masala Oats + Banana",l:"Dal Rice + Sabzi",d:"Grilled Chicken + Salad",cal:1820},
    Tue:  {b:"Idli Sambar (4 pcs)",l:"Rajma Chawal",d:"Paneer Tikka + Roti",cal:1950},
    Wed:  {b:"Poha + Chai",l:"Chole Bhature",d:"Khichdi + Papad",cal:1780},
    Thu:  {b:"Banana Smoothie + Toast",l:"Chicken Biryani (half)",d:"Veg Soup + Brown Rice",cal:2010},
    Fri:  {b:"Upma + Coconut Chutney",l:"Veg Pulao + Raita",d:"Fish Curry + Rice",cal:1890},
    Sat:  {b:"Paratha + Curd",l:"Hyderabadi Biryani",d:"Pizza Margherita",cal:2240},
    Sun:  {b:"Pancakes + Honey",l:"Family Feast Thali",d:"Light Soup + Salad",cal:1680},
  };
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay()-1];
  const goals = [
    {icon:"🔥",label:"Daily Cal Goal",val:"2000 kcal",color:"#ff6b6b"},
    {icon:"💪",label:"Protein",val:"80g / day",color:"#a29bfe"},
    {icon:"🌾",label:"Carbs",val:"250g / day",color:"#fdcb6e"},
    {icon:"💧",label:"Water",val:"3L / day",color:"#74b9ff"},
  ];

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#00b894,#00cec9);border-radius:20px;padding:24px;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-20px;top:-20px;font-size:120px;opacity:.1">🥗</div>
      <div style="position:relative;z-index:1">
        <div style="font-size:12px;color:rgba(255,255,255,.8);font-weight:700;text-transform:uppercase;letter-spacing:.1em">AI-Powered</div>
        <div style="font-size:26px;font-weight:800;color:#fff;margin:4px 0">Your Weekly Meal Plan</div>
        <div style="font-size:12px;color:rgba(255,255,255,.8)">Personalized nutrition • Automatically ordered • Saved 18% this week</div>
      </div>
    </div>

    <!-- Nutrition Goals -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
      ${goals.map(g=>`
      <div style="background:var(--white);border-radius:12px;padding:12px 6px;text-align:center;box-shadow:var(--card-shadow)">
        <div style="font-size:20px">${g.icon}</div>
        <div style="font-size:11px;font-weight:800;color:var(--ink);margin:3px 0">${g.val}</div>
        <div style="font-size:9px;color:var(--ink3)">${g.label}</div>
      </div>`).join("")}
    </div>

    <!-- Week Grid -->
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-size:14px;font-weight:800;color:var(--ink)">📅 This Week</div>
        <button onclick="regenerateMealPlan()" style="padding:6px 14px;background:var(--brand-light);border:1px solid var(--brand);border-radius:99px;font-size:11px;font-weight:700;color:var(--brand);cursor:pointer">🤖 Regenerate AI Plan</button>
      </div>
      <div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px">
        ${days.map(d=>`
        <div onclick="showMealDay('${d}')" id="mday-${d}" style="flex-shrink:0;width:52px;text-align:center;padding:8px 4px;border-radius:10px;cursor:pointer;background:${d===today?"var(--brand)":"var(--bg)"};border:2px solid ${d===today?"var(--brand)":"transparent"}">
          <div style="font-size:11px;font-weight:700;color:${d===today?"#fff":"var(--ink3)"}">${d}</div>
          <div style="font-size:18px;margin:3px 0">${["🍳","🥘","🍛","🥗","🐟","🍕","🥞"][days.indexOf(d)]}</div>
          <div style="font-size:9px;font-weight:700;color:${d===today?"rgba(255,255,255,.8)":"var(--ink3)"}">${meals[d].cal} cal</div>
        </div>`).join("")}
      </div>
    </div>

    <!-- Today's Meals -->
    <div id="mealDayDetail" style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="font-size:14px;font-weight:800;color:var(--ink);margin-bottom:12px">🍽️ Today — ${today}</div>
      ${["☀️ Breakfast","☕ Lunch","🌙 Dinner"].map((label,i)=>{
        const key = ["b","l","d"][i];
        const meal = meals[today][key];
        return `
      <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #f5f5f5">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--brand-light);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${label.split(" ")[0]}</div>
        <div style="flex:1">
          <div style="font-size:11px;color:var(--ink3);font-weight:600">${label.split(" ")[1]}</div>
          <div style="font-size:13px;font-weight:700;color:var(--ink)">${meal}</div>
        </div>
        <button onclick="orderMeal('${meal}')" style="padding:6px 12px;background:var(--brand);color:#fff;border:none;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer">Order</button>
      </div>`}).join("")}
    </div>

    <!-- Smart Insights -->
    <div style="background:linear-gradient(135deg,#a29bfe22,#6c5ce722);border:1.5px solid #a29bfe;border-radius:16px;padding:16px">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:10px">🤖 AI Insights</div>
      ${[
        "You've consumed 12% less calories than last week — great progress! 🎉",
        "Your protein intake is 15g short daily. Add dal or eggs to lunch.",
        "Tip: Order from Paradise Restaurant on Fri for best value biryani.",
        "You're trending toward your weight goal — 3 more weeks to go! 💪",
      ].map(t=>`<div style="display:flex;gap:8px;padding:6px 0;font-size:12px;color:var(--ink2)"><span style="color:var(--brand)">→</span>${t}</div>`).join("")}
    </div>
  </div>`;
}

function regenerateMealPlan() {
  toast("🤖 AI is generating your personalized plan...", "info");
  setTimeout(()=>{ toast("✅ New meal plan ready! Based on your health goals.", "success"); }, 2000);
}
function orderMeal(meal) { toast(`🛒 Adding "${meal}" ingredients to cart...`, "success"); }
function showMealDay(d) {
  document.querySelectorAll("[id^='mday-']").forEach(el=>{
    const isSelected = el.id === `mday-${d}`;
    el.style.background = isSelected ? "var(--brand)" : "var(--bg)";
    el.style.borderColor = isSelected ? "var(--brand)" : "transparent";
    el.querySelectorAll("div").forEach(c=>{ c.style.color = isSelected ? (c.style.fontSize==="9px"?"rgba(255,255,255,.8)":"#fff") : ""; });
  });
}

/* ══ 2. SOCIAL FEED ═══════════════════════════════════════════ */
function renderSocialFeed() {
  const el = document.getElementById("socialFeedContent");
  if (!el) return;
  const posts = [
    {user:"Priya M.",avatar:"🧕",time:"2 min ago",content:"Just tried the new Chicken Tikka from Al-Baik — absolutely mind-blowing! 🔥",shop:"Al-Baik Chicken",rating:5,likes:24,img:"🍗",verified:true},
    {user:"Rahul K.",avatar:"👨‍💼",time:"18 min ago",content:"Paradise Biryani never disappoints. 3rd time this week lol 😅",shop:"Paradise Restaurant",rating:5,likes:41,img:"🍛",verified:false},
    {user:"Anjali S.",avatar:"👩",time:"1h ago",content:"Green Farms organic veggies delivered so fresh! Supporting local 💚",shop:"Green Farms",rating:4,likes:17,img:"🥦",verified:true},
    {user:"Mohammed A.",avatar:"🧔",time:"2h ago",content:"Ordered for 10 people for office lunch — everything was perfect and on time!",shop:"Bawarchi Restaurant",rating:5,likes:89,img:"🍽️",verified:false},
    {user:"Kavitha R.",avatar:"👩‍🦱",time:"3h ago",content:"Mystery Box this month had 6 items worth ₹800 for just ₹399! Great deal 🎲",shop:"Nearzy Mystery",rating:5,likes:63,img:"🎁",verified:true},
  ];

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#fd79a8,#e84393);border-radius:20px;padding:22px;margin-bottom:20px;text-align:center">
      <div style="font-size:36px;margin-bottom:6px">📱</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Nearzy Social</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85)">What your community is eating right now</div>
    </div>

    <!-- Post composer -->
    <div style="background:var(--white);border-radius:16px;padding:14px;box-shadow:var(--card-shadow);margin-bottom:16px;display:flex;gap:10px;align-items:center">
      <div style="width:38px;height:38px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">😊</div>
      <div onclick="openPostComposer()" style="flex:1;padding:10px 14px;background:var(--bg);border-radius:99px;font-size:13px;color:var(--ink3);cursor:pointer">Share what you're eating... 🍽️</div>
      <button onclick="openPostComposer()" style="padding:8px 14px;background:var(--brand);color:#fff;border:none;border-radius:99px;font-size:12px;font-weight:700;cursor:pointer">Post</button>
    </div>

    <!-- Feed -->
    ${posts.map(p=>`
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--brand-light);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${p.avatar}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:5px">
            <div style="font-size:13px;font-weight:800;color:var(--ink)">${p.user}</div>
            ${p.verified?`<i class="fa-solid fa-circle-check" style="color:#1a73e8;font-size:11px"></i>`:""}
          </div>
          <div style="font-size:11px;color:var(--ink3)">${p.time} · <span style="color:var(--brand)">${p.shop}</span></div>
        </div>
        <div style="font-size:24px">${p.img}</div>
      </div>
      <div style="font-size:13px;color:var(--ink);line-height:1.6;margin-bottom:10px">${p.content}</div>
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:10px">
        ${"⭐".repeat(p.rating)}${"☆".repeat(5-p.rating)}
      </div>
      <div style="display:flex;gap:12px;padding-top:10px;border-top:1px solid #f5f5f5">
        <button onclick="likePost(this)" style="display:flex;align-items:center;gap:5px;background:none;border:none;font-size:12px;font-weight:600;color:var(--ink3);cursor:pointer"><i class="fa-regular fa-heart"></i> ${p.likes}</button>
        <button style="display:flex;align-items:center;gap:5px;background:none;border:none;font-size:12px;font-weight:600;color:var(--ink3);cursor:pointer"><i class="fa-regular fa-comment"></i> Reply</button>
        <button onclick="orderSameAs('${p.shop}')" style="display:flex;align-items:center;gap:5px;background:var(--brand-light);border:none;border-radius:99px;padding:5px 12px;font-size:11px;font-weight:700;color:var(--brand);cursor:pointer">Order Same 🛒</button>
      </div>
    </div>`).join("")}
  </div>`;
}

function likePost(btn) {
  const icon = btn.querySelector("i");
  icon.className = "fa-solid fa-heart";
  icon.style.color = "#e84393";
  btn.style.color = "#e84393";
}
function openPostComposer() {
  if (typeof openDynamicModal === "function") {
    openDynamicModal("📱 Share Your Order", `
      <div style="display:flex;gap:10px;margin-bottom:12px">
        <div style="width:38px;height:38px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">😊</div>
        <textarea id="postText" style="flex:1;padding:10px;border:1.5px solid var(--ink4);border-radius:12px;font-size:13px;color:var(--ink);background:var(--bg);resize:none;font-family:inherit" rows="3" placeholder="What did you order? Share your experience..."></textarea>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:14px">
        ${["🍛","🍕","🍗","🥗","🍰","☕","🥘","🐟"].map(e=>`<button onclick="document.getElementById('postText').value+=this.textContent" style="width:36px;height:36px;background:var(--bg);border:1px solid var(--ink4);border-radius:8px;font-size:18px;cursor:pointer">${e}</button>`).join("")}
      </div>
      <div class="fgroup"><label class="flabel">Tag a shop (optional)</label><input class="finput" placeholder="e.g. Paradise Restaurant"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <select class="fselect" style="flex:1"><option>⭐⭐⭐⭐⭐ 5 Stars</option><option>⭐⭐⭐⭐ 4 Stars</option><option>⭐⭐⭐ 3 Stars</option></select>
        <button onclick="submitPost()" style="padding:12px 20px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer">Post 🚀</button>
      </div>
    `);
  }
}
function submitPost() {
  if (typeof closeAllModals === "function") closeAllModals();
  if (typeof toast === "function") toast("🎉 Post shared with community! +25 loyalty points earned.", "success");
}
function orderSameAs(shop) { if(typeof toast==="function") toast(`🛒 Opening ${shop}...`, "info"); if(typeof showPage==="function") showPage("home"); }

/* ══ 3. CARBON FOOTPRINT TRACKER ══════════════════════════════ */
function renderCarbonTracker() {
  const el = document.getElementById("carbonTrackerContent");
  if (!el) return;
  const totalKg = 12.4;
  const savedKg = 8.2;
  const treesPlanted = 3;
  const orders = [
    {name:"Veg Biryani",shop:"Paradise",co2:"0.8kg CO₂",eco:"Low",color:"#00b894",bar:25},
    {name:"Chicken Tikka",shop:"Al-Baik",co2:"1.8kg CO₂",eco:"Medium",color:"#fdcb6e",bar:55},
    {name:"Fresh Veg Box",shop:"Green Farms",co2:"0.3kg CO₂",eco:"Very Low",color:"#00b894",bar:10},
    {name:"Mutton Biryani",shop:"Bawarchi",co2:"2.4kg CO₂",eco:"High",color:"#ff6b6b",bar:75},
  ];

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#00b894,#55efc4);border-radius:20px;padding:24px;margin-bottom:20px;text-align:center;position:relative;overflow:hidden">
      <div style="position:absolute;right:-10px;bottom:-10px;font-size:100px;opacity:.12">🌍</div>
      <div style="font-size:40px;margin-bottom:8px">🌱</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Your Carbon Footprint</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:4px">Track the environmental impact of your orders</div>
    </div>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      <div style="background:var(--white);border-radius:14px;padding:14px;text-align:center;box-shadow:var(--card-shadow)">
        <div style="font-size:28px;margin-bottom:4px">💨</div>
        <div style="font-size:18px;font-weight:800;color:#ff6b6b">${totalKg}kg</div>
        <div style="font-size:10px;color:var(--ink3)">CO₂ This Month</div>
      </div>
      <div style="background:var(--white);border-radius:14px;padding:14px;text-align:center;box-shadow:var(--card-shadow)">
        <div style="font-size:28px;margin-bottom:4px">♻️</div>
        <div style="font-size:18px;font-weight:800;color:#00b894">${savedKg}kg</div>
        <div style="font-size:10px;color:var(--ink3)">CO₂ Saved vs Driving</div>
      </div>
      <div style="background:var(--white);border-radius:14px;padding:14px;text-align:center;box-shadow:var(--card-shadow)">
        <div style="font-size:28px;margin-bottom:4px">🌳</div>
        <div style="font-size:18px;font-weight:800;color:#00b894">${treesPlanted}</div>
        <div style="font-size:10px;color:var(--ink3)">Trees Planted for You</div>
      </div>
    </div>

    <!-- Carbon per order -->
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="font-size:14px;font-weight:800;color:var(--ink);margin-bottom:14px">📊 Recent Orders Impact</div>
      ${orders.map(o=>`
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--ink)">${o.name}</div>
            <div style="font-size:11px;color:var(--ink3)">${o.shop}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;font-weight:700;color:${o.color}">${o.co2}</div>
            <div style="font-size:10px;padding:2px 7px;background:${o.color}22;color:${o.color};border-radius:99px;font-weight:700">${o.eco}</div>
          </div>
        </div>
        <div style="height:6px;background:#f0f0f0;border-radius:99px;overflow:hidden">
          <div style="height:100%;background:${o.color};border-radius:99px;width:${o.bar}%;transition:width 1s ease"></div>
        </div>
      </div>`).join("")}
    </div>

    <!-- Eco Tips -->
    <div style="background:linear-gradient(135deg,#00b89411,#55efc411);border:1.5px solid #00b894;border-radius:16px;padding:16px;margin-bottom:16px">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:10px">🌿 Go Greener</div>
      ${[
        ["🥗","Choose veg meals — saves up to 2.5kg CO₂ per order"],
        ["📦","Request no plastic packaging — saves 0.3kg CO₂"],
        ["🛵","Batch your orders — fewer deliveries, less emissions"],
        ["🏪","Order from nearby shops — shorter delivery = less fuel"],
      ].map(([i,t])=>`<div style="display:flex;gap:8px;padding:6px 0;font-size:12px;color:var(--ink2)"><span>${i}</span>${t}</div>`).join("")}
    </div>

    <button onclick="offsetCarbon()" style="width:100%;padding:14px;background:linear-gradient(135deg,#00b894,#00cec9);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer">
      🌳 Offset My Carbon — Plant Trees (₹10/tree)
    </button>
  </div>`;
}
function offsetCarbon() { if(typeof toast==="function") toast("🌳 Planting 1 tree on your behalf! ₹10 deducted from wallet.","success"); }

/* ══ 4. MYSTERY BOX ════════════════════════════════════════════ */
function renderMysteryBox() {
  const el = document.getElementById("mysteryBoxContent");
  if (!el) return;
  const boxes = [
    {name:"Food Lover Box",price:399,worth:"₹700–900",emoji:"🍛",desc:"Curated dishes from top-rated restaurants — surprise every time!",color:"linear-gradient(135deg,#ee5a24,#f0932b)",badge:"🔥 Bestseller",subscribers:1240},
    {name:"Grocery Surprise",price:299,worth:"₹500–650",emoji:"🥦",desc:"Premium fresh produce + pantry essentials from local farms.",color:"linear-gradient(135deg,#00b894,#26de81)",badge:"🌿 Eco Choice",subscribers:840},
    {name:"Sweet Treat Box",price:349,worth:"₹600–750",emoji:"🍰",desc:"Desserts, pastries, chocolates from city's best bakeries.",color:"linear-gradient(135deg,#a29bfe,#6c5ce7)",badge:"🎂 Limited",subscribers:620},
    {name:"Health & Wellness",price:449,worth:"₹800–1000",emoji:"💊",desc:"Vitamins, protein bars, organic snacks — curated by nutritionists.",color:"linear-gradient(135deg,#0652DD,#74b9ff)",badge:"💪 Premium",subscribers:380},
  ];

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#6c5ce7,#a29bfe);border-radius:20px;padding:24px;text-align:center;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎲</text></svg>') center/cover;opacity:.07"></div>
      <div style="position:relative;z-index:1">
        <div style="font-size:48px;margin-bottom:10px;animation:bounce 2s infinite">🎁</div>
        <div style="font-size:24px;font-weight:800;color:#fff">Mystery Box</div>
        <div style="font-size:13px;color:rgba(255,255,255,.85);margin-top:4px">Surprise deliveries • Always worth 2x the price • Delivered monthly</div>
      </div>
    </div>

    <!-- How it works -->
    <div style="display:flex;gap:0;background:var(--white);border-radius:14px;padding:14px;box-shadow:var(--card-shadow);margin-bottom:20px">
      ${[["🎯","Pick","Choose your box type"],["💳","Pay","One-time or monthly"],["📦","Wait","We curate the best"],["🎉","Wow","Open your surprise!"]].map(([i,t,d],idx)=>`
      <div style="flex:1;text-align:center;position:relative">
        ${idx<3?`<div style="position:absolute;right:0;top:50%;transform:translateY(-50%);color:var(--ink4);font-size:16px">›</div>`:""}
        <div style="font-size:22px;margin-bottom:3px">${i}</div>
        <div style="font-size:11px;font-weight:800;color:var(--ink)">${t}</div>
        <div style="font-size:10px;color:var(--ink3)">${d}</div>
      </div>`).join("")}
    </div>

    <!-- Boxes -->
    ${boxes.map(b=>`
    <div style="background:var(--white);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow);margin-bottom:14px">
      <div style="background:${b.color};padding:20px;display:flex;align-items:center;gap:16px">
        <div style="font-size:52px">${b.emoji}</div>
        <div style="flex:1">
          <div style="display:inline-block;font-size:10px;font-weight:800;color:rgba(255,255,255,.9);background:rgba(255,255,255,.2);padding:3px 8px;border-radius:99px;margin-bottom:6px">${b.badge}</div>
          <div style="font-size:18px;font-weight:800;color:#fff">${b.name}</div>
          <div style="font-size:12px;color:rgba(255,255,255,.8)">${b.subscribers.toLocaleString()} subscribers this month</div>
        </div>
      </div>
      <div style="padding:14px">
        <div style="font-size:12px;color:var(--ink2);line-height:1.6;margin-bottom:12px">${b.desc}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:20px;font-weight:800;color:var(--brand)">₹${b.price}</div>
            <div style="font-size:11px;color:var(--green);font-weight:700">Worth ${b.worth} guaranteed</div>
          </div>
          <button onclick="subscribeMysteryBox('${b.name}',${b.price})" style="padding:12px 22px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer">Subscribe 📦</button>
        </div>
      </div>
    </div>`).join("")}
  </div>`;
}
function subscribeMysteryBox(name, price) {
  if(typeof toast==="function") toast(`🎁 ${name} subscription started! First box arrives in 3–5 days.`, "success");
}

/* ══ 5. SPLIT BILL ═════════════════════════════════════════════ */
let _splitBillItems = [];
let _splitPeople = ["You", "Friend 1", "Friend 2"];

function renderSplitBill() {
  const el = document.getElementById("splitBillContent");
  if (!el) return;
  const total = _splitBillItems.reduce((s,i)=>s+i.price*i.qty,0) || 849;

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#fdcb6e,#e17055);border-radius:20px;padding:22px;margin-bottom:20px;text-align:center">
      <div style="font-size:36px;margin-bottom:6px">💸</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Split Bill</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85)">Split orders fairly with UPI • No awkward conversations</div>
    </div>

    <!-- Order Summary -->
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="font-size:14px;font-weight:800;color:var(--ink);margin-bottom:12px">🧾 Order Total</div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--ink2);margin-bottom:6px"><span>Subtotal</span><span>₹749</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--ink2);margin-bottom:6px"><span>Delivery</span><span>₹40</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--ink2);margin-bottom:10px"><span>GST</span><span>₹60</span></div>
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:var(--ink);padding-top:10px;border-top:2px solid var(--ink4)"><span>Total</span><span>₹${total}</span></div>
    </div>

    <!-- Split Method -->
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="font-size:14px;font-weight:800;color:var(--ink);margin-bottom:12px">⚖️ Split Method</div>
      <div style="display:flex;gap:8px;margin-bottom:14px" id="splitMethodBtns">
        ${["Equal Split","Custom Split","By Items"].map((m,i)=>`
        <button onclick="setSplitMethod(${i},this)" style="flex:1;padding:9px;background:${i===0?"var(--brand)":"var(--bg)"};color:${i===0?"#fff":"var(--ink2)"};border:${i===0?"none":"1.5px solid var(--ink4)"};border-radius:var(--r-sm);font-size:11px;font-weight:700;cursor:pointer">${m}</button>`).join("")}
      </div>
      <div style="font-size:20px;font-weight:800;color:var(--brand);text-align:center;margin-bottom:4px">₹${Math.round(total/3)} each</div>
      <div style="font-size:12px;color:var(--ink3);text-align:center">Split equally among ${_splitPeople.length} people</div>
    </div>

    <!-- People -->
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:14px;font-weight:800;color:var(--ink)">👥 People</div>
        <button onclick="addSplitPerson()" style="padding:6px 12px;background:var(--brand-light);border:1px solid var(--brand);border-radius:99px;font-size:11px;font-weight:700;color:var(--brand);cursor:pointer">+ Add Person</button>
      </div>
      <div id="splitPeopleList">
        ${_splitPeople.map((p,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f5f5f5">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--brand-light);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${["😊","🧑","👩"][i]||"👤"}</div>
          <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--ink)">${p}</div><div style="font-size:11px;color:var(--ink3)">UPI: ${p.toLowerCase().replace(" ","")}@upi</div></div>
          <div style="font-size:14px;font-weight:800;color:var(--ink)">₹${Math.round(total/3)}</div>
          <button onclick="sendSplitRequest('${p}')" style="padding:7px 12px;background:${i===0?"var(--green-light)":"var(--brand)"};color:${i===0?"var(--green)":"#fff"};border:none;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer">${i===0?"You 😊":"Request"}</button>
        </div>`).join("")}
      </div>
    </div>

    <button onclick="sendAllSplitRequests()" style="width:100%;padding:14px;background:linear-gradient(135deg,#fdcb6e,#e17055);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer">
      💸 Send All Payment Requests via UPI
    </button>
  </div>`;
}
function setSplitMethod(idx, btn) {
  document.querySelectorAll("#splitMethodBtns button").forEach((b,i)=>{ b.style.background=i===idx?"var(--brand)":"var(--bg)"; b.style.color=i===idx?"#fff":"var(--ink2)"; b.style.border=i===idx?"none":"1.5px solid var(--ink4)"; });
}
function addSplitPerson() {
  const name = prompt("Friend's name:");
  if(name) { _splitPeople.push(name); renderSplitBill(); }
}
function sendSplitRequest(name) { if(typeof toast==="function") toast(`📤 Payment request sent to ${name} via UPI!`, "success"); }
function sendAllSplitRequests() { if(typeof toast==="function") toast("📤 Payment requests sent to all friends via UPI!", "success"); }

/* ══ 6. NUTRITION TRACKER ══════════════════════════════════════ */
function renderNutritionTracker() {
  const el = document.getElementById("nutritionTrackerContent");
  if (!el) return;
  const today = {cal:1420,calGoal:2000,protein:58,proteinGoal:80,carbs:180,carbsGoal:250,fat:42,fatGoal:65,fiber:18,fiberGoal:25,water:1.8,waterGoal:3};

  const ring = (val,max,color,size=80) => {
    const pct = Math.min(val/max,1);
    const r = size/2 - 8;
    const circ = 2*Math.PI*r;
    const dash = pct*circ;
    return `<svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#f0f0f0" stroke-width="8"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-dasharray="${dash} ${circ}" stroke-linecap="round"/>
    </svg>`;
  };

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#e17055,#d63031);border-radius:20px;padding:22px;margin-bottom:20px;text-align:center">
      <div style="font-size:36px;margin-bottom:6px">🔬</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Nutrition Tracker</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85)">Know exactly what you're eating • Powered by AI</div>
    </div>

    <!-- Calorie Ring -->
    <div style="background:var(--white);border-radius:16px;padding:20px;box-shadow:var(--card-shadow);margin-bottom:16px;display:flex;align-items:center;gap:20px">
      <div style="position:relative;flex-shrink:0">
        ${ring(today.cal,today.calGoal,"#fc8019",100)}
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:18px;font-weight:800;color:var(--ink)">${today.cal}</div>
          <div style="font-size:9px;color:var(--ink3)">kcal</div>
        </div>
      </div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:800;color:var(--ink)">Today's Calories</div>
        <div style="font-size:12px;color:var(--ink3);margin:3px 0">${today.cal} / ${today.calGoal} kcal consumed</div>
        <div style="height:8px;background:#f0f0f0;border-radius:99px;overflow:hidden;margin:8px 0">
          <div style="height:100%;background:var(--brand);border-radius:99px;width:${(today.cal/today.calGoal*100).toFixed(0)}%"></div>
        </div>
        <div style="font-size:11px;color:var(--green);font-weight:700">${today.calGoal-today.cal} kcal remaining</div>
      </div>
    </div>

    <!-- Macro Grid -->
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px">
      ${[
        ["💪","Protein",today.protein,today.proteinGoal,"g","#a29bfe"],
        ["🌾","Carbs",today.carbs,today.carbsGoal,"g","#fdcb6e"],
        ["🥑","Fat",today.fat,today.fatGoal,"g","#ff7675"],
        ["🌿","Fiber",today.fiber,today.fiberGoal,"g","#55efc4"],
      ].map(([emoji,name,val,max,unit,color])=>`
      <div style="background:var(--white);border-radius:14px;padding:14px;box-shadow:var(--card-shadow)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:18px">${emoji}</span>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--ink)">${name}</div>
            <div style="font-size:11px;color:var(--ink3)">${val}/${max}${unit}</div>
          </div>
          <div style="margin-left:auto;position:relative">
            ${ring(val,max,color,44)}
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${color}">${Math.round(val/max*100)}%</div>
          </div>
        </div>
        <div style="height:5px;background:#f0f0f0;border-radius:99px;overflow:hidden">
          <div style="height:100%;background:${color};border-radius:99px;width:${Math.min(val/max*100,100).toFixed(0)}%"></div>
        </div>
      </div>`).join("")}
    </div>

    <!-- Water Tracker -->
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:14px;font-weight:800;color:var(--ink)">💧 Water Intake</div>
        <div style="font-size:13px;font-weight:700;color:#74b9ff">${today.water}L / ${today.waterGoal}L</div>
      </div>
      <div style="display:flex;gap:6px">
        ${Array.from({length:8},(_,i)=>`<div onclick="logWater(${i+1})" style="flex:1;height:40px;background:${i<Math.round(today.water/today.waterGoal*8)?"#74b9ff":"#f0f0f0"};border-radius:6px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;font-size:12px">${i<Math.round(today.water/today.waterGoal*8)?"💧":""}</div>`).join("")}
      </div>
      <div style="font-size:11px;color:var(--ink3);margin-top:8px;text-align:center">Tap glasses to log water</div>
    </div>

    <!-- Scan Food -->
    <button onclick="scanFoodItem()" style="width:100%;padding:14px;background:linear-gradient(135deg,#e17055,#d63031);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer;margin-bottom:10px">
      📷 Scan Food Item to Get Nutrition Info
    </button>
    <button onclick="logFromOrder()" style="width:100%;padding:14px;background:var(--bg);border:1.5px solid var(--ink4);color:var(--ink2);border-radius:var(--r-sm);font-size:13px;font-weight:700;cursor:pointer">
      📦 Auto-import from Recent Order
    </button>
  </div>`;
}
function logWater(glass) { if(typeof toast==="function") toast(`💧 Glass ${glass} logged! Keep hydrating.`, "info"); }
function scanFoodItem() { if(typeof toast==="function") toast("📷 Camera would open here for food scanning (native app feature)", "info"); }
function logFromOrder() { if(typeof toast==="function") toast("📦 Nutrition data imported from your last order!", "success"); }

/* ══ 7. LIVE AUCTION ═══════════════════════════════════════════ */
function renderLiveAuction() {
  const el = document.getElementById("liveAuctionContent");
  if (!el) return;
  const items = [
    {name:"Hyderabadi Biryani (2kg)",base:400,current:520,bids:14,timeLeft:312,emoji:"🍛",shop:"Paradise Restaurant",bidders:["Rahul","Priya","Arun","Mohammed"]},
    {name:"Premium Fruit Basket",base:350,current:480,bids:9,timeLeft:847,emoji:"🍎",shop:"Green Farms",bidders:["Kavitha","Suresh"]},
    {name:"Chicken Tikka Party Pack",base:500,current:670,bids:21,timeLeft:124,emoji:"🍗",shop:"Al-Baik",bidders:["Ravi","Ananya","Kiran"]},
    {name:"Wedding Cake (3kg)",base:1200,current:1580,bids:7,timeLeft:2400,emoji:"🎂",shop:"City Bakery",bidders:["Neha","Rohit"]},
  ];

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#d63031,#ff4757);border-radius:20px;padding:22px;margin-bottom:20px;text-align:center;position:relative;overflow:hidden">
      <div style="position:absolute;top:10px;right:14px;background:rgba(255,255,255,.2);padding:4px 10px;border-radius:99px;font-size:10px;font-weight:800;color:#fff;animation:pulse 1s infinite">🔴 LIVE</div>
      <div style="font-size:36px;margin-bottom:6px">🔨</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Live Price Auction</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85)">Bid on food & win at lower prices — unique to Nearzy!</div>
    </div>

    ${items.map(item=>{
      const mins = Math.floor(item.timeLeft/60);
      const secs = item.timeLeft%60;
      const isHot = item.timeLeft < 200;
      return `
    <div style="background:var(--white);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow);margin-bottom:14px;border:${isHot?"2px solid var(--red)":"1px solid #f0f0f0"}">
      ${isHot?`<div style="background:var(--red);padding:6px;text-align:center;font-size:11px;font-weight:800;color:#fff;animation:pulse 1s infinite">⚡ ENDING SOON!</div>`:""}
      <div style="padding:16px">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
          <div style="font-size:44px">${item.emoji}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:800;color:var(--ink)">${item.name}</div>
            <div style="font-size:11px;color:var(--ink3)">${item.shop}</div>
            <div style="display:flex;gap:6px;margin-top:5px">
              <span style="font-size:10px;padding:2px 8px;background:var(--brand-light);color:var(--brand);border-radius:99px;font-weight:700">${item.bids} bids</span>
              <span style="font-size:10px;padding:2px 8px;background:#fff3e8;color:var(--brand);border-radius:99px;font-weight:700">MRP ₹${item.base}</span>
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-size:11px;color:var(--ink3)">Current Bid</div>
            <div style="font-size:24px;font-weight:800;color:var(--brand)">₹${item.current}</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:11px;color:var(--ink3)">Time Left</div>
            <div style="font-size:20px;font-weight:800;color:${isHot?"var(--red)":"var(--ink)"};font-family:monospace">${mins}:${secs.toString().padStart(2,"0")}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:var(--ink3)">Recent Bidders</div>
            <div style="font-size:12px;color:var(--ink2)">${item.bidders.slice(0,2).join(", ")}...</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <input type="number" placeholder="Your bid (₹)" style="flex:1;padding:10px;border:1.5px solid var(--ink4);border-radius:var(--r-sm);font-size:14px;font-weight:700;color:var(--ink);background:var(--bg)" id="bid-${item.name.slice(0,5)}" min="${item.current+10}">
          <button onclick="placeBid('${item.name}','bid-${item.name.slice(0,5)}')" style="padding:10px 18px;background:var(--red);color:#fff;border:none;border-radius:var(--r-sm);font-size:13px;font-weight:800;cursor:pointer">Bid 🔨</button>
        </div>
      </div>
    </div>`}).join("")}
  </div>`;
}
function placeBid(item, inputId) {
  const val = document.getElementById(inputId)?.value;
  if (!val) { if(typeof toast==="function") toast("Enter a bid amount","error"); return; }
  if(typeof toast==="function") toast(`🔨 Bid of ₹${val} placed on ${item}! You're the highest bidder!`, "success");
}

/* ══ 8. PET CARE ═══════════════════════════════════════════════ */
function renderPetCare() {
  const el = document.getElementById("petCareContent");
  if (!el) return;
  const items = [
    {name:"Royal Canin Dog Food 3kg",price:899,mrp:1100,emoji:"🐕",tag:"Best Seller"},
    {name:"Whiskas Cat Food 1.2kg",price:420,mrp:520,emoji:"🐱",tag:""},
    {name:"Pet Shampoo Anti-Tick",price:180,mrp:220,emoji:"🧴",tag:"Vet Recommended"},
    {name:"Dog Treats (Chicken) 200g",price:150,mrp:180,emoji:"🦴",tag:""},
    {name:"Cat Litter 5kg",price:350,mrp:420,emoji:"🪣",tag:""},
    {name:"Pet Vitamin Supplements",price:320,mrp:400,emoji:"💊",tag:"Vet Recommended"},
  ];
  const services = [
    {icon:"✂️",name:"Pet Grooming",price:"₹299+",color:"#a29bfe"},
    {icon:"🏥",name:"Vet Consultation",price:"₹150",color:"#ff7675"},
    {icon:"🏨",name:"Pet Boarding",price:"₹499/day",color:"#74b9ff"},
    {icon:"🚶",name:"Dog Walker",price:"₹99/hr",color:"#55efc4"},
  ];

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#fdcb6e,#e17055);border-radius:20px;padding:22px;text-align:center;margin-bottom:20px">
      <div style="font-size:40px;margin-bottom:6px">🐾</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Nearzy Pet Care</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85)">Food, grooming, vet & more — for your furry friends</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">
      ${services.map(s=>`
      <div onclick="bookPetService('${s.name}')" style="background:var(--white);border-radius:12px;padding:12px 6px;text-align:center;cursor:pointer;box-shadow:var(--card-shadow)">
        <div style="width:40px;height:40px;border-radius:50%;background:${s.color}22;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 6px">${s.icon}</div>
        <div style="font-size:10px;font-weight:700;color:var(--ink)">${s.name}</div>
        <div style="font-size:10px;color:var(--brand);font-weight:700">${s.price}</div>
      </div>`).join("")}
    </div>
    <div style="font-size:14px;font-weight:800;color:var(--ink);margin-bottom:12px">🛒 Pet Supplies</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${items.map(item=>`
      <div style="background:var(--white);border-radius:14px;padding:14px;box-shadow:var(--card-shadow)">
        <div style="font-size:36px;text-align:center;margin-bottom:8px">${item.emoji}</div>
        ${item.tag?`<div style="font-size:9px;font-weight:800;color:var(--green);background:var(--green-light);padding:2px 7px;border-radius:99px;display:inline-block;margin-bottom:4px">${item.tag}</div>`:""}
        <div style="font-size:12px;font-weight:700;color:var(--ink);margin-bottom:6px">${item.name}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <span style="font-size:14px;font-weight:800;color:var(--brand)">₹${item.price}</span>
            <span style="font-size:10px;color:var(--ink3);text-decoration:line-through;margin-left:4px">₹${item.mrp}</span>
          </div>
          <button onclick="if(typeof toast==='function')toast('🐾 Added to cart!','success')" style="padding:6px 10px;background:var(--brand);color:#fff;border:none;border-radius:99px;font-size:10px;font-weight:700;cursor:pointer">Add</button>
        </div>
      </div>`).join("")}
    </div>
  </div>`;
}
function bookPetService(name) { if(typeof toast==="function") toast(`📅 Booking ${name}... Our team will contact you shortly!`, "info"); }

/* ══ 9. CORPORATE ORDERS ═══════════════════════════════════════ */
function renderCorporate() {
  const el = document.getElementById("corporateContent");
  if (!el) return;
  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#0652DD,#1289A7);border-radius:20px;padding:24px;margin-bottom:20px">
      <div style="font-size:36px;margin-bottom:8px">🏢</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Corporate Orders</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:4px">Bulk orders for offices, events & teams — GST invoice included</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      ${[["🍽️","Office Meals","Daily lunch/dinner for your team"],["🎉","Event Catering","Parties & corporate events"],["☕","Tea & Snacks","Daily chai & snacks subscription"]].map(([i,t,d])=>`
      <div onclick="openCorporateType('${t}')" style="background:var(--white);border-radius:14px;padding:14px;text-align:center;cursor:pointer;box-shadow:var(--card-shadow);transition:transform .2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
        <div style="font-size:28px;margin-bottom:6px">${i}</div>
        <div style="font-size:12px;font-weight:800;color:var(--ink)">${t}</div>
        <div style="font-size:10px;color:var(--ink3);margin-top:3px">${d}</div>
      </div>`).join("")}
    </div>
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="font-size:14px;font-weight:800;color:var(--ink);margin-bottom:14px">📋 Quick Corporate Order</div>
      <div class="fgroup"><label class="flabel">Company Name</label><input class="finput" placeholder="Acme Corp Private Ltd"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div class="fgroup"><label class="flabel">No. of People</label><input class="finput" type="number" placeholder="e.g. 25" min="5"></div>
        <div class="fgroup"><label class="flabel">Budget/Person</label><input class="finput" type="number" placeholder="₹ e.g. 150"></div>
      </div>
      <div class="fgroup" style="margin-top:10px"><label class="flabel">Delivery Date & Time</label><input class="finput" type="datetime-local"></div>
      <div class="fgroup" style="margin-top:10px"><label class="flabel">Office Address</label><textarea class="finput" rows="2" placeholder="Full office address with landmark"></textarea></div>
      <div style="background:var(--green-light);border-radius:var(--r-sm);padding:10px 12px;margin:12px 0;font-size:11px;color:var(--green);font-weight:600">
        ✅ GST Invoice provided • Free delivery on orders above ₹2000 • Dedicated account manager
      </div>
      <button onclick="submitCorporateOrder()" style="width:100%;padding:14px;background:linear-gradient(135deg,#0652DD,#1289A7);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer">Submit Corporate Order Request</button>
    </div>
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow)">
      <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:10px">✨ Corporate Benefits</div>
      ${[["💰","Up to 20% bulk discount"],["🧾","GST invoices automatically"],["👤","Dedicated account manager"],["📊","Monthly expense reports"],["🔄","Recurring order scheduling"],["📱","Team ordering dashboard"]].map(([i,t])=>`<div style="display:flex;gap:8px;padding:6px 0;font-size:12px;color:var(--ink2)"><span>${i}</span>${t}</div>`).join("")}
    </div>
  </div>`;
}
function openCorporateType(type) { if(typeof toast==="function") toast(`📋 Opening ${type} request form...`, "info"); }
function submitCorporateOrder() { if(typeof toast==="function") toast("✅ Corporate order submitted! Our team will contact you within 2 hours.", "success"); }

/* ══ 10. PRICE HISTORY ═════════════════════════════════════════ */
function renderPriceHistory() {
  const el = document.getElementById("priceHistoryContent");
  if (!el) return;
  // SVG sparkline data
  const data = [280,265,275,290,260,255,270,285,260,250,262,279];
  const min = Math.min(...data), max = Math.max(...data);
  const w = 320, h = 80;
  const points = data.map((v,i)=>`${(i/(data.length-1)*w).toFixed(1)},${((1-(v-min)/(max-min))*h).toFixed(1)}`).join(" ");

  const tracked = [
    {name:"Hyderabadi Biryani (1 plate)",current:280,low:250,high:320,emoji:"🍛",trend:"down",shop:"Paradise Restaurant"},
    {name:"Veg Pulao",current:120,low:100,high:150,emoji:"🍚",trend:"up",shop:"Bawarchi"},
    {name:"Chicken 1kg (Raw)",current:220,low:180,high:260,emoji:"🍗",trend:"stable",shop:"Al-Baik"},
  ];

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#6c5ce7,#a29bfe);border-radius:20px;padding:22px;margin-bottom:20px;text-align:center">
      <div style="font-size:36px;margin-bottom:6px">📈</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Price History</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85)">Track price trends — buy at the lowest point!</div>
    </div>

    <!-- Featured chart -->
    <div style="background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--ink)">🍛 Hyderabadi Biryani</div>
          <div style="font-size:11px;color:var(--ink3)">Paradise Restaurant · Last 12 weeks</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:800;color:var(--green)">₹279</div>
          <div style="font-size:10px;color:var(--green);font-weight:700">↓ 3% this week</div>
        </div>
      </div>
      <svg width="100%" height="80" viewBox="0 0 320 80" style="overflow:visible">
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6c5ce7" stop-opacity=".3"/>
            <stop offset="100%" stop-color="#6c5ce7" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polygon points="${points} 320,80 0,80" fill="url(#priceGrad)"/>
        <polyline points="${points}" fill="none" stroke="#6c5ce7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${data.map((v,i)=>`<circle cx="${(i/(data.length-1)*w).toFixed(1)}" cy="${((1-(v-min)/(max-min))*h).toFixed(1)}" r="3" fill="#6c5ce7"/>`).join("")}
      </svg>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--ink3);margin-top:4px">
        <span>12 wks ago</span><span>6 wks ago</span><span>Today</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid #f5f5f5">
        ${[["📉","All-time Low","₹250"],["📈","All-time High","₹320"],["📊","Avg Price","₹272"]].map(([i,l,v])=>`<div style="text-align:center"><div style="font-size:16px">${i}</div><div style="font-size:10px;color:var(--ink3)">${l}</div><div style="font-size:13px;font-weight:800;color:var(--ink)">${v}</div></div>`).join("")}
      </div>
    </div>

    <!-- Tracked items -->
    <div style="font-size:14px;font-weight:800;color:var(--ink);margin-bottom:12px">📌 Your Tracked Items</div>
    ${tracked.map(item=>`
    <div style="background:var(--white);border-radius:14px;padding:14px;box-shadow:var(--card-shadow);margin-bottom:10px;display:flex;align-items:center;gap:12px">
      <div style="font-size:36px;flex-shrink:0">${item.emoji}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--ink)">${item.name}</div>
        <div style="font-size:11px;color:var(--ink3)">${item.shop}</div>
        <div style="display:flex;gap:8px;margin-top:4px;font-size:10px">
          <span style="color:var(--green)">Low: ₹${item.low}</span>
          <span style="color:var(--red)">High: ₹${item.high}</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:16px;font-weight:800;color:var(--ink)">₹${item.current}</div>
        <div style="font-size:12px">${item.trend==="down"?"📉":"item.trend"==="up"?"📈":"➡️"} ${item.trend==="down"?"Falling":"item.trend"==="up"?"Rising":"Stable"}</div>
      </div>
    </div>`).join("")}

    <button onclick="if(typeof setPriceAlert==='function')setPriceAlert('new','a product',300)" style="width:100%;padding:14px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer;margin-top:6px">
      🔔 Set Price Alert for Any Item
    </button>
  </div>`;
}

/* ══ 11. COMMUNITY WALL ════════════════════════════════════════ */
function renderCommunityWall() {
  const el = document.getElementById("communityWallContent");
  if (!el) return;
  const posts = [
    {type:"tip",user:"Foodie_Ravi",avatar:"👨‍🍳",content:"Pro tip: Order from Paradise before 1pm for fastest service. After 2pm takes 45+ mins!",likes:156,emoji:"💡",time:"1h ago"},
    {type:"deal",user:"DealHunter_Priya",avatar:"🧕",content:"NEARZY20 code still works on pasta orders from Café Mocha! Just used it — ₹80 off! 🎉",likes:89,emoji:"🎁",time:"2h ago"},
    {type:"review",user:"MomOfThree",avatar:"👩‍👧",content:"Green Farms delivers the freshest vegetables in Hyderabad. No chemicals, farm-to-door in 30 mins!",likes:234,emoji:"⭐",time:"3h ago"},
    {type:"question",user:"NewInCity",avatar:"🙋",content:"Anyone know which pharmacy delivers at night in Ramagundam? Having trouble finding one 🙏",likes:12,emoji:"❓",time:"5h ago"},
    {type:"tip",user:"NightOwl_Kiran",avatar:"🦉",content:"Order before 11pm for midnight delivery. Nearzy Instant delivery is still available in most areas!",likes:67,emoji:"🌙",time:"6h ago"},
  ];
  const typeColors = {tip:"#fdcb6e",deal:"#00b894",review:"#6c5ce7",question:"#74b9ff"};
  const typeLabels = {tip:"💡 Tip",deal:"🎁 Deal",review:"⭐ Review",question:"❓ Question"};

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#e84393,#fd79a8);border-radius:20px;padding:22px;text-align:center;margin-bottom:20px">
      <div style="font-size:36px;margin-bottom:6px">🗺️</div>
      <div style="font-size:22px;font-weight:800;color:#fff">Community Wall</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85)">Tips, deals & reviews from your neighbourhood</div>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px">
      ${["All","Tips","Deals","Reviews","Questions"].map((f,i)=>`
      <button onclick="filterCommunity('${f}',this)" style="flex-shrink:0;padding:7px 14px;background:${i===0?"var(--brand)":"var(--bg)"};color:${i===0?"#fff":"var(--ink2)"};border:${i===0?"none":"1px solid var(--ink4)"};border-radius:99px;font-size:12px;font-weight:700;cursor:pointer">${f}</button>`).join("")}
    </div>
    <div style="background:var(--white);border-radius:14px;padding:12px;box-shadow:var(--card-shadow);margin-bottom:14px;display:flex;gap:10px;align-items:center">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">😊</div>
      <div onclick="openCommunityPost()" style="flex:1;padding:9px 13px;background:var(--bg);border-radius:99px;font-size:12px;color:var(--ink3);cursor:pointer">Share a tip, deal or question... 💬</div>
    </div>
    ${posts.map(p=>`
    <div style="background:var(--white);border-radius:14px;padding:14px;box-shadow:var(--card-shadow);margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--brand-light);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${p.avatar}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="font-size:12px;font-weight:800;color:var(--ink)">${p.user}</div>
            <span style="font-size:9px;padding:2px 7px;background:${typeColors[p.type]}22;color:${typeColors[p.type]};border-radius:99px;font-weight:700">${typeLabels[p.type]}</span>
          </div>
          <div style="font-size:10px;color:var(--ink3)">${p.time}</div>
        </div>
        <div style="font-size:22px">${p.emoji}</div>
      </div>
      <div style="font-size:13px;color:var(--ink);line-height:1.6;margin-bottom:10px">${p.content}</div>
      <div style="display:flex;gap:12px;padding-top:8px;border-top:1px solid #f5f5f5">
        <button onclick="likePost(this)" style="display:flex;align-items:center;gap:4px;background:none;border:none;font-size:12px;font-weight:600;color:var(--ink3);cursor:pointer"><i class="fa-regular fa-heart"></i> ${p.likes}</button>
        <button style="display:flex;align-items:center;gap:4px;background:none;border:none;font-size:12px;font-weight:600;color:var(--ink3);cursor:pointer"><i class="fa-regular fa-comment"></i> Reply</button>
        <button style="display:flex;align-items:center;gap:4px;background:none;border:none;font-size:12px;font-weight:600;color:var(--ink3);cursor:pointer"><i class="fa-solid fa-share"></i> Share</button>
      </div>
    </div>`).join("")}
  </div>`;
}
function filterCommunity(filter, btn) {
  document.querySelectorAll("[onclick*='filterCommunity']").forEach(b=>{ b.style.background="var(--bg)"; b.style.color="var(--ink2)"; b.style.border="1px solid var(--ink4)"; });
  btn.style.background="var(--brand)"; btn.style.color="#fff"; btn.style.border="none";
}
function openCommunityPost() { if(typeof toast==="function") toast("📝 Post composer coming soon!", "info"); }

/* ══ 12. AR FOOD PREVIEW ═══════════════════════════════════════ */
function renderARPreview() {
  const el = document.getElementById("arPreviewContent");
  if (!el) return;
  const foods = [
    {name:"Hyderabadi Biryani",emoji:"🍛",color:"#ee5a24",size:"28cm plate",weight:"450g",description:"Fragrant basmati rice layered with tender meat and saffron"},
    {name:"Chocolate Cake",emoji:"🎂",color:"#6c5ce7",size:"20cm round",weight:"1.2kg",description:"Rich chocolate layers with ganache frosting"},
    {name:"Veg Thali",emoji:"🍱",color:"#00b894",size:"35cm tray",weight:"600g",description:"6-item complete meal with dal, sabzi, rice & roti"},
    {name:"Fruit Basket",emoji:"🍎",color:"#fd79a8",size:"30cm basket",weight:"2kg",description:"Seasonal fresh fruits, hand-picked daily"},
  ];
  let selected = 0;

  el.innerHTML = `
  <div style="max-width:680px;margin:0 auto;padding:4px 0 20px">
    <div style="background:linear-gradient(135deg,#00cec9,#0984e3);border-radius:20px;padding:22px;text-align:center;margin-bottom:20px">
      <div style="font-size:36px;margin-bottom:6px">🥽</div>
      <div style="font-size:22px;font-weight:800;color:#fff">AR Food Preview</div>
      <div style="font-size:12px;color:rgba(255,255,255,.85)">See food size & portion before ordering — no surprises!</div>
    </div>

    <!-- 3D Preview Area -->
    <div style="background:var(--white);border-radius:16px;overflow:hidden;box-shadow:var(--card-shadow);margin-bottom:16px">
      <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);height:240px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden" id="arViewport">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,#ffffff08 0%,transparent 70%)"></div>
        <!-- Grid lines for AR effect -->
        <div style="position:absolute;inset:0;opacity:.1" style="background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:30px 30px"></div>
        <div id="arFood" style="text-align:center;transition:all .4s cubic-bezier(0.34,1.56,0.64,1)">
          <div style="font-size:100px;filter:drop-shadow(0 20px 40px rgba(0,0,0,.5));animation:float 3s ease-in-out infinite">${foods[0].emoji}</div>
          <div style="font-size:12px;color:rgba(255,255,255,.7);margin-top:8px;font-weight:600">${foods[0].size} • ${foods[0].weight}</div>
        </div>
        <!-- AR overlay elements -->
        <div style="position:absolute;top:12px;left:12px;background:rgba(0,200,150,.9);padding:4px 10px;border-radius:99px;font-size:10px;font-weight:800;color:#fff">🟢 AR Active</div>
        <div style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);padding:6px 10px;border-radius:8px">
          <div style="font-size:9px;color:rgba(255,255,255,.7)">Rotation</div>
          <input type="range" style="width:80px" oninput="rotateFood(this.value)">
        </div>
        <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.15);backdrop-filter:blur(10px);padding:5px 14px;border-radius:99px;font-size:10px;color:#fff;font-weight:700">
          👆 Pinch to zoom • Drag to rotate
        </div>
      </div>
      <div style="padding:14px">
        <div style="font-size:15px;font-weight:800;color:var(--ink)" id="arFoodName">${foods[0].name}</div>
        <div style="font-size:12px;color:var(--ink3);margin-top:3px" id="arFoodDesc">${foods[0].description}</div>
      </div>
    </div>

    <!-- Food selector -->
    <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;margin-bottom:16px">
      ${foods.map((f,i)=>`
      <div onclick="selectARFood(${i})" id="arf-${i}" style="flex-shrink:0;width:72px;text-align:center;cursor:pointer;padding:8px;border-radius:12px;border:2px solid ${i===0?"var(--brand)":"transparent"};background:${i===0?"var(--brand-light)":"var(--bg)"}">
        <div style="font-size:28px">${f.emoji}</div>
        <div style="font-size:9px;font-weight:700;color:var(--ink2);margin-top:3px">${f.name.split(" ")[0]}</div>
      </div>`).join("")}
    </div>

    <div style="background:var(--bg);border-radius:14px;padding:14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:800;color:var(--ink);margin-bottom:8px">📏 Portion Comparison</div>
      <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ink2)">
        <span style="font-size:24px">📱</span>
        <div style="flex:1;height:8px;background:#f0f0f0;border-radius:99px;overflow:hidden">
          <div style="height:100%;width:65%;background:var(--brand);border-radius:99px"></div>
        </div>
        <span style="font-size:24px">${foods[0].emoji}</span>
      </div>
      <div style="font-size:11px;color:var(--ink3);margin-top:6px">This item is about 65% the size of your phone screen</div>
    </div>

    <button onclick="if(typeof toast==='function')toast('📷 Point your camera at a table to place food in AR (native app)','info')" style="width:100%;padding:14px;background:linear-gradient(135deg,#00cec9,#0984e3);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer">
      📷 View in Your Space (AR Camera)
    </button>
  </div>`;

  // Store foods data for selector
  window._arFoods = foods;
}

function selectARFood(idx) {
  const foods = window._arFoods;
  if (!foods) return;
  document.querySelectorAll("[id^='arf-']").forEach((el,i)=>{ el.style.borderColor=i===idx?"var(--brand)":"transparent"; el.style.background=i===idx?"var(--brand-light)":"var(--bg)"; });
  const foodEl = document.getElementById("arFood");
  if (foodEl) { foodEl.style.transform="scale(0)"; setTimeout(()=>{ foodEl.querySelector("div").textContent=foods[idx].emoji; foodEl.querySelectorAll("div")[1].textContent=`${foods[idx].size} • ${foods[idx].weight}`; foodEl.style.transform=""; },300); }
  const nameEl = document.getElementById("arFoodName"); if(nameEl) nameEl.textContent=foods[idx].name;
  const descEl = document.getElementById("arFoodDesc"); if(descEl) descEl.textContent=foods[idx].description;
}
function rotateFood(val) {
  const el = document.getElementById("arFood");
  if(el) el.style.transform = `rotateY(${val*3.6}deg)`;
}

/* ══ 13. GAMIFICATION / STREAK SYSTEM ═════════════════════════ */
function initGamification() {
  const streak = parseInt(localStorage.getItem("nz_streak")||"0");
  const lastOrder = localStorage.getItem("nz_last_order_date");
  const today = new Date().toDateString();
  
  if (lastOrder !== today) {
    // Show streak badge on home
    if (streak > 0) {
      const badge = document.createElement("div");
      badge.style.cssText = "position:fixed;bottom:80px;right:12px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:#fff;border-radius:12px;padding:10px 14px;font-size:12px;font-weight:800;z-index:4000;box-shadow:0 4px 20px rgba(238,90,36,.4);cursor:pointer;animation:slideUp .3s ease";
      badge.innerHTML = `🔥 ${streak} day streak!<br><span style="font-size:10px;opacity:.85">Order today to keep it!</span>`;
      badge.onclick = () => badge.remove();
      document.body.appendChild(badge);
      setTimeout(() => badge.remove(), 5000);
    }
  }
}

/* ══ 14. WEATHER-BASED SUGGESTIONS ════════════════════════════ */
async function initWeatherSuggestions() {
  try {
    const pos = await new Promise((res,rej) => navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000}));
    const {latitude:lat, longitude:lon} = pos.coords;
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const data = await res.json();
    const temp = data.current_weather?.temperature;
    const weathercode = data.current_weather?.weathercode;
    
    let suggestion, emoji, reason;
    if (temp > 35) { suggestion = "Cold drinks, ice cream & cooling foods"; emoji = "🥤"; reason = `It's ${temp}°C — stay cool!`; }
    else if (temp < 20) { suggestion = "Hot soups, chai, masala dishes"; emoji = "☕"; reason = `Only ${temp}°C — warm up!`; }
    else if (weathercode >= 61) { suggestion = "Pakoda, chai & comfort food"; emoji = "🌧️"; reason = "It's raining — perfect snack time!"; }
    else { suggestion = "Perfect weather for any cuisine!"; emoji = "☀️"; reason = `${temp}°C — lovely day!`; }

    showWeatherBanner(suggestion, emoji, reason, temp);
  } catch(e) { /* Geolocation denied or failed */ }
}

function showWeatherBanner(suggestion, emoji, reason, temp) {
  const existing = document.getElementById("weatherBanner");
  if (existing) return;
  
  const shopsSection = document.getElementById("shopsSection");
  if (!shopsSection) return;
  
  const banner = document.createElement("div");
  banner.id = "weatherBanner";
  banner.style.cssText = "margin-bottom:16px;background:linear-gradient(135deg,#0984e3,#74b9ff);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer";
  banner.innerHTML = `
    <div style="font-size:32px">${emoji}</div>
    <div style="flex:1">
      <div style="font-size:12px;color:rgba(255,255,255,.85);font-weight:700">${reason}</div>
      <div style="font-size:13px;font-weight:800;color:#fff">${suggestion}</div>
    </div>
    <div style="font-size:24px;font-weight:800;color:#fff">${temp}°</div>`;
  banner.onclick = () => { if(typeof showPage==="function") showPage("home"); };
  shopsSection.parentNode.insertBefore(banner, shopsSection);
}

/* ══ 15. LIVE DEMAND HEATMAP INDICATOR ════════════════════════ */
function renderDemandIndicator() {
  const areas = [
    {name:"Hyderabad Central",demand:92,trend:"↑",color:"#ff4757"},
    {name:"Ramagundam",demand:67,trend:"→",color:"#fdcb6e"},
    {name:"Warangal",demand:45,trend:"↓",color:"#00b894"},
    {name:"Karimnagar",demand:78,trend:"↑",color:"#ff6b6b"},
  ];
  
  const home = document.getElementById("shopsSection");
  if (!home || document.getElementById("demandIndicator")) return;
  
  const div = document.createElement("div");
  div.id = "demandIndicator";
  div.style.cssText = "margin-bottom:16px";
  div.innerHTML = `
    <div style="font-size:13px;font-weight:800;color:var(--ink);margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span style="width:8px;height:8px;border-radius:50%;background:#ff4757;display:inline-block;animation:pulse 1s infinite"></span>
      Live Demand in Your Area
    </div>
    <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none">
      ${areas.map(a=>`
      <div style="flex-shrink:0;background:var(--white);border-radius:10px;padding:10px 12px;box-shadow:var(--card-shadow);min-width:120px">
        <div style="font-size:11px;font-weight:700;color:var(--ink);margin-bottom:5px">${a.name}</div>
        <div style="height:5px;background:#f0f0f0;border-radius:99px;overflow:hidden;margin-bottom:5px">
          <div style="height:100%;background:${a.color};border-radius:99px;width:${a.demand}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px">
          <span style="color:${a.color};font-weight:700">${a.demand}% active</span>
          <span style="color:var(--ink3)">${a.trend}</span>
        </div>
      </div>`).join("")}
    </div>`;
  home.parentNode.insertBefore(div, home);
}

/* ══ WIRE UP ALL NEW PAGES ═════════════════════════════════════ */
(function wireAdvancedPages() {
  const origShowPage = window.showPage;
  window.showPage = function(p, ...args) {
    if (typeof origShowPage === "function") origShowPage(p, ...args);
    setTimeout(() => {
      switch(p) {
        case "mealplanner":    renderMealPlanner();      break;
        case "socialfeed":     renderSocialFeed();       break;
        case "carbontracker":  renderCarbonTracker();    break;
        case "mysterybox":     renderMysteryBox();       break;
        case "splitbill":      renderSplitBill();        break;
        case "nutritiontracker": renderNutritionTracker(); break;
        case "liveauction":    renderLiveAuction();      break;
        case "petcare":        renderPetCare();          break;
        case "corporate":      renderCorporate();        break;
        case "pricehistory":   renderPriceHistory();     break;
        case "communitywall":  renderCommunityWall();    break;
        case "arpreview":      renderARPreview();        break;
      }
    }, 60);
  };
})();

/* ══ CSS ANIMATIONS ════════════════════════════════════════════ */
(function addAnimations() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    .nz-skeleton { background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite; }
  `;
  document.head.appendChild(style);
})();

/* ══ INIT ═══════════════════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", function() {
  setTimeout(() => {
    initGamification();
    initWeatherSuggestions();
    setTimeout(renderDemandIndicator, 1500);
    console.log("Nearzy Advanced Features v3.0 loaded 🚀");
  }, 1200);
});

/* ══ EXPORTS ════════════════════════════════════════════════════ */
Object.assign(window, {
  renderMealPlanner, regenerateMealPlan, orderMeal, showMealDay,
  renderSocialFeed, likePost, openPostComposer, submitPost, orderSameAs,
  renderCarbonTracker, offsetCarbon,
  renderMysteryBox, subscribeMysteryBox,
  renderSplitBill, setSplitMethod, addSplitPerson, sendSplitRequest, sendAllSplitRequests,
  renderNutritionTracker, logWater, scanFoodItem, logFromOrder,
  renderLiveAuction, placeBid,
  renderPetCare, bookPetService,
  renderCorporate, openCorporateType, submitCorporateOrder,
  renderPriceHistory,
  renderCommunityWall, filterCommunity, openCommunityPost,
  renderARPreview, selectARFood, rotateFood,
  initGamification, initWeatherSuggestions, showWeatherBanner, renderDemandIndicator,
});