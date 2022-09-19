import "./spinner.css";
import {useRef, useEffect, useState} from "react";
import renderFrame from "./renderFrame";

///////////////////////////////

//config
const addressAmount = 500;
const addresses = Array(addressAmount).fill(null).map(fakeAddress);
const deceleration = 0.004;
const minimumSpeed = 0.3;
const segmentsOnRoll = 18;
const size = {width: 550, height: 250, fontSize: 18, lineHeight: 40};

///////////////////////////

function stringToColour(str) {
    var hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (let i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

function fakeAddress() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 38; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const ret = '0x' + result;
    return [ret, stringToColour(ret)]
}

/////////////////////

function Spinner() {
    const [currentAddressIndex, setCurrentAddressIndex] = useState(false)
    const actualsegmentsOnRoll = segmentsOnRoll;
    const lineRads = (Math.PI * 2) / segmentsOnRoll;
    const lineHeightInverse = 1 / lineRads;
    const l = addresses.length;
    const canvasRef = useRef(null);
    const requestIdRef = useRef(null);
    const yPos = useRef({
        targetPos: 1, pos: 0
    });
    const addressesWithExtraLines = [...addresses, ...addresses.slice(0, actualsegmentsOnRoll)]


    let soundTick=false;
    const updateYpos = () => {
        const distance = yPos.current.targetPos - yPos.current.pos;
        const increment = Math.sqrt(deceleration * 2 * distance);
        if (increment > 0) {
            yPos.current.pos += increment;


            const soundTickNew=Math.floor(yPos.current.pos*1.5);
            if(soundTickNew!==soundTick){
                if(soundTick){

                    beep(
                        //dur
                        Math.max(1,Math.round(35 - increment*16)),
                        // frequency
                        550-increment*300,
                        // volume
                        15
                    );
                }
                soundTick=soundTickNew;
            }


        }
    };



    const renderCurrentFrame = () => {
        const ctx = canvasRef.current.getContext("2d");
        updateYpos();
        const mult = yPos.current.pos * lineHeightInverse;
        const mod = Math.floor(mult);
        const addMod = mod % l;
        renderFrame.call(ctx, size, yPos.current.pos, lineRads, addressesWithExtraLines.slice(addMod, addMod + actualsegmentsOnRoll));




    };

    const tick = () => {
        if (!canvasRef.current) return;
        renderCurrentFrame();
        requestIdRef.current = requestAnimationFrame(tick);
    };

    const getTargetPos = (addressIndex) => {
        const lineOffset = Math.ceil((segmentsOnRoll - 1) / 3);
        let targetPos = (addresses.length + (addressIndex - (lineOffset))) * (lineRads);
        while (targetPos < yPos.current.pos) {
            targetPos += (lineRads * addresses.length);
        }
        let increment = 0;
        while (increment <= minimumSpeed) {
            const distance = targetPos - yPos.current.pos;
            increment = Math.sqrt(deceleration * 2 * distance);

            if (increment <= minimumSpeed) {
                targetPos += (lineRads * addresses.length);
            }
        }
        return targetPos;
    }


    useEffect(() => {
        if (currentAddressIndex !== false) {
            let targetPos = getTargetPos(currentAddressIndex);
            yPos.current.targetPos = targetPos;



        }

    }, [currentAddressIndex]);

    useEffect(() => {
        const initialPos = getTargetPos(addresses.length - 1);
        yPos.current.targetPos = initialPos;
        yPos.current.pos = initialPos;

        requestIdRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(requestIdRef.current);
        };
    }, []);


    return <div style={{display: "flex", gap: 100, alignItems: "flex-start"}}>
        <div className="spinner">
            <canvas className="spinner-canvas" width={size.width} height={size.height} ref={canvasRef}/>
            <div className="spinner-shadow"/>
            <svg className={"cilinder-svg"}>
                <clipPath id="cilinder" clipPathUnits="objectBoundingBox">
                    <path d="M0.024,0 L0.976,0 C1,0.111,1,0.889,0.976,1 L0.049,1 C0,0.889,0,0.111,0.049,0"></path>
                </clipPath>
            </svg>
        </div>
        <div>
            {`${addressAmount} addresses`}
            <div style={{height: 500, overflow: "scroll"}}>
                {addresses.map((address, i) => <div onClick={() => {
                    setCurrentAddressIndex(i);
                }} key={address[0]} style={{
                    cursor: "pointer", background: address[1], opacity: (currentAddressIndex || 0) === i ? 1 : 0.5
                }}>{address[0]}</div>)}
            </div>
        </div>
    </div>;
}

export default Spinner;











const myAudioContext = new AudioContext();

function beep(duration, frequency, volume){
    return new Promise((resolve, reject) => {
        try{
            let oscillatorNode = myAudioContext.createOscillator();
            let gainNode = myAudioContext.createGain();
            oscillatorNode.connect(gainNode);
            // Set the oscillator frequency in hertz
            oscillatorNode.frequency.value = frequency;
            oscillatorNode.type= "square";
            gainNode.connect(myAudioContext.destination);

            // Set the gain to the volume
            gainNode.gain.value = volume * 0.01;

            // Start audio with the desired duration
            oscillatorNode.start(myAudioContext.currentTime);
            oscillatorNode.stop(myAudioContext.currentTime + duration * 0.001);

            // Resolve the promise when the sound is finished
            oscillatorNode.onended = () => {
                resolve();
            };
        }catch(error){
            reject(error);
        }
    });
}

