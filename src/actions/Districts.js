/* eslint-disable no-undef */

function search(address,city,state,zip,cb) {
  var url = window.location.protocol + "//" + window.location.hostname + "/api/api/v1/districts/find?address="+address+"&city="+city+"&state="+state;

  //var url = 'https://www.voter-information.com/api/api/v1/districts/find?address='+address+"&city="+city+"&state="+state;
  return fetch(url, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function searchFull(address,cb) {
  var url = window.location.protocol + "//" + window.location.hostname + "/api/api/v1/districts/find?faddress="+address;
  //var url = 'https://www.voter-information.com/api/api/v1/districts/find?faddress='+address;
  return fetch(url, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function show(id, cb){
  var url = window.location.protocol + "//" + window.location.hostname + "/api/api/v1/districts/"+id;
  //var url = 'https://www.voter-information.com/api/api/v1/districts/'+id;
  return fetch(url, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function byState(state_id,cb){
  var url = window.location.protocol + "//" + window.location.hostname + "/api/api/v1/districts?state_id="+state_id;
  //var url = 'https://www.voter-information.com/api/api/v1/districts?state_id='+state_id;
  return fetch(url, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function checkStatus(response){
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  throw error;
}

function parseJSON(response){
  return response.json();
}

const Districts = {search, searchFull, show, byState};
export default Districts;

