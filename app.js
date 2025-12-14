// ====== Data Produk (contoh) ======
const PRODUCTS = [
  {id:'P001', name:'Script Justin', price:50000, category:'script', img:'https://files.catbox.moe/szp43s.jpg'},
  {id:'P002', name:'Script Nika', price:25000, category:'script', img:'https://files.catbox.moe/1gkskl.jpg'},
  {id:'P003', name:'Tutor Bisnis Meta', price:10000, category:'digital', img:'https://files.catbox.moe/j3b2k3.jpeg'},
  {id:'P004', name:'Reseller Justin', price:130000, category:'digital', img:'https://files.catbox.moe/szp43s.jpg'},
  {id:'P005', name:'Partner Justin', price:150000, category:'digital', img:'https://files.catbox.moe/szp43s.jpg'},
  {id:'P006', name:'Buyer VIP Permanen', price:100000, category:'digital', img:'https://files.catbox.moe/szp43s.jpg'},
  {id:'P007', name:'Moderator Justin', price:300000, category:'digital', img:'https://files.catbox.moe/szp43s.jpg'},
  {id:'P008', name:'Partner VVIP Lubyz', price:30000, category:'digital', img:'https://files.catbox.moe/j8mfs8.jpg'},
  {id:'P009', name:'Reseller Nika', price:0, category:'digital', img:'https://files.catbox.moe/1gkskl.jpg'},
  {id:'P010', name:'SC MD 1K Fitur', price:80000, category:'script', img:'https://files.catbox.moe/qthmur.jpg'},
  {id:'P011', name:'Rename Script', price:10000, category:'jasa', img:'https://files.catbox.moe/1gkskl.jpg'}
];

// ====== Utils ======
const rupiah = (n)=> new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const $ = (sel,scope=document)=> scope.querySelector(sel);
const $$ = (sel,scope=document)=> Array.from(scope.querySelectorAll(sel));

// ====== Cart (localStorage) ======
const CART_KEY = 'jbshop_cart';

function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch{ return []; } }
function setCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartCount(); }
function addToCart(id){
  const items = getCart();
  const idx = items.findIndex(it=>it.id===id);
  if(idx>-1){ items[idx].qty += 1; } else { items.push({id, qty:1}); }
  setCart(items);
}
function removeFromCart(id){
  setCart(getCart().filter(it=>it.id!==id));
}
function changeQty(id, delta){
  const items = getCart().map(it => it.id===id ? {...it, qty: Math.max(1, it.qty+delta)} : it);
  setCart(items);
}
function cartCount(){
  return getCart().reduce((a,b)=>a+b.qty,0);
}
function updateCartCount(){
  const el = document.getElementById('cartCount');
  if(el) el.textContent = cartCount();
}

// ====== Renderers ======
function productCard(p){
  return `
    <div class="card">
      <div class="img"><img src="${p.img}" alt="${p.name}"></div>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="price">${rupiah(p.price)}</div>
        <div class="rating">★★★★★</div>
        <button class="add-btn" data-id="${p.id}">Tambah ke Keranjang</button>
      </div>
    </div>`;
}

function mountFeatured(){
  const wrap = document.getElementById('featuredProducts');
  if(!wrap) return;
  wrap.innerHTML = PRODUCTS.slice(0,4).map(productCard).join('');
  $$('button.add-btn', wrap).forEach(b=> b.addEventListener('click', e=>{
    addToCart(b.dataset.id);
    b.textContent = 'Ditambahkan!';
    setTimeout(()=> b.textContent='Tambah ke Keranjang', 1200);
  }));
}

function mountCatalog(){
  const list = document.getElementById('productList');
  if(!list) return;
  const url = new URL(location.href);
  const fromQuery = url.searchParams.get('category')||'';
  const select = document.getElementById('categoryFilter');
  if(select){ select.value = fromQuery; }
  const render = () => {
    const value = (select && select.value) ? select.value : '';
    const filtered = value ? PRODUCTS.filter(p=>p.category===value) : PRODUCTS;
    list.innerHTML = filtered.map(productCard).join('');
    $$('button.add-btn', list).forEach(b=> b.addEventListener('click', ()=>{
      addToCart(b.dataset.id);
      b.textContent = 'Ditambahkan!';
      setTimeout(()=> b.textContent='Tambah ke Keranjang', 1200);
    }));
  };
  if(select) select.addEventListener('change', render);
  render();
}

