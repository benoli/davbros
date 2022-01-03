import './app_manager';
//import './support_classes/photoTaker'
// import { addObjectToQueue as addObjectOnQueue } from "./app_manager";
import { Clean } from "./support_classes/clean_sideform";
import { DB } from './support_classes/persist_data_frontend';
import { DNI } from './support_classes/dni';
import { PhotoTaker } from './support_classes/photoTaker';

const db = new DB();
const dni = new DNI();
const clean = new Clean();
const taker = new PhotoTaker();

const dateFormat = async(dateToFormat)=>{
    let date = new Date(dateToFormat);
    let options = { weekday: 'short', day: 'numeric', month: 'numeric', hour: 'numeric', minute:'numeric' };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
}

const customPrint = async (content)=>{
    let printwin = window.open("");
    printwin.document.write(content);
    printwin.stop();
    printwin.print();
    printwin.close();
}

const printFixOrder = async(event)=>{
    let order = await db.getSingleDoc(event.target.dataset.id);
    let photos = order.photos.length > 0?'Si':'No';
    let fecha = await dateFormat(order.created_at);
    //let received_by = await db.getDocByField() end this.
    let printOrderTemplate =     
    `
    <style>
    html {
      font-family: sans-serif;
    }

    table {
      border-collapse: collapse;
      border: 2px solid rgb(200,200,200);
      letter-spacing: 1px;
      font-size: 0.8rem;
    }

    td, th {
      border: 1px solid rgb(190,190,190);
      padding: 10px 20px;
    }

    td {
      text-align: center;
    }

    caption {
      padding: 10px;
    }
    </style>
    <div class="modal-content">
    <h2>Datos de Orden</h2>
    <p>Fecha: ${fecha}</p>
    <p>Recibido por: ${'Andres Gil'}</p>
    <p>Cliente: ${order.lastname}, ${order.name}</p>
    <p>DNI: ${order.dni}</p>
    <table>
        <tr>
            <td class="bold">Dispositivo</td>
            <td class="bold">Detalle</td>
            <td class="bold">Fotos tomadas</td>
            <td class="bold">Cantidad de fotos</td>
            <td class="bold">Consentimiento</td>
        </tr>`;
        printOrderTemplate += `
        <tr>
            <td>${order.device}</td>
            <td>${order.details}</td>
            <td>${photos}</td>
            <td>${order.photos.length}</td>
            <td>${'Not Found'}</td>
        </tr>`;
    printOrderTemplate += `</table>`;
    await customPrint(printOrderTemplate);
}

// Fill the table with all planillas received
export const fillFixOrdersTable = async(dataset)=> {
  var columnsSource = [{title:"Estado"}, {title:"Dispositivo"}, {title:"Apellido"}, {title:"Nombre"}, {title:"Recibido"}];
  var dataSource = dataset;
  
  var config = {"scrollY":"52vh", "scrollX": true, scrollCollapse: true, paging: false, responsive: true, "processing": true, "destroy": true, "order": [[ 0, 'asc' ]], data: dataSource, columns: columnsSource, "language": {
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
                  //document.getElementById('change-client').addEventListener('click', initChangeClient);
                  document.getElementById('print-fixOrder').addEventListener('click', printFixOrder);
                  document.getElementById('delete-fixOrder').addEventListener('click', proxyDeleteFixOrder);
                }},
                {onCloseEnd:()=>{
                  document.getElementById('delete-fixOrder').removeEventListener('click', proxyDeleteFixOrder); // Detach to improve the performance
                  document.getElementById('print-fixOrder').removeEventListener('click', printFixOrder);
                  //document.getElementById('change-client').removeEventListener('click', initChangeClient); // Detach to improve the performance
                  let elem = document.querySelector('.modal');while (elem.firstChild) {elem.removeChild(elem.firstChild)
                  }}});
              let rowSelected = api.row(thisRow).data(); // Read data of row selected
              let userDataTemplate =     
              `<div class="modal-content">
                 <h4>Cliente: ${rowSelected[2]}, ${rowSelected[3]}</h4>
                 <p>Dispositivo: ${rowSelected[1]}</p>
                 <p>Estado: ${rowSelected[0]}</p>
                 <p>Fecha Recepción: ${rowSelected[4]}</p>
              </div>
              <div class="modal-footer">
                <button class="modal-close waves-effect btn-small">Salir</button>
                <button class="waves-effect btn-small red" data-id="${rowSelected[5]}" id="delete-fixOrder">Borrar</button>
                <button class="waves-effect btn-small green" data-id="${rowSelected[5]}" id="print-fixOrder">Imprimir</button>
                <button class="waves-effect btn-small blue" data-id="${rowSelected[5]}" id="change-fixOrder">Modificar</button>
              </div>`;
              elem.innerHTML = userDataTemplate;
              instance.open();
              console.log(rowSelected);
          } );
          //api.$('tr').click(evaluateClicks);
          // Here atach tooltip onmouseover
      } 
  };
  
  $('#reparaciones').DataTable(config);
}

