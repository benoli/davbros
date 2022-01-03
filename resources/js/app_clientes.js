import './app_manager';
import { Clean } from "./support_classes/clean_sideform";
import { DB } from './support_classes/persist_data_frontend';
import { DNI } from './support_classes/dni';

const db = new DB();
const dni = new DNI();
const clean = new Clean();

// Fill the table with all planillas received
export const fillClientesTable = async(dataset)=> {
  var columnsSource = [{title:"Apellido"}, {title:"Nombre"}, {title:"Celular"}, {title:"DNI"}];
  var dataSource = dataset;
  
  var config = {"scrollY":"52vh", "scrollX": true, scrollCollapse: true, paging: false, "pageLength": 5, "lengthMenu": false, "pagingType": "simple", responsive: true, "processing": true, "destroy": true, "order": [[ 0, 'asc' ]], data: dataSource, columns: columnsSource, "language": {
    "search": "Buscar:"
      }
      , "initComplete": 
      function () {
          let api = this.api();
          var table = this;
          api.$('tr').attr('title', 'Click sobre un cliente para ver más datos');
          api.$('tr').click( async function (event) {
              event.stopPropagation();
              let thisRow = this;
              var elem = document.getElementById('modal1');
              var instance = M.Modal.init(elem, 
                {onOpenEnd:async()=>{
                  document.getElementById('change-client').addEventListener('click', initChangeClient);
                  document.getElementById('delete-client').addEventListener('click', proxyDeleteClient)
                }},
                {onCloseEnd:()=>{
                  document.getElementById('delete-client').removeEventListener('click', proxyDeleteClient); // Detach to improve the performance
                  document.getElementById('change-client').removeEventListener('click', initChangeClient); // Detach to improve the performance
                  let elem = document.querySelector('.modal');while (elem.firstChild) {elem.removeChild(elem.firstChild)
                  }}});
              let rowSelected = api.row(thisRow).data(); // Read data of row selected
              let userDataTemplate =     
              `<div class="modal-content">
                 <h4>Cliente: ${rowSelected[0]}, ${rowSelected[1]}</h4>
                 <p>Teléfono: ${rowSelected[2]}</p>
              </div>
              <div class="modal-footer">
                <button class="modal-close waves-effect btn-small">Salir</button>
                <button class="waves-effect btn-small red" data-id="${rowSelected[4]}" id="delete-client">Borrar</button>
                <button class="waves-effect btn-small blue" data-id="${rowSelected[4]}" id="change-client">Modificar</button>
              </div>`;
              elem.innerHTML = userDataTemplate;
              instance.open();
              console.log(rowSelected);
          } );
          //api.$('tr').click(evaluateClicks);
          // Here atach tooltip onmouseover
      } 
  };
  
  $('#clientes').DataTable(config);
}

const initChangeClient = async(event)=>{
    let id = event.target.dataset.id;
    let client = await db.getSingleDoc(id);
    let modal = document.getElementById('modal1');
    let instanceModal = M.Modal.getInstance(modal);
    instanceModal.close(); 
    let sideForm = document.querySelector('.side-form');
    let instance = M.Sidenav.getInstance(sideForm);
    let keysToSet = ['name', 'lastname', 'dni', 'fecha_nac', 'sex', 'email', 'address', 'phone', 'alternative_phone', 'tipo'];
    instance.open();
    for await (const [key, value] of Object.entries(client)){
      // console.log(`${key} => ${value}`);
      if (keysToSet.includes(key)) {
        if (key != 'tipo') {
          let input = sideForm.querySelector(`input[name=${key}]`);
          input.value = value;
        }
        else{
          await fillClientTipoOnDropdown(value);
        }
      }
    }
    await setFormHeader('Modificar');
    // 
}
// Delete client from local DB & put the action on queue
const deleteClient = async(event)=>{
  try {
    let client = await db.getSingleDoc(event.target.dataset.id);
    await db.removeSingleDoc(event.target.dataset.id);
    // Add deleted doc to queue
    // Set fields needed for queue
    client.saved = false;
    client.action = 'DELETE';
    // Add object to queue
    console.log('ADD next object to Queue');
    console.log(client);
    await addObjectOnQueue(client);
  } catch (error) {
    console.log(`Error on delete ${error}`);
  }
  // Need to check if doc deleted still on queue since his creation. Otherwise it's gona POST it first and then it's gona DELETE it on the same queue
  await showClientes();
  let instance = M.Modal.getInstance(event.target.parentElement.parentElement);
  instance.close();
  M.toast({html: `Cliente Eliminado`});
}

// Trap to display a confirmation modal. If interaction is positive forward the call to original handler 
// This need a refactor because is not removing the event listener 
const acceptToContinue = {
  apply: function(target, thisArg, argumentsList) {
    let modal = document.getElementById('modal-confirm');
    console.log(modal);
    let instance = M.Modal.init(modal);
    instance.open();
    modal.querySelector('.modal-footer .red').addEventListener('click', async(event)=>{
        event.preventDefault();
        return Reflect.apply(...arguments);
    });
  }
}

// Create a proxy to handle the confirmation of client delete
const proxyDeleteClient = new Proxy(deleteClient, acceptToContinue)

