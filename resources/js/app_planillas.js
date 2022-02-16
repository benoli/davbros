import './app_manager';
import { Clean } from "./support_classes/clean_sideform";
import { DB } from './support_classes/persist_data_frontend';

const db = new DB();
const clean = new Clean();

// Fill the table with all planillas received
export const fillPlanillasTable = async(dataset)=> {
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
              <h4>Datos de Planilla</h4>
              <p class="show-data-field">Cliente: ${rowSelected[0]}</p>
              <p class="show-data-field">Sector: ${rowSelected[1]}</p>
              `;
              let planilla = await db.getSingleDoc(rowSelected[2]);
              let sector = await db.getSingleDoc(planilla.sector);
              userDataTemplate += `<p class="show-data-field">Nota: ${sector.nota}</p>`;
              for await (const tarea of planilla.tareas) {
                userDataTemplate +=     
                `<p class="show-data-field">${tarea}</p>`;
              }
              userDataTemplate +=`</div>
              <div class="modal-footer">
                <button class="modal-close waves-effect btn-small">Salir</button>
                <button class="waves-effect btn-small red" data-id="${rowSelected[2]}" id="delete-planilla">Eliminar</button>
                <button class="waves-effect btn-small blue" data-id="${rowSelected[2]}" id="change-planilla">Modificar</button>
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

const initChangeClient = async(event)=>{
    let id = event.target.dataset.id;
    let client = await db.getSingleDoc(id);
    let modal = document.getElementById('modal1');
    let instanceModal = M.Modal.getInstance(modal);
    instanceModal.close(); 
    let sideForm = document.querySelector('.side-form');
    let instance = M.Sidenav.getInstance(sideForm);
    let keysToSet = ['name', 'lastname', 'dni', 'fecha_nac', 'sex', 'email', 'address', 'phone', 'alternative_phone', 'client'];
    instance.open();
    for await (const [key, value] of Object.entries(client)){
      // console.log(`${key} => ${value}`);
      if (keysToSet.includes(key)) {
        if (key != 'client') {
          let input = sideForm.querySelector(`input[name=${key}]`);
          input.value = value;
        }
        else{
          await fillClientTipoOnDropdown(value);
        }
      }
    }
    await setFormHeaderAndButton('Modificar');
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
  await showPlanillas();
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
  // let sectorID = event.target.dataset.id;
  // let sector = await db.getSingleDoc(sectorID);
  // sector.nombre = document.querySelector(`#form-add-sector input[name=nombre]`).value;
  // sector.client = document.getElementById('select-client').value;
  // sector.nota = document.querySelector(`#form-add-sector textarea`).value;
  // try {
  //   db.saveSingleDoc(sector);
  // } catch (error) {
  //   console.log(`Error on editSector ${error}`);
  // }
  // await showSectores();
  // // Clean everything
  // let sidenav = document.querySelector('#side-form');
  // sidenav.dataset.canclose = 'true';
  // let instance = M.Sidenav.getInstance(sidenav);
  // instance.close();
  // await cleanSideform();
  // M.toast({html: `Sector Actualizado`});
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
}

// Clean form fields when user has the intention to create a new client
const atachCleanerToAddBtn = async()=>{
  document.querySelector(".btn-floating.btn-small.btn-large.add-btn.sidenav-trigger").addEventListener('click', cleanSideform);
}


// I need to refactor the validations on this function
const addPlanilla = async(event)=>{
  event.preventDefault();
  let planilla ={};
  planilla.tareas = [];
  const fieldsToValidate = ['email', 'dni']
  const fieldsRequired = ['name', 'lastname', 'dni', 'fecha_nac', 'sex', 'email', 'address', 'phone', 'alternative_phone'];
  let inputs = document.querySelectorAll("#form-add-cliente input");
  for await (const input of inputs){
      while (input.parentElement.contains(input.parentElement.querySelector('small'))) {
        input.parentElement.querySelector('small').remove();
      } 
      // Here validate if client already exists
      // if (fieldsToValidate.includes(input.name)) {
      //   if (await db.docExists(input.name, input.value)) {
      //       // REturn validation messsage and avoid save
      //       let small = document.createElement('small');
      //       small.style = "color:red;";
      //       small.innerText = `Ya existe un usuario con ${input.name} ${input.value}`;
      //       input.insertAdjacentElement('afterend', small);
      //       M.toast({html: `Ya existe un usuario con ${input.name} ${input.value}`});
      //       return;
      //   }
      // }
      // if (fieldsRequired.includes(input.name)) {
      //   console.log(`Lenght of value for ${input.name} ==> ${input.value.length}`);
      //   if (input.value.length < 3) {
      //     // REturn validation messsage and avoid save
      //     let small = document.createElement('small');
      //     small.style = "color:red;";
      //     small.innerText = `${input.name} es un campo obligatorio y debe contener información  correcta`;
      //     input.insertAdjacentElement('afterend', small);
      //     M.toast({html: `${input.name} es un campo obligatorio y debe contener información  correcta`});
      //     return;
      //   }
      // }
      if (input.className == 'select-dropdown dropdown-trigger') {
        continue;
      }
      planilla.tareas.push(input.value);
  }
  let select = document.getElementById('select-client');
  planilla.client = select.value;
  planilla.type = 'PLANILLA';
  let sector = document.getElementById('select-sector');
  planilla.sector = sector.value;
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

const fillClientOnDropdown = async (tipoSelected=false)=>{
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
      if (tipoSelected == client._id) {
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

const addTarea = async(event)=>{
  event.preventDefault();
  let template = `<div class="input-field">
                    <input placeholder="Nombre" id="name" type="text" class="validate" name="name" required>
                    <label for="name">Nombre tarea</label>
                  </div>`
  ;
  event.target.insertAdjacentHTML('beforebegin', template);
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