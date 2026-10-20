const products = [
    { id:1, name:'红富士苹果', desc:'山东烟台 · 脆甜多汁', price:19.9, img:'🍎', cat:'国产' },
    { id:2, name:'进口香蕉', desc:'厄瓜多尔 · 自然熟', price:12.8, img:'🍌', cat:'进口' },
    { id:3, name:'巨峰葡萄', desc:'新疆吐鲁番 · 颗颗饱满', price:25.0, img:'🍇', cat:'国产' },
    { id:4, name:'丹东草莓', desc:'当季新鲜 · 香甜可口', price:39.9, img:'🍓', cat:'浆果' },
    { id:5, name:'泰国山竹', desc:'果中皇后 · 清甜爽口', price:45.0, img:'🍑', cat:'热带' },
    { id:6, name:'新西兰奇异果', desc:'Zespri · 维C之王', price:29.9, img:'', cat:'进口' },
    { id:7, name:'海南芒果', desc:'贵妃芒 · 香气浓郁', price:22.5, img:'🥭', cat:'热带' },
    { id:8, name:'智利车厘子', desc:'JJ级 · 脆甜爆汁', price:89.0, img:'🍒', cat:'进口' },
    { id:9, name:'麒麟西瓜', desc:'皮薄肉甜 · 夏日必备', price:15.0, img:'🍉', cat:'国产' },
    { id:10, name:'蓝莓', desc:'云南 · 花青素丰富', price:35.0, img:'🫐', cat:'浆果' },
  ];

  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  let orders = JSON.parse(localStorage.getItem('orders') || '[]');
  let currentCat = '全部';

  function renderProducts() {
    const kw = document.getElementById('searchInput').value.trim();
    const list = products.filter(p =>
      (currentCat === '全部' || p.cat === currentCat) &&
      (!kw || p.name.includes(kw) || p.desc.includes(kw))
    );
    const html = list.map(p => `
      <div class="product">
        <div class="product-img">${p.img}</div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-bottom">
            <div class="product-price">¥${p.price}<small>/斤</small></div>
            <button class="add-btn" onclick="addToCart(${p.id})">+</button>
          </div>
        </div>
      </div>
    `).join('');
    document.getElementById('productList').innerHTML = html || '<div class="empty-tip">暂无商品</div>';
  }

  function filterCat(c) { currentCat = c; renderProducts(); }

  function addToCart(id) {
    if (!currentUser) { toast('请先登录'); openLogin(); return; }
    const item = cart.find(c => c.id === id);
    if (item) item.qty++;
    else {
      const p = products.find(p => p.id === id);
      cart.push({ ...p, qty: 1 });
    }
    saveCart();
    toast('已加入购物车');
  }

  function changeQty(id, d) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += d;
    if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
    saveCart();
    renderCart();
  }

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const total = cart.reduce((s, c) => s + c.qty, 0);
    const badge = document.getElementById('cartBadge');
    if (total > 0) { badge.style.display = 'block'; badge.textContent = total; }
    else badge.style.display = 'none';
  }

  function renderCart() {
    const box = document.getElementById('cartList');
    if (cart.length === 0) {
      box.innerHTML = '<div class="empty-tip"><div class="emoji"></div>购物车空空如也<br>快去挑选新鲜水果吧</div>';
      return;
    }
    let total = 0;
    const html = cart.map(c => {
      total += c.price * c.qty;
      return `
        <div class="cart-item">
          <div class="cart-item-img">${c.img}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${c.name}</div>
            <div class="cart-item-price">¥${c.price} × ${c.qty}</div>
          </div>
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="changeQty(${c.id},-1)">-</button>
            <span>${c.qty}</span>
            <button class="qty-btn" onclick="changeQty(${c.id},1)">+</button>
          </div>
        </div>
      `;
    }).join('');
    box.innerHTML = html + `
      <div class="cart-total">
        <div>合计：<span class="price">¥${total.toFixed(2)}</span></div>
        <button class="btn-primary" style="width:auto; padding:10px 24px; margin:0;" onclick="openCheckout()">去结算</button>
      </div>
    `;
  }

  function openLogin() {
    if (currentUser) { switchPage('me'); return; }
    document.getElementById('loginModal').classList.add('show');
  }
  function closeModal(id) { document.getElementById(id).classList.remove('show'); }
  function toggleRegister() {
    closeModal('loginModal');
    document.getElementById('registerModal').classList.add('show');
  }

  function doRegister() {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const pwd = document.getElementById('regPwd').value;
    if (!name || !phone || !pwd) return toast('请填写完整信息');
    if (phone.length !== 11) return toast('手机号格式不正确');
    if (pwd.length < 6) return toast('密码至少6位');
    if (users.find(u => u.phone === phone)) return toast('该手机号已注册');
    const user = { name, phone, pwd };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeModal('registerModal');
    updateUserUI();
    toast('注册成功');
  }

  function doLogin() {
    const account = document.getElementById('loginPhone').value.trim();
    const pwd = document.getElementById('loginPwd').value;
    
    // 老板特殊账号
    if (account === 'admin' && pwd === '123456') {
      currentUser = { name: '老板', phone: 'admin', isAdmin: true };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      closeModal('loginModal');
      updateUserUI();
      toast('👑 欢迎老板！');
      return;
    }

    const user = users.find(u => u.phone === account && u.pwd === pwd);
    if (!user) return toast('账号或密码错误');
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeModal('loginModal');
    updateUserUI();
    toast('登录成功');
  }

  function logout() {
    if (!confirm('确定退出登录？')) return;
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
    switchPage('home');
    toast('已退出');
  }

  function updateUserUI() {
    const btn = document.getElementById('userBtn');
    const me = document.getElementById('meInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    if (currentUser) {
      btn.textContent = currentUser.name;
      let roleTag = currentUser.isAdmin ? '<div style="margin-top:6px; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:10px; font-size:12px; display:inline-block;">👑 管理员</div>' : '';
      me.innerHTML = `
        <div style="font-size:20px; font-weight:bold;">👋 ${currentUser.name}</div>
        <div style="margin-top:6px; opacity:0.9;">📱 ${currentUser.phone}</div>
        ${roleTag}
      `;
      logoutBtn.style.display = 'block';
    } else {
      btn.textContent = '登录/注册';
      me.innerHTML = `<div style="font-size:18px;" onclick="openLogin()">点击登录 / 注册 →</div>`;
      logoutBtn.style.display = 'none';
    }
  }

  function openCheckout() {
    if (cart.length === 0) return toast('购物车是空的');
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    document.getElementById('coGoods').innerHTML = cart.map(c => `${c.name} × ${c.qty}`).join('<br>');
    document.getElementById('coTotal').textContent = '¥' + total.toFixed(2);
    document.getElementById('checkoutModal').classList.add('show');
  }

  function submitOrder() {
    const name = document.getElementById('coName').value.trim();
    const phone = document.getElementById('coPhone').value.trim();
    const addr = document.getElementById('coAddr').value.trim();
    if (!name || !phone || !addr) return toast('请填写完整收货信息');
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const order = {
      id: 'OD' + Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      user: currentUser.phone,
      userName: currentUser.name,
      goods: [...cart],
      total,
      name, phone, addr,
      status: '待发货'
    };
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    cart = [];
    saveCart();
    closeModal('checkoutModal');
    toast('下单成功！');
    renderCart();
    renderOrders();
    switchPage('order');
  }

  function renderOrders() {
    const box = document.getElementById('orderList');
    const banner = document.getElementById('bossBanner');
    const title = document.getElementById('orderTitle');
    
    let myOrders;
    if (currentUser && currentUser.isAdmin) {
      // 老板看所有订单
      myOrders = orders;
      banner.style.display = 'block';
      title.innerHTML = '📋 所有订单 <span style="font-size:12px; color:#888; font-weight:normal; margin-left:8px;">(共' + orders.length + '单)</span>';
    } else {
      // 顾客只看自己的
      myOrders = currentUser ? orders.filter(o => o.user === currentUser.phone) : [];
      banner.style.display = 'none';
      title.textContent = '我的订单';
    }

    if (myOrders.length === 0) {
      box.innerHTML = '<div class="empty-tip"><div class="emoji">📦</div>暂无订单</div>';
      return;
    }
    box.innerHTML = myOrders.map(o => `
      <div class="order-item">
        <div class="order-head">
          <span>订单号：${o.id}</span>
          <span class="order-status">${o.status}</span>
        </div>
        ${currentUser && currentUser.isAdmin ? `<div style="margin-bottom:6px;"><span style="color:#666;">顾客：</span><b>${o.userName}</b> (${o.phone}) <span class="order-customer">📍 ${o.addr}</span></div>` : ''}
        <div class="order-goods">${o.goods.map(g => g.name + '×' + g.qty).join('、')}</div>
        <div class="order-foot">
          <span>${o.time}</span>
          <span>合计：<span class="total">¥${o.total.toFixed(2)}</span></span>
        </div>
      </div>
    `).join('');
  }

  function switchPage(name, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    else {
      const idx = { home:0, cart:1, order:2, me:3 }[name];
      document.querySelectorAll('.nav-item')[idx].classList.add('active');
    }
    if (name === 'cart') renderCart();
    if (name === 'order') renderOrders();
    if (name === 'me') updateUserUI();
    window.scrollTo(0, 0);
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
  }

  renderProducts();
  saveCart();
  updateUserUI();
