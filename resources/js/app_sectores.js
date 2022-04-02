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
  await showSectores();
  if (change.deleted) {
    // document was deleted
  } else {
    // document was added/modified
  }
}).on('error', function (err) {
  // handle errors
});


// Fill the table with all planillas received
export const fillSectoresTable = async(dataset)=> {
  var columnsSource = [{title:"Cliente"}, {title:"Sector"}];
  var dataSource = dataset;
  
  var config = {"scrollY":"52vh", "scrollX": true, scrollCollapse: true, paging: false, "pageLength": 5, "lengthMenu": false, "pagingType": "simple", responsive: true, "processing": true, "destroy": true, "order": [[ 0, 'asc' ]], data: dataSource, columns: columnsSource, "language": {
    "search": "Buscar:"
      }
      , "initComplete": 
      function () {
          let api = this.api();
          var table = this;
          api.$('tr').attr('title', 'Click sobre un sector para editar');
          api.$('tr').click( async function (event) {
              event.stopPropagation();
              let thisRow = this;
              var elem = document.getElementById('modal1');
              var instance = M.Modal.init(elem, 
                {onOpenEnd:async()=>{
                  document.getElementById('change-sector').addEventListener('click', initChangeSector);
                  document.getElementById('delete-sector').addEventListener('click', proxyDeleteSector)
                }},
                {onCloseEnd:()=>{
                  document.getElementById('delete-sector').removeEventListener('click', proxyDeleteSector); // Detach to improve the performance
                  document.getElementById('change-sector').removeEventListener('click', initChangeSector); // Detach to improve the performance
                  let elem = document.querySelector('.modal');while (elem.firstChild) {elem.removeChild(elem.firstChild)
                  }
                }});
              let rowSelected = api.row(thisRow).data(); // Read data of row selected
              let sectorDataTemplate =     
              `<div class="modal-content">
                <button class="modal-close btn waves-effect waves-light grey right" style="width: 3.5rem;"><i class="material-icons right">close</i></button>
                <h4>Datos de Sector</h4>
                <p class="show-data-field">Cliente: ${rowSelected[0]}</p>
                <p class="show-data-field">Sector: ${rowSelected[1]}</p>
                <p class="show-data-field">Nota: ${rowSelected[2]}</p>
              </div>
              <div class="modal-footer">
                <button class="waves-effect btn-small green" data-id="${rowSelected[3]}" id="change-sector">Editar</button>
                <button class="waves-effect btn-small red" data-id="${rowSelected[3]}" id="delete-sector">Eliminar</button>
              </div>`;
              elem.innerHTML = sectorDataTemplate;
              instance.open();
              console.log(rowSelected);
          } );
          //api.$('tr').click(evaluateClicks);
          // Here atach tooltip onmouseover
      } 
  };
  
  $('#sectores').DataTable(config);
}

const initChangeSector = async(event)=>{
    let sectorID = event.target.dataset.id;
    let sector = await db.getSingleDoc(sectorID);
    let modal = document.getElementById('modal1');
    let instanceModal = M.Modal.getInstance(modal);
    instanceModal.close(); 
    let sideForm = document.querySelector('.side-form');
    let instance = M.Sidenav.getInstance(sideForm);
    //let keysToSet = ['name'];
    instance.open();
    let input = sideForm.querySelector(`input[name=nombre]`);
    input.value = sector.nombre;
    let textarea = document.querySelector(`#form-add-sector textarea`);
    textarea.value = sector.nota;
    M.textareaAutoResize(textarea);
    await setFormHeaderAndButton('Modificar', sector._id);
    await fillClientOnDropdown(sector.client);
    // 
}
// Delete client from local DB & put the action on queue
const deleteSector = async(event)=>{
  try {
    await db.removeSingleDoc(event.target.dataset.id);
  } catch (error) {
    console.log(`Error on delete ${error}`);
  }
  await showSectores();
  let modal = document.querySelector('.modal.open');
  let instance = M.Modal.getInstance(modal);
  instance.close();
  M.toast({html: `Sector Eliminado`});
}

// Trap to display a confirmation modal. If interaction is positive forward the call to original handler 
// This need a refactor because is not removing the event listener
const acceptToContinue = {
  apply: function(target, thisArg, argumentsList) {
    let modal = document.getElementById('modal-confirm');
    console.log(modal);
    const forwardInteraction = async(event)=>{
      event.preventDefault();
      console.log(`Triggered fordwareInteraction`);
      return Reflect.apply(...arguments);
    } 
    let instance = M.Modal.init(modal,
      {onOpenEnd:async()=>{
        modal.querySelector('.modal-footer .red').addEventListener('click', forwardInteraction);
      }},
      {onCloseEnd:()=>{
        modal.querySelector('.modal-footer .red').removeEventListener('click', forwardInteraction); // Detach to improve the performance
      }});
    instance.open();
  }
}

// Create a proxy to handle the confirmation of sector delete
const proxyDeleteSector = new Proxy(deleteSector, acceptToContinue)

const redrawSectoresUI= async(sectores)=> {
  let filteredSet = [];
  for await (const sector of sectores){
    let sectorData = [];
    let client = await db.getSingleDoc(sector.client);
    sectorData.push(client.name);
    sectorData.push(sector.nombre);
    sectorData.push(sector.nota);
    sectorData.push(sector._id); // #3 Keep track of this
    filteredSet.push(sectorData);
  };
    await fillSectoresTable(filteredSet);
}

