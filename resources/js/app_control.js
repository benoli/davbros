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
  await showControles();
  if (change.deleted) {
    // document was deleted
  } else {
    // document was added/modified
  }
}).on('error', function (err) {
  // handle errors
});

const dateFormat = async(dateToFormat)=>{
  let date = new Date(dateToFormat);
  let options = { weekday: 'short', day: 'numeric', month: 'numeric', hour: 'numeric', minute:'numeric' };
  return new Intl.DateTimeFormat('es-ES', options).format(date);
}

// Fill the table with all planillas received
const fillControlesTable = async(dataset)=> {
  var columnsSource = [{title:"Estado"}, {title:"Operario"}, {title:"Cliente|Sector"}];
  var dataSource = dataset;
  
  var config = {"scrollY":"52vh", "scrollX": true, scrollCollapse: true, paging: false, "pageLength": 5, "lengthMenu": false, "pagingType": "simple", responsive: true, "processing": true, "destroy": true, "order": [[ 0, 'asc' ]], data: dataSource, columns: columnsSource, "language": {
    "search": "Buscar:"
      }
      , "initComplete": 
      function () {
          let api = this.api();
          var table = this;
          api.$('tr').attr('title', 'Click para completar.');
          api.$('tr').click( async function (event) {
              event.stopPropagation();
              let thisRow = this;
              var elem = document.getElementById('modal1');
              var instance = M.Modal.init(elem, 
                {onOpenEnd:async()=>{
                  // document.getElementById('change-client').addEventListener('click', initChangeClient);
                  // document.getElementById('delete-client').addEventListener('click', proxyDeleteClient)
                }},
                {onCloseEnd:()=>{
                  // document.getElementById('delete-client').removeEventListener('click', proxyDeleteClient); // Detach to improve the performance
                  // document.getElementById('change-client').removeEventListener('click', initChangeClient); // Detach to improve the performance
                  // let elem = document.querySelector('.modal');while (elem.firstChild) {elem.removeChild(elem.firstChild)
                  // }
                }});
              let rowSelected = api.row(thisRow).data(); // Read data of row selected
              let userDataTemplate =     
              `<div class="modal-content">
                 <button class="modal-close btn waves-effect waves-light grey right" style="width: 3.5rem;"><i class="material-icons right">close</i></button>
              `;
              let control = await db.getSingleDoc(rowSelected[3]);
              console.log(`Control is`);
              console.log(control);
              let planilla = await db.getPlanillaByFields(control.client, control.sector);
              console.log(`planilla is`);
              console.log(planilla);
              for await (const tarea of planilla.tareas) {
                userDataTemplate +=     
                `<p>
                  <label>
                    <input type="checkbox" />
                    <span>${tarea}</span>
                  </label>
                </p>`;
              }
              userDataTemplate +=`</div>
              <div class="modal-footer">
              <button class="waves-effect btn-small blue" data-id="${rowSelected[3]}" id="start-control">Iniciar</button>
                <button class="waves-effect btn-small green" data-id="${rowSelected[3]}" id="end-control">Terminar</button>
                <button class="waves-effect btn-small red" data-id="${rowSelected[3]}" id="delete-control">Eliminar</button>
                <button class="waves-effect btn-small yellow" data-id="${rowSelected[3]}" id="change-control">Modificar</button>
              </div>`;
              elem.innerHTML = userDataTemplate;
              instance.open();
              console.log(rowSelected);
          } );
          //api.$('tr').click(evaluateClicks);
          // Here atach tooltip onmouseover
      } 
  };
  
  $('#controles').DataTable(config);
}

const leftOneInput = async()=>{
  let addTaskBtn = document.getElementById('add-tarea');
  let close = addTaskBtn.parentElement.previousElementSibling.querySelector('.right.material-icons');
  while (close != null) {
    console.log(`Exists`);
    let evento = {target:close};
    await removeTarea(evento);
    close = addTaskBtn.parentElement.previousElementSibling.querySelector('.right.material-icons');
    // addTaskBtn.parentElement.previousElementSibling.querySelector('.right.material-icons').dispatchEvent('click');
    //addTaskBtn.parentElement.previousElementSibling.querySelector('.right.material-icons').click();
  }
}

const removeAllInputs = async()=>{
  let inputs = document.querySelectorAll('.side-form input[name=tarea]');
  for await (const input of [...inputs]){
    // if (inputs.length > 1) {
      input.parentElement.remove();
      // console.log(`Lenght is => ${inputs.length}`);
      // console.log(inputs);
    // }
  }
}

