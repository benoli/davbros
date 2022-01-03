@extends ('pwa.pwashell')
  @section ('title')
    <title>Reparaciones</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
    <style>
      #video {
        border: 1px solid black;
        box-shadow: 2px 2px 3px black;
        width:320px;
        height:240px;
        margin-left: 7rem;
        margin-top: 2rem;
      }

      .photo {
        border: 1px solid black;
        box-shadow: 2px 2px 3px black;
        width: 10rem;
        height: auto;
        margin: .5rem;
      }

      #canvas {
        display:none;
      }

      .camera {
        width: 340px;
        display:inline-block;
      }

      /* .output {
        width: 340px;
        display:inline-block;
      } */

      #startbutton {
        display:block;
        position:relative;
        margin-left:auto;
        margin-right:auto;
        bottom:32px;
        background-color: rgba(0, 150, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.7);
        box-shadow: 0px 0px 1px 2px rgba(0, 0, 0, 0.2);
        font-size: 14px;
        font-family: "Lucida Grande", "Arial", sans-serif;
        color: rgba(255, 255, 255, 1.0);
      }

      .contentarea {
        font-size: 16px;
        font-family: "Lucida Grande", "Arial", sans-serif;
        width: 760px;
      }
    </style>
  @endsection
  @section('body-content')
  <h6>Reparaciones</h6>
  <div id="">
    <table id="reparaciones" class="stripe" style="width:100%"></table>
  </div>

      <!-- Modal Confirm Action -->
  <div id="modal-take-photo" class="modal">
    <div class="modal-content">
      <h4>Tomar Fotos</h4>
      <div>
          <label for="videoInputSelect">Elegir cámara</label>
          <select id="videoInputSelect" style="max-width:200px">
          </select>
        </div>
      <div class="camera">
        <video id="video-image">Video stream no disponible.</video>
        <button id="startbutton">Capturar Imágen</button> 
      </div>
      <canvas id="canvas">
      </canvas>
      <div class="output">
        <!-- <img class="photo">  -->
      </div>
    </div>
    <div class="modal-footer">
      <button class="modal-close waves-effect waves-green btn-small">Cancelar</button>
      <button id="save-photos" class="waves-effect waves-green btn-small red">Guardar Fotos</button>
    </div>
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
        <h6 >Nueva Reparación <i class="right material-icons">build</i></h6>
        <div class="divider"></div>
        <div class="input-field" style="display: none;">
          <select id="select-device" class="validate" name="device">
            <option value="0">Seleccionar</option>
          </select>
          <label for="name">Dispositivos Asociados</label>
        </div>
        <div class="input-field">
        <textarea placeholder="Comentario público" id="details" type="text" class="validate" name="details" style="margin-top: .5rem; width: 210px; height: 180px;"></textarea>
          <label for="name">Detalle</label>
        </div>
        <div class="input-field">
          <textarea placeholder="Comentario sólo visible para iPro" id="details-private" type="text" class="validate" name="details_private" style="margin-top: .5rem; width: 210px; height: 180px;"></textarea>
          <label for="name">Detalle Privado</label>
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
          <button class="btn-small" id="take-photo">Tomar Fotos</button>
        </div>
        <div class="input-field center">
          <button class="btn-small" id="save-and-print" data-action="saveAndPrint">Guardar e Imprimir</button>
        </div>
        <div class="input-field center">
          <button class="btn-small" id="save" data-action="save">Guardar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <!-- <script src="/js/jquery-3.3.1.min.js" defer></script> -->
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_reparaciones.js') }}" defer></script>
  @endsection