// Load clients on table on page load
const showSectores = async ()=> {
    let sectores = await db.getSectores();
    console.log('SECTORES on showSectores');
    console.log(sectores);
    // throw new Error('Error');
    await redrawSectoresUI(sectores);
    //await db.deleteAllDocs(); //THIS IS DANGEROUS
  }

const editSector = async(event)=>{
  event.preventDefault();
  let sectorID = event.target.dataset.id;
  let sector = await db.getSingleDoc(sectorID);
  sector.nombre = document.querySelector(`#form-add-sector input[name=nombre]`).value;
  sector.client = document.getElementById('select-client').value;
  sector.nota = document.querySelector(`#form-add-sector textarea`).value;
  try {
    db.saveSingleDoc(sector);
  } catch (error) {
    console.log(`Error on editSector ${error}`);
  }
  await showSectores();
  // Clean everything
  let sidenav = document.querySelector('#side-form');
  sidenav.dataset.canclose = 'true';
  let instance = M.Sidenav.getInstance(sidenav);
  instance.close();
  await cleanSideform();
  M.toast({html: `Sector Actualizado`});
}

const setFormHeaderAndButton = async(context, sectorID=false)=>{
  let sideForm = document.querySelector('.side-form');
  let i = context == 'Nuevo'?`<i class="right material-icons">add</i>`:`<i class="right material-icons">edit</i>`;
  sideForm.querySelector('form h6').innerHTML = `${context} Sector ${i}`;
  let button = document.querySelector('.side-form button'); // Here is an error need to fix it when sector is setted as edit
  if (context == 'Nuevo') {
    button.id = 'add-sector';
    button.innerText = 'Agregar';
    button.dataset.id = '';
    button.removeEventListener('click', editSector);
    button.addEventListener('click', addSector);
  }
  else{
    button.id = 'edit-sector';
    button.innerText = 'Guardar Cambios';
    button.dataset.id = sectorID;
    button.removeEventListener('click', addSector);
    button.addEventListener('click', editSector);
  }
}

const cleanSideform = async()=>{
  await clean.basicClean();
  await setFormHeaderAndButton('Nuevo');
}

// Clean form fields when user has the intention to create a new client
const atachCleanerToAddBtn = async()=>{
  document.querySelector(".btn-floating.btn-small.btn-large.add-btn.sidenav-trigger").addEventListener('click', cleanSideform);
}


// I need to refactor the validations on this function
const addSector = async(event)=>{
  event.preventDefault();
  let sector ={};
  // sector.planillas = [];
  let selectClient = document.getElementById('select-client');
  let clientID = selectClient.value;
  if (clientID.length < 1) {
      // REturn validation messsage and avoid save
      let small = document.createElement('small');
      small.style = "color:red;";
      small.innerText = `Debe seleccionar un cliente para crear un sector`;
      selectClient.insertAdjacentElement('afterend', small);
      M.toast({html: `Debe seleccionar un cliente para crear un sector`});
      return;
  }
  const fieldsToValidate = ['nombre']
  const fieldsRequired = ['nombre'];
  let inputs = document.querySelectorAll("#form-add-sector input");
  for await (const input of inputs){
      while (input.parentElement.contains(input.parentElement.querySelector('small'))) {
        input.parentElement.querySelector('small').remove();
      } 
      // Here validate if sector already exists in client
      if (fieldsToValidate.includes(input.name)) {
        if (await db.sectorExists(clientID, input.value)) {
            // REturn validation messsage and avoid save
            let small = document.createElement('small');
            small.style = "color:red;";
            small.innerText = `Ya existe un sector con ${input.name} ${input.value}`;
            input.insertAdjacentElement('afterend', small);
            M.toast({html: `Ya existe un sector con ${input.name} ${input.value}`});
            return;
        }
      }
      if (fieldsRequired.includes(input.name)) {
        if (input.value.length < 1) {
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
      //console.log(`Input is ${input.name} & value is ${input.value}`);
      sector.nombre = input.value;
  }

  sector.nota = document.querySelector(`#form-add-sector textarea`).value;
  sector.client = clientID;
  sector.type = 'SECTOR';
  // First save on pouch local Db
  console.log(`Sector is`);
  console.log(sector);
  let response = await db.saveSingleDoc(sector);
  if (response.ok) {
    await showSectores();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    sidenav.dataset.canclose = 'true';
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    M.toast({html: `Nuevo sector creado`});
  }
}

const atachAddSector = async()=>{
  document.getElementById('add-sector').addEventListener('click', addSector);
}

const fillClientOnDropdown = async (clientSelected=false)=>{
  let clientes = await db.getClientes();
  let select = document.getElementById('select-client');
  try {
    while (select.firstChild) {select.removeChild(select.firstChild)};
    let oldInstance = M.FormSelect.getInstance(select);
    oldInstance.destroy();
  } catch (error) {
    console.log(error);
  }
  for await (const client of clientes){
      let option = document.createElement('option');
      option.innerText = client.name;
      option.value = client._id;
      if (clientSelected == client._id) {
        option.setAttribute("selected", "selected");
        select.value = client._id;
      }
      select.appendChild(option);
  };
  let elem = document.getElementById('select-client');
  let instance = M.FormSelect.init(elem);
}

window.addEventListener('load', async()=>{
    await showSectores();
    await clean.inputs();
    await atachCleanerToAddBtn();
    await atachAddSector();
    await fillClientOnDropdown();
});