function calculateColors() {
    const colorThief = new ColorThief();

    const items = document.querySelectorAll('.item');
    items.forEach(value => {
        console.log(value);

        const img = value.querySelector('img');
        console.log(img);

        var color = [0, 0, 0];
        var palette = [];

        // Make sure image is finished loading
        if (img.complete) {
            color = colorThief.getColor(img);
            palette = colorThief.getPalette(img, 10);
        } else {
            img.addEventListener('load', function () {
                color = colorThief.getColor(img);
                palette = colorThief.getPalette(img, 10);
            });
            img.addEventListener('error', function () {
                alert('error')
            });
        }

        console.log(color);
        console.log(palette);

        value.querySelector(".item-result").setAttribute("style", "background: " + getRgbFromArray(color) + ";");
        value.querySelector(".item-result").appendChild(createColor(color, "Средний цвет"));

        palette.sort((a, b) => calculateSaturation(a[0], a[1], a[2]) - calculateSaturation(b[0], b[1], b[2]));

        palette.forEach(c => {
            value.querySelector(".item-result").appendChild(createColor(c));
        });

        let accent = findAccentColor(palette);
        value.querySelector(".item-accent").appendChild(createColor(accent, "Акцент"));
        var mostSaturated = palette[palette.length - 1];
        value.querySelector(".item-accent").appendChild(createColor(mostSaturated, "Насыщенный"));
        //value.querySelector(".item-accent").appendChild(createColor(increaseContrast(accent, 0.8)));

        value.querySelector(".item-img-w").setAttribute("style", "background: " + getRgbFromArray(color) + ";");
        value.querySelector(".item-img:nth-child(2) .item-img-w").setAttribute("style", "background: " + getRgbFromArray(accent) + ";");
        value.querySelector(".item-img:nth-child(3) .item-img-w").setAttribute("style", "background: " + getRgbFromArray(mostSaturated) + ";");
    });
}

function getRgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}

function getRgbFromArray(rgbArr) {
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
    calculateColors();
};

