import * as notify from "./notify.js";

let current = [];
let saved = [];
let favicon = new Favico({
    animation: 'slide',
});

export function compareStatuses(){
    let diffs = 0;

    if( current.length == saved.length ){
        current.forEach(function(now, i){
            if( now.online != saved[i].online && saved[i].online == false ){
                diffs++;
            }
        });

        if( diffs > 0 ){
            notify.notifyMe({title:"Addresses offline status detected", body: "("+diffs+") account/s status has changed since the last visit. Check them out so you don't lose your iDNAs"});
            favicon.badge(diffs);
        }

        saveStatuses();
    }
    else{
        saveStatuses();
    }
}

export function saveStatuses(){
    localStorage.setItem("savedStatuses", JSON.stringify(current));
}

export function loadStatuses(){
    if( !localStorage.getItem("savedStatuses") ){
        saveStatuses();
    }
    else{
        saved = JSON.parse(localStorage.getItem("savedStatuses"));
        compareStatuses();
    }
}

export function initStatuses(addrs){
    let addrs_pick = addrs.map((el) => {
        let {id, name, online} = el;
        return {"id":id, "online":(online) ? true : false};
    });

    current = addrs_pick;

    loadStatuses();
}