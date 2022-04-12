@extends ('pwa.pwashell')
  @section ('title')
    <title>Planillas</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
  @endsection
  @section('body-content')
    <h6>Planillas</h6>
    <div id="">
      <table id="planillas" class="stripe" style="width:100%"></table>
    </div>

    <!-- Modal Confirm Action -->
    <div id="modal-confirm" class="modal">
      <div class="modal-content">
        <h4>Confirmar</h4>
        <p>¿Desea Continuar?</p>
        <p>El modelo de planilla será eliminado.</p>
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
        <h6>Nueva Planilla de Control <i class="material-icons">assignment</i></h6>
        <div class="divider"></div>
        <div class="input-field">
          <select id="select-client" name="client" class="validate"></select>
          <label for="client">Cliente</label>
        </div>
        <div class="input-field">
          <select id="select-sector" name="sector" class="validate"></select>
          <label for="sector">Sector</label>
        </div>
        <label>
          <input type="checkbox" class="filled-in"/>
          <span>Habilitar firma digital</span>
        </label>
        <div class="input-field">
          <input placeholder="Nombre" type="text" class="validate" name="tarea" required>
          <label for="name">Nombre tarea</label>
        </div>
        <div class="input-field center" data-description="buttons-div">
          <button class="btn-small" id="add-tarea">Agregar tarea</button>
          <button class="btn-small" id="add-foja">Guardar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_planillas.js') }}" defer></script>
  @endsection