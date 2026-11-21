import fs from 'fs';

let tienda = fs.readFileSync('tienda.html', 'utf8');

function replaceFlex(content, target, replacement, label) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normReplacement = replacement.replace(/\r\n/g, '\n');
  if (!normContent.includes(normTarget)) {
    throw new Error(`Target not found for: ${label}`);
  }
  const updated = normContent.replace(normTarget, normReplacement);
  return eol === '\r\n' ? updated.replace(/\n/g, '\r\n') : updated;
}

// 1. CSS Enhancement for Stepper, Product Card in-cart, and Card Badges
const oldCss = `/* ── PRODUCT CARD BUTTONS & QUANTITY COUNTER ─────── */
.btn-card-add{
  margin-top:auto;
  width:100%;
  height:38px;
  font-size:13px;
  font-weight:700;
  font-family:var(--font-body);
  padding:0 14px;
  display:flex;align-items:center;justify-content:center;
  gap:6px;
  background:rgba(246,0,0,0.1);
  border:1px solid var(--red);
  border-radius:10px;
  color:var(--red) !important;
  cursor:pointer;
  transition:all .18s ease;
}
.btn-card-add:hover{
  background:var(--red);
  color:#FFFFFF !important;
  transform:translateY(-1px);
  box-shadow:0 4px 14px var(--red-glow);
}
.btn-personalizar, .sb-btn{
  margin-top:auto;
  width:100%;
  height:38px;
  font-size:13px;
  font-weight:700;
  font-family:var(--font-body);
  padding:0 14px;
  display:flex;align-items:center;justify-content:center;
  gap:7px;
  background:linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%) !important;
  border:none !important;
  border-radius:10px;
  color:#FFFFFF !important;
  cursor:pointer;
  transition:all .18s ease;
  box-shadow:0 3px 10px var(--red-glow);
}
.btn-personalizar:hover, .sb-btn:hover{
  filter:brightness(1.08);
  transform:translateY(-1px);
  box-shadow:0 6px 18px var(--red-glow);
}
.btn-personalizar .badge-count{
  background:rgba(255,255,255,0.25);
  color:#FFFFFF;
  border-radius:999px;
  padding:1px 8px;
  font-size:11px;
  font-weight:800;
  margin-left:4px;
}
.qty-control{
  display:flex;align-items:center;
  margin-top:auto;height:38px;border-radius:10px;overflow:hidden;
  border:1px solid var(--zinc);
  background:var(--steel);
  transition:all .2s ease;
}
.qty-control.has-items{
  border-color:var(--red);
  background:rgba(246,0,0,0.08);
  box-shadow:0 0 0 1px var(--red-glow);
}
.qty-btn{
  width:40px;height:38px;flex-shrink:0;
  background:transparent;border:none;
  color:var(--white);font-size:17px;font-weight:700;
  cursor:pointer;transition:all .12s;
  display:flex;align-items:center;justify-content:center;
}
.qty-btn:hover{background:var(--red);color:#FFFFFF !important;}
.qty-num{
  flex:1;text-align:center;
  font-family:var(--font-mono);font-size:14px;font-weight:800;
  color:var(--white);background:transparent;
  border:none;outline:none;
  padding:0;pointer-events:none;
}
.qty-control.has-items .qty-num{color:var(--red);font-weight:800;}`;

