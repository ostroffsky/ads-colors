const colorThief = new ColorThief();

function buildTable() {
/*    <tr className="item">
        <td className="item-img">
            <div className="item-img-w"><img src="1.jpg" alt="1"/></div>
        </td>
        <td className="item-img">
            <div className="item-img-w"><img src="1.jpg" alt="1"/></div>
        </td>
        <td className="item-img">
            <div className="item-img-w"><img src="1.jpg" alt="1"/></div>
        </td>
        <td className="item-result"></td>
        <td className="item-accent"></td>
    </tr>

   */

    var table = document.querySelector("table");
    for (var i = 1; i <= 13; i++) {
        table.appendChild(createTr(i));
    }
}

function createTr(num) {
    var tr = document.createElement("tr");
    tr.className = "item";

    tr.appendChild(createTd(num));
    tr.appendChild(createTd(num));
    tr.appendChild(createTd(num));

    var tdResult = document.createElement("td");
    tdResult.className = "item-result";
    tr.appendChild(tdResult);

    var tdAccent = document.createElement("td");
    tdAccent.className = "item-accent";
    tr.appendChild(tdAccent);

    return tr;
}

function createTd(num) {
    var td = document.createElement("td");
    td.className = "item-img";

    var div = document.createElement("div");
    div.className = "item-img-w";

    var faderDiv = document.createElement("div");
    faderDiv.className = "item-img-fader";

    var img = document.createElement("img");
    img.src = num + ".jpg";

    faderDiv.appendChild(img);
    div.appendChild(faderDiv);
    td.appendChild(div);

    return td;
}

function calculateColors() {
    const items = document.querySelectorAll('.item');
    items.forEach(value => {
        const img = value.querySelector('img');

        // Make sure image is finished loading
        if (img.complete) {
            console.log("img was complete");
            calculateColor(value, img);
        } else {
            img.addEventListener('load', function () {
                console.log("img inited via listener");
                calculateColor(value, img);
            });
        }

    });
}

function calculateColor(tr, img) {
    var color = [0, 0, 0];
    var palette = [];

    color = colorThief.getColor(img);
    palette = colorThief.getPalette(img, 10);

    tr.querySelector(".item-result").setAttribute("style", "background: " + getRgbFromArray(color) + ";");
    tr.querySelector(".item-result").appendChild(createColor(color, "Средний цвет"));

    palette.sort((a, b) => calculateSaturation(a[0], a[1], a[2]) - calculateSaturation(b[0], b[1], b[2]));

    palette.forEach(c => {
        tr.querySelector(".item-result").appendChild(createColor(c));
    });

    let accent = findAccentColor(palette);
    tr.querySelector(".item-accent").appendChild(createColor(accent, "Акцент"));
    var mostSaturated = palette[palette.length - 1];
    tr.querySelector(".item-accent").appendChild(createColor(mostSaturated, "Насыщенный"));

    tr.querySelector(".item-img-w").setAttribute("style", "background: " + getRgbFromArray(color) + ";");
    tr.querySelector(".item-img:nth-child(2) .item-img-w").setAttribute("style", "background: " + getRgbFromArray(accent) + ";");
    tr.querySelector(".item-img:nth-child(3) .item-img-w").setAttribute("style", "background: " + getRgbFromArray(mostSaturated) + ";");
}

function getRgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}

function getRgbFromArray(rgbArr) {
    rgbArr = rgbArr || [0,0,0];
    return getRgb(rgbArr[0], rgbArr[1], rgbArr[2]);
}

function normalizeColor(rgbArray) {
    const [r, g, b] = rgbArray;
    const maxVal = Math.max(r, g, b);
    if (maxVal === 0) return [0, 0, 0]; // Чтобы избежать деления на ноль

    const factor = 255 / maxVal;
    return [
        Math.min(255, Math.max(0, r * factor)),
        Math.min(255, Math.max(0, g * factor)),
        Math.min(255, Math.max(0, b * factor))
    ];
}

function getContrastColor(rgbArray) {
    const [r, g, b] = rgbArray;
    const luminance = calculateLuminance(r, g, b);
    return luminance > 128 ? [0, 0, 0] : [255, 255, 255]; // Черный или белый
}

function increaseContrast(rgbArray, factor = 1.5) {
    const [r, g, b] = rgbArray;
    return [
        Math.min(255, Math.max(0, r * factor)), // Ограничиваем значения в диапазоне [0, 255]
        Math.min(255, Math.max(0, g * factor)),
        Math.min(255, Math.max(0, b * factor))
    ];
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgbArr) {
    const [r, g, b] = rgbArr;
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function createColor(rgbArr, text) {
    rgbArr = rgbArr || [0, 0, 0];

    var div = document.createElement("div");
    div.setAttribute("class", "color");
    div.setAttribute("style", "background: " + getRgbFromArray(rgbArr) + ";");

    const [r, g, b] = rgbArr;
    text = text || (rgbToHex(rgbArr) + " " + calculateSaturation(r, g, b).toFixed(2));
    div.textContent = text;

    return div;
}

// Функция для расчета яркости
function calculateLuminance(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Функция для расчета насыщенности
function calculateSaturation(r, g, b) {
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    return (maxVal - minVal) / maxVal || 0; // Избегаем деления на ноль
}

// Функция для расчета контраста между двумя цветами
function calculateContrast(l1, l2) {
    return (l1 + 0.05) / (l2 + 0.05);
}

// Функция для поиска самого акцентного цвета
function findAccentColor(colors) {
    let maxAccentScore = -1;
    let accentColor = null;

    // Перебираем все цвета
    colors.forEach((color, index) => {
        const [r, g, b] = color;
        const luminance = calculateLuminance(r, g, b);
        const saturation = calculateSaturation(r, g, b);

        // Рассчитываем контрастность относительно других цветов
        let maxContrast = 0;
        colors.forEach((otherColor, otherIndex) => {
            if (index !== otherIndex) {
                const otherLuminance = calculateLuminance(...otherColor);
                const contrast = calculateContrast(luminance, otherLuminance);
                if (contrast > maxContrast) {
                    maxContrast = contrast;
                }
            }
        });

        // Рассчитываем общий акцентный показатель
        const accentScore = luminance * saturation * maxContrast;

        // Обновляем самый акцентный цвет
        if (accentScore > maxAccentScore) {
            maxAccentScore = accentScore;
            accentColor = color;
        }
    });

    return accentColor;
}

window.onload = function () {
    buildTable();
    calculateColors();
};

