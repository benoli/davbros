import './app_manager';
import { handleLogout } from './app_manager';
import { Clean } from "./support_classes/clean_sideform";
import { DB } from './support_classes/persist_data_frontend';
import { Cronometer } from './support_classes/cronometer';

const db = new DB();
const clean = new Clean();
let crono = new Cronometer();

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

db.localDB.changes({
  since: 'now',
  live: true,
  include_docs: true
}).on('change', async (change)=> {
  // change.id contains the doc id, change.doc contains the doc
  console.log(`A change has been made`);
  await closeAllModals();
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

/// DIGITAL SIGN SECTION ============================================

let $sigdiv = '';

const cleanSign = async(event)=>{
  $sigdiv.jSignature("reset");
}

const showSign = async(control)=>{
  return `<img src='data:${control.svgSign[0]},${control.svgSign[1]}'>`;
}

const saveSign = async(event)=>{
  let control = await db.getSingleDoc(event.target.dataset.id);
  //seguir aca obtener svg
  let svgSign = $sigdiv.jSignature("getData", "svgbase64");
  console.log(`The SVG is`);
  console.log(svgSign);
  //guardar en pouch
  control.svgSign = svgSign;
  control.signed = true;
  await db.saveSingleDoc(control);
  M.toast({html: `Firma guardada`});
  // update on server
  // Close and clean
  let modal = document.getElementById('modal-consent');
  let instance = M.Modal.init(modal);
  instance.open();
}

const initDigitalSign = async(event)=>{
  let control = await db.getSingleDoc(event.target.dataset.id);
  let modal = document.getElementById('modal-consent');
  let instance = M.Modal.init(modal);
  instance.open();
  let consent = `Al firmar el presente documento, usted brinda conformidad por la limpieza realizada en ${control.client}, al personal de DAVBROS S.R.L, y con lo detallado en la planilla de control.`
  let consentParagraph = document.getElementById('consent');
  consentParagraph.innerText = consent;
  if ($sigdiv == '') { // ask if sigdiv already is initialized.
    $sigdiv = $("#signature").jSignature({width: "100%", height: "100%", signatureLine:true});
    // let settings = $("#signature").jSignature("getSettings");
    // console.log(`Settings are`);
    // console.log(settings);
  }
  else{
    await cleanSign();
  }
  document.getElementById('clean-sign').removeEventListener('click', cleanSign);
  document.getElementById('clean-sign').addEventListener('click', cleanSign);
  let saveBtn = document.getElementById('save-sign');
  saveBtn.dataset.id = control._id;
  saveBtn.removeEventListener('click', saveSign);
  saveBtn.addEventListener('click', saveSign);
}

const closeAllModals = async()=>{
  for await (const modal of [...document.querySelectorAll('.modal')]){
    let instance = M.Modal.init(modal);
    instance.close();
  }
}

const startControl = async(event)=>{
    event.preventDefault();
    let control = await db.getSingleDoc(event.target.dataset.id);
    if (!control.start) {
      control.start = new Date();
      control.estado = `activo`;
      let updateResult = await db.saveSingleDoc(control);
      if (updateResult.ok) {
        await crono.showTime(control);
        document.getElementById('state').innerText = `${control.estado.replace(/^\w/, (c) => c.toUpperCase())}`;
        M.toast({html: `Control iniciado`});
      }
    }
    else{
      M.toast({html: `El control se inició el ${await dateFormat(control.start)}`});
    }

}

const endControl = async(event)=>{
  event.preventDefault();
  let control = await db.getSingleDoc(event.target.dataset.id);
  if (!control.end) {
    control.end = new Date();
    control.estado = `terminado`;
    // Here get all checked inputs
    let checkboxes = [...document.querySelectorAll('input[type=checkbox]')];
    for await (const checkbox of checkboxes){
      control.tareas.push(checkbox.checked);
      // if (condition) {
      //   //document.querySelector('input[type=checkbox]').checked
      //   //document.querySelector('input[type=checkbox]').nextElementSibling.innerText
      // }
    }
    console.log(control);
    let updateResult = await db.saveSingleDoc(control);
    if (updateResult.ok) {
      await crono.showTime(control);
      document.getElementById('state').innerText = `${control.estado.replace(/^\w/, (c) => c.toUpperCase())}`;
      M.toast({html: `Control terminado`});
    }
  }
  else{
    M.toast({html: `El control fue finalizado el ${await dateFormat(control.end)}`});
  }
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
              let rowSelected = api.row(thisRow).data(); // Read data of row selected
              let control = await db.getSingleDoc(rowSelected[3]);
              let planilla = await db.getPlanillaByFields(control.client, control.sector);
              var elem = document.getElementById('modal1');
              var instance = M.Modal.init(elem, 
                {onOpenEnd:async()=>{
                  await crono.showTime(control);
                  switch (control.estado) {
                    case 'pendiente':
                      document.getElementById('start-control').addEventListener('click', startControl);
                      break;
                    case 'activo':
                      document.getElementById('end-control').addEventListener('click', endControl);
                      break;
                    case 'terminado':
                      // Allow digital sign only if is checked on planilla model && if control state is terminado
                      if (planilla.digitalSign && !control.signed) {
                        document.getElementById('digital-sign').addEventListener('click', initDigitalSign);
                      }
                      break;
                    default:
                      document.getElementById(`time`).innerText = `Calculando...`;
                      M.toast({html: `Error en el calculo del tiempo`});
                      break;
                  }
                  if (await userCan()) {
                    document.getElementById('delete-control').addEventListener('click', proxyDeleteControl);
                  }
                  if (control.estado == `terminado`) {
                    // Disable all inputs
                    let inputs = document.querySelector('#control').querySelectorAll('input[type=checkbox]');
                    console.log(inputs);
                    for await (const input of [...inputs]){
                      input.disabled = `disabled`;
                    }
                  }
                }},
                {onCloseEnd:()=>{
                  // Detach to improve the performance
                  document.getElementById('start-control').removeEventListener('click', startControl);
                  document.getElementById('end-control').removeEventListener('click', endControl);
                  document.getElementById('delete-control').removeEventListener('click', proxyDeleteControl);
                  if (planilla.digitalSign && !control.signed) {
                    document.getElementById('digital-sign').removeEventListener('click', initDigitalSign);
                  }
                  let elem = document.querySelector('.modal');while (elem.firstChild) {elem.removeChild(elem.firstChild)
                  }
                }});
              let userDataTemplate =     
              `<div class="modal-content">
                 <button class="modal-close btn waves-effect waves-light grey right" style="width: 3.5rem;"><i class="material-icons right">close</i></button>
                 <h4>Datos de Control</h4>
                 <p class=""><b>Cliente|Sector:</b> <i>${rowSelected[2]}</i></p>
                 <p class=""><b>Operario:</b> <i>${rowSelected[1]}</i></p>
                 <p class=""><b>Estado:</b> <i id='state'>${rowSelected[0]}</i></p>
                 <p class=""><b>Tiempo:</b> <i id='time'></i></p>`;
                 if (planilla.digitalSign){
                  userDataTemplate += `<p class=""><b>Firmada:</b> ${control.signed?'Si':'No'}</p>`;
                 }
                 userDataTemplate += `<form id="control" class="container section">`;
              for await (const tarea of planilla.tareas) {
                userDataTemplate +=     
                `<p class='checkbox-field'>
                  <label>
                    <input type="checkbox" />
                    <span>${tarea}</span>
                  </label>
                </p>`;
              }
              userDataTemplate +=`</div>`;
              if (control.signed) {
                userDataTemplate +=`<div class='center'>${await showSign(control)}</div>`;
              }
              userDataTemplate +=`<div class="modal-footer">`;
                if (control.estado == `pendiente`) {
                  userDataTemplate +=`
                    <button class="waves-effect btn-small blue" data-id="${rowSelected[3]}" id="start-control">Inicio</button>
                  `;
                }
                if (control.estado == `activo`) {
                userDataTemplate +=`
                  <button class="waves-effect btn-small green" data-id="${rowSelected[3]}" id="end-control">Terminar</button>
                `;
                }
                if (planilla.digitalSign && !control.signed && control.estado == `terminado`) {
                  userDataTemplate +=`<button class="waves-effect btn-small" data-id="${rowSelected[3]}" id="digital-sign">Firmar</button>`;
                }
                if (await userCan()) {
                  userDataTemplate +=`<button class="waves-effect btn-small red" data-id="${rowSelected[3]}" id="delete-control">Eliminar</button>`;
                }
              userDataTemplate +=`
              </div>
              </form>`;
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
// Delete control from local DB
const deleteControl = async(event)=>{
  try {
    await db.removeSingleDoc(event.target.dataset.id);
  } catch (error) {
    console.log(`Error on deleteControl ${error}`);
  }
  await showControles();
  let instance = M.Modal.getInstance(event.target.parentElement.parentElement);
  instance.close();
  M.toast({html: `Control Eliminado`});
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
const proxyDeleteControl = new Proxy(deleteControl, acceptToContinue)

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
    let controles;
    let selector;
    let role = localStorage.getItem('userRole');
    let userID = localStorage.getItem('supportID');
    console.log(`LOG`);
    console.log(role);
    switch (role) {
      case 'employee':
        let operario = await db.getDocByField('id', parseInt(localStorage.getItem('supportID')));
        selector = {type:`CONTROL`, operario:operario._id};
        break;
      case 'internal_controller':
        let clientes = await db.getClientes();
        console.log(`Clientes are`);
        console.log(clientes);
        let orArray = [];
        for await (const client of clientes){
          for await (const supervisor of client.supervisores.internal_controller){
            if (supervisor === parseInt(userID)) {
              orArray.push({"client":client._id});
            }
          }
        }
        console.log(`Clients filtered are`);
        console.log(orArray);
        selector = {
            type:`CONTROL`,
            "$or": orArray
        };
        break;
      case 'external_controller':
        let clients = await db.getClientes();
        console.log(`Clientes are`);
        console.log(clients);
        let clientsFiltered = [];
        for await (const client of clients){
          for await (const supervisor of client.supervisores.external_controller){
            if (supervisor === parseInt(userID)) {
              clientsFiltered.push(client._id);
            }
          }
        }
        console.log(`Clients filtered are`);
        console.log(clientsFiltered);
        let clientID = clientsFiltered.length > 0?clientsFiltered[0]:``;
        selector = {
          type:`CONTROL`,
          client:clientID
        };
        break;
      default:
        selector = {type:`CONTROL`};
        break;
    }
    controles = await db.getDocBySelector(selector);
    if (!controles) {
      controles = [];
    }
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
  control.start = false;
  control.end = false;
  control.estado = "pendiente"; // Other states activo|terminado
  //control.percent = async()=>{};
  control.tareas = [];
  let client = document.getElementById('select-client');
  let clientName = client.options[client.selectedIndex].innerText;
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