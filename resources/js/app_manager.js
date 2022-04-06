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
const db = new DB();
PouchDB.plugin(find);

import { Notifications } from './support_classes/notification';
const notification= new Notifications();

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

    if (response.status == 204 || response.status == 419) {
      console.log(response);
      // clean app 
      let itemsToRemove = ['apiToken', 'apiTokenType', 'supportID', 'apiLogged', 'userRole', 'email', 'password', 'userName', 'userLastname'];
      for await (const key of itemsToRemove){
        localStorage.removeItem(key);
      }
      window.location = `/app`;
    }
    else{
      console.log(`Wasn't possible close session`);
      console.log(response);
    }
  }
}

const notificationsRedirect = async(event)=>{
  event.preventDefault();
  window.location = `/app/control`;
}

const atachNotificationRedirect = async()=>{
  let notificationLink = document.querySelector("a[href='/app/notificaciones']");
  notificationLink.removeEventListener('click', notificationsRedirect);
  notificationLink.addEventListener('click', notificationsRedirect);
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
  db.localDB.allDocs({include_docs: true, descending: true}, async(err, docs)=> {
      for await(const doc of docs.rows){
          console.log('Doc to remove');
          console.log(doc.doc);
          try {
            let response = await db.localDB.remove(doc.doc);
            console.log('Deleted Response');
            console.log(response);
          } catch (error) {
            console.log(error);
          }
      }
  });
}

const showAllDocs = async()=>{
  db.localDB.allDocs({include_docs: true, descending: true}, async(err, docs)=> {
      for await(const doc of docs.rows){
          console.log(doc.doc);
      }
  });
}

const deleteOperarios = async()=>{
  let operarios = await db.getOperarios();
  for await (const operario of operarios){
    await db.removeSingleDoc(operario._id);
  }
}

const makeSearch = async()=>{
  let clientDeepSelector = {
    type:`CLIENT`, 
    "$or":[
      {"supervisores.external_controller":parseInt(userID)},
      {"supervisores.internal_controller":parseInt(userID)}
    ]};
  let clients = await db.getDocBySelector(clientDeepSelector);
  console.log(`CLIENTES FETCHED ARE`);
  console.log(clients);
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
    let actions = ['delete', 'show', 'deleteOperarios', 'makeSearch']; // I need to refactor this to hold loadDevicesOnDb button
    for await (const action of actions){
      let button = document.createElement('button');
      button.className = 'btn-small';
      button.innerText = `${action} All Docs`;
      button.dataset.type = action;
      button.addEventListener('click', action == 'delete'?deleteAllDocs:(action == 'show'?showAllDocs:(action == 'makeSearch'?makeSearch:deleteOperarios)));
      document.body.appendChild(button);
    }
  }
}

const showName = async()=>{
  let roles = [{'super':'Super Admin'}, {'employee':'Empleado'}, {'external_controller':'Supervisor externo'}, {'internal_controller':'Encargado'}, {'admin':'Administrador'}];
  let userName = `${localStorage.getItem('userName')} ${localStorage.getItem('userLastname')}`;
  let userRole = `${localStorage.getItem('userRole')}`;
  document.getElementById('userName').innerText = userName;
  document.getElementById('userRole').innerText = roles[roles.findIndex(role => Object.keys(role)[0] == userRole)][`${userRole}`];
}

window.addEventListener('load', async()=>{
  await apilogin();
  await atachOfflineIntent();
  if (!await userCan()) {
    await removeNonAdminElems();
  }
  await atachLogOut();
  await atachNotificationRedirect();
  await disableBackButton();
  await addSuperActions();
  await notification.init();
  await showName();



// const dbs = await window.indexedDB.databases()
// for await (const db of dbs){
//   console.log(`DB is`);
//   console.log(db);
// }
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