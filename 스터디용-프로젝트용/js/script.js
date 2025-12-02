const USER_ID = 1; // 이름 통일

let allProducts = [];

//DB에서 상품목록 가져오기
async function fetchProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) {
    throw new Error("상품 목록 가져오기 실패");
  }
  allProducts = await res.json();
}

const resolveImage = (path = "") => {
  if (!path) return "../product/default.jpg";
  if (path.startsWith("../")) return path;
  if (path.startsWith("/")) return `..${path}`; // /product/…
  return `../${path}`;
};

const renderSection = (productList, containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!productList || !productList.length) {
    container.innerHTML = `<p class="empty">곧 업데이트됩니다.</p>`;
    return;
  }

  const fmt = (n) => Number(n || 0).toLocaleString();
  const html = productList.map(p => `
      <article data-product-id="${p.id}">
          <a href="/detail?id=${p.id}">
              <img src="${resolveImage(p.main_image)}" alt="${p.name}">
          </a>
          <h3 class="product-name">${p.name ?? "상품"}</h3>
          <p class="price">${fmt(p.price)}원</p>
          <button type="button" onclick="addToCart(${p.id})">장바구니</button>
      </article>
  `).join("");
  container.innerHTML = html;
};

function renderProducts() {
  if (!allProducts.length) return;
  const newArrivals = allProducts.slice(0, 4);
  const weeklyBest = allProducts.slice(4, 8);
  const bestSeller = allProducts.slice(8, 12);

  renderSection(newArrivals, "new-arrivals-container");
  renderSection(weeklyBest, "weekly-best-container");   // 실제 id에 맞춤
  renderSection(bestSeller, "best-seller-container");
}

// 장바구니 추가
async function addToCart(productId) {
  if (!USER_ID) {
    alert("로그인 후 이용해 주세요.");
    return;
  }
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: USER_ID,
        product_id : productId,
        quantity: 1,
      }),
    });
    if (!res.ok) throw new Error("장바구니 추가 실패");
    alert("장바구니에 담았습니다.")
  } catch (err) {
    console.error(err);
    alert("장바구니 담기에 실패했습니다.")
  }
}

window.addToCart = addToCart;

// 주문 생성
async function createOrder() {
  const body = { user_id: USER_ID, total_price: currentTotalPrice };
  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("주문 생성 실패");
  return res.json(); // message만 쓰면 됨
}

// index 페이지에서만 실행되도록 설정
document.addEventListener("DOMContentLoaded", async () => {
  const listSection = document.getElementById("new-arrivals-container");
  if (!listSection) return; // index가 아니면 아무 것도 안 함

  try {
    await fetchProducts();
    renderProducts();
  } catch (err) {
    console.error(err);
    alert("상품 목록을 불러오지 못했습니다.");
  }
});