import * as notify from "./notify.js";

let current = [];
let statuses = [];
let favicon = new Favico({
    animation: 'slide',
});

export function compareStatuses(){
    let diffs = 0;

    if( current.length == statuses.length ){
        current.forEach(function(el, i){
            if( el.online != statuses[i].online ){
                diffs++;
            }
        });

        if( diffs > 0 ){
            notify.notifyMe({title:"Status change detected", body: "("+diffs+") account/s status has changed since the last visit. Check them out so you don't lose your iDNAs"});
            favicon.badge(diffs);
        }

        // Save new
        saveStatuses();
    }
    else{
        console.log("Current and Saved statuses is not the same!");
    }
}

export function saveStatuses(){
    localStorage.setItem("statuses", JSON.stringify(current));
}

export function loadStatuses(){
    if( !localStorage.getItem("statuses") ){
        saveStatuses();
    }
    else{
        statuses = JSON.parse(localStorage.getItem("statuses"));
        compareStatuses();
    }
}

export function initStatuses(c){
    current = c;

    loadStatuses();
}