const newCss = `/* ── PRODUCT CARD BUTTONS & PERSISTENT STEPPER ─────── */
.btn-card-add{
  margin-top:auto;
  width:100%;
  height:36px;
  min-height:36px;
  font-size:13px;
  font-weight:700;
  font-family:var(--font-body);
  padding:0 14px;
  display:flex;align-items:center;justify-content:center;
  gap:6px;
  background:rgba(246,0,0,0.08);
  border:1.5px solid var(--red);
  border-radius:999px;
  color:var(--red) !important;
  cursor:pointer;
  transition:all .18s ease;
  user-select:none;
}
.btn-card-add:hover{
  background:var(--red);
  color:#FFFFFF !important;
  transform:translateY(-1px);
  box-shadow:0 4px 14px var(--red-glow);
}
.btn-card-add:active{
  transform:scale(0.97);
}
.btn-personalizar, .sb-btn{
  margin-top:auto;
  width:100%;
  height:36px;
  min-height:36px;
  font-size:13px;
  font-weight:700;
  font-family:var(--font-body);
  padding:0 14px;
  display:flex;align-items:center;justify-content:center;
  gap:7px;
  background:linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%) !important;
  border:none !important;
  border-radius:999px;
  color:#FFFFFF !important;
  cursor:pointer;
  transition:all .18s ease;
  box-shadow:0 3px 10px var(--red-glow);
  user-select:none;
}
.btn-personalizar:hover, .sb-btn:hover{
  filter:brightness(1.08);
  transform:translateY(-1px);
  box-shadow:0 6px 18px var(--red-glow);
}
.btn-personalizar:active{
  transform:scale(0.97);
}
.btn-personalizar .badge-count{
  background:rgba(255,255,255,0.3);
  color:#FFFFFF;
  border-radius:999px;
  padding:2px 8px;
  font-size:11px;
  font-weight:800;
  margin-left:4px;
  font-variant-numeric:tabular-nums;
  animation:badgePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.qty-control{
  display:flex;align-items:center;justify-content:space-between;
  margin-top:auto;
  width:100%;
  min-width:108px;
  height:36px;
  min-height:36px;
  border-radius:999px;
  overflow:hidden;
  border:1.5px solid var(--zinc);
  background:var(--steel);
  padding:0 3px;
  transition:all .2s cubic-bezier(.16,1,.3,1);
  user-select:none;
}
.qty-control.has-items, .qty-control.persistent-stepper{
  border-color:var(--red) !important;
  background:rgba(246,0,0,0.06);
  box-shadow:0 2px 10px var(--red-glow);
}
.qty-control.has-items:hover, .qty-control.persistent-stepper:hover{
  border-color:var(--red-dark, #D60000) !important;
  box-shadow:0 4px 14px var(--red-glow);
}
.qty-btn{
  width:34px;height:30px;min-width:34px;min-height:30px;flex-shrink:0;
  background:transparent;border:none;border-radius:999px;
  color:var(--red);font-size:14px;font-weight:700;
  cursor:pointer;transition:all .15s ease;
  display:flex;align-items:center;justify-content:center;
  padding:0;
}
.qty-btn:hover{background:var(--red);color:#FFFFFF !important;transform:scale(1.08);}
.qty-btn:active{transform:scale(0.92);}
.qty-btn.qty-btn-dec:hover{background:#DC2626;color:#FFFFFF !important;}
.qty-num{
  flex:1;text-align:center;
  font-family:var(--font-head), var(--font-body), sans-serif;
  font-size:15px;font-weight:800;
  font-variant-numeric:tabular-nums;
  color:var(--white);background:transparent;
  border:none;outline:none;
  padding:0;pointer-events:none;
  user-select:none;
  transition:transform 0.15s ease, color 0.15s ease;
}
.qty-control.has-items .qty-num, .qty-control.persistent-stepper .qty-num{
  color:var(--white);
  font-weight:800;
}
.qty-num.bump{
  animation:qtyBump 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color:var(--red) !important;
}
@keyframes qtyBump{
  0%{transform:scale(1);}
  50%{transform:scale(1.22);}
  100%{transform:scale(1);}
}

/* ── PRODUCT CARD ACTIVE IN-CART STATE & BADGE ──────── */
.product-card.in-cart{
  border-color:var(--red) !important;
  box-shadow:0 4px 18px var(--red-glow), 0 2px 8px rgba(0,0,0,0.06);
}
.card-in-cart-badge{
  position:absolute;
  left:8px;
  z-index:4;
  display:inline-flex;
  align-items:center;
  gap:4px;
  background:var(--red);
  color:#FFFFFF;
  font-size:10.5px;
  font-weight:700;
  font-family:var(--font-body);
  padding:3px 8px;
  border-radius:999px;
  box-shadow:0 2px 8px var(--red-glow);
  letter-spacing:0.01em;
  pointer-events:none;
  animation:badgePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes badgePop{
  0%{transform:scale(0.7);opacity:0;}
  100%{transform:scale(1);opacity:1;}
}`;

tienda = replaceFlex(tienda, oldCss, newCss, 'tienda.html buttons and stepper CSS');

// 2. getProductCartQty helper definition right after findProduct
const oldState = `let products = [];
let cart     = {};
let cartDetails = {}; // Guarda { baseId, price, optionsText } para claves compuestas de productos con variantes
function findProduct(id) {
  if (id == null || id === '') return undefined;
  const baseId = String(id).split('_')[0];
  return products.find(x => String(x.id) === baseId);
}`;

