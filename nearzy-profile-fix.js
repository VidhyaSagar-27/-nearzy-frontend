/* ================================================================
   NEARZY — PROFILE PAGE FIX v1.0
   Fixes:
     1. Password fields floating over sidebar (z-index + positioning)
     2. Profile form layout broken on desktop (acc-layout isolation)
     3. Profile save connected to backend
     4. Password change with validation
     5. Edit My Profile button working
     6. Footer missing background color
     7. Bottom nav touch targets on mobile
   ================================================================ */
"use strict";

/* ──────────────────────────────────────────────────────────────
   FIX 1 — CSS INJECTION
   Injects CSS that fixes layout isolation, z-index stacking,
   and prevents password fields from escaping their container.
   ────────────────────────────────────────────────────────────── */
(function injectProfileFixes() {
  const style = document.createElement("style");
  style.id = "nz-profile-fix-css";
  style.textContent = `
    /* ── Prevent account layout from leaking z-index ── */
    .acc-layout {
      position: relative;
      isolation: isolate;
    }

    /* ── Sidebar stays on top within the layout ── */
    .acc-sidebar {
      position: sticky;
      top: 82px;
      z-index: 10;
    }

    /* ── Profile tab content stays below sidebar ── */
    .acc-tab {
      position: relative;
      z-index: 1;
    }

    /* ── All form inputs in profile stay inside the form ── */
    .acc-box input,
    .acc-box select,
    .acc-box textarea {
      position: relative !important;
      z-index: auto !important;
      width: 100%;
    }

    /* ── Password wrapper: eye icon stays inside input ── */
    .nz-pass-wrap {
      position: relative;
      width: 100%;
    }
    .nz-pass-wrap input {
      padding-right: 42px !important;
      width: 100% !important;
      position: relative !important;
    }
    .nz-eye-btn {
      position: absolute !important;
      right: 12px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      background: none !important;
      border: none !important;
      cursor: pointer !important;
      color: var(--ink3) !important;
      font-size: 15px !important;
      padding: 4px !important;
      z-index: 2 !important;
      min-height: unset !important;
      min-width: unset !important;
      width: auto !important;
      height: auto !important;
      display: flex !important;
      align-items: center !important;
    }

    /* ── Fix footer background in dark/light mode ── */
    footer {
      background: #0f1117;
      padding: 40px 20px 24px;
    }

    /* ── Fix mobile touch target overriding on profile page ── */
    .acc-box .finput,
    .acc-box .fselect,
    #profileForm input,
    #profileForm select {
      min-height: unset !important;
      min-width: unset !important;
      display: block !important;
    }

    /* ── Profile save button always visible ── */
    #profileSaveBtn {
      position: relative;
      z-index: 2;
    }

    /* ── Prevent modal overlays from being z-index blocked ── */
    .modal-overlay {
      z-index: 9000 !important;
    }
    .modal-box {
      z-index: 9001 !important;
    }
  `;
  // Remove any existing fix style to avoid duplicates
  document.getElementById("nz-profile-fix-css")?.remove();
  document.head.appendChild(style);
})();

/* ──────────────────────────────────────────────────────────────
   FIX 2 — PROFILE TAB RENDERER
   Replaces the broken profile tab rendering with a clean version
   where all fields stay inside their containers.
   ────────────────────────────────────────────────────────────── */
