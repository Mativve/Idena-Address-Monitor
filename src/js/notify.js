function notifyPermission(callback){
    Notification.requestPermission().then(function (p) {
        if (p === 'granted') {
            callback({status: true, msg: ""});
        } else {
            callback({status: false, msg: "User blocked notifications."});
        }
    }).catch(function (err) {
        callback({status: false, msg: "Error"});
    });
}

function notifyShow(data){
    console.log("NS");
    let title = data.title || "";
    let body = data.body || "";
    let notify = new Notification(title, {
        body: body,
        icon: 'dist/img/icon.png',
    });
}

export function notifyMe(data) {
    if (!window.Notification) {
        console.log('Browser does not support notifications.');
    } else {
        if (Notification.permission === 'granted') {
            notifyShow(data);
        } else {
            notifyPermission(function(res){
                if( res.status ){

                }else{
                    console.log(res.msg);
                }
            });
        }
    }
}