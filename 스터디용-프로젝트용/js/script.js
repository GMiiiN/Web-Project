const newArrivals = [ 
  { id: 101, name: "반팔 티셔츠", price: 20000, alt: "top", imgUrl: "../product/white_T-shirt.jpg" },
  { id: 102, name: "반바지", price: 35000, alt: "bottom", imgUrl: "../product/Short_pants.jpg" },
  { id: 103, name: "운동화", price: 43000, alt: "shoes", imgUrl: "../product/Shoes.jpg" },
  { id: 104, name: "후드티", price: 60000, alt: "top", imgUrl: "../product/Blue_Hood.jpg" },
];

const weeklyBest = [
  { id: 201, name: "검정색 스웨터", price: 60000, alt: "top", imgUrl: "../product/Sweater.jpg", }, // 이미지 경로는 실제로 있는 파일로 변경하세요
  { id: 202, name: "검정색 모자", price: 35000, alt: "cap", imgUrl: "../product/Black_cap.jpg",},
  { id: 203, name: "흰색 셔츠", price: 30000, alt: "top", imgUrl: "../product/White_shirt.jpg",},
  { id: 204, name: "와이드 청바지", price: 40000, alt: "bottom", imgUrl: "../product/Wide_pants.jpg"}
];

const bestSeller = [
  { id: 301, name: "베스트셀러 자켓", price: 90000, alt: "outer", imgUrl: "../product/best_jacket.jpg" },
  { id: 302, name: "베스트셀러 셔츠", price: 30000, alt: "top", imgUrl: "../product/best_shirt.jpg" },
  { id: 303, name: "베스트셀러 바지", price: 40000, alt: "bottom", imgUrl: "../product/best_pants.jpg" },
  { id: 304, name: "베스트셀러 가방", price: 70000, alt: "bag", imgUrl: "../product/best_bag.jpg", }, 
];

const allProducts = [...newArrivals, ...weeklyBest, ...bestSeller];


// 각 객체배열로 저장된 상품들을 화면에 삽입
function renderProducts() {
    
  // [1] 상품 목록(list)과 HTML 컨테이너 ID(containerId)를 받아서 처리하는 범용 함수
    const renderSection = (productList, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return; 

        let htmlContent = '';
        productList.forEach(function (product) {
            // 상품을 표시하는 HTML 템플릿
            htmlContent += `
                <article data-product-id="${product.id}">
                    <a href="detail.html?id=${product.id}"> 
                        <img src="${product.imgUrl}" alt="${product.alt}">
                    </a>
                    
                    <p class="price">${product.price.toLocaleString()}원</p>
                    
                    <button onclick="addToCart(${product.id})">장바구니</button>
                </article>
            `;
        });
        
        // 기존 제목/부제목을 유지하고, 그 뒤에 상품 목록을 추가
        container.innerHTML += htmlContent; 
    };

    // [2] 정의된 범용 함수를 사용하여 세 섹션을 모두 렌더링
    renderSection(newArrivals, 'new-arrivals-container');
    renderSection(weeklyBest, 'weekly-best-container');
    renderSection(bestSeller, 'best-seller-container');
}

let cartItems = [];

function addToCart(productId) {

    const productToAdd = allProducts.find(product => product.id === productId);

    if (productToAdd) {
      // 2. 찾은 상품 객체를 cartItems 배열에 추가
      cartItems.push(productToAdd);

      console.log(
        `상품 ID ${productId} (${productToAdd.name}) 장바구니에 담김.`
      );
      console.log("현재 장바구니 상태:", cartItems);

      // 사용자에게 알림
      alert(`${productToAdd.name} 장바구니 담기 성공!`);
    }
}

// 이미지 누르면 나오는 상세 페이지
// detail.html 에서 ?id=101 식으로 열면 해당 상품을 찾아 이미지/정보를 채워줌
function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const idStr = params.get('id');
  if (!idStr) return; // id 없으면 아무 것도 안 함

  const productId = parseInt(idStr, 10);
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  // product-info 요소가 있으면 이름/가격/버튼 업데이트
  const info = document.getElementById('product-info');
  if (info) {
    info.innerHTML = `
      <h1>${product.name}</h1>
      <p>가격: ${product.price.toLocaleString()}원</p>
      <button id="add-to-cart-detail">장바구니 담기</button>
    `;
    const addBtn = document.getElementById('add-to-cart-detail');
    if (addBtn) addBtn.addEventListener('click', () => addToCart(product.id));
  }

  // product-gallery가 있으면 이미지 한 장 표시 (원하면 여러장으로 확장 가능)
  const gallery = document.getElementById('product-gallery');
  if (gallery) {
    // 빈 <img>를 직접 생성해서 넣음 (기존 HTML 구조 유지)
    gallery.innerHTML = '';
    const img = document.createElement('img');
    img.src = product.imgUrl;
    img.alt = product.alt || product.name;
    img.style.width = '300px';
    img.style.height = 'auto';
    img.style.borderRadius = '8px';
    gallery.appendChild(img);
  }
}