function mountCart(){
  const wrap = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if(!wrap || !totalEl) return;
  const items = getCart();
  if(items.length===0){
    wrap.innerHTML = '<p>Keranjang kosong.</p>';
    totalEl.textContent = rupiah(0);
    return;
  }
  const rows = items.map(it=>{
    const p = PRODUCTS.find(x=>x.id===it.id);
    const line = p.price * it.qty;
    return `
      <div class="card" style="margin-bottom:10px">
        <div class="body" style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap">
          <div style="display:flex;gap:12px;align-items:center">
            <img src="${p.img}" alt="${p.name}" style="width:80px;height:60px;object-fit:cover;border-radius:8px">
            <div>
              <div><strong>${p.name}</strong></div>
              <div class="price">${rupiah(p.price)}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="add-btn" data-act="dec" data-id="${p.id}" style="width:auto;padding:8px 12px">-</button>
            <span>${it.qty}</span>
            <button class="add-btn" data-act="inc" data-id="${p.id}" style="width:auto;padding:8px 12px">+</button>
            <button class="add-btn" data-act="rm" data-id="${p.id}" style="width:auto;padding:8px 12px;border-color:#ff006e;color:#ff006e">Hapus</button>
            <strong style="margin-left:8px">${rupiah(line)}</strong>
          </div>
        </div>
      </div>`;
  });
  wrap.innerHTML = rows.join('');
  const total = items.reduce((acc,it)=>{
    const p = PRODUCTS.find(x=>x.id===it.id); return acc + p.price*it.qty;
  },0);
  totalEl.textContent = rupiah(total);
  // events
  $$('#cartItems .add-btn').forEach(btn=>{
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    btn.addEventListener('click', ()=>{
      if(act==='inc') changeQty(id, +1);
      if(act==='dec') changeQty(id, -1);
      if(act==='rm') removeFromCart(id);
      mountCart();
    });
  });

  // === Checkout to WhatsApp ===
  const checkout = document.getElementById('checkoutBtn');
  if(checkout){
    checkout.onclick = ()=>{
      const items = getCart();
      if(items.length === 0){
        alert('Keranjang masih kosong!');
        return;
      }

      // 🟢 Nomor WhatsApp admin (ganti dengan nomor kamu)
      const admin = '6282268135038';

      // Buat pesan otomatis
      let pesan = 'Halo JOSS OFFICIAL ! Saya ingin memesan barang berikut:%0A%0A';
      let totalHarga = 0;

      items.forEach(it=>{
        const p = PRODUCTS.find(x=>x.id===it.id);
        const subtotal = p.price * it.qty;
        totalHarga += subtotal;
        pesan += `- ${p.name} x${it.qty} = ${rupiah(subtotal)}%0A`;
      });

      pesan += `%0ATotal: *${rupiah(totalHarga)}*%0A%0AAlamat Pengiriman:%0ANama:%0AAlamat:%0ANo HP:%0A%0ATerima kasih.`;

      // Arahkan ke WhatsApp
      const url = `https://wa.me/${admin}?text=${pesan}`;
      window.open(url, '_blank');

      // Kosongkan keranjang
      setCart([]);
      mountCart();
    };
  }
}

// ====== Contact form (dummy) ======
function mountContact(){
  const btn = document.getElementById('sendMsg');
  const status = document.getElementById('msgStatus');
  if(!btn || !status) return;
  btn.onclick = ()=>{
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const msg = document.getElementById('message').value.trim();
    if(!name || !email || !msg){
      status.textContent = 'Harap lengkapi semua kolom.';
      return;
    }
    status.textContent = 'Pesan terkirim! (simulasi)';
    setTimeout(()=> status.textContent = '', 2500);
  };
}

// ====== Init ======
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
  mountFeatured();
  mountCatalog();
  mountCart();
  mountContact();
});