const newState = `let products = [];
let cart     = {};
let cartDetails = {}; // Guarda { baseId, price, optionsText } para claves compuestas de productos con variantes
function findProduct(id) {
  if (id == null || id === '') return undefined;
  const baseId = String(id).split('_')[0];
  return products.find(x => String(x.id) === baseId);
}

function getProductCartQty(id) {
  if (id == null || id === '') return 0;
  const baseId = String(id).split('_')[0];
  let total = 0;
  for (const [k, q] of Object.entries(cart)) {
    if (k === baseId || k.startsWith(baseId + '_')) {
      total += (q || 0);
    }
  }
  return total;
}`;

tienda = replaceFlex(tienda, oldState, newState, 'tienda.html getProductCartQty helper');

// 3. Card template in render()
const oldCardRender = `  document.getElementById('grid').innerHTML = filtered.map((p,i) => {
    const qty = cart[String(p.id)] || 0;
    const flag = ORIGIN_FLAGS[p.origen] || '';
    const hasVideo = p.video_url && window.CAN_USE_MICRO_VIDEOS;
    return \`
    <div class="product-card \${p.stock <= 0 ? 'out-of-stock' : ''}" style="animation-delay:\${Math.min(i,12)*30}ms;cursor:pointer;"
      onclick='openProductDrawer(\${JSON.stringify(p.id)})'>
      <div class="product-img" style="position:relative;">
        <button type="button" class="card-share-btn" onclick='event.stopPropagation(); shareProduct(\${JSON.stringify(p.id)})' title="Compartir producto" style="position:absolute;top:8px;right:8px;z-index:4;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;padding:0;line-height:1;"><i class="bi bi-share"></i></button>
        \${hasVideo ? \`
          <div class="micro-video-pill" style="position:absolute;top:8px;left:8px;z-index:4;background:linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:12px;backdrop-filter:blur(4px);display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(239,68,68,0.4);letter-spacing:0.02em;">
            <i class="bi bi-play-circle-fill"></i> 5s Video
          </div>
          <video class="card-micro-video" src="\${p.video_url}" muted loop playsinline preload="metadata" onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0;transition:opacity 0.25s ease;" onplay="this.style.opacity='1'" onpause="this.style.opacity='0'"></video>
        \` : ''}
        \${p.img
          ? \`<img src="\${optimizeImg(p.img, 450)}" alt="\${escapeHTML(p.name)}" loading="lazy" decoding="async" class="main-img" onerror="this.style.display='none';this.parentElement.querySelector('.product-img-fallback').style.display='flex'"/>
             \${p.img2 ? \`<img src="\${optimizeImg(p.img2, 450)}" alt="\${escapeHTML(p.name)} detalle" loading="lazy" decoding="async" class="hover-img"/>\` : ''}
             <div class="product-img-fallback" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;">\${p.emoji}</div>\`
          : \`<div class="product-img-fallback">\${p.emoji}</div>\`}
        <span class="stock-chip \${p.stock===0?'out':''}">\${p.stock===0?'Sin stock':\`Stock: \${p.stock}\`}</span>
      </div>
      <div class="product-body">
        <div class="product-cat">\${escapeHTML(p.cat)}\${flag?' <span class="origen-flag">'+flag+'</span>':''}</div>
        \${p.marca?\`<div style="font-size:10px;color:var(--silver);margin-bottom:2px;">\${escapeHTML(p.marca)}</div>\`:''}
        <div class="product-name">\${escapeHTML(p.name)}</div>
        <div>
          \${(p.price_prev && p.price_prev > p.price) ? \`
            <div class="product-price-prev-row">
              <span class="product-price-prev">\${getCurrencySymbol(p.currency || p.divisa)} \${p.price_prev.toLocaleString('es-AR')}</span>
              <span class="product-discount-badge">-\${p.discount_pct || Math.round(((p.price_prev - p.price) / p.price_prev) * 100)}% OFF</span>
            </div>
          \` : ''}
          <span class="product-price-label">\${getCurrencySymbol(p.currency || p.divisa)}</span>
          <span class="product-price">\${(p.price || 0).toLocaleString('es-AR')}</span>
        </div>
        \${p.stock > 0
          ? ((p.variants && p.variants.length > 0) || (p.modifiers && p.modifiers.length > 0)
            ? \`<button class="btn-personalizar" onclick='event.stopPropagation(); openProductDrawer(\${JSON.stringify(p.id)})'><i class="bi bi-sliders"></i> Personalizar \${qty > 0 ? \`<span class="badge-count">\${qty}</span>\` : ''}</button>\`
            : (qty > 0
              ? \`<div class="qty-control has-items" id="qc-\${p.id}" onclick="event.stopPropagation()">
                  <button type="button" class="qty-btn" onclick='changeQtyCard(\${JSON.stringify(p.id)},-1)' aria-label="Disminuir cantidad"><i class="bi bi-dash"></i></button>
                  <span class="qty-num">\${qty}</span>
                  <button type="button" class="qty-btn" onclick='changeQtyCard(\${JSON.stringify(p.id)},1)' aria-label="Aumentar cantidad"><i class="bi bi-plus"></i></button>
                </div>\`
              : \`<button class="btn-card-add" id="qc-\${p.id}" onclick='event.stopPropagation(); changeQtyCard(\${JSON.stringify(p.id)},1)' aria-label="Agregar al carrito"><i class="bi bi-plus-lg"></i> Agregar</button>\`
              )
            )
          : \`<div style="margin-top:auto;height:38px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--silver);border:1px solid var(--zinc);border-radius:10px;opacity:.6;">Sin stock</div>\`}
      </div>
    </div>\`;
  }).join('');`;

