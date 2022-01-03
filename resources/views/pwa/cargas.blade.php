@extends ('pwa.pwashell')
  @section ('title')
    <title>Cargas</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
  @endsection
  @section('body-content')
  <h4>Cargas</h4>
  <div id="">
    <table id="cargas" class="stripe" style="width:100%"></table>
  </div>
    <!-- Modal Structure -->
  <div id="listadoArticulos" class="modal modal-fixed-footer">
    <div class="modal-content">
      <h4>Listado de Artículos</h4>
      <div id="">
        <table id="articulos" class="stripe" style="width:100%"></table>
      </div>
    </div>
    <div class="modal-footer">
      <a href="#!" class="modal-close waves-effect waves-green btn-flat" id="finish-load" data-action="normal" data-cargaId="">Terminar</a>
    </div>
  </div>
      <!-- Modal Select Articulos cant -->
  <div id="modalArticulos" class="modal modal-fixed-footer">
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
      <form id="form-add-carga" class="add-recipe container section">
        <h6 >Nueva Carga</h6>
        <div class="divider"></div>
        <div class="input-field">
          <select id="select-camioneta" class="validate" name="camioneta">
          </select>
          <label for="camioneta">Seleccione Camioneta</label>
        </div>
        <div class="input-field">
          <a class="btn-floating btn-small right" id="add-articulos">
            <i class="material-icons">add</i>
          </a>
          <label for="articulos">Añadir Artículos</label>
        </div>
        <br>
        <br>
        <div class="divider"></div>
        <div class="input-field center">
          <button class="btn-small" id="add-carga">Cargar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('script')
    <script src="/js/jquery-3.3.1.min.js" defer></script>
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_cargas.js') }}" defer></script>
  @endsection