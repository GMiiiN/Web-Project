if (!localStorage.getItem("user")){ // 초기 데이터가 없을 때만
    const user = {
        name : "김지민",
        address : "서울특별시 성북구 삼선동 삼선교로16길 116 한성대학교 우촌관 102호",
        cart : [
            { name: "후드티", price: 50000, quantity: 1, img: "../product/cloth.jpg" },
            { name: "옷2",   price: 35000, quantity: 2, img: "../product/cloth2.jpg" }
        ]
    };
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("cart", JSON.stringify(user.cart));
}