// const initChangeClient = async(event)=>{
//     let id = event.target.dataset.id;
//     let client = await db.getSingleDoc(id);
//     let modal = document.getElementById('modal1');
//     let instanceModal = M.Modal.getInstance(modal);
//     instanceModal.close(); 
//     let sideForm = document.querySelector('.side-form');
//     let instance = M.Sidenav.getInstance(sideForm);
//     let keysToSet = ['name', 'lastname', 'dni', 'fecha_nac', 'sex', 'email', 'address', 'phone', 'alternative_phone', 'tipo'];
//     instance.open();
//     for await (const [key, value] of Object.entries(client)){
//       // console.log(`${key} => ${value}`);
//       if (keysToSet.includes(key)) {
//         if (key != 'tipo') {
//           let input = sideForm.querySelector(`input[name=${key}]`);
//           input.value = value;
//         }
//         else{
//           await fillClientTipoOnDropdown(value);
//         }
//       }
//     }
//     await setFormHeader('Modificar');
//     // 
// }
// Delete client from local DB & put the action on queue
const deleteFixOrder = async(event)=>{
  try {
    let fixOrder = await db.getSingleDoc(event.target.dataset.id);
    await db.removeSingleDoc(event.target.dataset.id);
    // Add deleted doc to queue
    // Set fields needed for queue
    // fixOrder.saved = false;
    // fixOrder.action = 'DELETE';
    // // Add object to queue
    // console.log('ADD next object to Queue');
    // console.log(fixOrder);
    // await addObjectOnQueue(fixOrder);
  } catch (error) {
    console.log(`Error on delete ${error}`);
  }
  // Need to check if doc deleted still on queue since his creation. Otherwise it's gona POST it first and then it's gona DELETE it on the same queue
  await showFixOrders();
  let instance = M.Modal.getInstance(event.target.parentElement.parentElement);
  instance.close();
  M.toast({html: `Orden de reparación Eliminada`});
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

// Create a proxy to handle the confirmation of fixorder delete
const proxyDeleteFixOrder = new Proxy(deleteFixOrder, acceptToContinue)

const redrawFixOrdersUI= async(set)=> {
  let filteredSet = [];
  for await (const order of set){
    let orderData = [];
      orderData.push(order.state);
      orderData.push(order.device);
      orderData.push(order.lastname);
      orderData.push(order.name);
      orderData.push(await dateFormat(order.created_at));
      orderData.push(order._id); // #3 Keep track of this
      filteredSet.push(orderData);
  };
    console.log(set);
    console.log(filteredSet);
    await fillFixOrdersTable(filteredSet);
}

// Load clients on table on page load
const showFixOrders = async ()=> {
    let fixOrders = await db.getFixOrders();
    // console.log('CLIENTS on CLientes');
    // console.log(clients);
    // throw new Error('Error');
    await redrawFixOrdersUI(fixOrders);
    //await db.deleteAllDocs(); //THIS IS DANGEROUS
  }
  const atachScanners = async()=>{
    // If device is mobile. Delete button scanner
      document.getElementById('scanner').addEventListener('click', dni.scan);
      document.getElementById('camera').addEventListener('click', dni.camera);
  }

// const setFormHeader = async(context)=>{
//   let sideForm = document.querySelector('.side-form');
//   let i = context == 'Nuevo'?`<i class="right material-icons">person_add</i>`:`<i class="right material-icons">edit</i>`;
//   sideForm.querySelector('form h6').innerHTML = `${context} Cliente ${i}`;
// }

const cleanSideform = async()=>{
  await clean.basicClean();
  await clean.textareas();
  await dni.removePulse();
  //await setFormHeader('Nuevo');
}

// // Clean form fields when user has the intention to create a new client
// const atachCleanerToAddBtn = async()=>{
//   document.querySelector(".btn-floating.btn-small.btn-large.add-btn.sidenav-trigger").addEventListener('click', cleanSideform);
// }


const saveFixOrder = async(event)=>{
  event.preventDefault();
  let fixOrder ={};
  let inputs = document.querySelectorAll("#form-add-device input");
  for await (const input of inputs){
      if (input.className == 'select-dropdown dropdown-trigger') {
        continue;
      }
      fixOrder[input.name] = input.value;
  }
  let textareas = document.querySelectorAll("#form-add-device textarea");
  for await (const textarea of textareas){
    fixOrder[textarea.name] = textarea.value;
  }

  let select = document.getElementById('select-device');
  fixOrder.device = select.value;
  fixOrder.type = 'FIXORDER';
  let client = await db.getDocByField('dni', fixOrder.dni);
  fixOrder.user_id = client.user_id;
  fixOrder.state = 'recibido';
  fixOrder.photos = await taker.getPhotos();
  fixOrder.created_at = new Date();
  console.log('Fix Order');
  console.log(fixOrder);
  // First save on pouch local Db
  let response = await db.saveSingleDoc(fixOrder);
  if (response.ok) {
    await showFixOrders();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    await dni.removePulse();
    M.toast({html: `Nueva orden de reparación guardada`});
    // Set fields needed for queue
    fixOrder.saved = false;
    fixOrder.action = 'POST';
    fixOrder._id = response.id;

    if (event.target.dataset.action == 'saveAndPrint') {
        //await printFixOrder();
    }
    // Add object to queue
    //await addObjectOnQueue(client);
  }
}

const atachSaveFixOrder = async()=>{
  document.getElementById('save').removeEventListener('click', saveFixOrder);
  document.getElementById('save').addEventListener('click', saveFixOrder);

  document.getElementById('save-and-print').removeEventListener('click', saveFixOrder);
  document.getElementById('save-and-print').addEventListener('click', saveFixOrder);
}

const savePhotosOnFixOrder = async(event)=>{
    event.preventDefault();
    let modal = document.getElementById('modal-take-photo'); 
    let instance = M.Modal.getInstance(modal);
    instance.close();
    await enableButtons();

}

const handleTakePhotos = async(event)=>{
    event.preventDefault();
    let modal = document.getElementById('modal-take-photo'); 
    let instance = M.Modal.init(modal);
    instance.open();
    document.getElementById('save-photos').removeEventListener('click', savePhotosOnFixOrder);
    document.getElementById('save-photos').addEventListener('click', savePhotosOnFixOrder);
    await taker.startup();
}

const enableTakePhotos = async()=>{
    let takeFotosBtn = document.getElementById('take-photo');
    takeFotosBtn.removeAttribute('disabled');
    takeFotosBtn.removeEventListener('click', handleTakePhotos);
    takeFotosBtn.addEventListener('click', handleTakePhotos);
}

const fillDevicesForClient = async (event)=>{
  let client = await db.getDocByField('dni', event.target.value);
  console.log('Client');
  console.log(client);
  if (client) {
    let select = document.getElementById('select-device');
    await clean.cleanSelect(select);
    for await (const device of client.devices){
      let option = document.createElement('option');
      option.innerText = device.model;
      option.value = device.model;
      select.appendChild(option);
    };
    select.parentElement.style.display = 'block';
    let instance = M.FormSelect.init(select);
    await enableTakePhotos();
    while (event.target.parentElement.contains(event.target.parentElement.querySelector('small'))) {
        event.target.parentElement.querySelector('small').remove();
    } 
  }
  else{
    // REturn validation messsage and avoid save
    if (!event.target.parentElement.contains(event.target.parentElement.querySelector('small'))) {
        let small = document.createElement('small');
        small.style = "color:red;";
        small.innerText = `No existe usuario con dni ${event.target.value}. Agregue usuario primero`;
        event.target.insertAdjacentElement('afterend', small);
    } 
    M.toast({html: `No existe usuario con dni ${event.target.value}. Agregue usuario primero`});
    await disableButtons();
    return;
  }
}

const atachListenDni = async()=>{
  document.getElementById('dni').removeEventListener('change', fillDevicesForClient);
  document.getElementById('dni').addEventListener('change', fillDevicesForClient);
}

const enableButtons = async()=>{
    let btnToEnable =['save-and-print', 'save'];
    for await (const btn of [...document.querySelectorAll('#side-form button')]){
        if (btnToEnable.includes(btn.id)) {
            btn.removeAttribute('disabled');
        }
    }
}

const disableButtons = async()=>{
    let btnToDisable =['take-photo', 'save-and-print', 'save'];
    for await (const btn of [...document.querySelectorAll('#side-form button')]){
        if (btnToDisable.includes(btn.id)) {
            btn.setAttribute('disabled', 'disabled');
        }
    }
}

window.addEventListener('load', async()=>{
    await showFixOrders();
    await atachScanners();
    await cleanSideform();
    await disableButtons();

    // await atachCleanerToAddBtn();
    await atachSaveFixOrder();
    await atachListenDni();
    // await fillClientTipoOnDropdown();
});

// HELPER FUNCTIONS

const checkDeviceType = async()=>{
  
}