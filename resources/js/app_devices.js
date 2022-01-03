import './app_manager';
import { addObjectToQueue as addObjectOnQueue } from "./app_manager";
import { Clean } from "./support_classes/clean_sideform";
import { DB } from './support_classes/persist_data_frontend';
import { DNI } from './support_classes/dni';

const db = new DB();
const dni = new DNI();
const clean = new Clean();

// Fill the table with all planillas received
export const fillDevicesTable = async(dataset)=> {
  var columnsSource = [{title:"Tipo"}, {title:"Modelo"}, {title:"Dueño"}];
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
                  document.getElementById('change-device').addEventListener('click', initChangeDevice);
                  document.getElementById('delete-device').addEventListener('click', proxyDeleteDevice)
                }},
                {onCloseEnd:()=>{
                  document.getElementById('delete-device').removeEventListener('click', proxyDeleteDevice); // Detach to improve the performance
                  document.getElementById('change-device').removeEventListener('click', initChangeDevice); // Detach to improve the performance
                  let elem = document.querySelector('.modal');while (elem.firstChild) {elem.removeChild(elem.firstChild)
                  }}});
              let rowSelected = api.row(thisRow).data(); // Read data of row selected
              let userDataTemplate =     
              `<div class="modal-content">
                 <h4>Dispositivo: ${rowSelected[1]}</h4>
                 <p>Cliente: ${rowSelected[2]}</p>
              </div>
              <div class="modal-footer">
                <button class="modal-close waves-effect btn-small">Salir</button>
                <button class="waves-effect btn-small red" data-id="${rowSelected[3]}" id="delete-device">Borrar</button>
                <button class="waves-effect btn-small blue" data-id="${rowSelected[3]}" id="change-device">Modificar</button>
              </div>`;
              elem.innerHTML = userDataTemplate;
              instance.open();
              console.log(rowSelected);
          } );
          //api.$('tr').click(evaluateClicks);
          // Here atach tooltip onmouseover
      } 
  };
  
  $('#dispositivos').DataTable(config);
}

