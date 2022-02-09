@extends ('pwa.pwashell')
  @section ('title')
    <title>Clientes</title>
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
        <p>Los sectores y planillas asociados al cliente también serán eliminados.</p>
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
        <h6 >Nuevo Cliente <i class="right material-icons">add</i></h6>
        <div class="divider"></div>
        <div class="input-field">
          <input placeholder="Nombre" id="name" type="text" class="validate" name="name" required>
          <label for="name">Nombre</label>
        </div>
        <div class="input-field">
          <input placeholder="Email" id="email" type="text" class="validate" name="email">
          <label for="email">Email</label>
        </div>
        <div class="input-field">
          <input placeholder="Celular" id="phone" type="text" class="validate" name="phone">
          <label for="phone">Teléfono</label>
        </div>
        <div class="input-field center">
          <button class="btn-small" id="add-client">Agregar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_clientes.js') }}" defer></script>
  @endsection