const newCardRender = `  document.getElementById('grid').innerHTML = filtered.map((p,i) => {
    const qty = getProductCartQty(p.id);
    const flag = ORIGIN_FLAGS[p.origen] || '';
    const hasVideo = p.video_url && window.CAN_USE_MICRO_VIDEOS;
    const hasVariants = (p.variants && p.variants.length > 0) || (p.modifiers && p.modifiers.length > 0);
    return \`
    <div class="product-card \${p.stock <= 0 ? 'out-of-stock' : ''} \${qty > 0 ? 'in-cart' : ''}" id="pcard-\${p.id}" style="animation-delay:\${Math.min(i,12)*30}ms;cursor:pointer;"
      onclick='openProductDrawer(\${JSON.stringify(p.id)})'>
      <div class="product-img" style="position:relative;">
        <button type="button" class="card-share-btn" onclick='event.stopPropagation(); shareProduct(\${JSON.stringify(p.id)})' title="Compartir producto" style="position:absolute;top:8px;right:8px;z-index:4;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;padding:0;line-height:1;"><i class="bi bi-share"></i></button>
        <div class="card-in-cart-badge" id="cbadge-\${p.id}" style="\${qty > 0 ? 'display:inline-flex;' : 'display:none;'} \${hasVideo ? 'top:36px;' : 'top:8px;'}">
          <i class="bi bi-bag-check-fill"></i> <span class="cbadge-num">\${qty}</span> en carrito
        </div>
        \${hasVideo ? \`
          <div class="micro-video-pill" style="position:absolute;top:8px;left:8px;z-index:4;background:linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:12px;backdrop-filter:blur(4px);display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(239,68,68,0.4);letter-spacing:0.02em;">
            <i class="bi bi-play-circle-fill"></i> 5s Video
          </div>
          <video class="card-micro-video" src="\${p.video_url}" muted loop playsinline preload="metadata" onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0;transition:opacity 0.25s ease;" onplay="this.style.opacity='1'" onpause="this.style.opacity='0'"></video>
        \` : ''}
        \${p.img
          ? \`<img src="\${optimizeImg(p.img, 450)}" alt="\${escapeHTML(p.name)}" loading="lazy" decoding="async" class="main-img" onerror="this.style.display='none';this.parentElement.querySelector('.product-img-fallback').style.display='flex'"/>
             \${p.img2 ? \`<img src="\${optimizeImg(p.img2, 450)}" alt="\${escapeHTML(p.name)} detalle" loading="lazy" decoding="async" class="hover-img"/>\` : ''}
             <div class="product-img-fallback" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;">\${p.emoji}</div>\`
          : \`<div class="product-img-fallback">\${p.emoji}</div>\`}
        <span class="stock-chip \${p.stock===0?'out':''}">\${p.stock===0?'Sin stock':\`Stock: \${p.stock}\`}</span>
      </div>
      <div class="product-body">
        <div class="product-cat">\${escapeHTML(p.cat)}\${flag?' <span class="origen-flag">'+flag+'</span>':''}</div>
        \${p.marca?\`<div style="font-size:10px;color:var(--silver);margin-bottom:2px;">\${escapeHTML(p.marca)}</div>\`:''}
        <div class="product-name">\${escapeHTML(p.name)}</div>
        <div>
          \${(p.price_prev && p.price_prev > p.price) ? \`
            <div class="product-price-prev-row">
              <span class="product-price-prev">\${getCurrencySymbol(p.currency || p.divisa)} \${p.price_prev.toLocaleString('es-AR')}</span>
              <span class="product-discount-badge">-\${p.discount_pct || Math.round(((p.price_prev - p.price) / p.price_prev) * 100)}% OFF</span>
            </div>
          \` : ''}
          <span class="product-price-label">\${getCurrencySymbol(p.currency || p.divisa)}</span>
          <span class="product-price">\${(p.price || 0).toLocaleString('es-AR')}</span>
        </div>
        \${p.stock > 0
          ? (hasVariants
            ? \`<button class="btn-personalizar" id="qc-\${p.id}" onclick='event.stopPropagation(); openProductDrawer(\${JSON.stringify(p.id)})'><i class="bi bi-sliders"></i> Personalizar \${qty > 0 ? \`<span class="badge-count">\${qty}</span>\` : ''}</button>\`
            : (qty > 0
              ? \`<div class="qty-control has-items persistent-stepper" id="qc-\${p.id}" onclick="event.stopPropagation()">
                  <button type="button" class="qty-btn qty-btn-dec" onclick='event.stopPropagation(); changeQtyCard(\${JSON.stringify(p.id)},-1)' aria-label="\${qty === 1 ? 'Eliminar del carrito' : 'Disminuir cantidad'}">
                    <i class="bi \${qty === 1 ? 'bi-trash' : 'bi-dash'}"></i>
                  </button>
                  <span class="qty-num">\${qty}</span>
                  <button type="button" class="qty-btn qty-btn-inc" onclick='event.stopPropagation(); changeQtyCard(\${JSON.stringify(p.id)},1)' aria-label="Aumentar cantidad">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>\`
              : \`<button class="btn-card-add" id="qc-\${p.id}" onclick='event.stopPropagation(); changeQtyCard(\${JSON.stringify(p.id)},1)' aria-label="Agregar al carrito"><i class="bi bi-plus-lg"></i> Agregar</button>\`
              )
            )
          : \`<div style="margin-top:auto;height:38px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--silver);border:1px solid var(--zinc);border-radius:10px;opacity:.6;">Sin stock</div>\`}
      </div>
    </div>\`;
  }).join('');`;

