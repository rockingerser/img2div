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
    const imgCont = document.getElementById('img-cont');
    const imgBright = document.getElementById('img-bright');
    const imgSat = document.getElementById('img-sat');
    const imgHue = document.getElementById('img-hue');
    const output = document.getElementById('output');
    const addMore = document.getElementById('add-urls');
    const urlDiv = document.getElementById('urls');
    const firstUrlUpload = document.getElementById('first-url-upload');
    const filesSpan = document.getElementById('files');
    const oldURLs = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {
        alpha: false,
        willReadFrequently: true
    });

    let updated = false;
    let urlButtons = 1;

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
        const imageUrls = document.querySelectorAll('.url-upload');
        for (let i = 0; i < imageUrls.length; i++) {
            const currUrl = imageUrls[i];
            if (currUrl.value == '') {
                continue;
            }
            oldURLs.push(currUrl.value);
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
        input.placeholder = 'https://www.example.com/myimage.png';
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
    let firstSubmit = false
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!firstSubmit) {
            onbeforeunload = function() {
                return false;
            };
            firstSubmit = true;
        }

        const contrast = imgCont.value == '' ? 1 : imgCont.value
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
            for (let i = 0; i < myURLs.length; i++) {
                const url = myURLs[i];
                const div = document.createElement('div');
                const image = document.createElement('img');
                image.src = url;
                if (widthInput.value != '') {
                    image.width = widthInput.value;
                }
                if (heightInput.value != '') {
                    image.height = heightInput.value;
                }
                image.style = 'position:absolute;filter:opacity(0);pointer-events:none';
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

                    ctx.filter = `contrast(${contrast}) brightness(${brightness}) saturate(${saturate}) hue-rotate(${hueRotate}deg)`;
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
                            const ret = `${pixel[i]},${pixel[i + 1]},${pixel[i + 2]},${pixel[i + 3]}`;
                            if (array) {
                                return ret.split(',');
                            }
                            return ret;
                        }
                        function getDiff(r = pixel[i - 4], g = pixel[i - 3], b = pixel[i - 2], a = pixel[i - 1], r2 = pixel[i], g2 = pixel[i + 1], b2 = pixel[i + 2], a2 = pixel[i + 3]) {
                            return Math.abs(r2 - r) + Math.abs(g2 - g) + Math.abs(b2 - b) + Math.abs(a2 - a);
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
