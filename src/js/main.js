import * as ls from './adresses.js';
import * as notify from "./notify.js";
import * as qr from "./qrCode.js";
import * as status from "./compareStatus.js";

const version = "0.2";

let tableApp, epochInfo, dataManager;
let notified = false;

function timeSince(date) {
    let last = Date.now() - parseInt(new Date(date).getTime() / 100000);

    let seconds = Math.floor((new Date() - last) / 1000);

    let interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}

function countDownToDate(dt, check){
    let end = new Date(dt);

    let _second = 1000;
    let _minute = _second * 60;
    let _hour = _minute * 60;
    let _day = _hour * 24;

    let now = new Date();
    let distance = end - now;

    let days = Math.floor(distance / _day);
    let hours = Math.floor((distance % _day) / _hour);
    let minutes = Math.floor((distance % _hour) / _minute);
    let seconds = Math.floor((distance % _minute) / _second);

    let t = "";
    t = days + 'd ';
    t += hours + 'h ';
    t += minutes + 'm ';
    t += seconds + 's';

    if( check ){
        if( distance <= 50000 && distance > 0 && !notified ){
            notified = true;
            notify.notifyMe({title:"VALIDATION", body: "Validation will start in less than " + seconds + 's'});
        }
        else if (distance < 0 && distance >= -1500000) {
            return "Validation in progress";
        }
        else if (distance < -1500000) {
            return "Validation ended<br/><small>check your score!</small>";
        }
    }

    return t;
}

function dateToDhm(date, check){
    let d = new Date(date);
    let year = d.getFullYear();
    let month = (d.getMonth() < 10) ? "0"+d.getMonth() : d.getMonth();
    let day = (d.getDate() < 10) ? "0"+d.getDate() : d.getDate();
    let hour = (d.getHours() < 10) ? "0"+d.getHours() : d.getHours();
    let minute = (d.getMinutes() < 10) ? "0"+d.getMinutes() : d.getMinutes();

    return `${year}-${month}-${day} ${hour}:${minute} (${countDownToDate(date, check)})`;
}

function mountTable(){
    tableApp = {
        data(){
            return {
                addresses: [],
                name: "",
                id: ""
            };
        },
        created(){
            ls.initAddresses();

            this.addresses = ls.getAdresses();
        },
        mounted(){
            this.renderAddresses();
        },
        methods:{
            renderAddresses: function(){
                ls.getAdresses().then(res => {
                    this.addresses = res;

                    if( res ){
                        status.initStatuses(res);
                    }
                });
            },
            saveData: function(e){
                if(
                    this.name.length > 0 &&
                    this.id.length > 0
                ){

                    if(this.id[0] == "0" && this.id[1] == "x"){
                        let data = {id: this.id, name: this.name};
                    
                        ls.addAddress(data);
    
                        this.name = "";
                        this.id = "";
    
                        this.renderAddresses();
                    }
                    else{
                        alert("The address is incorrect!");    
                    }
                }
                else{
                    alert("Name and address cannot be empty!");
                }

                e.preventDefault();
                return false;
            },
            removeAddress: function(index){
                let curr = ls.returnAddresses()[index];

                if( confirm(`Do you want delete "${curr.name}"?`) ){
                    ls.removeAddress(index);

                    ls.saveAddresses();

                    this.renderAddresses();
                }
            },
            moreInfo: function(id){
                alert(id);
            },
            toggleInfo: function(i){
                this.addresses[i].more = !this.addresses[i].more;
            },
            convertDate: function(date){
                if( date ){
                    return dateToDhm(date);
                }
                else{
                    return "N/D";
                }
            },
            dateSince: function(date){
                console.log("LAST", date);
                if( date ){
                    return timeSince(date);
                }
                else{
                    return "N/D";
                }
            }
        }
    };

    Vue.createApp(tableApp).mount('#table');
}

