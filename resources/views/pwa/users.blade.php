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
          <label for="name">Nombre de Usuario</label>
        </div>
        <div class="input-field">
          <input placeholder="Email" id="email" type="text" class="validate" name="email">
          <label for="email">Email</label>
        </div>
        <div class="input-field">
          <input placeholder="Contraseña" id="password" type="text" class="validate" name="password">
          <label for="password">Contraseña</label>
          <small style="color: red;">(Mín. 8 caracteres)</small>
        </div>
        <div class="input-field">
          <input placeholder="Rol" id="role" type="text" class="validate" name="rol">
          <label for="role">Rol</label>
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