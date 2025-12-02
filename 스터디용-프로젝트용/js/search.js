document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("search-form");
    if (!form) return;

    const input = document.getElementById("searchInput");
    const emptyState = document.getElementById("results-empty");
    const grid = document.getElementById("results-grid");
    let currentUser = null;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        executeSearch().catch((err) => {
            console.error(err);
            alert("검색에 실패했습니다.");
        });
    });

    grid.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-product-id]");
        if (!button) return;
        const productId = Number(button.dataset.productId);
        addToCart(productId).catch((err) => {
            console.error(err);
            alert("장바구니 담기에 실패했습니다.");
        });
    });

    fetchCurrentUser();

    async function fetchCurrentUser() {
        try {
            const res = await fetch("/api/me");
            if (!res.ok) return;
            const data = await res.json();
            if (data.loggedIn) {
                currentUser = data.user;
            }
        } catch (err) {
            console.error("세션 확인 실패", err);
        }
    }

    const resolveImage = (path = "") => {
        if (!path) return "../product/default.jpg";
        if (path.startsWith("../")) return path;
        if (path.startsWith("/")) return `..${path}`;
        return `../${path}`;
    };

    async function executeSearch() {
        const keyword = input.value.trim();

        if (!keyword) {
            showEmpty("검색어를 입력하세요.");
            return;
        }

        const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
        if (!res.ok) throw new Error("SEARCH_FAIL");
        const data = await res.json();

        if (!data.length) {
            showEmpty(`'${keyword}'에 대한 검색 결과가 없습니다.`);
            return;
        }

        const fmt = (n) => Number(n || 0).toLocaleString();
        grid.innerHTML = data.map((item) => `
            <article class="result-card" data-product-id="${item.id}">
                <a href="/detail?id=${item.id}">
                    <img src="${resolveImage(item.main_image)}" alt="${item.name}">
                </a>
                <h3>${item.name}</h3>
                <p class="price">${fmt(item.price)}원</p>
                <div class="actions">
                    <a href="/detail?id=${item.id}">자세히 보기</a>
                    <button type="button" data-product-id="${item.id}">장바구니</button>
                </div>
            </article>
        `).join("");

        grid.hidden = false;
        emptyState.hidden = true;
    }

    function showEmpty(message) {
        grid.hidden = true;
        grid.innerHTML = "";
        emptyState.hidden = false;
        emptyState.textContent = message;
    }

    async function addToCart(productId) {
        if (!currentUser) {
            alert("로그인 후 이용해 주세요.");
            window.location.href = "/login";
            return;
        }

        const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        if (!res.ok) throw new Error("ADD_CART_FAIL");
        alert("장바구니에 담았습니다.");
    }
});
