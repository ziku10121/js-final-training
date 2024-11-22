const UID = "TxMiCA1O51WN94suBr9Wb8BH0ws2";
const api_path = "leoli35";
const baseUrl = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}`;

const orderList = document.querySelector(".orderPage-content");
const discardAllBtn = document.querySelector(".discardAllBtn");

let orderData = [];

// timestamp to date
function formatDate(time) {
  const date = new Date(time * 1000);
  const formattedDate = date
    .toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "/");

  return formattedDate;
}

// 取得訂單資訊API
async function getOrderAPI() {
  let url = `${baseUrl}/orders`;

  try {
    let res = await axios.get(url, {
      headers: {
        Authorization: `${UID}`,
      },
    });

    if (res.status) {
      let data = res.data;
      orderData = data.orders;
      renderOrders(orderData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 修改訂單狀態API
async function editOrderStatusAPI(id, status) {
  let url = `${baseUrl}/orders`;

  let data = {
    data: {
      id: id,
      paid: status,
    },
  };
  try {
    let res = await axios.put(url, data, {
      headers: {
        Authorization: `${UID}`,
      },
    });

    if (res.status) {
      let data = res.data;
      orderData = data.orders;
      renderOrders(orderData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 刪除所以訂單資料API
async function deleteAllOrderAPI() {
  let url = `${baseUrl}/orders`;

  try {
    let res = await axios.delete(url, {
      headers: {
        Authorization: `${UID}`,
      },
    });

    if (res.status) {
      let data = res.data;
      orderData = data.orders;
      renderOrders(orderData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 刪除所以訂單資料API
async function deleteSingleOrderAPI(id) {
  let url = `${baseUrl}/orders/${id}`;

  try {
    let res = await axios.delete(url, {
      headers: {
        Authorization: `${UID}`,
      },
    });

    if (res.status) {
      let data = res.data;
      orderData = data.orders;
      renderOrders(orderData);
    } else {
      console.error("status error!");
    }
  } catch (err) {
    console.error(err);
  }
}

// 渲染訂單表畫面
function renderOrders(data) {
  orderList.innerHTML = "";
  if (data.length > 0) {
    data.forEach((order) => {
      let orderDate = formatDate(order.updatedAt);
      let paid = order.paid ? "已處理" : "未處理";

      let productList = "";

      order.products.forEach((product) => {
        productList += `
          <div>${product.title}</div>
        `;
      });

      let orderItem = `
        <tr data-id=${order.id}>
            <td>${order.id}</td>
            <td>
              <p>${order.user.name}</p>
              <p>${order.user.tel}</p>
            </td>
            <td>${order.user.address}</td>
            <td>${order.user.email}</td>
            <td>
              <p>${productList}</p>
            </td>
            <td>${orderDate}</td>
            <td class="orderStatus">
              <a href="#">${paid}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn" value="刪除">
            </td>
        </tr>
      `;

      orderList.innerHTML += orderItem;
    });
  }

  if (data.length === 0) {
    orderList.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center;">無資料</td>
      </tr>
    `;
  }

  renderCategoryPiChart(data);
  renderProductPiChart(data);
}

// 渲染全產品類別營收圖表
function renderCategoryPiChart(data) {
  let productData = [];
  let categoryData = {};

  data.forEach((order) => {
    order.products.forEach((product) => {
      productData.push(product);
    });
  });

  productData.forEach(function (product) {
    categoryData[product.category] =
      (categoryData[product.category] || 0) + product.price;
  });

  let chartData = Object.entries(categoryData);

  renderPieChart("#categoryChart", chartData);
}

// 渲染全品項產營收圖表
function renderProductPiChart(data) {
  let productData = [];
  let product3CData = {};

  data.forEach((order) => {
    order.products.forEach((product) => {
      productData.push(product);
    });
  });

  productData.forEach(function (product) {
    product3CData[product.title] =
      (product3CData[product.title] || 0) + product.price;
  });

  let chartData = Object.entries(filterProductData(product3CData));

  renderPieChart("#productChart", chartData);
}

// 渲染圓餅圖表
function renderPieChart(chartIdElement, data) {
  chart = c3.generate({
    bindto: chartIdElement, // HTML 元素綁定
    data: {
      type: "pie",
      columns: data,
      colors: {
        床架: "#DACBFF",
        收納: "#9D7FEA",
        窗簾: "#5434A7",
        其他: "#301E5F",
      },
    },
  });
}

// 篩選出前三名營收品項，其他 4~8 名都統整為「其它」
function filterProductData(data) {
  let sortData = Object.entries(data).sort((a, b) => {
    return b[1] - a[1];
  });

  // 挑出前三名
  const topThree = sortData.slice(0, 3); // 將其他名次歸為 "其他"
  const others = sortData.slice(3);
  // 計算 "其他" 的總值
  const othersTotal = others.reduce((sum, [_, value]) => sum + value, 0);

  // 組建結果物件
  const result = {};

  // 將前三名加入結果物件
  topThree.forEach(([key, value]) => {
    result[key] = value;
  });

  // 將 "其他" 加入結果物件
  if (othersTotal > 0) {
    result["其他"] = othersTotal;
  }

  return result;
}

// 表格相關點擊事件
orderList.addEventListener("click", function (e) {
  e.preventDefault();

  let id = e.target.closest("tr").dataset.id;
  const orderStatusBtn = e.target.closest(".orderStatus>a");
  const deleteBtn = e.target.closest(".delSingleOrder-Btn");

  //點擊訂單狀態切換事件
  if (orderStatusBtn) {
    let status = orderStatusBtn.text === "未處理" ? true : false;
    editOrderStatusAPI(id, status);
  }
  //單筆訂單資料刪除事件
  if (deleteBtn) {
    deleteSingleOrderAPI(id);
  }
});

// 全部訂單刪除事件
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();

  deleteAllOrderAPI();
});

getOrderAPI();
