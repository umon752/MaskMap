'use strict'
/**
 * DOM
 */
const county = document.querySelector('#countyId');
const town = document.querySelector('#townId');
const sidebarBtn = document.querySelector('#btnId');
const sidebar = document.querySelector('#sidebarBodyId');
const search = document.querySelector('#searchBtnId');
// 初始顯示的地區名稱
const countyInit = "臺北市";



/**
 * Model
 */
const data = [];
let map = {};

/** global L (marker群組管理) **/
const markers = new L.MarkerClusterGroup();


/**
 * init
 */



/** 印出今天日期 **/
const getDate = () => {
    const date = document.querySelector('#dateId');
    const today = new Date();
    // const today1 = new Date().getDay;

    // 月份，判斷數字小於9前面要加0
    const month = function () {
        const value = today.getMonth() + 1;
        if (value > 9) {
            return value;
        }
        return `0${value}`;
    }();

    // 日期，判斷數字小於9前面要加0
    const day = function () {
        let value = today.getDate();
        if (value > 9) {
            return value;
        }
        return `0${value}`;
    }();

    // 今天日期組字串
    const dateStr = `${today.getFullYear()}-${month}-${day}`;
    date.textContent = dateStr;
};



/** 印出星期幾與身分證字號單雙數 **/
const getWeekIdCard = () => {
    const week = document.querySelector('#weekId');
    const idCard = document.querySelector('#cardId');
    const today = new Date();

    switch (true) {
        case today.getDay() === 1:
            week.textContent = '星期一';
            idCard.textContent = '1,3,5,7,9';
            break;
        case today.getDay() === 2:
            week.textContent = '星期二';
            idCard.textContent = '0,2,4,6,8';
            break;
        case today.getDay() === 3:
            week.textContent = '星期三';
            idCard.textContent = '1,3,5,7,9';
            break;
        case today.getDay() === 4:
            week.textContent = '星期四';
            idCard.textContent = '0,2,4,6,8';
            break;
        case today.getDay() === 5:
            week.textContent = '星期五';
            idCard.textContent = '1,3,5,7,9';
            break;
        case today.getDay() === 6:
            week.textContent = '星期六';
            idCard.textContent = '0,2,4,6,8';
            break;
        default:
            week.textContent = '星期日';
            idCard.textContent = '不限制';
            break;
    }
};



/** 印縣市名稱在下拉選單內 **/
const upDataCounty = (importData) => {
    let str = '';
    let countyList = [];

    importData.forEach((element) => {
        countyList.push(element.properties.county);
    });

    let countyArray = [];
    countyList.forEach(function (value) {
        if (countyArray.indexOf(value) === -1) {
            countyArray.push(value);
        }
    });

    // 刪除countyArray第二筆的空字串
    countyArray.splice(1, 1);
    // 刪除"臺北市"
    countyArray.forEach(function (item, index) {
        if (item === countyInit) {
            countyArray.splice(index, 1);
        }
    })
    // 新增"臺北市"為countyArray第一筆
    countyArray.splice(0, 0, countyInit);
    countyArray.forEach((element) => {
        str += `
        <option value="${element}">
        ${element}</option>`;
    });

    county.innerHTML = str;
};



/** 印區域名稱在下拉選單內 **/
const upDataTown = (importData) => {
    let str = '<option value="全部地區">全部地區</option>';
    let townList = [];

    data.forEach((element) => {
        if (importData === element.properties.county) {
            townList.push(element.properties.town);
        }
    });

    let townArray = [];
    townList.forEach(function (value) {
        if (townArray.indexOf(value) === -1) {
            townArray.push(value);
        }
    });

    townArray.forEach((element) => {
        str += `
        <option value="${element}">
        ${element}</option>`;
    });

    town.innerHTML = str;
};