const initChangePlanilla = async(event)=>{
    await clean.basicClean();
    await removeAllInputs();
    let id = event.target.dataset.id;
    let planilla = await db.getSingleDoc(id);
    let modal = document.getElementById('modal1');
    let instanceModal = M.Modal.getInstance(modal);
    instanceModal.close(); 
    let sideForm = document.querySelector('.side-form');
    let instance = M.Sidenav.getInstance(sideForm);
    let keysToSet = ['client', 'sector', 'tareas'];
    instance.open();
    for await (const [key, value] of Object.entries(planilla)){
      // console.log(`${key} => ${value}`);
      if (keysToSet.includes(key)) {
        switch (key) {
          case 'tareas':
            let addBtn = document.getElementById('add-tarea');
            let evento = {target:addBtn, preventDefault:()=>{}};
            // After removeAllInputs I add all inputs
            for await (const tarea of value){
              await addTarea(evento, tarea)
            }
            break;
          case 'client':
            await fillClientOnDropdown(value);
            break;
          case 'sector':
            let evento2 = {target:{value:planilla.client}};
            await fillSectorOnDropdown(evento2, value);
            break;
          default:
            break;
        }
      }
    }
    await setFormHeaderAndButton('Modificar', id);
    
}
// Delete client from local DB & put the action on queue
const deletePlanilla = async(event)=>{
  try {
    await db.removeSingleDoc(event.target.dataset.id);
  } catch (error) {
    console.log(`Error on deletePlanilla ${error}`);
  }
  // Need to check if doc deleted still on queue since his creation. Otherwise it's gona POST it first and then it's gona DELETE it on the same queue
  await showControles();
  let instance = M.Modal.getInstance(event.target.parentElement.parentElement);
  instance.close();
  M.toast({html: `Planilla Eliminada`});
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
const proxyDeletePlanilla = new Proxy(deletePlanilla, acceptToContinue)

const calcTotalTime = async(end, start)=>{
  console.log(`Calculating time...`);
  return `Calculating...`
}

const redrawControlesUI= async(controles)=> {
  let filteredSet = [];
  for await (const control of controles){
      let controlData = [];
      let client = await db.getSingleDoc(control.client);
      let sector = await db.getSingleDoc(control.sector);
      let operario = await db.getSingleDoc(control.operario);
      // controlData.push(`${control.estado}|${await calcTotalTime(control.end, control.start)}`);
      controlData.push(`${control.estado.replace(/^\w/, (c) => c.toUpperCase())}`);
      controlData.push(`${operario.lastname}, ${operario.name}`);
      controlData.push(`${client.name}|${sector.nombre}`);
      controlData.push(control._id);
      filteredSet.push(controlData);
  };
    await fillControlesTable(filteredSet);
}

// Load clients on table on page load
const showControles = async ()=> {
    let controles = await db.getControles();
    console.log('Controles on showControles');
    console.log(controles);
    // throw new Error('Error');
    await redrawControlesUI(controles);
    //await db.deleteAllDocs(); //THIS IS DANGEROUS
  }

const editControl = async(event)=>{
  event.preventDefault();
  // let planillaID = event.target.dataset.id;
  // let planilla = await db.getSingleDoc(planillaID);
  // let client = document.getElementById('select-client');
  // let clientName = client.options[client.selectedIndex].innerText;
  // planilla.client = client.value;
  // let sector = document.getElementById('select-sector');
  // planilla.sector = sector.value;
  // let sectorName = sector.options[sector.selectedIndex].innerText;
  // planilla.tareas = []; // Clean the old tareas array
  // let inputs = document.querySelectorAll("#form-add-cliente input");
  // for await (const input of inputs){
  //     if (input.value.length < 1) {
  //       M.toast({html: `${input.name} es un campo obligatorio y no puede estar vacío.`});
  //       return;
  //     }
  //     if (input.className == 'select-dropdown dropdown-trigger') {
  //       continue;
  //     }
  //     planilla.tareas.push(input.value);
  // }
  // try {
  //   db.saveSingleDoc(planilla);
  // } catch (error) {
  //   console.log(`Error on editPlanilla ${error}`);
  // }
  // await showControles();
  // // Clean everything
  // let sidenav = document.querySelector('#side-form');
  // sidenav.dataset.canclose = 'true';
  // let instance = M.Sidenav.getInstance(sidenav);
  // instance.close();
  // await cleanSideform();
  // M.toast({html: `Planilla actualizada`});
}

  const setFormHeaderAndButton = async(context, planillaID=false)=>{
    let sideForm = document.querySelector('.side-form');
    let i = context == 'Nuevo'?`<i class="right material-icons">add</i>`:`<i class="right material-icons">edit</i>`;
    sideForm.querySelector('form h6').innerHTML = `${context} Control ${i}`;
    let button = document.querySelector('.side-form button'); // Here is an error need to fix it when sector is setted as edit
    if (context == 'Nuevo') {
      button.id = 'add-control';
      button.innerText = 'Agregar';
      button.dataset.id = '';
      button.removeEventListener('click', editControl);
      button.addEventListener('click', addControl);
    }
    else{
      button.id = 'edit-planilla';
      button.innerText = 'Guardar Cambios';
      button.dataset.id = planillaID;
      button.removeEventListener('click', addControl);
      button.addEventListener('click', editControl);
    }
  }

const cleanSideform = async()=>{
  await clean.basicClean();
  await setFormHeaderAndButton('Nuevo');
  // await leftOneInput();
}

// Clean form fields when user has the intention to create a new client
const atachCleanerToAddBtn = async()=>{
  document.querySelector(".btn-floating.btn-small.btn-large.add-btn.sidenav-trigger").addEventListener('click', cleanSideform);
}


// I need to refactor the validations on this function
const addControl = async(event)=>{
  event.preventDefault();
  await clean.smalls();
  let control ={};
  control.start = "";
  control.end = "";
  control.estado = "pendiente"; // Other states activo|terminado
  //control.percent = async()=>{};
  control.tareas = [];
  let client = document.getElementById('select-client');
  // let clientName = client.options[client.selectedIndex].innerText;
  // console.log(`Client Name is ${clientName}`);
  control.client = client.value;
  control.type = 'CONTROL';
  let sector = document.getElementById('select-sector');
  control.sector = sector.value;
  let sectorName = sector.options[sector.selectedIndex].innerText;
  let operario = document.getElementById('select-operario');
  control.operario = operario.value;
  // I must do a validation here taht take account of estado value and assigned_at maybe. Think about this 
  if (!await db.planillaExists(control.client, control.sector)) {
    M.toast({html: `NO existe modelo de planilla para el cliente ${clientName}, y el sector ${sectorName}`});
    M.toast({html: `Debe crear uno primero`});
    return;
  }
  let input = document.querySelector("#form-add-control input[name=nro_ofi_hab]");
  if (input.value.length < 1) {
    M.toast({html: `Nro/detalle de oficina/habitación es un campo obligatorio y no puede estar vacío.`});
    return;
  }
  control.nro_ofi_hab = input.value;
  control.assigned_at = new Date();
  // First save on pouch local Db
  let response = await db.saveSingleDoc(control);
  if (response.ok) {
    await showControles();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    sidenav.dataset.canclose = 'true';
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    M.toast({html: `Nuevo control asignado`});
  }
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
  let evento = {'target': select};
  await fillSectorOnDropdown(evento);
  select.removeEventListener('change', fillSectorOnDropdown);
  select.addEventListener('change', fillSectorOnDropdown);
}

const fillSectorOnDropdown = async (event, tipoSelected=false)=>{
  let sectores = await db.getSectoresByClient(event.target.value);
  let select = document.getElementById('select-sector');
  try {
    while (select.firstChild) {select.removeChild(select.firstChild)};
    let oldInstance = M.FormSelect.getInstance(select);
    oldInstance.destroy();
  } catch (error) {
    console.log(error);
  }
  for await (const sector of sectores){
      let option = document.createElement('option');
      option.innerText = sector.nombre;
      option.value = sector._id;
      if (tipoSelected == sector._id) {
        option.setAttribute("selected", "selected");
        select.value = sector._id;
      }
      select.appendChild(option);
  };
  let elem = document.getElementById('select-sector');
  let instance = M.FormSelect.init(elem);
}

const fillOperariosOnDropdown = async (event, tipoSelected=false)=>{
  let operarios = await db.getOperarios();
  let select = document.getElementById('select-operario');
  try {
    while (select.firstChild) {select.removeChild(select.firstChild)};
    let oldInstance = M.FormSelect.getInstance(select);
    oldInstance.destroy();
  } catch (error) {
    console.log(error);
  }
  for await (const operario of operarios){
      let option = document.createElement('option');
      option.innerText = `${operario.name} ${operario.lastname}`;
      option.value = operario._id;
      if (tipoSelected == operario._id) {
        option.setAttribute("selected", "selected");
        select.value = operario._id;
      }
      select.appendChild(option);
  };
  let elem = document.getElementById('select-operario');
  let instance = M.FormSelect.init(elem);
}

window.addEventListener('load', async()=>{
    await showControles();
    await clean.inputs();
    await atachCleanerToAddBtn();
    await fillClientOnDropdown();
    await fillOperariosOnDropdown();
});