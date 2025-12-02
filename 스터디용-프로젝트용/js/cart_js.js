const USER_ID = 1; // 임시 유저

// 1. 장바구니 목록 불러오기
async function loadCart() {
  const res = await fetch(`/api/cart/${USER_ID}`);
  if (!res.ok) throw new Error("장바구니 조회 실패");

  const items = await res.json();
  renderCart(items);
}

function renderCart(items){
    const tbody = document.querySelector("#cart tbody");
  const totalEl = document.getElementById("total-price");

  tbody.innerHTML = "";
  let total = 0;

  if (!items.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="3">장바구니가 비어 있습니다.</td>`;
    tbody.appendChild(tr);
    totalEl.innerText = "총 합계 : 0원";
    return;
  }

  items.forEach((item) => {
    total += Number(item.total);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.product_name}</td>
      <td>${item.quantity}</td>
      <td>${Number(item.total).toLocaleString()}원</td>
    `;
    tbody.appendChild(tr);
  });

  totalEl.innerText = `총 합계 : ${total.toLocaleString()}원`;
}
// 3. 장바구니 전체 비우기
async function clearCart() {
  try {
    // 현재 장바구니 목록 가져오기
    const res = await fetch(`/api/cart/${USER_ID}`);
    if (!res.ok) throw new Error("장바구니 조회 실패");

    const items = await res.json();

    // 비울 게 없으면 그냥 리턴
    if (!items.length) {
      alert("이미 장바구니가 비어 있습니다.");
      return;
    }

    // 각 항목에 대해 DELETE 요청
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
  const cartTable = document.getElementById("cart");
  if (!cartTable) return; // cart.html 이 아니면 아무 것도 안 함

  loadCart().catch((err) => {
    console.error(err);
    alert("장바구니를 불러오지 못했습니다.");
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