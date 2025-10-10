const savedUser = JSON.parse(localStorage.getItem('user')) || { cart: [] };
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
});
// 팝업에서 보낸 새 주소를 받아 화면에 반영
window.addEventListener("message", function(e){
    const data = e.data;
    if(!data || data.type !== "ADDRESS_UPDATE")
        return;
    const userAddress = document.getElementById("user-address");
    userAddress.textContent = data.address;
})


//요청사항이 직접입력일 때만 보이게끔