/** 在sidebar上印出data資料 **/
const upDataSidebar = (importData) => {
    let str = '';

    importData.forEach((element) => {
        // 背景顏色(大人)
        const bgAdult = (() => {
            if (element.properties.mask_adult === 0) {
                return 'bg-info';
            }
            return 'bg-main';
        })();

        // 背景顏色(兒童)
        const bgChild = (() => {
            if (element.properties.mask_child === 0) {
                return 'bg-info';
            }
            return 'bg-secondary';
        })();

        // 把值帶入印出資料
        str += `<div class="data__item">
                <div class="item__title">
                <h2 class="h2">${element.properties.name}</h2>
                <a class="fas fa-eye icon--view" id="pathId" href="#"
                data-lat = "${element.geometry.coordinates[1]}"
                data-lng = "${element.geometry.coordinates[0]}"></a>
                </div>
                <span class="h3">${element.properties.address}</span>
                <span class="h3">${element.properties.phone}</span>
                <span class="h3">${element.properties.note}</span>
                <span class="btn__block">
                    <div class="quantity__block ${bgAdult}">
                        <span class="h4">成人口罩</span>
                        <span class="h2">${element.properties.mask_adult}</span>
                    </div>
                    <div class="quantity__block ${bgChild}">
                        <span class="h4">兒童口罩</span>
                        <span class="h2">${element.properties.mask_child}</span>
                    </div>
                </span>
            </div>`;

    });

    sidebar.innerHTML = str;
};



// 抓取經緯度存在markerIcon
const markerOpen = (lat, lng) => {
    // 搜尋 markers 圖層下的子圖層
    markers.eachLayer((layer) => {
        // 抓取圖層的 經緯度
        // eslint-disable-next-line no-underscore-dangle
        const eachLat = layer._latlng.lat;
        // eslint-disable-next-line no-underscore-dangle
        const eachLng = layer._latlng.lng;
        // 如果與參數的經緯度相同，就抓取那個 layer
        if (eachLat === lat && eachLng === lng) {
            // zoomToShowLayer 這個是 MarkerClusterGroup 給的函式
            // 方法是調用 MarkerClusterGroup 下的子圖層
            // 打開 bindPopup 的 HTML
            markers.zoomToShowLayer((layer), () => layer.openPopup());
        }
    });
};

// 顯示markerIcon
const addMarker = (importData) => {
    importData.forEach((element) => {
        // 解構賦值寫法，宣告要從來源變數(element)接收解開的值之變數。
        // 等於element.properties.../element.geometry...
        const {
            geometry,
            properties
        } = element;
        // 判斷background-color
        const adultStockNoMore = (() => {
            if (properties.mask_adult === 0) {
                return 'bg-info';
            }
            return 'bg-main';
        })();
        const childStockNoMore = (() => {
            if (properties.mask_child === 0) {
                return 'bg-info';
            }
            return 'bg-secondary';
        })();
        // 判斷icon 顏色
        const iconColor = (() => {
            // 大人、小孩庫存都還有時，icon為綠色
            if (properties.mask_adult > 0 && properties.mask_child > 0) {
                return new L.Icon({
                    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                });
            }
            // 大人、小孩庫存都沒有時，icon為灰色
            if (properties.mask_adult === 0 && properties.mask_child === 0) {
                return new L.Icon({
                    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                });
            }
            // 大人、小孩庫存只要其中一個沒有時，icon為紅色
            return new L.Icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });
        })();
        // 套上marker
        markers.addLayer(
            // marker套上經緯度與顏色
            L.marker([geometry.coordinates[1], geometry.coordinates[0]], {
                icon: iconColor,
            }).bindPopup(
                `<div class="data__item popup--width">
        <h2 class="h2">${properties.name}</h2>
        <span class="h3">${properties.address}</span>
        <span class="h3">${properties.phone}</span>
        <span class="h3">${properties.note}</span>
        <span class="btn__block">
            <div class="quantity__block ${adultStockNoMore}">
                <span class="h4">成人口罩</span>
                <span class="h2">${properties.mask_adult}</span>
            </div>
            <div class="quantity__block ${childStockNoMore}">
                <span class="h4">兒童口罩</span>
                <span class="h2">${properties.mask_child}</span>
            </div>
        </span>
    </div>`),
        );
    });
    map.addLayer(markers);
};



/** 圖資Leaflet + OpenStreetMap **/
// 設定一個地圖，把地圖定位在#map這個div上，設定center座標、zoom縮放等級定在16
const buildMap = () => {
    map = L.map('map', {
        center: [25.047763, 121.517375],
        zoom: 16
    });
    // 將圖資資料放到#map這個div內
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // 使用 control.locate 套件
    L.control
        .locate({
            showPopup: false,
        })
        .addTo(map)
        .start();
};