function mountEpochInfo(){
    epochInfo = {
        data(){
            return {
                epoch: 0,
                time: "-",
                timeDate: "-",
                scoreToInvite: 0
            };
        },
        created(){
            this.getEpochInfo();
        },
        mounted(){
        },
        methods:{
            getEpochInfo: function(){
                fetch("https://api.idena.org/api/epoch/last")
                .then(res => res.json())
                .then(res => {
                    if( res.result ){
                        this.epoch = res.result.epoch;

                        this.time = countDownToDate(res.result.validationTime, true);
                        setInterval(() => {
                            this.time = countDownToDate(res.result.validationTime, true);
                        }, 1000);
                        this.timeDate = new Date(res.result.validationTime).toLocaleString();

                        this.scoreToInvite = (res.result.minScoreForInvite * 100).toFixed(2) + "%";
                    }
                });
            }
        }
    };

    Vue.createApp(epochInfo).mount('#epoch-info');
}

function mountFooter(){
    tableApp = {
        data(){
            return {
                ver: ""
            };
        },
        created(){
            this.ver = version;
        }
    };

    Vue.createApp(tableApp).mount('#footer');
}

function mountDataManager(){
    dataManager = {
        data(){
            return {
                modal_active: false,
                maxSource: 0,
                source: 0
            };
        },
        created(){
        },
        mounted(){
            qr.init();
        },
        methods:{
            toggleModal: function(){
                this.modal_active = !this.modal_active;

                if( this.modal_active ){
                    let addr = ls.returnAddresses();
                    let txt = "";
                    
                    addr.forEach(function(el, i){
                        txt += el.id + "," + el.name;
                        
                        if( i < addr.length-1 ){
                            txt += "|";
                        }
                    });

                    qr.generateCode( btoa(txt) );
                }
                else{
                    qr.stopScan();
                }
            },
            saveFile: function(){
                ls.getAdresses(["id","name"]).then(res => {
                    console.log(res);
                    let tosave = JSON.stringify(res);
                    let blob = new Blob([tosave], {type: "text/plain"});
                    
                    let date = new Date();
                    let year = date.getFullYear();
                    let month = (date.getMonth() < 10) ? "0"+date.getMonth() : date.getMonth();
                    let day = (date.getDate() < 10) ? "0"+date.getDate() : date.getDate();
                    let hour = (date.getHours() < 10) ? "0"+date.getHours() : date.getHours();
                    let minutes = (date.getMinutes() < 10) ? "0"+date.getMinutes() : date.getMinutes();
                    let format = `${year}_${month}_${day}_${hour}_${minutes}`;
    
                    saveAs(blob, "iam_"+format+".iam");
                });
            },
            loadFile: function(){
                let input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", ".iam");
                input.click();

                input.addEventListener('input', function(e){
                    let f = e.target.files[0];

                    if(f){
                        let r = new FileReader();
                        r.onload = function(e){
                            let contents = e.target.result;
                            if( contents ){
                                ls.saveAddresses(JSON.parse(contents));
                                ls.initAddresses();
                                
                                window.location.reload();
                            }
                        };
                        r.readAsText(f);
                    }
                });
            },
            scanCodeStart: function(){
                qr.scanCode(function(res){
                    if( res.length ){
                        let c = atob(res);
                        let arr = c.split("|");
                        let addr = arr.map(function(el){ let u = el.split(","); return {"id":u[0],"name": u[1]}; });
                        
                        if( addr ){
                            ls.saveAddresses(addr);
                            window.location.reload();
                        }
                    }

                });

                let {list, count} = qr.returnSource();
                this.source = (count+1);
                this.maxSource = (list) ? list.length : 0;
            },
            scanSource: function(){
                qr.sourceChange();
                
                let {list, count} = qr.returnSource();
                this.source = (count+1);
                this.maxSource = list.length;
            },
            scanCodeEnd: function(){
                qr.stopScan();
            }
        }
    };

    Vue.createApp(dataManager).mount('#data-manager');
}

function init(){
    mountTable();
    mountEpochInfo();
    mountFooter();
    mountDataManager();
}
init();