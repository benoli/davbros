export class Clean{
    constructor(){
        this.basicClean = this.basicClean.bind(this);

    }

    basicClean = async()=>{
        await this.inputs();
        await this.smalls();
        document.querySelector('#side-form').dataset.canclose = 'false';
    }

    textareas = async()=>{
        for await (const textarea of [...document.querySelectorAll('#side-form textarea')]){
            textarea.value = "";
        };
    }

    inputs = async()=>{
        for await (const input of [...document.querySelectorAll('#side-form input')]){
            input.value = "";
        };
        for await (const textarea of [...document.querySelectorAll('#side-form textarea')]){
            textarea.value = "";
        };
    }

    smalls = async()=>{
        for await (const small of [...document.querySelectorAll('small')]){
            small.remove();
          }
    }

    cleanSelect = async(select=false)=>{
        if (select) {
            try {
                while (select.firstChild) {select.removeChild(select.firstChild)};
                let oldInstance = M.FormSelect.getInstance(select);
                oldInstance.destroy();
              } catch (error) {
                console.log(error);
              }
        }
        else{
            for await (const dropDown of [...document.querySelectorAll('select')]){
                try {
                    while (dropDown.firstChild) {dropDown.removeChild(dropDown.firstChild)};
                    let oldInstance = M.FormSelect.getInstance(dropDown);
                    oldInstance.destroy();
                  } catch (error) {
                    console.log(error);
                  }
            }
        }
    }
}