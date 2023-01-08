!async function () {
    'use strict';

    async function sleep(ms) {
        await new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    }
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('image-upload');
    const useInvalid = document.getElementById('use-invalid');
    const compression = document.getElementById('compress');
    const compressLevel = document.getElementById('compress-level');
    const widthInput = document.getElementById('img-width');
    const heightInput = document.getElementById('img-height');
    const imgBright = document.getElementById('img-bright');
    const output = document.getElementById('output');
    const oldURLs = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {
        alpha: false,
        willReadFrequently: true
    });

    let updated = false;

    compression.addEventListener('input', function () {
        compressLevel.innerText = this.value;
    });
    fileInput.addEventListener('change', function () {
        while (oldURLs.length > 0) {
            URL.revokeObjectURL(oldURLs.shift());
        }
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            oldURLs.push(URL.createObjectURL(file));
        }
        updated = true;
    });
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const brightness = imgBright.value == '' ? 1 : imgBright.value;
        function toPixel(p) {
            return p * brightness;
        }
        if (true || updated) {
            output.innerHTML = '';
            for (let i = 0; i < oldURLs.length; i++) {
                const url = oldURLs[i];
                const div = document.createElement('div');
                const image = document.createElement('img');
                image.src = url;
                if (widthInput.value != '') {
                    image.width = widthInput.value;
                }
                if (heightInput.value != '') {
                    image.height = heightInput.value;
                }
                image.style = 'position:absolute;filter:opacity(0)';
                div.appendChild(image);

                image.addEventListener('load', async function (e) {
                    const divImage = document.createElement('div');
                    divImage.className = 'div-image';

                    canvas.width = image.offsetWidth > 0 ? image.offsetWidth : image.naturalWidth;
                    canvas.height = image.offsetHeight > 0 ? image.offsetHeight : image.naturalHeight;

                    divImage.style.width = canvas.width + 'px';
                    divImage.style.height = canvas.height + 'px';
                    divImage.style.display = 'flex';
                    divImage.style.flexWrap = 'wrap';

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixel = data.data;

                    let oldColor = null;
                    let currColor = null;
                    let single = null
                    let diff = 0;
                    const useinvalid = useInvalid.checked ? 'z' : 'div';
                    let lockedIndexes = [];
                    let RepeatIndex = 0;
                    let containsTallDivs = false

                    for (let i = 0; i < pixel.length; i += 4) {
                        /*if (lockedIndexes.includes(i)) {
                            continue;
                        }*/
                        function getColor(array = false) {
                            const ret = `${toPixel(pixel[i])},${toPixel(pixel[i + 1])},${toPixel(pixel[i + 2])},${pixel[i + 3]}`;
                            if (array) {
                                return ret.split(',');
                            }
                            return ret;
                        }
                        function getDiff(r = pixel[i - 4], g = pixel[i - 3], b = pixel[i - 2], a = pixel[i - 1], r2 = pixel[i], g2 = pixel[i + 1], b2 = pixel[i + 2], a2 = pixel[i + 3]) {
                            return Math.abs(toPixel(r2 - r)) + Math.abs(toPixel(g2 - g)) + Math.abs(toPixel(b2 - b)) + Math.abs(a2 - a);
                        }
                        diff = getDiff();
                        currColor = getColor();

                        if (diff <= compression.value && i / 4 % canvas.width > 0) {
                            single.style.width = parseInt(single.style.width) + 1 + 'px';
                            /*
                            const oldIndex = i;
                            let rows = 1;
                            const top = Math.floor(i / 4 / canvas.width);
                            let horizontal = 1;
                            const startColor = getColor(true);
                            let color = startColor;
                            const startIndex = i;

                            while (getDiff(pixel[startIndex], pixel[startIndex + 1], pixel[startIndex + 2], pixel[startIndex + 3]) <= compression.value && i / 4 % canvas.width > 0/*top == Math.floor(i / 4 / canvas.width)) {
                                i += 4;
                                horizontal += 1;
                                //lockedIndexes.push(i);
                                //color = getColor(true);
                            }
                            single.style.width = horizontal + 'px';
                            const oldIndex2 = i - 4;
                            i = oldIndex;
                            let oldIndexX = oldIndex2 / 4 % canvas.width;
                            while (true) {
                                i = oldIndex * (canvas.width * rows);
                                oldIndexX = oldIndex2 / 4 % canvas.width;
                                let brokenInside = false
                                while ((i / 4) % canvas.width < oldIndexX) {
                                    i += 4;
                                    color = getColor(true);
                                    if (lockedIndexes.includes(i)) {
                                        debugger;
                                    }
                                    if (getDiff(color[0], color[1], color[2], color[3], startColor[0], startColor[1], startColor[2], startColor[3]) >= compression.value || i / 4 > canvas.width * canvas.height || lockedIndexes.includes(i)) {
                                        brokenInside = true;
                                        break;
                                    }
                                    lockedIndexes.push(i);
                                }
                                rows += 1;
                                containsTallDivs = true;
                                if (brokenInside) {
                                    break;
                                }
                            }
                            if (containsTallDivs) {
                                divImage.style.position = 'relative';
                                single.style.height = rows + 'px';
                            }
                            i = oldIndex;*/
                        } else {
                            single = document.createElement(useinvalid);
                            single.style.width = '1px';
                            single.style.height = '1px';
                            if (containsTallDivs) {
                                single.style.position = 'absolute';
                                single.style.left = i / 4 % canvas.width + 'px';
                                single.style.top = Math.floor(i / 4 / canvas.width) + 'px';
                            }
                            single.style.background = 'rgba(' + currColor + ')';
                            divImage.appendChild(single);
                        }
                    }

                    div.appendChild(divImage);
                    div.insertAdjacentText('beforeend', `Buffer size: ${Math.round(divImage.outerHTML.length / 1024)} kB`);
                    const code = document.createElement('textarea');
                    code.innerText = divImage.outerHTML;
                    code.style.width = '400px';
                    code.style.height = '200px';
                    code.style.lineBreak = 'anywhere';
                    div.appendChild(code);
                });
                output.appendChild(div);
            }
            updated = false;
        }
    });
}();
