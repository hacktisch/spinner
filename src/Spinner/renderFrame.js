let subimgs = []

const getSubImg = (size, offsSide) => ([address, color]) => {
    var c = document.createElement("canvas").getContext("2d");
    c.canvas.width = size.width + 2 * offsSide;
    c.canvas.height = size.lineHeight;
    c.font = size.fontSize + 'px Courier New';
    c.fillColor = '#000';
    c.textBaseline = 'middle';
    c.textAlign = 'center';
    c.fillText(address, size.width * 0.5, size.lineHeight * 0.5);
    c.fillStyle = color;
    c.globalCompositeOperation = 'destination-over'
    c.fillRect(0, 0, c.canvas.width, c.canvas.height)
    return [address, c];
}
const getSubImgs = (addresses, size, offsSide) => {
    // this is to cache the text subcanvasses in view
    if (subimgs.length !== addresses.length) {
        subimgs = addresses.map(getSubImg(size, offsSide))
    } else {
        if (subimgs[0][0] !== addresses[0][0]) {
            if (subimgs[1][0] === addresses[0][0]) {
                subimgs.shift();
                subimgs.push(getSubImg(size, offsSide)(addresses[addresses.length - 1]))
            } else {
                subimgs = addresses.map(getSubImg(size, offsSide))
            }
        }
    }
    return subimgs;
}

function renderFrame(size, y, lineRads, addresses) {
    const offsSide = (size.height / lineRads) * 0.06;
    const subImgs = getSubImgs(addresses, size, offsSide)
    this.clearRect(0, 0, size.width, size.height);

    const drawRows = (y) => {
        this.clearRect(0, 0, size.width, size.height);
        const l = addresses.length;
        let from;
        let to = false;
        const calcPos = i => (1 - ((1 + Math.cos(y - lineRads * (i - 2))) * 0.5)) * size.height
        for (let i = 0; i < l; i++) {
            from = to === false ? calcPos(i) : to;
            to = calcPos(i + 1);
            if (to > from) {
                const height = to - from;
                const reversed = size.height - to;

                const offset = (height / size.height) * 250;

                this.drawImage(subImgs[i][1].canvas, offset, 0, (size.width - 2 * offset), size.lineHeight, 0, reversed, size.width, height);
            }
        }
    };
    drawRows(y % lineRads);
}


export default renderFrame;



