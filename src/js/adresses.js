import * as api from './api.js';
import * as cs from './compareStatus.js';

let addresses = [];

export function removeAddress(index){
    let clone = [];

    addresses.forEach((el, i) => {
        if( i != index ){
            clone.push( el );
        }
    });

    addresses = [];
    addresses = clone;
}

export function returnAddresses(){
    return addresses;
}

export async function getAdresses(custom_scheme){
    if( addresses ){
        let promises = addresses.map(async (address) => {
            return await api.getAddressInfo(address).then(infos => {
                let scheme = ["id", "name", "balance", "stake", "lastActivity","online","penalty","totalShortAnswers","score","state", "more"];
                let info = {};

                if( custom_scheme ){
                    scheme = custom_scheme;
                }

                // Data out of API
                if( scheme.includes("id") ){ info.id = address.id; }
                if( scheme.includes("name") ){ info.name = address.name; }
                if( scheme.includes("more") ){ info.more = false; }

                // console.log("scheme", scheme);

                // Data API
                infos.forEach(el => {
                    if( el.result != null ){
                        Object.keys(el.result).forEach((elr) => {

                            if( scheme.includes(elr) ){
                                info[elr] = (el.result[elr]) ? el.result[elr] : "N/D";

                                switch(elr){
                                    case "totalShortAnswers":{
                                        if( el.result.totalShortAnswers.point && el.result.totalShortAnswers.flipsCount ){
                                            info.score = ((el.result.totalShortAnswers.point / el.result.totalShortAnswers.flipsCount) * 100).toFixed(2) + "%";
                                        }
                                        else{
                                            info.score = "Candidate";
                                        }
                                        break;
                                    }
                                    case "state":{
                                        if( info[elr] == "Undefined" ){
                                            info[elr] = "N/D";
                                        }
                                        break;
                                    }
                                }
                            }

                        });
                    }
                });

                // console.log("info", info);

                return info;
            });
        });
        
        return Promise.all(promises);
    }
}

function updateStatuses(){
    getAdresses().then(res => {
        let st = res.map(el => {
            return {"id":el.id, "online": (el.online) ? true : false};
        });
        
        cs.initStatuses(st);
    });
}

export function saveAddresses(custom_addresses){
    localStorage.setItem("addresses", JSON.stringify((custom_addresses) ? custom_addresses : addresses));
}

export function loadAddresses(){
    if( !localStorage.getItem("addresses") ){
        saveAddresses();
    }

    addresses = JSON.parse(localStorage.getItem("addresses"));
    
    updateStatuses();
}

export function addAddress(data){
    if(
        data.name.length > 0 &&
        data.id.length > 0 &&
        (data.id[0] == "0" && data.id[1] == "x")
    ){
        let duplicate = addresses.find((el) => { return (el.id == data.id); });
        if( !duplicate ){
            addresses.push(data);

            saveAddresses();
        }
        else{
            alert("Duplicate detected! Current name: " + duplicate.name);
        }
    }
}

export function initAddresses(){
    loadAddresses();
}