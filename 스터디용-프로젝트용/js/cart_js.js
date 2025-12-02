let cartUser = null;

const resolveCartImage = (path = "") => {
  if (!path) return "../product/default.jpg";
  if (path.startsWith("../")) return path;
  if (path.startsWith("/")) return `..${path}`;
  return `../${path}`;
};

async function requireCartUser() {
  if (cartUser) return cartUser;
  const res = await fetch('/api/me');
  if (!res.ok) throw new Error('AUTH');
  const data = await res.json();
  if (!data.loggedIn) throw new Error('AUTH');
  cartUser = data.user;
  return cartUser;
}

// 1. 장바구니 목록 불러오기
async function loadCart() {
  await requireCartUser();
  const res = await fetch(`/api/cart`);
  if (!res.ok) throw new Error("장바구니 조회 실패");

  const items = await res.json();
  renderCart(items);
}

function renderCart(items){
  const list = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal-price");
  const totalEl = document.getElementById("total-price");
  const countEl = document.getElementById("summary-count");
  if (!list) return;

  list.innerHTML = "";
  let total = 0;

  if (!items.length) {
    list.innerHTML = `
      <div class="empty-state">
        <p>담아둔 상품이 없습니다.</p>
        <a href="/">쇼핑 계속하기</a>
      </div>`;
    subtotalEl.innerText = "0원";
    totalEl.innerText = "0원";
    if (countEl) countEl.innerText = "0개 상품";
    return;
  }

  const frag = document.createDocumentFragment();
  items.forEach((item) => {
    total += Number(item.total);
    const card = document.createElement("article");
    card.className = "cart-item";
    card.innerHTML = `
      <div class="thumb"><img src="${resolveCartImage(item.main_image)}" alt="${item.product_name}"></div>
      <div class="info">
        <h4>${item.product_name}</h4>
        <p class="price">${Number(item.price).toLocaleString()}원</p>
        <p class="qty">수량 ${item.quantity}개</p>
      </div>
      <div class="line-total">${Number(item.total).toLocaleString()}원</div>
    `;
    frag.appendChild(card);
  });

  list.appendChild(frag);

  subtotalEl.innerText = `${total.toLocaleString()}원`;
  totalEl.innerText = `${total.toLocaleString()}원`;
  if (countEl) countEl.innerText = `${items.length}개 상품`;
}

// 3. 장바구니 전체 비우기
async function clearCart() {
  try {
    await requireCartUser();
    const res = await fetch(`/api/cart`);
    if (!res.ok) throw new Error("장바구니 조회 실패");

    const items = await res.json();

    if (!items.length) {
      alert("이미 장바구니가 비어 있습니다.");
      return;
    }

    await Promise.all(
      items.map((item) =>
        fetch(`/api/cart/${item.cart_id}`, { method: "DELETE" })
      )
    );

    alert("장바구니를 비웠습니다.");
    await loadCart();
  } catch (err) {
    console.error(err);
    alert("장바구니 비우기에 실패했습니다.");
  }
}

// 4. 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
  const listSection = document.getElementById("cart-items");
  if (!listSection) return; // cart.html 이 아니면 아무 것도 안 함

  requireCartUser()
    .then(loadCart)
    .catch((err) => {
      console.error(err);
      if (err.message === 'AUTH') {
        alert('로그인 후 이용해 주세요.');
        window.location.href = '/login';
      } else {
        alert("장바구니를 불러오지 못했습니다.");
      }
    });

  const clearBtn = document.getElementById("clear-cart");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearCart().catch((err) => {
        console.error(err);
        alert("장바구니 비우기에 실패했습니다.");
      });
    });
  }
});