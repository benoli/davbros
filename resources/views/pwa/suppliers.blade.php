@extends ('pwa.pwashell')
  @section ('title')
    <title>Proveedores</title>
    <link type="text/css" href="/css/datatables.min.css" rel="stylesheet">
  @endsection
  @section('body-content')
  <h4>Proveedores</h4>
  <div id="">
    <table id="suppliers" class="stripe" style="width:100%"></table>
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
      <form id="form-add-camioneta" class="add-recipe container section">
        <h6 >Nuevo Proveedor <i class="right material-icons">local_shipping</i></h6>
        <div class="divider"></div>
        <div class="input-field">
          <input placeholder="Nombre" id="nombre" type="text" class="validate" name="nombre">
          <label for="nombre">nombre</label>
        </div>
        <!-- <div class="input-field">
          <select id="select-chofer" class="validate" name="chofer">
          </select>
          <label for="chofer">Chofer</label>
        </div> -->
        <div class="input-field">
          <input placeholder="Teléfono" id="phone" type="text" class="validate" name="phone">
          <label for="phone">Teléfono</label>
        </div>
        <div class="input-field">
          <input placeholder="Email" id="email" type="text" class="validate" name="email">
          <label for="email">Email</label>
        </div>
        <div class="input-field">
          <input placeholder="Nombre Fantasía" id="fantasy_name" type="text" class="validate" name="fantasy_name">
          <label for="fantasy_name">Nombre Fantasía</label>
        </div>
        <div class="input-field">
          <input placeholder="CUIT/CUIL" id="fantasy_name" type="text" class="validate" name="fantasy_name">
          <label for="fantasy_name">CUIT/CUIL</label>
        </div>
        <div class="input-field">
          <input placeholder="Número CUIT/CUIL" id="fantasy_name" type="text" class="validate" name="fantasy_name">
          <label for="fantasy_name">Número CUIT/CUIL</label>
        </div>
        <div class="input-field">
          <input placeholder="Dirección" id="fantasy_name" type="text" class="validate" name="fantasy_name">
          <label for="fantasy_name">Dirección</label>
        </div>
        <div class="input-field center">
          <button class="btn-small" id="add-camioneta">Agregar</button>
        </div>
      </form>
    </div>
  @endsection
  @section ('scripts-sections')
    <!-- <script src="/js/jquery-3.3.1.min.js" defer></script> -->
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_suppliers.js') }}" defer></script>
  @endsection