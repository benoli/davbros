@extends ('pwa.pwashell')
  @section ('title')
    <title>Usuarios</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
  @endsection
  @section('body-content')
  <h6>Usuarios</h6>
  <div id="">
    <table id="usuarios" class="stripe" style="width:100%"></table>
  </div>

  <!-- Modal Confirm Action -->
  <div id="modal-confirm" class="modal">
    <div class="modal-content">
      <h4>Confirmar</h4>
      <p>¿Desea eliminar el usuario?</p>
      <p>Algunos documentos quedarán sin referencia a los usuarios eliminados.</p>
    </div>
    <div class="modal-footer">
      <button class="modal-close waves-effect waves-green btn-small">Cancelar</button>
      <button class="modal-close waves-effect waves-green btn-small red">Continuar</button>
    </div>
  </div>
    <!-- Modal Structure -->
  <div id="modal1" class="modal">

  </div>
@endsection
  @section ('add-button')
    <div class="center">
      <a class="btn-floating btn-small btn-large add-btn sidenav-trigger" data-target="side-form">
        <i class="material-icons">add</i>
      </a>
    </div>
  @endsection
  @section ('add-form')
        <!-- add recipe side nav -->
    <div id="side-form" class="sidenav side-form">
      <form id="form-add-user" class="add-recipe container section">
        <h6 >Nuevo Usuario</h6>
        <div class="divider"></div>
        <div class="input-field">
          <input placeholder="Nombre" id="name" type="text" class="validate" name="name">
          <label for="name">Nombre</label>
        </div>
        <div class="input-field">
          <input placeholder="Apellido" id="lastname" type="text" class="validate" name="lastname">
          <label for="name">Apellido</label>
        </div>
        <div class="input-field">
          <input placeholder="Email" id="email" type="text" class="validate" name="email">
          <label for="email">Email</label>
        </div>
        <div class="input-field">
          <select id="select-role" type="text" class="validate" name="role">
            <option value="0">Seleccionar</option>
          </select>
          <label for="name">Rol</label>
        </div>
        <div class="input-field">
          <input placeholder="Contraseña" id="password" type="password" class="validate" name="password">
          <label for="password">Contraseña</label>
          <small style="color: red;">(Mín. 8 caracteres)</small>
        </div>
        <div class="input-field">
          <input placeholder="Contraseña" id="password-confirm" type="password" class="validate" name="password_confirmation">
          <label for="password-confirm">Repetir Contraseña</label>
          <small style="color: red;">(Mín. 8 caracteres)</small>
        </div>
        <div class="input-field center">
          <button class="btn-small" id="add-user">Agregar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <!-- <script src="/js/jquery-3.3.1.min.js" defer></script> -->
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_users.js') }}" defer></script>
  @endsection