import './app_manager';
import { DB } from './support_classes/persist_data_frontend';

const db = new DB();

const calcClientes = async()=>{
    let cantClientes = await db.getCantClientes();
    document.getElementById(`cant-clientes`).innerText = cantClientes;
}

const calcServicios = async()=>{
    let servicios = await db.getControlesByDate();
    document.getElementById(`cant-servicios`).innerText = servicios;
    // document.getElementById(`servicios-desde`).innerText = `Desde: ${start?start:'Inicio'}`;
    // document.getElementById(`servicios-hasta`).innerText = `Hasta: ${end?end:'Hoy'}`;
}

const showServiciosByDate = async(e)=>{
    let start = document.getElementById(`servicios-date-start`).value;
    let end = document.getElementById(`servicios-date-end`).value;
    let servicios = await db.getControlesByDate(start, end);
    document.getElementById(`cant-servicios`).innerText = servicios;
    document.getElementById(`servicios-desde`).innerText = `Desde: ${start?start:'Inicio'}`;
    document.getElementById(`servicios-hasta`).innerText = `Hasta: ${end?end:'Hoy'}`;
    e.target.parentElement.style.display = `none`;
}

const atachShowServicios = async()=>{
    document.getElementById(`show-servicios`).addEventListener(`click`, showServiciosByDate);
}

const getUsers = async (id=false)=>{
    let endpoint = `/api/users`;
    if (id) {
        endpoint += `/${id}`;
    }
    let type = localStorage.getItem('apiTokenType');
    let token = localStorage.getItem('apiToken');
    const fetchUsers = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `${type} ${token}` 
        }
      });
    return await fetchUsers.json();
}

const showUsers = async()=>{
    // show users
    let users = await getUsers();
    const roles = users.reduce((allNames, name) => {
        allNames[name.role] ??= 0;
        allNames[name.role]++;
        // Remember to return the object, or the next iteration
        // will receive undefined
        return allNames;
    });
    document.getElementById(`registrados`).innerText = `Registrados: ${roles.admin + roles.employee + roles.external_controller + roles.internal_controller}`;
    document.getElementById(`admin`).innerText = `Admin: ${roles.admin}`;
    document.getElementById(`empleados`).innerText = `Operarios: ${roles.employee}`;
    document.getElementById(`internal`).innerText = `Encargados: ${roles.internal_controller}`;
    document.getElementById(`external`).innerText = `Supervisores Externos: ${roles.external_controller}`;
}

window.addEventListener('load', async()=>{
    await calcClientes();
    await calcServicios();
    await atachShowServicios();
    await showUsers();
});