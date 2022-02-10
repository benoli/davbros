import './app_manager';
import { Clean } from "./support_classes/clean_sideform";
import { DB } from './support_classes/persist_data_frontend';

const db = new DB();
const clean = new Clean();

// Fill the table with all planillas received
export const fillFojasTable = async(dataset)=> {
  var columnsSource = [{title:"Cliente"}, {title:"Sector"}, {title:"id"}];
  var dataSource = dataset;
  
  var config = {"scrollY":"52vh", "scrollX": true, scrollCollapse: true, paging: false, "pageLength": 5, "lengthMenu": false, "pagingType": "simple", responsive: true, "processing": true, "destroy": true, "order": [[ 0, 'asc' ]], data: dataSource, columns: columnsSource, "language": {
    "search": "Buscar:"
      }
      , "initComplete": 
      function () {
          let api = this.api();
          var table = this;
          api.$('tr').attr('title', 'Click sobre una planilla para rellenar');
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
              `<div class="modal-content">`;
              let foja = await db.getSingleDoc(rowSelected[2]);
              for await (const tarea of foja.tareas) {
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
                <button class="modal-close waves-effect btn-small">Salir</button>
                <button class="waves-effect btn-small blue" data-id="${rowSelected[2]}" id="change-client">Guardar</button>
              </div>`;
              elem.innerHTML = userDataTemplate;
              instance.open();
              console.log(rowSelected);
          } );
          //api.$('tr').click(evaluateClicks);
          // Here atach tooltip onmouseover
      } 
  };
  
  $('#fojas').DataTable(config);
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
  await showFojas();
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

const redrawFojasUI= async(set)=> {
  let filteredSet = [];
  for await (const foja of set){
    let fojaData = [];
      fojaData.push(foja.client);
      fojaData.push(foja.sector);
      fojaData.push(foja._id); // #3 Keep track of this
      // This for print 40 times the same foja
      for (let i = 0; i < 40; i++) {
        filteredSet.push(fojaData);
        
      }
      //filteredSet.push(fojaData);
  };
    await fillFojasTable(filteredSet);
}

// Load clients on table on page load
const showFojas = async ()=> {
    let fojas = await db.getFojas();
    console.log('FOJAS on Fojas');
    console.log(fojas);
    // throw new Error('Error');
    await redrawFojasUI(fojas);
    //await db.deleteAllDocs(); //THIS IS DANGEROUS
  }

const setFormHeader = async(context)=>{
  let sideForm = document.querySelector('.side-form');
  let i = context == 'Nueva'?`<i class="right material-icons">add</i>`:`<i class="right material-icons">edit</i>`;
  sideForm.querySelector('form h6').innerHTML = `${context} Planilla de Control ${i}`;
}

const cleanSideform = async()=>{
  await clean.basicClean();
  await setFormHeader('Nueva');
}

// Clean form fields when user has the intention to create a new client
const atachCleanerToAddBtn = async()=>{
  document.querySelector(".btn-floating.btn-small.btn-large.add-btn.sidenav-trigger").addEventListener('click', cleanSideform);
}


// I need to refactor the validations on this function
const addFojaControl = async(event)=>{
  event.preventDefault();
  let foja ={};
  foja.tareas = [];
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
      foja.tareas.push(input.value);
  }
  let select = document.getElementById('select-client');
  foja.type = 'FOJA';
  foja.user_id = '';
  foja.client = select.value;
  let sector = document.getElementById('select-sector');
  foja.sector = sector.value;
  // First save on pouch local Db
  let response = await db.saveSingleDoc(foja);
  if (response.ok) {
    await showFojas();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    sidenav.dataset.canclose = 'true';
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    M.toast({html: `Nueva planilla creada`});
  }
}

const atachAddFojaControl = async()=>{
  document.getElementById('add-foja').addEventListener('click', addFojaControl);
}

const fillClientOnDropdown = async (tipoSelected=false)=>{
  let clientes = ['Barrick', 'Aerolíneas'];
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
      option.innerText = client;
      option.value = client;
      if (tipoSelected == client) {
        option.setAttribute("selected", "selected");
        select.value = client;
      }
      select.appendChild(option);
  };
  let elem = document.getElementById('select-client');
  let instance = M.FormSelect.init(elem);
}

const fillSectorOnDropdown = async (tipoSelected=false)=>{
  let sectores = ['Habitaciones/baños', 'Baños Comparidos', 'Pasilos / Escaleras', 'Oficinas', 'Espacios comunes'];
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
      option.innerText = sector;
      option.value = sector;
      if (tipoSelected == sector) {
        option.setAttribute("selected", "selected");
        select.value = sector;
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
    await showFojas();
    await clean.inputs();
    await atachCleanerToAddBtn();
    await atachAddFojaControl();
    await fillClientOnDropdown();
    await fillSectorOnDropdown();
    await atachAddTarea();
});