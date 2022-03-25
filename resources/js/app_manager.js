/* In main.js */
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./sw.js')
//     .then((registration)=> {
//         console.log("Service Worker Registered", registration.scope);
//     })
//     .catch(function(err) {
//         console.log("Service Worker Failed to Register", err);
//     })
// }
import PouchDB from 'pouchdb';
import find from 'pouchdb-find';
import { DB } from './support_classes/persist_data_frontend';
PouchDB.plugin(find);
// CHANGE THIS -> Get credentials using XHR not in file because when file is cached on login page, credentials are exposed.
const username = "sswsboss";
const password = "cA*RLp16qfP#*#";

//let get_date = async ()=>{let date = new Date(); return date.toJSON();};
//export const localDB = new PouchDB('localDavbrosTest');
// export const localDB = new PouchDB('localDavbros');
export const localDB = new PouchDB('localDavbrosDev');
const remoteDB = new PouchDB('https://db.davbros.com.ar/davbros_dev', {auth:{username: username, password:password}});

const db = new DB();

// A FULL Sync of Local COUCH

localDB.sync(remoteDB, {
  live: true,
  retry: true
  })
    .on('complete', function () {
        M.toast({html: 'Datos Actualizados.'});
        console.log("Yeah bitch we are syncing with remote Magnets!!!");
    })
    .on('error', function (err) {
      console.log('Error on Pouch DB');
      console.log(err);
});

const apilogin = async ()=>{
  if (localStorage.getItem('apiLogged')) {
    return;
  }
  let email = localStorage.getItem('email');
  let password = localStorage.getItem('password');
  const rawResponse = await fetch("/api/login", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email: email, password: password})
  });
  const content = await rawResponse.json();

  if (content.status_code == 200) {
    // get token 
    let token = content.access_token;
    let type = content.token_type;
    let id = content.support_id;
    let role = content.user_role;
    let userName = content.user_name;
    let userLastname = content.user_lastname; 
    if (role == `employee`) {
      let userDoc = db.getDocByField(`id`, id);
      localStorage.setItem('localID', userDoc._id);
    }
    localStorage.setItem('apiToken', token);
    localStorage.setItem('apiTokenType', type);
    localStorage.setItem('supportID', id);
    localStorage.setItem('apiLogged', true);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userLastname', userLastname);
    localStorage.removeItem('email');
    localStorage.removeItem('password');
  }
}

window.addEventListener('offline', async ()=> { M.toast({html: 'Sin conexión. Sus datos pueden estar desactualizados.'})});
// when online atach queue process
window.addEventListener('online', async (event)=> { 
  M.toast({html: 'Sistema online. Sincronizando Datos.'});
});

// Common Functions used over the app

export const closeSidenavForm = async ()=>{
  let sidenav = document.querySelector('.sidenav.side-form');
  Array.from(sidenav.querySelectorAll("input")).map(input=>{input.value = ""; input.dataset.id = ""});
  let instanceSidenav = M.Sidenav.getInstance(sidenav);
  instanceSidenav.close();
}

export const handleLogout = async (event)=>{
  if (!window.navigator.onLine) {
    M.toast({html: 'Debe tener conexión para cerrar sesión'});
    event.preventDefault();
    return;
  }
  else{
    
  }
}

const logOut = async(event)=>{
  event.preventDefault();
  if (window.navigator.onLine) {
    const token = document.querySelector("meta[name='csrf-token']").content;
    const data   = new FormData();
    data.append('_token', token);
    const response = await fetch("/logout", {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': token,
        'Accept': 'application/json',
      },
      body:data
    });

    if (response.status == 204 || (response.status == 419 && response.message == "CSRF token mismatch.")) {
      // clean app 
      let itemsToRemove = ['apiToken', 'apiTokenType', 'supportID', 'apiLogged', 'userRole', 'email', 'password', 'userName', 'userLastname'];
      for await (const key of itemsToRemove){
        localStorage.removeItem(key);
      }
      window.location = `/app`;
    }
  }
}

const atachLogOut = async()=>{
  let logoutLink = document.querySelector("a[href='/app/logout']");
  logoutLink.removeEventListener('click', logOut);
  logoutLink.addEventListener('click', logOut);
}

const handleOfflineIntent = async (event)=>{
  if (!window.navigator.onLine) {
    event.preventDefault();
    M.toast({html: `${event.target.dataset.offlinemsg}`});
    return;
  }
  else{
    
  }
}

