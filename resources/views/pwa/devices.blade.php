@extends ('pwa.pwashell')
  @section ('title')
    <title>Dispositivos</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
  @endsection
  @section('body-content')
  <!-- <h6>Dispositivos</h6> -->
  <h6>Sectores</h6>
  <div id="">
    <table id="dispositivos" class="stripe" style="width:100%"></table>
  </div>

    <!-- Modal Confirm Action -->
  <div id="modal-confirm" class="modal">
    <div class="modal-content">
      <h4>Confirmar</h4>
      <p>¿Desea Continuar?</p>
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
      <form id="form-add-device" class="add-recipe container section">
        <h6 >Nuevo Dispositivo <i class="right material-icons">phonelink</i></h6>
        <div class="divider"></div>
        <div class="input-field">
          <select id="select-type" class="validate" name="type">
            <option value="0">Seleccionar</option>
          </select>
          <label for="name">Tipo</label>
        </div>
        <div class="input-field">
          <select id="select-model" type="text" class="validate" name="model">
            <option value="0">Seleccionar</option>
          </select>
          <label for="name">Modelo</label>
        </div>
        <div class="input-field">
          <input placeholder="Año" id="year" type="text" class="validate" name="year">
          <label for="email">Año</label>
        </div>
        <div class="input-field">
          <input placeholder="Imei" id="imei" type="text" class="validate" name="imei">
          <label for="name">Imei</label>
        </div>
        <div class="input-field">
          <input placeholder="Serial" id="serial" type="text" class="validate" name="serial">
          <label for="name">Serial</label>
        </div>
        <div class="input-field">
          <input placeholder="MAC" id="mac" type="text" class="validate" name="mac">
          <label for="name">MAC</label>
        </div>
        <div class="input-field">
          <input placeholder="Nombre" id="name" type="text" class="validate" name="name">
          <label for="name">Nombre Cliente</label>
        </div>
        <div class="input-field">
          <input placeholder="Apellido" id="lastname" type="text" class="validate" name="lastname">
          <label for="name">Apellido Cliente</label>
        </div>
        <div class="input-field">
          <input placeholder="DNI" id="dni" type="text" class="validate" name="dni">
          <label for="name">DNI Cliente</label>
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
          <button class="btn-small" id="add-device">Agregar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <script>
        const devices = @json($devices);
    </script>
    <!-- <script src="/js/jquery-3.3.1.min.js" defer></script> -->
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_devices.js') }}" defer></script>
  @endsection