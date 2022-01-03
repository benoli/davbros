const askBeforeLeave = async(sideform)=>{
  if (sideform.dataset.canclose == 'false') {
    let modal = document.getElementById('modal-confirm-sidenav-close');
    let instance = M.Modal.init(modal);
    instance.open();
    modal.querySelector('.modal-footer .red').addEventListener('click', async(event)=>{
        event.preventDefault();
        instance.close();
        let sidenavInstance = M.Sidenav.getInstance(sideform);
        sidenavInstance.open();
    });
  }
}

const recipes = document.querySelector('.recipes');

document.addEventListener('DOMContentLoaded', async ()=> {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, {edge: 'right', draggable:true});
  // add recipe form
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, {edge: 'left', draggable:true, onCloseStart:askBeforeLeave});
});