# Nearzy Frontend PWA

A production-ready Progressive Web App for Nearzy hyperlocal delivery.

## Files
- `index.html` — Main PWA (12,900+ lines, all features included)
- `nearzy-features.js` — Extended features v2.0 (wallet, loyalty, pro, AI, etc.)
- `manifest.json` — PWA manifest
- `sw.js` — Service worker (offline support, push notifications)

## Features
✅ Full order flow (browse → cart → checkout → tracking)
✅ Wallet system with Razorpay top-up
✅ Loyalty points & tier system (Bronze/Silver/Gold/Platinum)
✅ Nearzy Pro subscription
✅ AI Food Assistant (powered by Claude)
✅ Table booking
✅ Flash deals
✅ Gift cards
✅ Scheduled delivery
✅ Referral system
✅ Multi-city support
✅ Dark mode
✅ PWA (install to home screen, offline support)
✅ Push notifications

## Setup
1. Deploy `index.html`, `nearzy-features.js`, `manifest.json`, `sw.js` to any static host
2. Update the API URL in `index.html` (search for `nearzy-backend.onrender.com`)
3. Update the Razorpay key (`rzp_live_SQ2a0BIeQiJQly`)

## Static Hosting Options
- **Netlify**: Drag & drop the files → instant deploy
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Push to repo, enable Pages
- **Firebase Hosting**: `firebase deploy`