const initChangeDevice = async(event)=>{
    let id = event.target.dataset.id;
    let client = await db.getSingleDoc(id);
    let modal = document.getElementById('modal1');
    let instanceModal = M.Modal.getInstance(modal);
    instanceModal.close(); 
    let sideForm = document.querySelector('.side-form');
    let instance = M.Sidenav.getInstance(sideForm);
    instance.open();
    let keysToSetClient = ['name', 'lastname', 'dni'];
    let keysToSetDeviceInputs = ['imei', 'mac', 'serial', 'year'];

    const fillSelect = async(key, value)=>{
      let select = document.querySelector(`select[name=${key}`);
      // console.log(select);
      select.value = value;
      // console.log(`option[value="${value}"]`);
      let option = select.querySelector(`option[value="${value}"]`);
      // console.log(option);
      select.querySelector(`option[value="${value}"]`).setAttribute("selected", "selected");
      let instance = M.FormSelect.init(select);
    }

    // Fill client personal data]
    for await (const [key, value] of Object.entries(client)){
      // console.log(`${key} => ${value}`);
      if (keysToSetClient.includes(key)) {
          let input = sideForm.querySelector(`input[name=${key}]`);
          input.value = value;
      }
    }
    // Fill device data
    for await (const device of client.devices){
      for await (const [key, value] of Object.entries(device)){
        // console.log(`${key} => ${value}`);
        if (keysToSetDeviceInputs.includes(key)) {
            let input = sideForm.querySelector(`input[name=${key}]`);
            input.value = value;
        }
        else{
          // console.log(`KEY ==> ${key}`);
          let select = document.querySelector(`select[name=${key}`);
          let changeEvent = new Event('change');
          await fillSelect(key, value);
          select.dispatchEvent(changeEvent);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    await setFormHeaderAndButton('Modificar', id);
    // 
}
// Delete device from local DB & put the action on queue
const deleteDevice = async(event)=>{
  try {
    let client = await db.getSingleDoc(event.target.dataset.id);
    let deleted = (client.devices.splice(client.devices.findIndex(e => (e.model === event.target.dataset.model) && (e.serial === event.dataset.serial)), 1).length > 0);
    if (deleted) {
      console.log(`The device is deleted ==> ${deleted}`);
      await db.saveSingleDoc(client);
          // Add deleted device to queue
    // Build the device object
    // Set fields needed for queue
    // client.saved = false;
    // client.action = 'DELETE';
    // // Add object to queue
    // console.log('ADD next object to Queue');
    // console.log(client);
    // await addObjectOnQueue(client);
    }
  } catch (error) {
    console.log(`Error on delete ${error}`);
  }
  // Need to check if doc deleted still on queue since his creation. Otherwise it's gona POST it first and then it's gona DELETE it on the same queue
  await showDevices();
  let instance = M.Modal.getInstance(event.target.parentElement.parentElement);
  instance.close();
  M.toast({html: `Dispositivo Eliminado`});
}

// Trap to display a confirmation modal. If interaction is positive forward the call to original handler 
// This need a refactor because is not removing the event listener 
const acceptToContinue = {
  apply: function(target, thisArg, argumentsList) {
    let modal = document.getElementById('modal-confirm');
    let instance = M.Modal.init(modal);
    instance.open();
    modal.querySelector('.modal-footer .red').addEventListener('click', async(event)=>{
        event.preventDefault();
        return Reflect.apply(...arguments);
    });
  }
}

// Create a proxy to handle the confirmation of client delete
const proxyDeleteDevice = new Proxy(deleteDevice, acceptToContinue)

const redrawDevicesUI= async(set)=> {
  let filteredSet = [];
  for await (const client of set){
    if (client.hasOwnProperty('devices')) {
      for await (const device of client.devices){
        console.log('DEVICE');
        console.log(device);
        let deviceData = [];
          deviceData.push(device.device_type);
          deviceData.push(device.model);
          deviceData.push(`${client.lastname}, ${client.name}`);
          deviceData.push(`${client._id}`);
          deviceData.push(device.model);
          deviceData.push(device.serial);
          filteredSet.push(deviceData);
      };
    }
  };
    // console.log('SET');
    // console.log(set);
    // console.log('Filtered set');
    // console.log(filteredSet);
    await fillDevicesTable(filteredSet);
}

// Load devices on table on page load
const showDevices = async ()=> {
    let clients = await db.getClientes();
    // console.log('CLIENTS on DEVICES');
    // console.log(clients);
    // throw new Error('Error');
    await redrawDevicesUI(clients);
    //await db.deleteAllDocs(); //THIS IS DANGEROUS
  }
const atachScanners = async()=>{
  // If device is mobile. Delete button scanner
    document.getElementById('scanner').addEventListener('click', dni.scan);
    document.getElementById('camera').addEventListener('click', dni.camera);
}

const setFormHeaderAndButton = async(context, clientID=false)=>{
  let sideForm = document.querySelector('.side-form');
  let i = context == 'Nuevo'?`<i class="right material-icons">phonelink</i>`:`<i class="right material-icons">edit</i>`;
  sideForm.querySelector('form h6').innerHTML = `${context} Dispositivo ${i}`;
  let button = [...sideForm.querySelectorAll('.btn-small')][2];
  if (context == 'Nuevo') {
    button.id = 'add-device';
    button.innerText = 'Agregar';
    button.dataset.id = '';
    button.removeEventListener('click', editDevice);
    button.addEventListener('click', addDevice);
  }
  else{
    button.id = 'edit-device';
    button.innerText = 'Guardar Cambios';
    button.dataset.id = clientID;
    button.removeEventListener('click', addDevice);
    button.addEventListener('click', editDevice);
  }
}

const editDevice = async(event)=>{
  event.preventDefault();
  let device ={};
  let id = event.target.dataset.id;
  let client = await db.getSingleDoc(id);
  const fieldsToSkip = ['name', 'lastname', 'dni', ""];
  let inputs = document.querySelectorAll("#form-add-device input");
  for await (const input of inputs){
    if (fieldsToSkip.includes(input.name)) {
      continue;
    }
    device[input.name] = input.value;
  }
  let selectType = document.getElementById('select-type');
  device.type = selectType.value;
  let selectModel = document.getElementById('select-model');
  device.model = selectModel.value;
  let deleted = (client.devices.splice(client.devices.findIndex(e => (e.model === event.target.dataset.model) && (e.serial === event.dataset.serial)), 1).length > 0);
  if (!deleted) {
    M.toast({html: `Error en la modificación consulte al soporte`});
    return;
  }
  client.devices.push(device);
  // First save on pouch local Db
  let response = await db.saveSingleDoc(client);
  if (response.ok) {
    await showDevices();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    sidenav.dataset.canclose = 'true';
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    await dni.removePulse();
    M.toast({html: `Dispositivo moidificado`});
    // Set fields needed for queue
    device.saved = false;
    device.action = 'POST';
    device._id = response.id;
    // Add object to queue
    //await addObjectOnQueue(device);
  }
}

const cleanSideform = async()=>{
  await clean.basicClean();
  await dni.removePulse();
  await setFormHeaderAndButton('Nuevo');
}

// Clean form fields when user has the intention to create a new client
const atachCleanerToAddBtn = async()=>{
  document.querySelector(".btn-floating.btn-small.btn-large.add-btn.sidenav-trigger").addEventListener('click', cleanSideform);
}

const addDevice = async(event)=>{
  event.preventDefault();
  let device ={};
  const fieldsToValidate = ['dni', 'imei', 'serial', 'mac'];
  const fieldsToSkip = ['name', 'lastname', 'dni', ""];
  let inputs = document.querySelectorAll("#form-add-device input");
  console.log('Inputs');
  console.log(inputs);
  let client;
  for await (const input of inputs){
      // Here validate if device already exists
      if (fieldsToValidate.includes(input.name)) {
        if (input.name == 'dni') {
          if (!await db.docExists(input.name, input.value)) { // No existe usuario con el DNI leido
            // REturn validation messsage and avoid save
            let small = document.createElement('small');
            small.style = "color:red;";
            small.innerText = `No existe usuario con ${input.name} ${input.value}. Agregue usuario primero`;
            input.insertAdjacentElement('afterend', small);
            M.toast({html: `No existe usuario con ${input.name} ${input.value}. Agregue usuario primero`});
            return;
          }
          else{
              client = await db.getDocByField('dni', input.value);
          }
        }
      }
      if (fieldsToSkip.includes(input.name)) {
        continue;
      }
      device[input.name] = input.value;
  }
  device.type = 'DEVICE'; // This type is needed to post the object to backend
  let selectType = document.getElementById('select-type');
  device.device_type = selectType.value; // This is the device type eg. iPhone, Macbook, etc.
  let selectModel = document.getElementById('select-model');
  device.model = selectModel.value;
  if (!client.hasOwnProperty('devices')) {
    client.devices = [];
  }
  client.devices.push(device);
  // First save on pouch local Db
  let response = await db.saveSingleDoc(client);
  if (response.ok) {
    await showDevices();
    // Clean everything
    let sidenav = document.querySelector('#side-form');
    sidenav.dataset.canclose = 'true';
    let instance = M.Sidenav.getInstance(sidenav);
    instance.close();
    await cleanSideform();
    await dni.removePulse();
    M.toast({html: `Nuevo dispositivo creado`});
    // Set fields needed for queue
    device.saved = false;
    device.action = 'POST';
    device._id = response.id;
    device.cliente_id = client.user_id;
    // Add object to queue// DO this ASAP
    await addObjectOnQueue(device);
  }
}

const fillYearField = async(event)=>{
  document.getElementById('year').value = event.target.options[event.target.selectedIndex].dataset.year;
}

const fillModeloOnDropdown = async(event, tipoSelected=false)=>{
  let devices = await db.getDevices();
  let select = document.getElementById('select-model');
  await clean.cleanSelect(select);
  for await (const device of devices.list){
      for await (const [key, value] of Object.entries(device)){
        if (key == event.target.value) {
          for await (const model of device[key].models){
            let option = document.createElement('option');
            option.innerText = model.model;
            option.value = model.model;
            option.dataset.year = model.year;
            if (tipoSelected == model.model) {
              option.setAttribute("selected", "selected");
              select.value = model.model;
            }
            select.appendChild(option);
          }
        }
      }
  };
  let instance = M.FormSelect.init(select);
  let evento = {'target': select};
  await fillYearField(evento);
  select.removeEventListener('change', fillYearField);
  select.addEventListener('change', fillYearField);
}

const fillDeviceTipoOnDropdown = async (tipoSelected=false)=>{
  let devices = await db.getDevices();
  let select = document.getElementById('select-type');
  await clean.cleanSelect(select);
  try {
    for await (const device of devices.list){
        for await (const [key, value] of Object.entries(device)){
          console.log(`Key => ${key}`);
          let option = document.createElement('option');
          option.innerText = key;
          option.value = key;
          if (tipoSelected == key) {
            option.setAttribute("selected", "selected");
            select.value = device;
          }
          select.appendChild(option);
        }
    };
    let instance = M.FormSelect.init(select);
    let event = {'target': select};
    await fillModeloOnDropdown(event);
    select.removeEventListener('change', fillModeloOnDropdown);
    select.addEventListener('change', fillModeloOnDropdown);
    
  } catch (error) {
    console.log(`Error => ${error}`);
  }
}

const loadDevicesOnDB = async()=>{
  let devicesObject = {};
  devicesObject.type = 'DEVICESLIST';
  devicesObject.list = [];
  for await (const [key, value] of Object.entries(devices)){
    let device = {};
    device[key] = value;
    devicesObject.list.push(device);
  }
  db.saveSingleDoc(devicesObject);
}

window.addEventListener('load', async()=>{
    await showDevices();
    await atachScanners();
    await atachCleanerToAddBtn();
    await cleanSideform();
    await fillDeviceTipoOnDropdown('AirTag');
    console.log(devices);
    //await loadDevicesOnDB();
});

// HELPER FUNCTIONS

const checkDeviceType = async()=>{
  
}