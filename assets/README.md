# /assets — Product Images

This folder holds the images used by **shoplp.html**. Wired and live for the team review.

## Current image mapping

Each product has **2 views** (front + back). The hero gallery shows both as clickable thumbnails.

| Product (in switcher order) | Front view | Back view |
|---|---|---|
| **#1 — Mini Leopard Tote** | `MINI LEOPARD - PU 1.png` | `MINI LEOPARD - PU 2.png` |
| **#2 — Retro Tote** | `RETRO TOTE BAG 1.png` | `RETRO TOTE BAG 2.png` |
| **#3 — Zebra Tote** | `ZEBRA TOTE - PU POCKET 1.png` | `ZEBRA TOTE - PU POCKET 2.png` |
| **#4 — Leopard Chain Tote** | `LEOPARD TOTE BAG 2.png` | `LEOPARD TOTE BAG 1.png` |

The brand-story section uses `MINI LEOPARD - PU 2.png`.

## To swap or update an image

1. Drop the new image into this folder.
2. **If you keep the same filename** → no code changes needed, just refresh shoplp.html.
3. **If you use a different filename** → open shoplp.html, do Find & Replace for the old filename. References live in:
   - The `<img src="...">` tags in the product switcher (top of page) and gallery
   - The `products` array around line 2410 in the `<script>` block
   - The collection grid (mid-page)

## Image specs

- **Aspect ratio**: 4:5 portrait (containers in shoplp.html are set to 4:5 — non-4:5 images will be cropped). Current images are 1080×1350.
- **Recommended size**: 1080×1350 or 1200×1500
- **Format**: PNG or JPG. PNGs from your team are fine — for production, compress with [tinypng.com](https://tinypng.com) to keep page-load fast.
- **No transparent backgrounds** for product shots — use a solid white or light neutral.

## Optional: switch to Shopify CDN later

When products are live in Shopify Admin, you can pull images directly from Shopify's CDN instead of `/assets`:

1. Shopify Admin → Products → click a product → right-click any image → "Copy image address".
2. The URL looks like `https://cdn.shopify.com/s/files/1/0123/4567/products/...png`.
3. In shoplp.html, replace the `assets/...png` reference with that full URL.

This is optional — the local `/assets` approach works perfectly and keeps image control on your end.