tienda = replaceFlex(tienda, oldCardRender, newCardRender, 'tienda.html render card template');

// 4. removeFromCart update
const oldRemove = `function removeFromCart(id) {
  const key = String(id);
  delete cart[key];
  delete cartDetails[key];
  updateCartUI();
  renderDrawer();
  // Update card counter using base ID
  const baseId = key.split('_')[0];
  const qc = document.getElementById('qc-'+baseId);
  if (qc) {
    const totalQtyThisProduct = Object.keys(cart).filter(k => k === baseId || k.startsWith(baseId + '_')).reduce((sum, k) => sum + cart[k], 0);
    const num = qc.querySelector('.qty-num');
    if (num) num.textContent = totalQtyThisProduct > 0 ? totalQtyThisProduct : '+';
    qc.classList.toggle('has-items', totalQtyThisProduct > 0);
  }
}`;

const newRemove = `function removeFromCart(id) {
  const key = String(id);
  const baseId = key.split('_')[0];
  delete cart[key];
  delete cartDetails[key];
  updateCartUI();
  renderDrawer();
  syncProductCardUI(baseId);
}`;

tienda = replaceFlex(tienda, oldRemove, newRemove, 'tienda.html removeFromCart');

// 5. COUNTER section: changeQtyCard, syncProductCardUI, syncAllProductCards
const oldCounter = `/* ═══════════════════════════════════════════ COUNTER */
function changeQtyCard(id, delta) {
  const key = String(id);
  const current = cart[key] || 0;
  const p = findProduct(id);
  const newQty = Math.max(0, Math.min(current + delta, p?.stock || 99));
  if (newQty === 0) delete cart[key]; else cart[key] = newQty;
  // Update counter in card without full re-render
  const qc = document.getElementById('qc-'+key);
  if (qc) {
    if (newQty > 0) {
      if (qc.classList.contains('qty-control')) {
        const num = qc.querySelector('.qty-num');
        if (num) num.textContent = newQty;
        qc.classList.add('has-items');
      } else {
        qc.outerHTML = \`<div class="qty-control has-items" id="qc-\${key}" onclick="event.stopPropagation()">
            <button type="button" class="qty-btn" onclick='changeQtyCard(\${JSON.stringify(key)},-1)' aria-label="Disminuir cantidad"><i class="bi bi-dash"></i></button>
            <span class="qty-num">\${newQty}</span>
            <button type="button" class="qty-btn" onclick='changeQtyCard(\${JSON.stringify(key)},1)' aria-label="Aumentar cantidad"><i class="bi bi-plus"></i></button>
          </div>\`;
      }
    } else {
      qc.outerHTML = \`<button class="btn-card-add" id="qc-\${key}" onclick='event.stopPropagation(); changeQtyCard(\${JSON.stringify(key)},1)' aria-label="Agregar al carrito"><i class="bi bi-plus-lg"></i> Agregar</button>\`;
    }
  }
  // Update drawer if open
  const drawerQty = document.getElementById('pdrawer-qty-num');
  if (drawerQty && String(drawerQty.dataset.id) === key) {
    drawerQty.textContent = newQty || 0;
  }
  updateCartUI();
}`;

