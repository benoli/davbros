// Check offline & show transformStyle:
try {
  document.getElementById('login').addEventListener('click', async (event)=>{
    if (!window.navigator.onLine) {
      M.toast({html: 'Debe tener conexión para iniciar sesión'});
      event.preventDefault();
      return;
    }
    else{
      localStorage.setItem('email', document.querySelector("input[name=email]").value);
      localStorage.setItem('password', document.querySelector("input[name=password]").value);
    }
  });
} catch (error) {
  
}

const cleanApp = async()=>{
    // clean app 
    let itemsToRemove = ['apiToken', 'apiTokenType', 'supportID', 'apiLogged', 'userRole', 'email', 'password', 'userName', 'userLastname'];
    for await (const key of itemsToRemove){
      localStorage.removeItem(key);
    }
}

window.addEventListener('load', async()=>{
    await cleanApp();
});