let qrobj, qrcode = "";

let selectedDeviceId;
let codeReader;

let resultCode = "";

let sourceCount = 0;
let sourceList;

export function returnResultCode(){
    return resultCode;
}

export function returnSource(){
    return {list:sourceList, count:sourceCount};
}

function decodeOnce(codeReader, selectedDeviceId, callback) {
    codeReader.decodeFromInputVideoDevice(selectedDeviceId, 'video').then((result) => {
        resultCode = result.text;

        callback(result.text);

        stopScan();
    }).catch((err) => {
        console.error(err);
        resultCode = false;

        callback(resultCode);
    });
}

export function scanCode(callback){
    codeReader.getVideoInputDevices()
        .then((videoInputDevices) => {
            sourceList = videoInputDevices;

            selectedDeviceId = sourceList[sourceCount].deviceId;
            decodeOnce(codeReader, selectedDeviceId, callback);
        })
        .catch((err) => {
            console.error(err);

            callback(resultCode);
        });
}

export function sourceChange(){
    codeReader.reset();

    if( sourceCount == 0 ){ sourceCount = 1; }
    else if( sourceCount == 1 ){ sourceCount = 0; }

    scanCode();
}

export function stopScan(){
    codeReader.reset();
    console.log('Reset');
}

export function generateCode(data){
    if( qrobj && data != qrcode ){
        qrcode = data;
        qrobj.makeCode(qrcode);
    }
}

export function init(){
    // QR Generator
    qrobj = new QRCode("qrcode", {
        text: "",
        width: 256,
        height: 256,
        colorDark : "#090909",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });

    qrobj.clear();

    // QR Reader
    codeReader = new ZXing.BrowserQRCodeReader();
    console.log('ZXing code reader initialized');
}