const removeNonAdminElems = async()=>{
  let menuBar = document.querySelector('#side-menu');
  let itemsToRemove = ['inicio', 'clientes', 'sectores', 'planillas', 'users'];
  for await (const key of itemsToRemove){
    menuBar.querySelector(`a[href='/app/${key}']`).remove();
  }
  //window.location = `/app/control`;
}
const atachOfflineIntent = async ()=>{
  let logoutLink = document.querySelector("a[href='/app/logout']");
  logoutLink.removeEventListener('click', handleOfflineIntent);
  logoutLink.addEventListener('click', handleOfflineIntent);
  let usersLink = document.querySelector("a[href='/app/users']");
  usersLink.removeEventListener('click', handleOfflineIntent);
  usersLink.addEventListener('click', handleOfflineIntent);
}

// Disable BACK BUTTON on browser // NEED TO DEBUG
const disableBackButton = async()=>{
  window.history.pushState(null, null, window.location.href);
  window.onpopstate = function () {
      window.history.go(1);
  };
}

const deleteAllDocs = async()=>{
  localDB.allDocs({include_docs: true, descending: true}, async(err, docs)=> {
      for await(const doc of docs.rows){
          console.log('Doc to remove');
          console.log(doc.doc);
          try {
            let response = await localDB.remove(doc.doc);
            console.log('Deleted Response');
            console.log(response);
          } catch (error) {
            console.log(error);
          }
      }
  });
}

const showAllDocs = async()=>{
  localDB.allDocs({include_docs: true, descending: true}, async(err, docs)=> {
      for await(const doc of docs.rows){
          console.log(doc.doc);
      }
  });
}

const userCan = async()=>{
  let rolesAllowed = ['super', 'admin'];
  let role = localStorage.getItem('userRole');
  if (rolesAllowed.includes(role)) {
    return true;
  }
  else{
    return false;
  }
}

const addSuperActions = async()=>{
  let role = localStorage.getItem('userRole');
  if (role == 'super') {
    let actions = ['delete', 'show']; // I need to refactor this to hold loadDevicesOnDb button
    for await (const action of actions){
      let button = document.createElement('button');
      button.className = 'btn-small';
      button.innerText = `${action} All Docs`;
      button.dataset.type = action;
      button.addEventListener('click', action == 'delete'?deleteAllDocs:showAllDocs);
      document.body.appendChild(button);
    }
  }
}

const getOperarios = async()=>{
  let endpoint = `/api/operarios`;
  let type = localStorage.getItem('apiTokenType');
  let token = localStorage.getItem('apiToken');
  const fetchedOperarios = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `${type} ${token}` 
      }
    });
  let operarios = await fetchedOperarios.json();

  // console.log(`operarios`);
  // console.log(operarios);
  for await (let operario of operarios){
    // console.log(`Operario is`);
    // console.log(operario);
    let operator = {name:operario.name, lastname:operario.lastname, id:operario.id, type:'OPERARIO'};
    if(! await db.docExists('id', operario.id)){
      let response = await db.saveSingleDoc(operator);
      console.log(`response of save => ${response}`);
    } 
  }
}

const showNotifications = async()=>{
  let selector = {estado:'pendiente', type:'CONTROL'};
  const notifications = await db.getDocBySelector(selector);
  for await (const notification of notifications){
    console.log(`Notification is`);
    console.log(notification);
  }
}

const showName = async()=>{
  let userName = `${localStorage.getItem('userName')} ${localStorage.getItem('userLastname')}`;
  let userRole = `${localStorage.getItem('userRole')}`;
  document.getElementById('userName').innerText = userName;
  document.getElementById('userRole').innerText = userRole;
}

window.addEventListener('load', async()=>{
  await apilogin();
  await atachOfflineIntent();
  if (!await userCan()) {
    await removeNonAdminElems();
  }
  await getOperarios();
  await atachLogOut();
  await disableBackButton();
  await addSuperActions();
  await showNotifications();
  await showName();



//   const dbs = await window.indexedDB.databases()
// dbs.forEach(db => { window.indexedDB.deleteDatabase(db.name) })
//   var DBDeleteRequest = window.indexedDB.deleteDatabase("_pouch_localiPro");

// DBDeleteRequest.onerror = function(event) {
//   console.log("Error deleting database.");
// };

// DBDeleteRequest.onsuccess = function(event) {
//   console.log("Database deleted successfully");

//   console.log(event.result); // should be undefined
// };

});