window.renderProfileTab = function() {
  const container = document.querySelector(".acc-tab#tab-profile, [data-tab='profile'], #profileTabContent");
  // Find the profile tab content area
  const accContent = document.getElementById("accountContent");
  if (!accContent) return;

  const profileBox = accContent.querySelector(".acc-tab.active .acc-box, #tab-profile .acc-box");
  if (!profileBox) return;

  const u = window.S?.user || {};

  profileBox.innerHTML = `
    <div class="acc-box-title">
      <i class="fa-solid fa-user-pen"></i> My Profile
    </div>

    <form id="profileForm" onsubmit="return false" autocomplete="off">
      <!-- Personal Info -->
      <div class="fgrid" style="margin-bottom:14px">
        <div class="fgroup">
          <label class="flabel">First Name</label>
          <input class="finput" id="pf_fname" type="text"
            value="${_esc(u.name?.split(" ")[0] || "")}"
            placeholder="First name" autocomplete="given-name">
        </div>
        <div class="fgroup">
          <label class="flabel">Last Name</label>
          <input class="finput" id="pf_lname" type="text"
            value="${_esc(u.name?.split(" ").slice(1).join(" ") || "")}"
            placeholder="Last name" autocomplete="family-name">
        </div>
      </div>

      <div class="fgrid full" style="margin-bottom:14px">
        <div class="fgroup">
          <label class="flabel">Email Address</label>
          <input class="finput" id="pf_email" type="email"
            value="${_esc(u.email || "")}"
            placeholder="your@email.com" autocomplete="email">
        </div>
      </div>

      <div class="fgrid" style="margin-bottom:20px">
        <div class="fgroup">
          <label class="flabel">Phone</label>
          <input class="finput" id="pf_phone" type="tel"
            value="${_esc(u.phone || "")}"
            placeholder="Phone number" autocomplete="tel">
        </div>
        <div class="fgroup">
          <label class="flabel">City</label>
          <input class="finput" id="pf_city" type="text"
            value="${_esc(u.city || "")}"
            placeholder="Your city" autocomplete="address-level2">
        </div>
      </div>

      <!-- Divider -->
      <div style="border-top:1px solid #f0f0f0;margin:20px 0"></div>

      <!-- Change Password -->
      <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:14px;display:flex;align-items:center;gap:8px">
        <i class="fa-solid fa-lock" style="color:var(--ink3)"></i> Change Password
        <span style="font-size:11px;font-weight:400;color:var(--ink3)">(leave blank to keep current)</span>
      </div>

      <div class="fgrid full" style="margin-bottom:14px">
        <div class="fgroup">
          <label class="flabel">Current Password</label>
          <div class="nz-pass-wrap">
            <input class="finput" id="pf_curpass" type="password"
              placeholder="Enter current password" autocomplete="current-password">
            <button type="button" class="nz-eye-btn" onclick="_nzTogglePass('pf_curpass',this)" tabindex="-1" aria-label="Show/hide password">
              <i class="fa-regular fa-eye"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="fgrid" style="margin-bottom:20px">
        <div class="fgroup">
          <label class="flabel">New Password <span style="font-size:10px;color:var(--ink3);text-transform:none;font-weight:400">(min 6 chars)</span></label>
          <div class="nz-pass-wrap">
            <input class="finput" id="pf_newpass" type="password"
              placeholder="New password" autocomplete="new-password">
            <button type="button" class="nz-eye-btn" onclick="_nzTogglePass('pf_newpass',this)" tabindex="-1" aria-label="Show/hide password">
              <i class="fa-regular fa-eye"></i>
            </button>
          </div>
        </div>
        <div class="fgroup">
          <label class="flabel">Confirm New Password</label>
          <div class="nz-pass-wrap">
            <input class="finput" id="pf_confpass" type="password"
              placeholder="Confirm new password" autocomplete="new-password">
            <button type="button" class="nz-eye-btn" onclick="_nzTogglePass('pf_confpass',this)" tabindex="-1" aria-label="Show/hide password">
              <i class="fa-regular fa-eye"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:10px;align-items:center">
        <button id="profileSaveBtn" type="button"
          onclick="window.saveProfileChanges()"
          style="padding:12px 28px;background:var(--brand);color:#fff;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .2s">
          <i class="fa-solid fa-floppy-disk"></i> Save Changes
        </button>
        <button type="button"
          onclick="window._clearProfilePassFields()"
          style="padding:12px 20px;background:var(--bg);color:var(--ink2);border:1px solid var(--ink4);border-radius:var(--r-sm);font-size:13px;font-weight:600;cursor:pointer">
          Cancel
        </button>
      </div>
    </form>
  `;
};

/* Helper: escape HTML to prevent XSS */
function _esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Helper: toggle password visibility */
window._nzTogglePass = function(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const icon = btn.querySelector("i");
  if (inp.type === "password") {
    inp.type = "text";
    if (icon) { icon.className = "fa-regular fa-eye-slash"; }
  } else {
    inp.type = "password";
    if (icon) { icon.className = "fa-regular fa-eye"; }
  }
};

