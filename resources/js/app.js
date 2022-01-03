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

// localStorage.removeItem('apiToken');
// localStorage.removeItem('apiTokenType');
// localStorage.removeItem('apiLogged');