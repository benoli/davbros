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

window.addEventListener('load', async()=>{
    await calcClientes();
    await calcServicios();
    await atachShowServicios();
});