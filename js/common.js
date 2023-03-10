!async function () {
    'use strict';

    async function sleep(ms) {
        await new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    const onerrorRes = {
        width: 314,
        height: 60
    };

    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('image-upload');
    const useInvalid = document.getElementById('use-invalid');
    const compression = document.getElementById('compress');
    const compressLevel = document.getElementById('compress-level');
    const widthInput = document.getElementById('img-width');
    const heightInput = document.getElementById('img-height');
    const imgCont = document.getElementById('img-cont');
    const imgBright = document.getElementById('img-bright');
    const imgSat = document.getElementById('img-sat');
    const imgHue = document.getElementById('img-hue');
    const output = document.getElementById('output');
    const addMore = document.getElementById('add-urls');
    const imgQual = document.getElementById('qual');
    const imgQualLevel = document.getElementById('qual-level');
    const urlDiv = document.getElementById('urls');
    const firstUrlUpload = document.getElementById('first-url-upload');
    const filesSpan = document.getElementById('files');
    const htmlCache = document.querySelector('html-cache');
    const oldURLs = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {
        alpha: true,
        willReadFrequently: true
    });

    let updated = false;
    let urlButtons = 1;

    htmlCache.remove();

    imgQual.addEventListener('input', function () {
        imgQualLevel.innerText = this.value * 100 + '%';
    });
    compression.addEventListener('input', function () {
        compressLevel.innerText = this.value;
    });
    firstUrlUpload.addEventListener('change', function () {
        fileInput.required = urlButtons <= 1 && this.value.length <= 0;
    });
    fileInput.addEventListener('change', function () {
        while (oldURLs.length > 0) {
            URL.revokeObjectURL(oldURLs.shift());
        }
        files.innerText = '';
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            files.innerText += ' ' + file.name;
            if (this.files.length > 1) {
                files.innerText += ',';
            }
            oldURLs.push(URL.createObjectURL(file));
        }
        updated = true;
    });
    addMore.addEventListener('click', function () {
        fileInput.required = false;
        urlButtons += 1;
        const input = document.createElement('input');
        const button = document.createElement('input');

        input.className = 'url-upload';
        input.type = 'url';
        input.placeholder = 'https://example.com/myimage.png';
        input.required = true;

        button.type = 'button';
        button.value = 'Remove';
        button.addEventListener('click', function () {
            fileInput.required = (--urlButtons) <= 1 && firstUrlUpload.value.length <= 0;
            input.remove();
            button.remove();
        });

        urlDiv.appendChild(input);
        input.insertAdjacentElement('afterend', button);
    });

    let firstSubmit = false;
    let tempURLs = [];

    form.addEventListener('submit', async function (e) {
        while (tempURLs.length > 0) {
            URL.revokeObjectURL(tempURLs.shift());
        }
        e.preventDefault();

        if (!firstSubmit) {
            onbeforeunload = function () {
                return false;
            };
            firstSubmit = true;
        }

        const contrast = imgCont.value == '' ? 1 : imgCont.value;
        const brightness = imgBright.value == '' ? 1 : imgBright.value;
        const saturate = imgSat.value == '' ? 1 : imgSat.value;
        const hueRotate = imgHue.value == '' ? 0 : imgHue.value;

        if (true || updated) {
            output.innerHTML = '';
            const myURLs = [...oldURLs];
            const imageUrls = document.querySelectorAll('.url-upload');

            for (let i = 0; i < imageUrls.length; i++) {
                const currUrl = imageUrls[i];
                if (currUrl.value == '') {
                    continue;
                }
                myURLs.push(currUrl.value);
            }
            output.insertAdjacentText('afterbegin', 'Desired result:');
            for (let i = 0; i < myURLs.length; i++) {
                const url = myURLs[i];
                const div = document.createElement('div');
                const image = document.createElement('img');
                image.src = url;
                image.crossOrigin = 'Anonymous';

                if (widthInput.value != '') {
                    image.width = widthInput.value;
                }
                if (heightInput.value != '') {
                    image.height = heightInput.value;
                }

                async function load(e) {
                    image.removeEventListener('load', load);
                    image.removeEventListener('error', load);

                    const typeError = e.type == 'error';
                    const currentSrc = image.currentSrc;

                    if (typeError) {
                        canvas.width = onerrorRes.width;
                        canvas.height = onerrorRes.height;
                        image.src = canvas.toDataURL('image/webp', 0);
                    }

                    div.appendChild(image);
                    const divImage = document.createElement('div');
                    divImage.className = 'div-image';

                    const normalWidth = typeError ? onerrorRes.width : image.naturalWidth;
                    const normalHeight = typeError ? onerrorRes.height : image.naturalHeight;

                    canvas.width = image.offsetWidth > 0 ? image.offsetWidth : normalWidth;
                    canvas.height = image.offsetHeight > 0 ? image.offsetHeight : normalHeight;

                    image.width = canvas.width;
                    image.height = canvas.height;

                    divImage.style.width = canvas.width + 'px';
                    divImage.style.height = canvas.height + 'px';
                    divImage.style.display = 'flex';
                    divImage.style.flexWrap = 'wrap';

                    ctx.filter = `contrast(${contrast}) brightness(${brightness}) saturate(${saturate}) hue-rotate(${hueRotate}deg)`;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    if (typeError) {
                        ctx.transform(canvas.width / normalWidth, 0, 0, canvas.height / normalHeight, 0, 0);
                        ctx.fillStyle = '#efefef';
                        ctx.setLineDash([4, 2]);
                        ctx.strokeStyle = '#aaa';
                        ctx.lineWidth = 2
                        ctx.fillRect(0, 0, normalWidth, normalHeight);
                        ctx.strokeRect(2, 2, normalWidth - 4, normalHeight - 4);
                        ctx.fillStyle = '#000';
                        ctx.textBaseline = 'top';
                        ctx.font = '14px helvetica neue, helvetica, arial, sans-serif';
                        ctx.fillText('An error occurred and this image could not load.', 7, 7, normalWidth - 10);
                        ctx.fillText('Target: ' + currentSrc, 7, 7 + 16, normalWidth - 10);
                        ctx.fillText('Press F12 to view more details.', 7, 7 + 16 * 2, normalWidth - 10);
                    } else {
                        ctx.resetTransform();
                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    }
                    
                    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let pixel = data.data;

                    let oldColor = null;
                    let currColor = null;
                    let single = null;
                    let diff = 0;

                    const useinvalid = useInvalid.checked ? 'z' : 'div';
                    let lockedIndexes = [];
                    let RepeatIndex = 0;
                    let containsTallDivs = false;

                    function getColor(array = false) {
                        const ret = `${pixel[i]},${pixel[i + 1]},${pixel[i + 2]},${pixel[i + 3]}`;
                        if (array) {
                            return ret.split(',');
                        }
                        return ret;
                    }
                    function getDiff(r = pixel[i - 4], g = pixel[i - 3], b = pixel[i - 2], a = pixel[i - 1], r2 = pixel[i], g2 = pixel[i + 1], b2 = pixel[i + 2], a2 = pixel[i + 3]) {
                        return Math.abs(r2 - r) + Math.abs(g2 - g) + Math.abs(b2 - b) + Math.abs(a2 - a);
                    }

                    let i = 0;

                    if (compression.value > 0) {
                        currColor = getColor();
                        for (i = 0; i < pixel.length; i += 4) {
                            const arrColor = currColor.split(',');
                            diff = getDiff(arrColor[0], arrColor[1], arrColor[2], arrColor[3]);

                            if (diff < compression.value && i / 4 % canvas.width > 0) {
                                pixel[i] = arrColor[0];
                                pixel[i + 1] = arrColor[1];
                                pixel[i + 2] = arrColor[2];
                                pixel[i + 3] = arrColor[3];
                            } else {
                                currColor = getColor();
                            }
                        }
                        ctx.putImageData(data, 0, 0);
                    }
                    await new Promise(function (resolve) {
                        canvas.toBlob(function (blob) {
                            const url = URL.createObjectURL(blob);
                            image.src = url;
                            image.onload = function() {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                ctx.filter = '';
                                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                                tempURLs.push(url);
                                data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                pixel = data.data;
                                resolve();
                            };
                        }, 'image/webp', Number(imgQual.value));
                    });

                    const triggerButton = document.createElement('input');
                    triggerButton.type = 'button';
                    triggerButton.value = 'Generate div data';
                    div.appendChild(triggerButton);
                    let width = 1
                    triggerButton.addEventListener('click', function () {
                        triggerButton.disabled = true;
                        let htmlString = `<div style=width:${canvas.width}px;display:flex;flex-wrap:wrap>`;
                        for (i = 0; i < pixel.length; i += 4) {
                            /*if (lockedIndexes.includes(i)) {
                                continue;
                            }*/
                            diff = getDiff();
                            currColor = getColor();

                            if (diff == 0 && i / 4 % canvas.width > 0) {
                                width++;
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
                                const currCArr = currColor.split(',');
                                let hex = '';
                                for (let i2 = 0; i2 < currCArr.length; i2++) {
                                    const color = Number(currCArr[i2]);
                                    if (i2 == 3 && color >= 255) {
                                        break;
                                    }
                                    let singleHex = color.toString(16);
                                    if (singleHex.length == 1) {
                                        singleHex += singleHex[0];
                                    }
                                    hex += singleHex;
                                }
                                if (hex.length == 6 && hex[0] == hex[1] && hex[2] == hex[3] && hex[4] == hex[5]) {
                                    hex = hex[0] + hex[2] + hex[4];
                                } else if (hex[0] == hex[1] && hex[2] == hex[3] && hex[4] == hex[5] && hex[6] == hex[7]) {
                                    hex = hex[0] + hex[2] + hex[4] + hex[6];
                                }
                                if (single != null) {
                                    htmlString += single + `width:${width}px></div>`;
                                }
                                width = 1;
                                single = `<div style=background:#${hex};height:1px;`;
                                if (containsTallDivs) {
                                    single.style.position = 'absolute';
                                    single.style.left = i / 4 % canvas.width + 'px';
                                    single.style.top = Math.floor(i / 4 / canvas.width) + 'px';
                                }
                                continue;
                            }
                        }
                        htmlString += '</div>';

                        div.insertAdjacentText('beforeend', `Buffer size: ${Math.floor(htmlString.length / 1024)} kB`);
                        const code = document.createElement('textarea');
                        code.innerText = htmlString;
                        code.style.width = '400px';
                        code.style.height = '200px';
                        code.style.lineBreak = 'anywhere';
                        div.appendChild(code);
                    });
                }
                image.addEventListener('error', load);
                image.addEventListener('load', load);
                output.appendChild(div);
            }
            updated = false;
        }
    });
}();
