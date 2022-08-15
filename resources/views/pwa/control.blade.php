@extends ('pwa.pwashell')
  @section ('title')
    <title>Control de Servicio</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
  @endsection
  @section('body-content')
    <h6>Control de Servicio</h6>
    <div id="">
      <table id="controles" class="stripe" style="width:100%"></table>
    </div>

    <!-- Modal Confirm Action -->
    <div id="modal-confirm" class="modal">
      <div class="modal-content">
        <h4>Confirmar</h4>
        <p>¿Desea Continuar?</p>
        <p>El control de servicio será eliminado.</p>
      </div>
      <div class="modal-footer">
        <button class="modal-close waves-effect waves-green btn-small">Cancelar</button>
        <button class="modal-close waves-effect waves-green btn-small red">Continuar</button>
      </div>
    </div>
      <!-- Modal Consent -->
      <div id="modal-consent" class="modal">
        <div class="modal-content">
          <button class="modal-close btn waves-effect waves-light grey right" style="width: 3.5rem;"><i class="material-icons right">close</i></button>
          <h4>Firma Digital</h4>
          <p id="consent"></p>
          <div>
              <div id="signature"></div>
          </div>
        </div>
        <div class="modal-footer" style="text-align: center;">
          <button id="clean-sign" class="btn waves-effect waves-light grey left">Limpiar <i class="material-icons right">delete</i></button>
          <button id="save-sign" class="waves-effect waves-green btn-small green right">Guardar Firma</button>
        </div>
      </div>
      <!-- Modal Structure -->
    <div id="modal1" class="modal" style="height: 100%;">

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
      <form id="form-add-control" class="add-recipe container section">
        <h6>Nuevo Control de Servicio <i class="material-icons">add</i></h6>
        <div class="divider"></div>
        <div class="input-field">
          <select id="select-client" name="client" class="validate"></select>
          <label for="client">Cliente</label>
        </div>
        <div class="input-field">
          <select id="select-sector" name="sector" class="validate"></select>
          <label for="sector">Sector</label>
        </div>
        <div class="input-field">
          <select id="select-operario" name="operario" class="validate"></select>
          <label for="operario">Operario</label>
        </div>
        <div class="input-field">
          <input placeholder="Nro. Identificación o Detalle" type="text" class="validate" name="nro_ofi_hab">
          <label for="name">Nro. Oficina/ Habitación</label>
        </div>
        <div class="input-field center" data-description="buttons-div">
          <button class="btn-small" id="add-control">Guardar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <script src="/js/datatables.min.js" defer></script>
    <script src="/js/jSignature.min.noconflict.js" defer></script>
    <script src="{{ mix('js/app_control.js') }}" defer></script>
  @endsection