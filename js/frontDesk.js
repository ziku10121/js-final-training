const api_path = "leoli35";
const baseUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`;

const filterSelect = document.querySelector(".productSelect");
const productsList = document.querySelector(".productWrap");
const cartsList = document.querySelector(".cartWrap");
const discardAllBtn = document.querySelector(".discardAllBtn");
const totalText = document.querySelector(".total");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
const form = document.querySelector(".orderInfo-form");
// 預定資料
const nameText = document.querySelector("#customerName");
const telText = document.querySelector("#customerPhone");
const emailText = document.querySelector("#customerEmail");
const addressText = document.querySelector("#customerAddress");
const paymentText = document.querySelector("#tradeWay");

let productData = []; // 產品資料
let filterProductData = []; // 已篩選產品資料
let payment = 0;
let debounceTimer; // 更新項目數量防抖計時器

// string to money
function convertCurrency(number) {
  return number.toLocaleString();
}

// 取得產品資訊
async function getProductsAPI() {
  let url = `${baseUrl}/products`;

  try {
    let res = await axios.get(url);

    if (res.status) {
      let data = res.data;
      productData = data.products;
      renderProducts(productData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}
// 篩選產品
function filterProducts() {
  let filterCategory = filterSelect.value;

  if (filterCategory === "全部") {
    filterProductData = productData;
  } else {
    filterProductData = productData.filter(
      (item) => item.category === filterCategory
    );
  }
  renderProducts(filterProductData);
}
// 渲染產品項目
function renderProducts(data) {
  productsList.innerHTML = [];
  data.forEach((product) => {
    let origin_price = convertCurrency(product.origin_price);
    let price = convertCurrency(product.price);

    // 設置內部HTML
    productsList.innerHTML += `
      <li class="productCard" data-id=${product.id}>
        <h4 class="productType">${product.category}</h4>
        <img
          src="${product.images}"
          alt=""
        />
        <a href="#" class="addCardBtn">加入購物車</a>
        <h3>${product.title}</h3>
        <del class="originPrice">NT$${origin_price}</del>
        <p class="nowPrice">NT$${price}</p>
      </li>
    `;
  });
}

let cartData = []; // 當前我的購物車商品資料

// 取得購物車資訊API
async function getCartsAPI() {
  let url = `${baseUrl}/carts`;

  try {
    let res = await axios.get(url);

    if (res.status) {
      let data = res.data;
      cartData = data.carts;
      calculate(data.finalTotal);
      renderCarts(cartData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 新增購物車API
async function addCartAPI(id, qty) {
  let url = `${baseUrl}/carts`;

  let data = {
    data: {
      productId: id,
      quantity: qty,
    },
  };
  try {
    let res = await axios.post(url, data);

    if (res.status) {
      let data = res.data;
      cartData = data.carts;
      calculate(data.finalTotal);
      renderCarts(cartData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 刪除單筆購物車某項產品
async function deleteCartAPI(id) {
  let url = `${baseUrl}/carts/${id}`;

  try {
    let res = await axios.delete(url);

    if (res.status) {
      let data = res.data;
      cartData = data.carts;
      calculate(data.finalTotal);
      renderCarts(cartData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 刪除所有購物車項目
async function deleteAllCartAPI() {
  let url = `${baseUrl}/carts`;

  try {
    let res = await axios.delete(url);

    if (res.status) {
      let data = res.data;
      cartData = data.carts;
      calculate(data.finalTotal);
      renderCarts(cartData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 更新購物車項目數量
async function updateCartAPI(id, qty) {
  let url = `${baseUrl}/carts`;

  let data = {
    data: {
      id,
      quantity: qty,
    },
  };
  try {
    let res = await axios.patch(url, data);

    if (res.status) {
      let data = res.data;
      cartData = data.carts;
      calculate(data.finalTotal);
      renderCarts(cartData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 更新購物車數量防抖
function updateCartQuantity(cartQty) {
  const cartId = cartQty.closest(".cart-item").dataset.id;
  const newQuantity = Number(cartQty.value);

  updateCartAPI(cartId, newQuantity);
}

//渲染購物車畫面
function renderCarts(data) {
  cartsList.innerHTML = "";

  data.forEach((cart) => {
    let price = convertCurrency(cart.product.price);
    let sub_total = convertCurrency(cart.product.price * cart.quantity);

    cartsList.innerHTML += `
      <tr class="cart-item" data-id=${cart.id}>
        <td>
          <div class="cardItem-title">
            <img src="${cart.product.images}" alt="" />
            <p>${cart.product.title}</p>
          </div>
        </td>
        <td>NT$${price}</td>
        <td>
          <input class="qty" type="number" min="1" value="${cart.quantity}">
        </td>
        <td>NT$${sub_total}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons"> clear </a>
        </td>
      </tr>
    `;
  });
}
// 計算總金額
function calculate(total) {
  total = convertCurrency(total);
  totalText.textContent = `NT$${total}`;
}

// 更新購物車項目數量
async function orderAPI(user) {
  let url = `${baseUrl}/orders`;

  let data = {
    data: {
      user,
    },
  };
  try {
    let res = await axios.post(url, data);

    if (res.status) {
      form.reset();
      alert("成功送出訂單!");
      getCartsAPI();
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

const constraints = {
  姓名: {
    presence: { message: "必填" }, // 必填
    length: { maximum: 50, message: "用戶名不超過 50 個字符" }, // 不超過 50 個字符
  },
  電話: {
    presence: { message: "必填" },
  },
  Email: {
    presence: { message: "必填" },
    email: { message: "請提供有效的電子郵件地址" }, // 有效的電子郵件格式
  },
  寄送地址: {
    presence: { message: "必填" },
  },
};

function submitHandle() {
  let userInfo = {
    name: nameText.value,
    tel: telText.value,
    email: emailText.value,
    address: addressText.value,
    payment: paymentText.value,
  };

  let validationResult = validate(form, constraints);

  let errorNameMsg = nameText
    .closest(".orderInfo-inputWrap")
    .querySelector(".orderInfo-message");
  let errorTelMsg = telText
    .closest(".orderInfo-inputWrap")
    .querySelector(".orderInfo-message");
  let errorEmailMsg = emailText
    .closest(".orderInfo-inputWrap")
    .querySelector(".orderInfo-message");
  let errorAddressMsg = addressText
    .closest(".orderInfo-inputWrap")
    .querySelector(".orderInfo-message");

  errorNameMsg.textContent = "";
  errorTelMsg.textContent = "";
  errorEmailMsg.textContent = "";
  errorAddressMsg.textContent = "";

  if (validationResult) {
    if (validationResult["姓名"]) {
      errorNameMsg.textContent = validationResult["姓名"][0];
    }
    if (validationResult["電話"]) {
      errorTelMsg.textContent = validationResult["電話"][0];
    }
    if (validationResult["Email"]) {
      errorEmailMsg.textContent = validationResult["Email"][0];
    }
    if (validationResult["寄送地址"]) {
      errorAddressMsg.textContent = validationResult["寄送地址"][0];
    }
  } else {
    orderAPI(userInfo);
  }
}

// 產品篩選選單
filterSelect.addEventListener("change", function (e) {
  console.log(e.target.value);
  filterProducts();
});

// 產品 加入購物車 按鈕
productsList.addEventListener("click", function (e) {
  e.preventDefault();

  const addCardBtn = e.target.closest(".addCardBtn");
  if (addCardBtn) {
    const productCard = e.target.closest(".productCard");
    const productId = productCard.dataset.id;
    let productQty = 1;
    let filterProduct = cartData.filter(
      (cart) => cart.product.id === productId
    );

    if (filterProduct[0]) {
      productQty = filterProduct[0].quantity + 1;
    }

    addCartAPI(productId, productQty);
  }
});

// 單筆更新購物車產品數量
cartsList.addEventListener("input", function (e) {
  const cartQty = e.target.closest(".qty");

  if (cartQty) {
    console.log(cartQty.value);
    // 清除先前的 debounce 計時器
    clearTimeout(debounceTimer);

    // 設置新的計時器
    debounceTimer = setTimeout(function () {
      // 觸發 PATCH 請求
      updateCartQuantity(cartQty);
    }, 600); // 延遲 500 毫秒後觸發 API 請求
  }
});

// 單筆刪除購物車產品按鈕
cartsList.addEventListener("click", function (e) {
  e.preventDefault();

  const discardBtn = e.target.closest(".discardBtn");
  if (discardBtn) {
    const cartItem = e.target.closest(".cart-item");
    const cartId = cartItem.dataset.id;
    deleteCartAPI(cartId);
  }
});

// 全部刪除購物車產品按鈕
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();

  deleteAllCartAPI();
});

// 送出預定資料
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  submitHandle();
});

getProductsAPI();
getCartsAPI();