const redrawClientsUI= async(set)=> {
  let filteredSet = [];
  for await (const client of set){
    let clientData = [];
      clientData.push(client.lastname);
      clientData.push(client.name);
      clientData.push(client.phone);
      clientData.push(client.dni);
      clientData.push(client._id); // #3 Keep track of this
      // This for print 40 times the same client
      for (let i = 0; i < 40; i++) {
        filteredSet.push(clientData);
        
      }
      //filteredSet.push(clientData);
  };
    await fillClientesTable(filteredSet);
}

// Load clients on table on page load
const showClientes = async ()=> {
    let clients = await db.getClientes();
    // console.log('CLIENTS on CLientes');
    // console.log(clients);
    // throw new Error('Error');
    await redrawClientsUI(clients);
    //await db.deleteAllDocs(); //THIS IS DANGEROUS
  }
const atachScanners = async()=>{
  // If device is mobile. Delete button scanner
    document.getElementById('scanner').addEventListener('click', dni.scan);
    document.getElementById('camera').addEventListener('click', dni.camera);
}

const setFormHeader = async(context)=>{
  let sideForm = document.querySelector('.side-form');
  let i = context == 'Nuevo'?`<i class="right material-icons">person_add</i>`:`<i class="right material-icons">edit</i>`;
  sideForm.querySelector('form h6').innerHTML = `${context} Cliente ${i}`;
}

const cleanSideform = async()=>{
  await clean.basicClean();
  await dni.removePulse();
  await setFormHeader('Nuevo');
}

// Clean form fields when user has the intention to create a new client
const atachCleanerToAddBtn = async()=>{
  document.querySelector(".btn-floating.btn-small.btn-large.add-btn.sidenav-trigger").addEventListener('click', cleanSideform);
}


// I need to refactor the validations on this function
const addClient = async(event)=>{
  event.preventDefault();
  let client ={};
  const fieldsToValidate = ['email', 'dni']
  const fieldsRequired = ['name', 'lastname', 'dni', 'fecha_nac', 'sex', 'email', 'address', 'phone', 'alternative_phone'];
  let inputs = document.querySelectorAll("#form-add-cliente input");
  for await (const input of inputs){
      while (input.parentElement.contains(input.parentElement.querySelector('small'))) {
        input.parentElement.querySelector('small').remove();
      } 
      // Here validate if client already exists
      if (fieldsToValidate.includes(input.name)) {
        if (await db.docExists(input.name, input.value)) {
            // REturn validation messsage and avoid save
            let small = document.createElement('small');
            small.style = "color:red;";
            small.innerText = `Ya existe un usuario con ${input.name} ${input.value}`;
            input.insertAdjacentElement('afterend', small);
            M.toast({html: `Ya existe un usuario con ${input.name} ${input.value}`});
            return;
        }
      }
      if (fieldsRequired.includes(input.name)) {
        console.log(`Lenght of value for ${input.name} ==> ${input.value.length}`);
        if (input.value.length < 3) {
          // REturn validation messsage and avoid save
          let small = document.createElement('small');
          small.style = "color:red;";
          small.innerText = `${input.name} es un campo obligatorio y debe contener información  correcta`;
          input.insertAdjacentElement('afterend', small);
          M.toast({html: `${input.name} es un campo obligatorio y debe contener información  correcta`});
          return;
        }
      }
      if (input.className == 'select-dropdown dropdown-trigger') {
        continue;
      }
      client[input.name] = input.value;
  }
  let select = document.getElementById('select-tipo');
  client.type = 'CLIENT';
  client.user_id = '';
  client.tipo = select.value;
  // First save on pouch local Db
  let response = await db.saveSingleDoc(client);
  if (response.ok) {
    await showClientes();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    sidenav.dataset.canclose = 'true';
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    M.toast({html: `Nuevo cliente creado`});
    // Set fields needed for queue
    client.saved = false;
    client.action = 'POST';
    client._id = response.id;
    // Add object to queue
    await addObjectOnQueue(client);
  }
}

const atachAddClient = async()=>{
  document.getElementById('add-user').addEventListener('click', addClient);
}

const fillClientTipoOnDropdown = async (tipoSelected=false)=>{
  let tipos = ['Final', 'Intermedio'];
  let select = document.getElementById('select-tipo');
  try {
    while (select.firstChild) {select.removeChild(select.firstChild)};
    let oldInstance = M.FormSelect.getInstance(select);
    oldInstance.destroy();
  } catch (error) {
    console.log(error);
  }
  for await (const tipo of tipos){
      let option = document.createElement('option');
      option.innerText = tipo;
      option.value = tipo;
      if (tipoSelected == tipo) {
        option.setAttribute("selected", "selected");
        select.value = tipo;
      }
      select.appendChild(option);
  };
  let elem = document.getElementById('select-tipo');
  let instance = M.FormSelect.init(elem);
}

window.addEventListener('load', async()=>{
    await showClientes();
    await atachScanners();
    await clean.inputs();
    await atachCleanerToAddBtn();
    await atachAddClient();
    await fillClientTipoOnDropdown();
});

// HELPER FUNCTIONS

// This is for show the scanner button only if device != mobile
const checkDeviceType = async()=>{
  
}