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
PouchDB.plugin(find);
// CHANGE THIS -> Get credentials using XHR not in file because when file is cached on login page, credentials are exposed.
const username = "sswsboss";
const password = "cA*RLp16qfP#*#";

//let get_date = async ()=>{let date = new Date(); return date.toJSON();};
export const localDB = new PouchDB('localDavbros');
const remoteDB = new PouchDB('https://db.davbros.com.ar/davbros_dev', {auth:{username: username, password:password}});

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

localDB.changes().on('change', function() {
  console.log('Ch-Ch-Changes');
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
    localStorage.setItem('apiToken', token);
    localStorage.setItem('apiTokenType', type);
    localStorage.setItem('supportID', id);
    localStorage.setItem('apiLogged', true);
    localStorage.setItem('userRole', role);
    localStorage.removeItem('email');
    localStorage.removeItem('password');
  }

  console.log(content);
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

const atachLogout = async ()=>{
  let logoutLink = document.querySelector("a[href='/app/logout']");
  logoutLink.addEventListener('click', handleLogout);
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

window.onload = apilogin();
window.onload = atachLogout();
window.onload = disableBackButton();
window.onload = addSuperActions();