const newCounter = `/* ═══════════════════════════════════════════ COUNTER & SYNC */
function syncProductCardUI(id) {
  if (id == null || id === '') return;
  const baseId = String(id).split('_')[0];
  const p = findProduct(baseId);
  if (!p) return;
  const qty = getProductCartQty(baseId);

  // 1. Actualizar borde activo en la tarjeta y badge flotante
  const card = document.getElementById('pcard-' + baseId);
  if (card) {
    card.classList.toggle('in-cart', qty > 0);
    const badge = document.getElementById('cbadge-' + baseId);
    if (badge) {
      badge.style.display = qty > 0 ? 'inline-flex' : 'none';
      const badgeNum = badge.querySelector('.cbadge-num');
      if (badgeNum) badgeNum.textContent = qty;
    }
  }

  // 2. Actualizar botón o stepper en la tarjeta
  const qc = document.getElementById('qc-' + baseId);
  if (!qc) return;

  const hasVariants = (p.variants && p.variants.length > 0) || (p.modifiers && p.modifiers.length > 0);
  if (hasVariants) {
    if (qty > 0) {
      qc.innerHTML = \`<i class="bi bi-sliders"></i> Personalizar <span class="badge-count">\${qty}</span>\`;
    } else {
      qc.innerHTML = \`<i class="bi bi-sliders"></i> Personalizar\`;
    }
  } else {
    if (qty > 0) {
      const isTrash = (qty === 1);
      const decIcon = isTrash ? 'bi-trash' : 'bi-dash';
      const decLabel = isTrash ? 'Eliminar del carrito' : 'Disminuir cantidad';
      
      if (qc.classList.contains('persistent-stepper')) {
        const num = qc.querySelector('.qty-num');
        if (num) {
          num.textContent = qty;
          num.classList.remove('bump');
          void num.offsetWidth; // reiniciar animación micro-interacción
          num.classList.add('bump');
        }
        const decBtn = qc.querySelector('.qty-btn-dec');
        if (decBtn) {
          decBtn.innerHTML = \`<i class="bi \${decIcon}"></i>\`;
          decBtn.setAttribute('aria-label', decLabel);
        }
      } else {
        qc.outerHTML = \`
          <div class="qty-control has-items persistent-stepper" id="qc-\${baseId}" onclick="event.stopPropagation()">
            <button type="button" class="qty-btn qty-btn-dec" onclick='event.stopPropagation(); changeQtyCard(\${JSON.stringify(baseId)},-1)' aria-label="\${decLabel}">
              <i class="bi \${decIcon}"></i>
            </button>
            <span class="qty-num bump">\${qty}</span>
            <button type="button" class="qty-btn qty-btn-inc" onclick='event.stopPropagation(); changeQtyCard(\${JSON.stringify(baseId)},1)' aria-label="Aumentar cantidad">
              <i class="bi bi-plus"></i>
            </button>
          </div>
        \`;
      }
    } else {
      qc.outerHTML = \`<button class="btn-card-add" id="qc-\${baseId}" onclick='event.stopPropagation(); changeQtyCard(\${JSON.stringify(baseId)},1)' aria-label="Agregar al carrito"><i class="bi bi-plus-lg"></i> Agregar</button>\`;
    }
  }
}

function syncAllProductCards() {
  if (Array.isArray(products)) {
    products.forEach(p => syncProductCardUI(p.id));
  }
}

function changeQtyCard(id, delta) {
  const key = String(id);
  const baseId = key.split('_')[0];
  const p = findProduct(baseId);
  const current = cart[key] || 0;

  // Validación de stock al incrementar
  if (delta > 0 && p && p.stock !== undefined && p.stock !== null && current >= p.stock) {
    showToast(\`⚠ Stock máximo alcanzado (\${p.stock} unidades)\`);
    return;
  }

  const newQty = Math.max(0, current + delta);
  if (newQty === 0) {
    delete cart[key];
    delete cartDetails[key];
  } else {
    cart[key] = newQty;
  }

  // Micro-interacción: feedback háptico en móviles
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(15); } catch(e) {}
  }

  // Sincronizar tarjeta en catálogo
  syncProductCardUI(baseId);

  // Actualizar modal de detalle si está abierto con este id
  const drawerQty = document.getElementById('pdrawer-qty-num');
  if (drawerQty && String(drawerQty.dataset.id) === baseId) {
    const totalThis = getProductCartQty(baseId);
    drawerQty.textContent = totalThis || 0;
  }

  // Sincronizar UI de carrito
  updateCartUI();
  if (document.getElementById('drawer')?.classList.contains('open')) {
    renderDrawer();
  }
}`;