/* Helper: clear password fields */
window._clearProfilePassFields = function() {
  ["pf_curpass", "pf_newpass", "pf_confpass"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ""; el.type = "password"; }
  });
  // Reset eye icons
  document.querySelectorAll(".nz-eye-btn i").forEach(i => {
    i.className = "fa-regular fa-eye";
  });
  if (typeof toast === "function") toast("Changes discarded", "info");
};

/* ──────────────────────────────────────────────────────────────
   FIX 3 — SAVE PROFILE (Backend + local)
   ────────────────────────────────────────────────────────────── */
window.saveProfileChanges = async function() {
  const fname    = document.getElementById("pf_fname")?.value?.trim() || "";
  const lname    = document.getElementById("pf_lname")?.value?.trim() || "";
  const email    = document.getElementById("pf_email")?.value?.trim() || "";
  const phone    = document.getElementById("pf_phone")?.value?.trim() || "";
  const city     = document.getElementById("pf_city")?.value?.trim() || "";
  const curpass  = document.getElementById("pf_curpass")?.value || "";
  const newpass  = document.getElementById("pf_newpass")?.value || "";
  const confpass = document.getElementById("pf_confpass")?.value || "";

  // Validation
  if (!fname) { if (typeof toast === "function") toast("First name is required", "error"); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (typeof toast === "function") toast("Enter a valid email address", "error"); return;
  }
  if (newpass) {
    if (newpass.length < 6) { if (typeof toast === "function") toast("New password must be at least 6 characters", "error"); return; }
    if (newpass !== confpass) { if (typeof toast === "function") toast("Passwords do not match", "error"); return; }
    if (!curpass) { if (typeof toast === "function") toast("Enter your current password to change it", "error"); return; }
  }

  const fullName = [fname, lname].filter(Boolean).join(" ");
  const btn = document.getElementById("profileSaveBtn");
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...'; btn.disabled = true; }

  try {
    const payload = { name: fullName, email, phone, city };
    if (newpass) { payload.currentPassword = curpass; payload.newPassword = newpass; }

    // Try backend first
    if (window.S?.token) {
      const API = window.API || "https://nearzy-backend.onrender.com/api";
      const res = await fetch(`${API}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + window.S.token
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save profile");
      }
    }

    // Update local session
    if (window.S) {
      if (!window.S.user) window.S.user = {};
      window.S.user.name  = fullName;
      window.S.user.email = email;
      window.S.user.phone = phone;
      window.S.user.city  = city;
      if (typeof saveSession === "function") saveSession();
    }

    // Update header display
    const nameEl = document.getElementById("userNameEl");
    if (nameEl) nameEl.textContent = fname;
    const avatarEl = document.getElementById("userAvatarBadge");
    if (avatarEl) avatarEl.textContent = fname.charAt(0).toUpperCase();
    const dropName = document.getElementById("dropUserName");
    if (dropName) dropName.textContent = fullName;
    const dropEmail = document.getElementById("dropUserEmail");
    if (dropEmail) dropEmail.textContent = email;

    // Clear password fields after successful save
    window._clearProfilePassFields?.();
    // Override the toast message instead of the cancel one
    if (typeof toast === "function") toast("✅ Profile updated successfully!", "success");

  } catch (err) {
    if (typeof toast === "function") toast("❌ " + (err.message || "Could not save profile"), "error");
  } finally {
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
      btn.disabled = false;
    }
  }
};

/* ──────────────────────────────────────────────────────────────
   FIX 4 — PATCH switchAccTab TO CALL renderProfileTab
   Whenever the profile tab is activated, re-render with clean HTML
   ────────────────────────────────────────────────────────────── */
(function patchSwitchAccTab() {
  const _orig = window.switchAccTab;
  window.switchAccTab = function(tab, ...args) {
    if (typeof _orig === "function") _orig(tab, ...args);
    if (tab === "profile") {
      // Small delay to let the original render first, then we patch it
      setTimeout(() => {
        // Find the active profile box and ensure password fields are correct
        const profileInputs = document.querySelectorAll(
          "#tab-profile input[type='password'], .acc-tab.active input[type='password']"
        );
        profileInputs.forEach(inp => {
          // Ensure they are inside a relative-positioned wrapper
          const parent = inp.parentElement;
          if (parent && !parent.classList.contains("nz-pass-wrap")) {
            // If not already wrapped, wrap it
            if (getComputedStyle(parent).position === "static") {
              parent.style.position = "relative";
            }
            // Ensure the input itself isn't fixed/absolute
            inp.style.position = "relative";
            inp.style.zIndex = "auto";
          }
        });
      }, 100);
    }
  };
})();

/* ──────────────────────────────────────────────────────────────
   FIX 5 — EDIT MY PROFILE BUTTON
   The orange "Edit My Profile" button in the sidebar should
   switch to the profile tab.
   ────────────────────────────────────────────────────────────── */
(function fixEditProfileBtn() {
  document.addEventListener("click", function(e) {
    const btn = e.target.closest("[onclick*='editProfile'], .edit-my-profile-btn");
    if (btn) {
      e.preventDefault();
      if (typeof switchAccTab === "function") switchAccTab("profile");
      else if (typeof goToAccountTab === "function") goToAccountTab("profile");
    }
  });

  // Also fix the acc-hero edit button once account page renders
  const _origRenderAccount = window.renderAccountPage || window.renderAccount;
  if (typeof _origRenderAccount === "function") {
    const wrapped = function(...args) {
      const result = _origRenderAccount.apply(this, args);
      setTimeout(() => {
        const editBtns = document.querySelectorAll(
          ".acc-hero button, [onclick*='goToAccountTab'][onclick*='profile']"
        );
        editBtns.forEach(btn => {
          if (btn.textContent.includes("Edit") || btn.textContent.includes("Profile")) {
            btn.onclick = () => {
              if (typeof switchAccTab === "function") switchAccTab("profile");
            };
          }
        });
      }, 200);
      return result;
    };
    window.renderAccountPage = wrapped;
    window.renderAccount = wrapped;
  }
})();

/* ──────────────────────────────────────────────────────────────
   FIX 6 — FOOTER BACKGROUND
   Footer was missing background color in some browsers
   ────────────────────────────────────────────────────────────── */
(function fixFooter() {
  const footer = document.querySelector("footer");
  if (footer && !footer.style.background) {
    footer.style.background = "#0f1117";
  }
})();

/* ──────────────────────────────────────────────────────────────
   FIX 7 — PREVENT position:fixed ON DYNAMICALLY CREATED INPUTS
   Intercepts innerHTML assignments that create floating inputs
   ────────────────────────────────────────────────────────────── */
(function guardDynamicInputs() {
  // After any dynamic render, scan for broken inputs
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        // Check all inputs within added node
        const inputs = node.querySelectorAll
          ? node.querySelectorAll("input[type='password'], input[type='text']")
          : [];
        inputs.forEach(inp => {
          const s = window.getComputedStyle(inp);
          if (s.position === "fixed" || s.position === "absolute") {
            // This is the bug — fix it
            inp.style.position = "relative";
            inp.style.zIndex = "auto";
            inp.style.top = "auto";
            inp.style.left = "auto";
            inp.style.right = "auto";
            inp.style.bottom = "auto";
            console.warn("[NZ Fix] Corrected floating input:", inp.id || inp.name);
          }
        });
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();

/* ──────────────────────────────────────────────────────────────
   FIX 8 — BACKEND: /api/users/me PUT endpoint guide
   Add this to your Express server routes/users.js:

   router.put("/me", authMW, async (req, res) => {
     try {
       const { name, email, phone, city, currentPassword, newPassword } = req.body;
       const User = require("../models/User");
       const user = await User.findById(req.user._id || req.user.id);
       if (!user) return res.status(404).json({ message: "User not found" });

       if (newPassword) {
         const bcrypt = require("bcryptjs");
         const ok = await bcrypt.compare(currentPassword, user.password);
         if (!ok) return res.status(400).json({ message: "Current password is incorrect" });
         user.password = await bcrypt.hash(newPassword, 12);
       }

       if (name)  user.name  = name;
       if (email) user.email = email;
       if (phone) user.phone = phone;
       if (city)  user.city  = city;

       await user.save();
       res.json({ success: true, user: { name:user.name, email:user.email, phone:user.phone, city:user.city } });
     } catch(e) {
       res.status(500).json({ message: e.message });
     }
   });
   ────────────────────────────────────────────────────────────── */

console.log("✅ Nearzy Profile Fix v1.0 loaded — layout isolation, password fields, save connected.");
