import { DB } from './persist_data_frontend';

const db = new DB();

export class Notifications{
    constructor(){
        this.permission;
        this.qtyNotifications;
        this.operario;
    }

    init = async()=>{

        this.operario = await db.getDocByField('id', parseInt(localStorage.getItem('supportID')));

        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            M.toast({html: `Su navegador no soporta notificaciones`});
            //localStorage.setItem(`notifications`, `Not supported`);
        }
        
        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            this.permission = `granted`;
        }
        
        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            await this.displayRequestPermission();
        }

        await this.showNotifications();
        
        db.localDB.changes({
            since: 'now',
            live: true,
            include_docs: true
          }).on('change', async (change)=> {
            // change.id contains the doc id, change.doc contains the doc
            console.log(`A change has been made`);
            if (change.doc.type == 'CONTROL') {
                if (change.doc.estado == 'pendiente' && change.doc.operario == this.operario._id) {
                    await this.showNotifications();
                }
            }
            if (change.deleted) {
              // document was deleted
              await this.showNotifications();
            } else {
              // document was added/modified
            }
          }).on('error', function (err) {
            // handle errors
          });
    }

    showNotifications = async()=>{
        if (this.operario) {
            let selector = {estado:'pendiente', type:'CONTROL', operario:this.operario._id};
            // console.log(`SELECTOR is`);
            // console.log(selector);
            const notifications = await db.getDocBySelector(selector);
            // console.log(`Notifications are`);
            // console.log(notifications);
            if (notifications) {
                await this.notify(`Tienes ${notifications.length} ${notifications.length > 1 ? 'servicios pendientes':'servicio pendiente'}`)
                let badge = document.querySelector(`.new.badge`);
                if (badge != null) {
                    badge.remove();
                }
                let span = `<span class="new badge" data-badge-caption=${notifications.length>1?'pendientes':'pendiente'}>${notifications.length}</span>`;
                document.querySelector(`a[href='/app/notificaciones']`).innerHTML += span;
            }
        }
    }

    requestPermission = async()=>{
        let modal = document.getElementById('modal-permission');
        let instance = M.Modal.getInstance(modal);
        instance.close();
        let permission = await Notification.requestPermission();
        // If the user accepts, let's create a notification
        if (permission === "granted") {
            this.permission = `granted`;
            await this.notify(`Permisos OK`);
        }
    }

    displayRequestPermission = async()=>{
        let elem = document.getElementById('modal-permission');
        let instance = M.Modal.init(elem, 
          {onOpenEnd:async()=>{
            document.getElementById('grant-permissions').addEventListener('click', this.requestPermission);
          }},
          {onCloseEnd:()=>{
            document.getElementById('grant-permissions').removeEventListener('click', this.requestPermission); // Detach to improve the performance
          }
        });
        instance.open();
    }

    notify = async(msg)=> {
        let notification = new Notification(`${msg}`);
    }

}