tienda = replaceFlex(tienda, oldCounter, newCounter, 'tienda.html COUNTER section');

// 6. addFromDrawer sync
const oldAddFromDrawer = `  // Increment quantity in cart
  cart[key] = (cart[key] || 0) + 1;

  // Update overall UI
  updateCartUI();
  
  // Update card counter using base ID
  const baseId = key.split('_')[0];
  const qc = document.getElementById('qc-'+baseId);
  if (qc) {
    const totalQtyThisProduct = Object.keys(cart).filter(k => k === baseId || k.startsWith(baseId + '_')).reduce((sum, k) => sum + cart[k], 0);
    const num = qc.querySelector('.qty-num');
    if (num) num.textContent = totalQtyThisProduct > 0 ? totalQtyThisProduct : '+';
    qc.classList.toggle('has-items', totalQtyThisProduct > 0);
  }

  const btn = document.getElementById('pdrawer-add-btn');
  const totalQtyThisProduct = Object.keys(cart).filter(k => k === String(id) || k.startsWith(id + '_')).reduce((sum, k) => sum + cart[k], 0);
  btn.textContent = \`Agregar al carrito (\${totalQtyThisProduct})\`;`;

const newAddFromDrawer = `  // Increment quantity in cart
  cart[key] = (cart[key] || 0) + 1;

  // Micro-interacción: feedback háptico en móviles
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(15); } catch(e) {}
  }

  // Update overall UI
  updateCartUI();
  
  // Update card counter & active border
  const baseId = key.split('_')[0];
  syncProductCardUI(baseId);

  const btn = document.getElementById('pdrawer-add-btn');
  const totalQtyThisProduct = getProductCartQty(id);
  btn.textContent = \`Agregar al carrito (\${totalQtyThisProduct})\`;`;

tienda = replaceFlex(tienda, oldAddFromDrawer, newAddFromDrawer, 'tienda.html addFromDrawer');

// 7. handleCheckout cart reset: syncAllProductCards
const oldCheckoutReset = `    window.SERENO_ORDER_CONFIRMED = false;
    cart = {};
    cartDetails = {};
    updateCartUI();
    closeCart();`;

const newCheckoutReset = `    window.SERENO_ORDER_CONFIRMED = false;
    cart = {};
    cartDetails = {};
    updateCartUI();
    syncAllProductCards();
    closeCart();`;

tienda = replaceFlex(tienda, oldCheckoutReset, newCheckoutReset, 'tienda.html checkout reset');

// Write back to tienda.html
fs.writeFileSync('tienda.html', tienda, 'utf8');
console.log('✓ Successfully patched tienda.html with persistent stepper and visual badges!');
