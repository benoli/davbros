@extends ('pwa.pwashell')
  @section ('title')
    <title>Notificaciones</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
  @endsection
  @section('body-content')
    <h6>Clientes</h6>
    <div id="">
      <table id="clientes" class="stripe" style="width:100%"></table>
    </div>

    <!-- Modal Confirm Action -->
    <div id="modal-confirm" class="modal">
      <div class="modal-content">
        <h4>Confirmar</h4>
        <p>¿Desea Continuar?</p>
        <p>Los dispositivos asociados al cliente también serán eliminados. Si quiere conservarlos, deben ser asignados a otro cliente antes de realizar este paso.</p>
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
      <form id="form-add-cliente" class="add-recipe container section">
        <h6 >Nuevo Cliente <i class="right material-icons">person_add</i></h6>
        <div class="divider"></div>
        <div class="input-field">
          <input placeholder="Nombre" id="name" type="text" class="validate" name="name" required>
          <label for="name">Nombre</label>
        </div>
        <div class="input-field">
          <input placeholder="Apellido" id="lastname" type="text" class="validate" name="lastname" required>
          <label for="lastname">Apellido</label>
        </div>
        <div class="input-field">
          <input placeholder="DNI" id="dni" type="text" class="validate" name="dni" required>
          <label for="dni">DNI</label>
        </div>
        <div class="input-field">
          <input placeholder="F. Nac." id="fecha_nac" type="date" class="validate" name="fecha_nac" required>
          <label for="fecha_nac">Fecha Nacimiento</label>
        </div>
        <div class="input-field">
          <input placeholder="Sexo" id="sex" type="text" class="validate" name="sex" required>
          <label for="sex">Sexo</label>
        </div>
        <div class="input-field">
          <input placeholder="Email" id="email" type="text" class="validate" name="email" required>
          <label for="email">Email</label>
        </div>
        <div class="input-field">
          <input placeholder="Dirección" id="address" type="text" class="validate" name="address">
          <label for="address">Dirección</label>
        </div>
        <div class="input-field">
          <input placeholder="Celular" id="phone" type="text" class="validate" name="phone" required>
          <label for="phone">Celular</label>
        </div>
        <div class="input-field">
          <input placeholder="Celular Alternativo" id="alternative_phone" type="text" class="validate" name="alternative_phone" required>
          <label for="alternative_phone">Celular Alternativo</label>
        </div>
        <div class="input-field">
          <select id="select-tipo" name="tipo" class="validate"></select>
          <label for="tipo">Tipo de cliente</label>
        </div>
        <div>
            <video id="video" class="scanner-window" width="300" height="200" style="border: 1px solid gray; display:none"></video>
        </div>
        <div id="sourceSelectPanel" style="display:none">
          <label for="sourceSelect">Elegir cámara</label>
          <select id="sourceSelect" style="max-width:200px">
          </select>
        </div>
        <div class="input-field center">
          <button class="btn-small" id="scanner">DNI con Lector</button>
        </div>
        <div class="input-field center">
          <button class="btn-small" id="camera">DNI con cámara</button>
        </div>
        <div class="input-field center">
          <button class="btn-small" id="add-user">Agregar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_clientes.js') }}" defer></script>
  @endsection