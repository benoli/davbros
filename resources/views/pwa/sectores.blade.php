@extends ('pwa.pwashell')
  @section ('title')
    <title>Sectores</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
  @endsection
  @section('body-content')
  <h6>Sectores</h6>
  <div id="">
    <table id="sectores" class="stripe" style="width:100%"></table>
  </div>

  <!-- Modal Confirm Action -->
  <div id="modal-confirm" class="modal">
      <div class="modal-content">
        <h4>Confirmar</h4>
        <p>¿Desea Continuar?</p>
        <p>El sector seleccionado será eliminado. Y también los modelos de planilla asociados.</p>
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
      <form id="form-add-sector" class="add-recipe container section">
        <h6 >Nuevo Sector <i class="right material-icons">add</i></h6>
        <div class="divider"></div>
        <div class="input-field">
          <input placeholder="Nombre" id="nombre" type="text" class="validate" name="nombre">
          <label for="nombre">nombre</label>
        </div>
        <div class="input-field">
          <select id="select-client" class="validate" name="client">
          </select>
          <label for="client">Cliente</label>
        </div>
        <div class="input-field col s12">
            <textarea id="nota" class="materialize-textarea" data-length="160"></textarea>
            <label for="nota">Nota</label>
          </div>
        <div class="input-field center">
          <button class="btn-small" id="add-sector">Agregar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <!-- <script src="/js/jquery-3.3.1.min.js" defer></script> -->
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_sectores.js') }}" defer></script>
  @endsection