/** 撈取遠端JSON資料 **/
(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
    xhr.send(null);

    xhr.onload = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // 以 JSON 解析字串轉為物件
            const json = JSON.parse(xhr.responseText);
            // 使用 forEach 迴圈 以抓出每筆資料 push 到 資料庫
            json.features.forEach((element) => data.push(element));

            // 取得今天日期
            getDate();
            getWeekIdCard();

            // sidebar預設值為臺北市全部資料
            const pharmacyData = data.filter(
                (element) => element.properties.county === countyInit
            );

            // 預設值為臺北市全部資料
            upDataSidebar(pharmacyData);
            upDataCounty(data);
            upDataTown(countyInit);

            // 創建地圖
            buildMap();
            // 地圖座標icon
            addMarker(data);

            // 顯示loading圖，資料onload完畢立即消失
            const loading = document.querySelector('.loading--bg');
            loading.setAttribute('style', 'display: none');
        };
    };
})();



/**
 * Controller
 */

/** 左側欄開闔效果sidebar-toggle **/
const toggle = (e) => {
    e.preventDefault();
    const hideSidebar = document.querySelector('.sidebar');
    const map = document.querySelector('.map');
    const phoneScreen = window.matchMedia("(max-width: 640px)");
    // 螢幕寬度小於等於640px時，將左側欄與地圖位移(操作Class)
    if (phoneScreen.matches) {
        hideSidebar.classList.toggle('show');
        map.classList.toggle('remove');
    } else {
        hideSidebar.classList.toggle('hide');
        map.classList.toggle('active');
    }
};



/** 縣市切換 **/
const selectArea = (e) => {
    let areaData = e.target.value;
    // 讀取data裡的county資料，符合當前選取的縣市名稱
    const pharmacyData = data.filter(
        (element) => element.properties.county === areaData
    );
    // 讀取符合當前選取的縣市，其第一筆資料的經緯度
    const lat = pharmacyData[0].geometry.coordinates[1];
    const lng = pharmacyData[0].geometry.coordinates[0];
    // 將當前選取的縣市名稱帶入，印出符合的地區名稱
    upDataTown(areaData);
    // 將當前選取的縣市資料帶入，印出符合的資料
    upDataSidebar(pharmacyData);
    // 將經緯度的值帶入，為被點擊時的第一筆定位資料(openPopup)
    markerOpen(lat, lng);
};



/** 區域切換 **/
const selectTown = (e) => {
    let townData = e.target.value;
    // 讀取data裡的town資料，符合當前選取的地區名稱
    const pharmacyData = data.filter(
        (element) => element.properties.town === townData
    );
    // 讀取符合當前選取的縣市，其第一筆資料的經緯度
    const lat = pharmacyData[0].geometry.coordinates[1];
    const lng = pharmacyData[0].geometry.coordinates[0];
    // 將當前選取的地區資料帶入，印出符合的資料
    upDataSidebar(pharmacyData);
    // 將經緯度的值帶入，為被點擊時的第一筆定位資料(openPopup)
    markerOpen(lat, lng);
};



/** 搜尋 **/
const searchAddress = (e) => {
    // 點擊button標籤
    if (e.target.nodeName !== 'BUTTON') {
        return;
    }
    const searchText = document.querySelector('#searchId').value;
    // 沒有輸入任何資料就會跳出視窗警示
    if (searchText === '') {
        alert('請輸入資料，無法搜尋空白。');
    } else {
        // 找出輸入的文字與地址相符的資料
        const pharmacyData = data.filter(
            (element) => element.properties.address.match(searchText),
        );
        // 將輸入的文字與地址相符的資料帶入，印出符合的資料
        upDataSidebar(pharmacyData);
    }

};



/** 查看此筆店家詳細資訊 **/
const viewStore = (e) => {
    if (e.target.id !== 'pathId') {
        return;
    }
    // 阻止元素默認的行為
    e.preventDefault();
    const lat = Number(e.target.dataset.lat);
    const lng = Number(e.target.dataset.lng);
    // 以資料庫為參數帶入
    // 找到被點擊的那筆定位座標，並顯示定位資料(openPopup)
    markerOpen(lat, lng);
};



sidebarBtn.addEventListener('click', toggle, false);
county.addEventListener('change', selectArea, false);
town.addEventListener('change', selectTown, false);
search.addEventListener('click', searchAddress, false);
sidebar.addEventListener('click', viewStore, false);