// https://api.idena.org/api/address/##id##
// result -> balance, stake, flips count, reportedFlipsCount

// https://api.idena.org/api/identity/##id##
// result -> state, totalShortAnswers

// https://api.idena.org/api/onlineidentity/##id##
// result -> lastActivity, online, penalty
export async function getAddressInfo(data){
    let {id} = data;

    let urls = [`https://api.idena.org/api/address/${id}`, `https://api.idena.org/api/identity/${id}`, `https://api.idena.org/api/onlineidentity/${id}`];
    let promises = urls.map(async url => await fetch(url).then(y => y.json()));
    
    return Promise.all(promises);
}