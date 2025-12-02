const User_ID = 1;

let currentCartItems = [];
let currentTotalPrice = 0;

//1. order 페이지에서 사용할 장바구니 정보 불러오기
async function loadCartForOrder(){
    const res = await fetch(`/api/cart/${USER_ID}`);
    if(!res.ok) throw new Error("장바구니 조회 실패");

    const items = await res.json();
    currentCartItems = items;

    renderOrderCart(items);
}
//2. 주문 페이지에 장바구니/금액 표시
function renderOrderCart(items){
    const listDiv = document.getElementById("product-list");
    const subtotalEl = document.getElementById("subtotal-price");
    const discountEl = document.getElementById("discount-price");
    const totalEl = document.getElementById("total-price");

    listDiv.innerHTML = "";
  let subtotal = 0;

  if (!items.length) {
    listDiv.innerHTML = "<p>장바구니가 비어 있습니다.</p>";
    subtotalEl.innerText = "0원";
    discountEl.innerText = "0원";
    totalEl.innerText = "0원";
    currentTotalPrice = 0;
    return;
  }

  items.forEach((item) => {
    const lineTotal = Number(item.total);
    subtotal += lineTotal;

    const p = document.createElement("p");
    p.textContent = `${item.product_name} x ${item.quantity} = ${lineTotal.toLocaleString()}원`;
    listDiv.appendChild(p);
  });

  const discount = 0; // 아직 할인 로직 없음

  currentTotalPrice = subtotal - discount;

  subtotalEl.innerText = `${subtotal.toLocaleString()}원`;
  discountEl.innerText = `${discount.toLocaleString()}원`;
  totalEl.innerText = `${currentTotalPrice.toLocaleString()}원`;
}

//3. 주문 생성 요청
async function createOrder(){
    const body = {
        user_id: USER_ID,
        total_price: currentTotalPrice,
    };

    const res = await fetch("/api/order", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("장바구니 조회 실패");

    const items = await res.json();
    await Promise.all(
        items.map((item) => {
            fetch(`/api/cart/${item.cart_id}`, {method: "DELETE"})
        })
    );
}

//4. 주문 후 장바구니 비우기
async function clearCartAfterOrder() {
    const res = await fetch(`/api/cart/${USER_ID}`);
    if (!res.ok) throw new Error("장바구니 조회 실패");
    const items = await res.json();
    await Promise.all( 
        items.map((item) =>
        fetch(`/api/cart/${item.cart_id}`, { method: "DELETE" })
        )
    );
}

//5. 주문하기 버튼 처리
async function handleOrderSubmit(e) {
    e.preventDefault();

    if(!currentCartItems.length){
        alert("장바구니가 비어있습니다.")
        return;
    }

    try{
        await createOrder();
        await clearCartAfterOrder();

        alert("주문이 완료되었습니다.")
        // 주문 완료 후 메인으로 이동
        window.location.href = "/";
    }
    catch(err){
        console.error(err);
        alert("주문 처리 실패했습니다.");
    }
}
// 6. order.html 에서만 실행
document.addEventListener("DOMContentLoaded", () => {
    const purchaseBox = document.getElementById("purchase-box");
    if (!purchaseBox) return; // order.html 이 아니면 아무 것도 안 함

    loadCartForOrder().catch((err) => {
        console.error(err);
        alert("주문 정보를 불러오지 못했습니다.");
    });

    const orderForm = purchaseBox.querySelector("form");
    if (orderForm) {
        orderForm.addEventListener("submit", (e) => {
        handleOrderSubmit(e).catch((err) => {
            console.error(err);
            alert("주문 처리에 실패했습니다.");
        });
    });
    }
});