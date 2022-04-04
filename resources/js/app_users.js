import { event } from 'jquery';
import './app_manager';
import { Clean } from "./support_classes/clean_sideform";
const clean = new Clean();
import { DB } from './support_classes/persist_data_frontend';
const db = new DB();

const getUsers = async (id=false)=>{
    let endpoint = `/api/users`;
    if (id) {
        endpoint += `/${id}`;
    }
    let type = localStorage.getItem('apiTokenType');
    let token = localStorage.getItem('apiToken');
    const fetchUsers = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `${type} ${token}` 
        }
      });
    return await fetchUsers.json();
}

const initChangeUser = async(event)=>{
        let id = event.target.dataset.id;
        let user = await getUsers(id);
        console.log(user);
        let modal = document.getElementById('modal1');
        let instanceModal = M.Modal.getInstance(modal);
        instanceModal.close(); 
        let sideForm = document.querySelector('.side-form');
        let instance = M.Sidenav.getInstance(sideForm);
        instance.open();
    
        // Fill user role
        let select = document.querySelector(`select[name=role]`);
        // console.log(select);
        select.value = user.role;
        // console.log(`option[value="${value}"]`);
        let option = select.querySelector(`option[value="${user.role}"]`);
        // console.log(option);
        select.querySelector(`option[value="${user.role}"]`).setAttribute("selected", "selected");
        let instanceSelect = M.FormSelect.init(select);
        let keysToSetUser = ['name', 'lastname', 'email'];
        // Fill client personal data]
        for await (const [key, value] of Object.entries(user)){
          console.log(`${key} => ${value}`);
          if (keysToSetUser.includes(key)) {
              let input = sideForm.querySelector(`input[name=${key}]`);
              input.value = value;
          }
        }
        await setFormHeaderAndButton('Modificar', id);
}

// Fill the table with all planillas received
const fillUsersTable = async(dataset)=> {
    var columnsSource = [{title:"Nombre"}, {title:"Rol"}, {title:"Email"}];
    var dataSource = dataset;
    
    var config = {scrollY:'70vh', "scrollX": true, scrollCollapse: true, paging: false, responsive: true, "processing": true, "destroy": true, "order": [[ 0, 'asc' ]], data: dataSource, columns: columnsSource, "language": {
      "search": "Buscar:"
        }
        , "initComplete": 
        function () {
            let api = this.api();
            var table = this;
            api.$('tr').attr('title', 'Click sobre un usuario para ver más datos');
            api.$('tr').click( async function (event) {
                event.stopPropagation();
                let thisRow = this;
                let elem = document.getElementById('modal1');
                let instance = M.Modal.init(elem,
                    {onOpenEnd:async()=>{
                        document.getElementById('change-user').addEventListener('click', initChangeUser);
                        document.getElementById('delete-user').addEventListener('click', proxyDeleteUser)
                    }}, 
                    {onCloseEnd:()=>{
                        document.getElementById('delete-user').removeEventListener('click', proxyDeleteUser); // Detach to improve the performance
                        document.getElementById('change-user').removeEventListener('click', initChangeUser); // Detach to improve the performance
                        let elem = document.querySelector('.modal');while (elem.firstChild) {elem.removeChild(elem.firstChild)}}
                    }
                );
                let rowSelected = api.row(thisRow).data(); // Read data of row selected
                let userDataTemplate =     
                `<div class="modal-content">
                   <h4>Datos de Usuario</h4>
                   <p class="show-data-field">Nombre: ${rowSelected[0]}</p>
                   <p class="show-data-field">Rol: ${rowSelected[1]}</p>
                   <p class="show-data-field">Email: ${rowSelected[2]}</p>
                </div>
                <div class="modal-footer">
                  <button class="modal-close waves-effect btn-small">Salir</button>
                  <button class="waves-effect btn-small red" data-id="${rowSelected[3]}" id="delete-user">Eliminar</button>
                  <button class="waves-effect btn-small blue" data-id="${rowSelected[3]}" id="change-user">Modificar</button>
                </div>`;
                elem.innerHTML = userDataTemplate;
                instance.open();
                console.log(rowSelected);
            } );
        } 
    };
    
    $('#usuarios').DataTable(config);
  
    // let table1 = $('table.stripe');
    // table1[0].style.width = '150vh';
    // let table2 = $('.dataTables_scrollHeadInner');
    // table2[0].style.width = '150vh';
  }
  
const prepareData = async(set)=> {
    let filteredSet = [];
    let roles = [{'super':'Super Admin'}, {'employee':'Empleado'}, {'external_controller':'Supervisor externo'}, {'internal_controller':'Encargado'}, {'admin':'Administrador'}];
    for await (const user of set){
        if (user.role == 'super') {
            continue;
        }
        let clientData = [];
        clientData.push(`${user.lastname}, ${user.name}`);
        clientData.push(roles[roles.findIndex(role => Object.keys(role)[0] == user.role)][`${user.role}`]);
        //clientData.push(user.activo);
        //clientData.push(user.telefono);
        clientData.push(user.email);
        clientData.push(user.id);
        filteredSet.push(clientData);
    };
      return filteredSet;
}

