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
  await showPlanillas();
  if (change.deleted) {
    // document was deleted
  } else {
    // document was added/modified
  }
}).on('error', function (err) {
  // handle errors
});

// Fill the table with all planillas received
const fillPlanillasTable = async(dataset)=> {
  var columnsSource = [{title:"Cliente"}, {title:"Sector"}];
  var dataSource = dataset;
  
  var config = {"scrollY":"52vh", "scrollX": true, scrollCollapse: true, paging: false, "pageLength": 5, "lengthMenu": false, "pagingType": "simple", responsive: true, "processing": true, "destroy": true, "order": [[ 0, 'asc' ]], data: dataSource, columns: columnsSource, "language": {
    "search": "Buscar:"
      }
      , "initComplete": 
      function () {
          let api = this.api();
          var table = this;
          api.$('tr').attr('title', 'Click sobre una planilla para ver las tareas');
          api.$('tr').click( async function (event) {
              event.stopPropagation();
              let thisRow = this;
              var elem = document.getElementById('modal1');
              var instance = M.Modal.init(elem, 
                {onOpenEnd:async()=>{
                  document.getElementById('change-planilla').addEventListener('click', initChangePlanilla);
                  document.getElementById('delete-planilla').addEventListener('click', proxyDeletePlanilla)
                }},
                {onCloseEnd:()=>{
                  document.getElementById('delete-planilla').removeEventListener('click', proxyDeletePlanilla); // Detach to improve the performance
                  document.getElementById('change-planilla').removeEventListener('click', initChangePlanilla); // Detach to improve the performance
                  let elem = document.querySelector('.modal');while (elem.firstChild) {elem.removeChild(elem.firstChild)
                  }
                }});
              let rowSelected = api.row(thisRow).data(); // Read data of row selected
              let planilla = await db.getSingleDoc(rowSelected[2]);
              let sector = await db.getSingleDoc(planilla.sector);
              let userDataTemplate =     
              `<div class="modal-content">
                <button class="modal-close btn waves-effect waves-light grey right" style="width: 3.5rem;"><i class="material-icons right">close</i></button>
                <h4>Datos de Planilla</h4>
                <p class="show-data-field">Cliente: ${rowSelected[0]}</p>
                <p class="show-data-field">Sector: ${rowSelected[1]}</p>
                <p class="show-data-field">Nota: ${sector.nota}</p>
                <p class="show-data-field">Firma digital: ${planilla.digitalSign?'Si':'No'}</p>
                <h5>Lista de Tareas</h5>
              `;
              for await (const tarea of planilla.tareas) {
                userDataTemplate +=     
                `<p class="show-data-field">${tarea}</p>`;
              }
              userDataTemplate +=`</div>
              <div class="modal-footer">
                <button class="waves-effect btn-small grey" data-id="${rowSelected[2]}" id="change-planilla">Editar</button>
                <button class="waves-effect btn-small red" data-id="${rowSelected[2]}" id="delete-planilla">Eliminar</button>
              </div>`;
              elem.innerHTML = userDataTemplate;
              instance.open();
              console.log(rowSelected);
          } );
          //api.$('tr').click(evaluateClicks);
          // Here atach tooltip onmouseover
      } 
  };
  
  $('#planillas').DataTable(config);
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
  await showPlanillas();
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

const redrawPlanillasUI= async(planillas)=> {
  let filteredSet = [];
  for await (const planilla of planillas){
      let planillaData = [];
      let client = await db.getSingleDoc(planilla.client);
      let sector = await db.getSingleDoc(planilla.sector);
      planillaData.push(client.name);
      planillaData.push(sector.nombre);
      planillaData.push(planilla._id);
      filteredSet.push(planillaData);
  };
    await fillPlanillasTable(filteredSet);
}

// Load clients on table on page load
const showPlanillas = async ()=> {
    let planillas = await db.getPlanillas();
    console.log('Planillas on showPlanillas');
    console.log(planillas);
    // throw new Error('Error');
    await redrawPlanillasUI(planillas);
    //await db.deleteAllDocs(); //THIS IS DANGEROUS
  }

const editPlanilla = async(event)=>{
  event.preventDefault();
  let planillaID = event.target.dataset.id;
  let planilla = await db.getSingleDoc(planillaID);
  let client = document.getElementById('select-client');
  let clientName = client.options[client.selectedIndex].innerText;
  planilla.client = client.value;
  let sector = document.getElementById('select-sector');
  planilla.sector = sector.value;
  planilla.digitalSign = document.querySelector('input[type=checkbox]').checked; 
  let sectorName = sector.options[sector.selectedIndex].innerText;
  planilla.tareas = []; // Clean the old tareas array
  let inputs = document.querySelectorAll("#form-add-cliente input");
  for await (const input of inputs){
      if (input.className == 'filled-in') {
        continue;
      }
      if (input.value.length < 1) {
        M.toast({html: `${input.name} es un campo obligatorio y no puede estar vacío.`});
        return;
      }
      if (input.className == 'select-dropdown dropdown-trigger') {
        continue;
      }
      planilla.tareas.push(input.value);
  }
  try {
    db.saveSingleDoc(planilla);
  } catch (error) {
    console.log(`Error on editPlanilla ${error}`);
  }
  await showPlanillas();
  // Clean everything
  let sidenav = document.querySelector('#side-form');
  sidenav.dataset.canclose = 'true';
  let instance = M.Sidenav.getInstance(sidenav);
  instance.close();
  await cleanSideform();
  M.toast({html: `Planilla actualizada`});
}

  const setFormHeaderAndButton = async(context, planillaID=false)=>{
    let sideForm = document.querySelector('.side-form');
    let i = context == 'Nueva'?`<i class="right material-icons">add</i>`:`<i class="right material-icons">edit</i>`;
    sideForm.querySelector('form h6').innerHTML = `${context} Planilla ${i}`;
    let button = document.querySelectorAll('.side-form button')[1]; // Here is an error need to fix it when sector is setted as edit
    if (context == 'Nueva') {
      button.id = 'add-planilla';
      button.innerText = 'Agregar';
      button.dataset.id = '';
      button.removeEventListener('click', editPlanilla);
      button.addEventListener('click', addPlanilla);
    }
    else{
      button.id = 'edit-planilla';
      button.innerText = 'Guardar Cambios';
      button.dataset.id = planillaID;
      button.removeEventListener('click', addPlanilla);
      button.addEventListener('click', editPlanilla);
    }
  }

const cleanSideform = async()=>{
  await clean.basicClean();
  await setFormHeaderAndButton('Nueva');
  await leftOneInput();
}

// Clean form fields when user has the intention to create a new client
const atachCleanerToAddBtn = async()=>{
  document.querySelector(".btn-floating.btn-small.btn-large.add-btn.sidenav-trigger").addEventListener('click', cleanSideform);
}


// I need to refactor the validations on this function
const addPlanilla = async(event)=>{
  event.preventDefault();
  await clean.smalls();
  let planilla ={};
  planilla.tareas = [];
  let client = document.getElementById('select-client');
  let clientName = client.options[client.selectedIndex].innerText;
  console.log(`Client Name is ${clientName}`);
  planilla.client = client.value;
  planilla.type = 'PLANILLA';
  let sector = document.getElementById('select-sector');
  planilla.sector = sector.value;
  let sectorName = sector.options[sector.selectedIndex].innerText;
  if (await db.planillaExists(planilla.client, planilla.sector)) {
    M.toast({html: `Ya existe una planilla para el cliente ${clientName}, y el sector ${sectorName}`});
    return;
  }
  planilla.digitalSign = document.querySelector('input[type=checkbox]').checked; 
  let inputs = document.querySelectorAll("#form-add-cliente input");
  for await (const input of inputs){
      if (input.className == 'filled-in') {
        continue;
      }
      if (input.value.length < 1) {
        M.toast({html: `${input.name} es un campo obligatorio y no puede estar vacío.`});
        return;
      }
      if (input.className == 'select-dropdown dropdown-trigger') {
        continue;
      }
      planilla.tareas.push(input.value);
  }
  // First save on pouch local Db
  let response = await db.saveSingleDoc(planilla);
  if (response.ok) {
    await showPlanillas();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    sidenav.dataset.canclose = 'true';
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    M.toast({html: `Nueva planilla creada`});
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

const removeTarea = async(event)=>{
    event.target.removeEventListener('click', removeTarea);
    let inputs = document.querySelectorAll('.side-form input[name=tarea]');
    if(inputs.length > 1){
      event.target.parentElement.remove();
    };
    await atachRemoveTarea();
}

const atachRemoveTarea = async()=>{
  for await (const iTag of ([...document.querySelectorAll(`.side-form .input-field i`)])){
    iTag.removeEventListener(`click`, removeTarea);
    iTag.remove();
  }
    let inputs = document.querySelectorAll('.side-form input[name=tarea]');
    if(inputs.length > 1){
      let i = document.createElement("i");
      i.className = `right material-icons`;
      i.innerText = `clear`;
      i.addEventListener('click', removeTarea);
      inputs[inputs.length - 1].insertAdjacentElement('beforebegin', i);
    };
}

const addTarea = async(event, tarea=false)=>{
  event.preventDefault();
  let template = `<div class="input-field">
                    <input placeholder="Tarea" type="text" class="validate" name="tarea" value="${tarea?tarea:''}"required>
                    <label class='active' for="name">Nombre tarea</label>
                  </div>`
  ;
  event.target.parentElement.insertAdjacentHTML('beforebegin', template);
  event.target.scrollIntoView({behavior: "smooth"});
  await atachRemoveTarea();
}

const atachAddTarea = async()=>{
  document.getElementById('add-tarea').addEventListener('click', addTarea);
}

window.addEventListener('load', async()=>{
    await showPlanillas();
    await clean.inputs();
    await atachCleanerToAddBtn();
    await fillClientOnDropdown();
    await atachAddTarea();
});