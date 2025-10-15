const savedUser = JSON.parse(localStorage.getItem('user') || '{}'); 
// 로컬 스토리지에서 user 불러오기

// 초기에 user의 정보대로 페이지 출력. + 장바구니 내용물 추가해야함
document.addEventListener("DOMContentLoaded", function(){
    const userName = document.getElementById("user-name");
    const userAddress = document.getElementById("user-address");
    
    userName.textContent = savedUser.name;
    userAddress.textContent = savedUser.address;

    // 주소변경
    const CAB = document.getElementById("changeAddressB"); // Change Address Button
    if(CAB){
        CAB.addEventListener("click", function(e){
            e.preventDefault();
            const features = "width=500,height=320,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes";
            const popup = window.open("address-popup.html", "addressPopup", features);
            if(!popup)
                alert("팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.")
        });
    }

    renderCart();
    renderMoney();
});
// 팝업에서 보낸 새 주소를 받아 화면에 반영
window.addEventListener("message", function(e){
    const data = e.data;
    if(!data || data.type !== "ADDRESS_UPDATE")
        return;
    const userAddress = document.getElementById("user-address");
    userAddress.textContent = data.address;
})

// 장바구니 상품 목록을 페이지에 출력
function renderCart() {
    const list = document.getElementById("product-list");
    if(!list)
        return;

    //user.cart 우선, 없으면 cart 키 호환
    const cart = (savedUser && Array.isArray(savedUser.cart))
        ? savedUser.cart
        : JSON.parse(localStorage.getItem("cart") || "[]");

    list.innerHTML = ""; // 원래 있던 샘플 제거
    const frag = document.createDocumentFragment();
    const fmt = function(n) { // 숫자에 콤마 넣기
        return Number(n || 0).toLocaleString("ko-KR")
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "product-info-row"

        const imgBox = document.createElement("div");
        imgBox.className = "product-img";
        const img = document.createElement("img");
        img.src = item.img;
        img.alt = item.name || "상품 이미지";
        imgBox.appendChild(img);

        const info = document.createElement("div");
        info.className = "product-info";

        const title = document.createElement("div");
        title.textContent = item.name || "상품";

        const desc = document.createElement("p");
        // 데이터에 desc가 없으므로 가격/수령을 설명으로 표기
        desc.textContent = item.desc ? item.desc : `가격 ${fmt(item.price)}원 · 수량 ${item.quantity || 1}개`;

        info.appendChild(title);
        info.appendChild(desc);
        row.appendChild(imgBox);
        row.appendChild(info);
        frag.appendChild(row);
    });
    list.appendChild(frag);
}

// 합계 계산
function calTotals(cart){
    let subtotal = 0;
    let count = 0;
    for (const it of cart){
        const qty = Number(it.quantity) || 1;
        const price = Number(it.price) || 0;
        subtotal += price * qty;
        count += qty;
    }
    return {subtotal, count};
}

// 결재 총 금액 페이지에 출력
function renderMoney(){
    const cart = (savedUser && Array.isArray(savedUser.cart)) ? savedUser.cart : JSON.parse(localStorage.getItem("cart") || "[]")

    const {subtotal, count} = calTotals(cart);
    const fmt = function(n){
        return Number(n || 0).toLocaleString("ko-KR");
    }
    const map = [
        ["total-price", `${fmt(subtotal)}원`], // 총 결재 금액
        ["total-count", `${count}개`], // 총 수량
        ["subtotal-price", `${fmt(subtotal)}`] // 소계
    ];

    let updated = false;
    map.forEach(([id, text]) => {
        const el = document.getElementById(id);
        if(el) {
            el.textContent = text;
            updated = true;
        }
    });
    if(!updated){
        console.log("[합계]", {subtotal, count});
    }
}

//결재 정보 넘기기 (결재하기)
function getSelectedValue(name){ // 선택한 라디오 가져오기
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
}

//주문 버튼 핸들러 등록
document.addEventListener("DOMContentLoaded", function(){
    const orderBtn = document.getElementById("order-button");
    if(!orderBtn)
        return;

    orderBtn.addEventListener("click", async function(){
        // 결재 정보 받기
        const payment = getSelectedValue("payment"); // 결재방식
        const receipt = getSelectedValue("receipt"); // 예 아니요
        // 주소
        const address = (document.getElementById("user-address")?.textContent || "").trim();

        // 장바구니와 합계
        const cart = (savedUser && Array.isArray(savedUser.cart)) ? savedUser.cart : JSON.parse(localStorage.getItem("cart")|| "[]");

        const {subtotal} = calTotals(cart);

        // 기본
        if (!payment){
            alert("결제 수단을 선택해 주세요");
            return;
        }
        if (!receipt){
            alert("현금영수증 발급 여부를 선택해 주세요");
            return;
        }
        if (!cart.length || subtotal <= 0){
            alert("장바구니가 비어 있습니다.");
            return;
        }

        const order = { 
            id: "ORD-" + Date.now(),
            payment, // 결재방식
            cashReceipt: receipt === "yes", // 현금영수증 발행 여부
            amount : subtotal, // 금액 합계
            address, // 주소
            items: cart.map(i => ({ name:i.name, price:i.price, quantity:i.quantity })),
            orderedAt: new Date().toISOString()
        };

        const orders = JSON.parse(localStorage.getItem("orders")||"[]");
        orders.push(order);
        localStorage.setItem("orders", JSON.stringify(orders));

        showOrderSuccess(order);
    });
});

// 주문 성공 메시지 출력
function showOrderSuccess(order){
    let box = document.getElementById("order-success");
    if(!box){
        box = document.createElement("div");
        box.id = "order-success";
        box.style.cssText = "margin:16px 0;padding:12px;border:1px solid #4caf50;background:#e8f8ec;color:#256330;border-radius:6px;font-size:0.95em;";
        const main = document.querySelector("main") || document.body;
        main.prepend(box);
    }
    box.textContent = `주문이 완료되었습니다. 주문번호: ${order.id} (총 결제금액: ${order.amount.toLocaleString("ko-KR")}원)`;
    alert(`주문 완료\n주문번호: ${order.id}\n결제금액: ${order.amount.toLocaleString("ko-KR")}원`);
    // 잠시 강조
    box.style.transition = "background 0.6s";
    box.style.background = "#c9f1d4";
    setTimeout(()=> box.style.background = "#e8f8ec", 50);
}