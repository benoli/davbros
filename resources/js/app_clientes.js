import './app_manager';
import { Clean } from "./support_classes/clean_sideform";
import { DB } from './support_classes/persist_data_frontend';

const db = new DB();
const clean = new Clean();

db.localDB.changes({
  since: 'now',
  live: true,
  include_docs: true
}).on('change', async (change)=> {
  // change.id contains the doc id, change.doc contains the doc
  console.log(`A change has been made`);
  await showClientes();
  if (change.deleted) {
    // document was deleted
  } else {
    // document was added/modified
  }
}).on('error', function (err) {
  // handle errors
});

// Fill the table with all planillas received
export const fillClientesTable = async(dataset)=> {
  var columnsSource = [{title:"Nombre"}, {title:"Tel."}, {title:"Email"}];
  var dataSource = dataset;
  
  var config = {scrollY:'70vh', "scrollX": true, scrollCollapse: true, paging: false, responsive: true, "processing": true, "destroy": true, "order": [[ 0, 'asc' ]], data: dataSource, columns: columnsSource, "language": {
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
                 <button class="modal-close btn waves-effect waves-light grey right" style="width: 3.5rem;"><i class="material-icons right">close</i></button>
                 <h4>Datos de Cliente</h4>
                 <p class="show-data-field">Nombre: ${rowSelected[0]}</p>
                 <p class="show-data-field">Teléfono: ${rowSelected[1]}</p>
                 <p class="show-data-field">Email: ${rowSelected[2]}</p>
              </div>
              <div class="modal-footer">
                <button class="waves-effect btn-small grey" data-id="${rowSelected[3]}" id="change-client">Editar</button>
                <button class="waves-effect btn-small blue" data-id="${rowSelected[3]}" id="select-client">Seleccionar</button>
                <button class="waves-effect btn-small red" data-id="${rowSelected[3]}" id="delete-client">Eliminar</button>
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
    let keysToSet = ['name', 'phone', 'email'];
    instance.open();
    for await (const [key, value] of Object.entries(client)){
      // console.log(`${key} => ${value}`);
      if (keysToSet.includes(key)) {
        let input = sideForm.querySelector(`input[name=${key}]`);
        input.value = value;
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
  } catch (error) {
    M.toast({html: `Error, no se puede eliminar. Contacte al soporte. Error: ${error}`});
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
      clientData.push(client.name);
      clientData.push(client.phone);
      clientData.push(client.email);
      clientData.push(client._id); // #3 Keep track of this
      filteredSet.push(clientData);
  };
    console.log(set);
    console.log(filteredSet);
    await fillClientesTable(filteredSet);
}

// Load clients on table on page load
const showClientes = async ()=> {
    let clients = await db.getClientes();
    console.log('CLIENTS on CLientes');
    console.log(clients);
    // throw new Error('Error');
    await redrawClientsUI(clients);
    //await db.deleteAllDocs(); //THIS IS DANGEROUS
  }

const setFormHeader = async(context)=>{
  let sideForm = document.querySelector('.side-form');
  let i = context == 'Nuevo'?`<i class="right material-icons">add</i>`:`<i class="right material-icons">edit</i>`;
  sideForm.querySelector('form h6').innerHTML = `${context} Cliente ${i}`;
  let button = document.getElementById('add-client');
  if (context == 'Nuevo') {
    button.innerText = `Agregar`;
  }
  else{
    button.innerText = `Guardar`;
  }
}

const cleanSideform = async()=>{
  await clean.basicClean();
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
  const fieldsToValidate = ['email']
  const fieldsRequired = ['name'];
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
            small.innerText = `Ya existe un cliente con ${input.name} ${input.value}`;
            input.insertAdjacentElement('afterend', small);
            M.toast({html: `Ya existe un cliente con ${input.name} ${input.value}`});
            return;
        }
      }
      if (fieldsRequired.includes(input.name)) {
        console.log(`Lenght of value for ${input.name} ==> ${input.value.length}`);
        if (input.value.length < 2) {
          // REturn validation messsage and avoid save
          let small = document.createElement('small');
          small.style = "color:red;";
          small.innerText = `${input.name} es un campo obligatorio y debe contener información  correcta`;
          input.insertAdjacentElement('afterend', small);
          M.toast({html: `${input.name} es un campo obligatorio y debe contener información  correcta`});
          return;
        }
      }
      client[input.name] = input.value;
  }
  client.type = 'CLIENT';
  client.supervisores = {};
  client.supervisores.external_controller = [];
  client.supervisores.internal_controller = [];
  // First save on pouch local Db
  let response = await db.saveSingleDoc(client);
  console.log(`Response on save is ===>>>>`);
  console.log(response);
  if (response.ok) {
    await showClientes();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    sidenav.dataset.canclose = 'true';
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    M.toast({html: `Nuevo cliente creado`});
  }
}

const atachAddClient = async()=>{
  document.getElementById('add-client').addEventListener('click', addClient);
}

window.addEventListener('load', async()=>{
    await showClientes();
    await clean.inputs();
    await atachCleanerToAddBtn();
    await atachAddClient();
});