const fillUsers = async ()=>{
    let users = await getUsers();
    let filteredSet = await prepareData(users);
    console.log(users);
    await fillUsersTable(filteredSet);
}

const setFormHeaderAndButton = async(context, clientID=false)=>{
    let sideForm = document.querySelector('.side-form');
    let i = context == 'Nuevo'?`<i class="right material-icons">person_add</i>`:`<i class="right material-icons">edit</i>`;
    sideForm.querySelector('form h6').innerHTML = `${context} Usuario ${i}`;
    let button = sideForm.querySelector('.btn-small');
    console.log(sideForm);
    console.log(button);
    if (context == 'Nuevo') {
      button.id = 'add-user';
      button.innerText = 'Agregar';
      button.dataset.id = '';
      button.removeEventListener('click', editUser);
      button.addEventListener('click', addUser);
    }
    else{
      button.id = 'edit-user';
      button.innerText = 'Guardar Cambios';
      button.dataset.id = clientID;
      button.removeEventListener('click', addUser);
      button.addEventListener('click', editUser);
    }
  }

const cleanSideform = async()=>{
    await clean.basicClean();
    await setFormHeaderAndButton('Nuevo');
  }

const editUser = async(event)=>{
    event.preventDefault();
    let id = event.target.dataset.id;
    let formData = new FormData();
    formData.append('_method', 'PUT');
    let inputs = document.querySelectorAll("#form-add-user input");
    for await (const input of inputs){
        formData.append(input.name, input.value);
    }
    let selectRole = document.getElementById('select-role');
    formData.append('role', selectRole.value);
    let type = localStorage.getItem('apiTokenType');
    let token = localStorage.getItem('apiToken');
    const postNewUser = await fetch(`/api/users/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': type + ' ' + token,
          'Accept': 'application/json' 
        },
        body: new URLSearchParams(formData)
        }
      );
    console.log(postNewUser);
    let result = await postNewUser.json();
    console.log(result);
    if (result.status == 'ok') {
        await fillUsers();
        // Clean everything
        let sidenav = document.querySelector('#side-form');
        sidenav.dataset.canclose = 'true';
        let instance = M.Sidenav.getInstance(sidenav);
        instance.close();
        await cleanSideform();
        M.toast({html: `${result.msg}`});
    }
    else{
        result.error.map(err =>
            err.map(
                msg=> M.toast({html: `${msg}`})
            )
        )
    }
}

const addUser = async(event)=>{
    event.preventDefault();
    let formData = new FormData();
    let inputs = document.querySelectorAll("#form-add-user input");
    for await (const input of inputs){
        formData.append(input.name, input.value);
    }
    let selectRole = document.getElementById('select-role');
    formData.append('role', selectRole.value);
    let type = localStorage.getItem('apiTokenType');
    let token = localStorage.getItem('apiToken');
    const postNewUser = await fetch("/api/users", {
        method: 'POST',
        headers: {
          'Authorization': type + ' ' + token,
          'Accept': 'application/json' 
        },
        body: new URLSearchParams(formData)
        }
      );
    console.log(postNewUser);
    let result = await postNewUser.json();
    console.log(result);
    if (result.status == 'ok') {
      // console.log(`FORM DATA IS`);
      // for await (const [key, value] of formData) {
      //   console.log('>>»', key, value)
      // }
      // throw new Error(`Showing form Data`)
        if (formData.get(`role`) == `employee`) {
          let operator = {name:formData.get(`name`), lastname:formData.get(`lastname`), id:result.user_id, type:'OPERARIO'};
          if(! await db.docExists('id', operator.id)){
            let response = await db.saveSingleDoc(operator);
            console.log(`response of save operator => ${response}`);
          }
        }
        let role = formData.get(`role`);
        if (role == `internal_controller` || role == `external_controller`) {
          const selected = [...document.querySelectorAll('#relate-client-to-controller option:checked')].map(e => e.value);
          console.log(`Selection is`);
          console.log(selected);
          for await (const client of selected){
            let clientObj = await db.getSingleDoc(client);
            clientObj.supervisores[`${role}`].push(result.user_id);
          }
        }
        await fillUsers();
        // Clean everything
        let sidenav = document.querySelector('#side-form');
        sidenav.dataset.canclose = 'true';
        let instance = M.Sidenav.getInstance(sidenav);
        instance.close();
        await cleanSideform();
        M.toast({html: `${result.msg}`});
    }
    else{
        result.error.map(err =>
            err.map(
                msg=> M.toast({html: `${msg}`})
            )
        )
    }
}

const atachAddUser = async()=>{
    document.getElementById("add-user").addEventListener('click', addUser);
}

const addClientSelector = async(event)=>{
  let selectExists = document.getElementById(`relate-client-to-controller`);
  if (selectExists) {
    let instanceOfSelect = M.FormSelect.getInstance(selectExists);
    instanceOfSelect.destroy();
    selectExists.parentElement.remove();
  }
  let roles = ['external_controller', 'internal_controller'];
  if (roles.includes(event.target.value)) {
    let select = document.createElement('select');
    select.id = `relate-client-to-controller`;
    let optionSelection = document.createElement('option');
    optionSelection.value = "";
    optionSelection.setAttribute('disabled', 'disabled');
    optionSelection.setAttribute('selected', 'selected');
    optionSelection.innerText = `Seleccione Cliente`;
    if (event.target.value == `internal_controller`) {
      select.setAttribute('multiple', 'multiple');
      optionSelection.innerText = `Seleccione Clientes`;
    }
    let clients = await db.getClientes();
    if (clients.length < 1) {
      M.toast({html: `Debe crear clientes primero`});
    }
    for await (const client of clients){
      let option = document.createElement('option');
      option.innerText = client.name;
      option.value = client._id;
      select.appendChild(option);
    }
    let div = document.createElement(`div`);
    div.className = `input-field`;
    let label = document.createElement(`label`);
    label.innerText = `Asignar cliente/s al usuario`;
    div.appendChild(select);
    div.appendChild(label);
    document.getElementById(`select-role`).parentElement.parentElement.insertAdjacentElement('afterend', div);
    let instance = M.FormSelect.init(select);
  }
}

const fillUserRoleOnDropdown = async ()=>{
    let roles = [{'employee':'Empleado'}, {'external_controller':'Supervisor del Cliente'}, {'internal_controller':'Encargado'}, {'admin':'Administrador'}];
    let select = document.getElementById('select-role');
    await clean.cleanSelect(select);
    try {
      let optionSelection = document.createElement('option');
      optionSelection.value = "";
      optionSelection.setAttribute('disabled', 'disabled');
      optionSelection.setAttribute('selected', 'selected');
      optionSelection.innerText = `Seleccione Rol`;
      select.appendChild(optionSelection);
      for await (const role of roles){
          for await (const [key, value] of Object.entries(role)){
            let option = document.createElement('option');
            option.innerText = value;
            option.value = key;
            select.appendChild(option);
          }
      };
      let instance = M.FormSelect.init(select);
    } catch (error) {
      console.log(`Error => ${error}`);
    }

    select.removeEventListener('change', addClientSelector);
    select.addEventListener('change', addClientSelector);
}

// Delete user fram backend
const deleteUser = async(event)=>{
    try {
      let userID = event.target.dataset.id;
      let formData = new FormData();
      formData.append('_method', 'DELETE');
      let type = localStorage.getItem('apiTokenType');
      let token = localStorage.getItem('apiToken');
      const postDeleteUser = await fetch(`/api/users/${userID}`, {
        method: 'POST',
        headers: {
          'Authorization': type + ' ' + token,
          'Accept': 'application/json' 
        },
        body: new URLSearchParams(formData)
        }
      );
        console.log(postDeleteUser);
        let result = await postDeleteUser.json();
        console.log(result);
        if (result.status == 'ok') {
            let selector = {type:`OPERARIO`, id:parseInt(userID)};
            console.log(`Selector id`);
            console.log(selector);
            let pouchUser = await db.getDocBySelector(selector);
            console.log(`Pouch user is`);
            console.log(pouchUser);
            if (pouchUser) {
              let response = await db.removeSingleDoc(pouchUser._id);
              console.log(`Response of deletion is => ${response.ok}`);
            }
            console.log(`The user is deleted ==> ${result.msg}`);
            await fillUsers();
            let instance = M.Modal.getInstance(event.target.parentElement.parentElement);
            instance.close();
            M.toast({html: `Usuario Eliminado`});
        }
        else{
            M.toast({html: `No se pudo eliminar`});
            console.log(`Error deleting ==> ${result.msg}`);
        }
    } catch (error) {
      console.log(`Error on delete ${error}`);
    }
}

// Trap to display a confirmation modal. If interaction is positive forward the call to original handler 
// This need a refactor because is not removing the event listener 
const acceptToContinue = {
    apply: function(target, thisArg, argumentsList) {
      // console.log(`Arguments`);
      // console.log(argumentsList);
        let modal = document.getElementById('modal-confirm');
        console.log(`ON ACCEPT TO CONTINUE`);
        console.log(modal);
        let instance = M.Modal.init(modal);
        instance.open();
        modal.querySelector('.modal-footer .red').addEventListener('click', async(event)=>{
            event.preventDefault();
            // let selector = {id:parseInt(argumentsList[0].target.dataset.id)};
            // if (!await db.areDocsRelated(selector)) {
            //   M.toast({html: `No se pudo eliminar, porque existen documentos asociados`});
            //   return;
            // }
            return Reflect.apply(...arguments);
        });
    }
}
  
// Create a proxy to handle the confirmation of user delete
const proxyDeleteUser = new Proxy(deleteUser, acceptToContinue);

window.addEventListener('load', async ()=>{
    await fillUsers();
    await atachAddUser();
    await fillUserRoleOnDropdown();
});


// const fetchUsers = await fetch("/api/users", {
//     method: 'GET',
//     headers: {
//       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//       'Authorization': type + ' ' + token 
//     }
//   });