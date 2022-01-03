@extends ('pwa.structure')
  @section ('header-links')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link type="text/css" href="{{ mix('css/app.css') }}" rel="stylesheet" defer>
    <script type="text/javascript" src="/js/materialize.min.js"></script>
  @endsection
@section ('body')
    <!-- top nav -->
    <nav class="z-depth-0">
      <div class="nav-wrapper container">
      <a href="/app/inicio" style="font-size: xx-large; color:#3800FF"><img src="/images/icons/apple_icon.png" style="width: 2rem;">i<span style="color: black;">Pro</span></a>
        <span class="right black-text text-darken-1">
          <i class="material-icons sidenav-trigger" data-target="side-menu">menu</i>
        </span>
      </div>
    </nav>

    <!-- side nav -->
    <ul id="side-menu" class="sidenav side-menu">
      <li>
          <a class="subheader menu-icon" style="height:180px;">
              <img src="https://ipro.test/images/manifest-icon-512.png" style="width: 180px;margin: 0rem 1rem;">
          </a>
      </li>
      <li><a href="/app/inicio" class="waves-effect">Inicio <i class="material-icons">assessment</i></a></li>
      <li><a href="/app/suppliers" class="waves-effect">Proveedores <i class="material-icons">local_shipping</i></a></li>
      <li><a href="/app/compras" class="waves-effect">Compras <i class="material-icons">add_shopping_cart</i></a></li>
      <li><a href="/app/stock" class="waves-effect">Stock <i class="material-icons">devices_other</i></a></li>
      <li><a href="/app/repuestos" class="waves-effect">Repuestos <i class="material-icons">memory</i></a></li>
      <li><a href="/app/garantias" class="waves-effect">Garantías <i class="material-icons">assignment_turned_in</i></a></li>
      <li><a href="/app/clientes" class="waves-effect">Clientes <i class="material-icons icon-slateblue">person</i></a></li>
      <li><a href="/app/devices" class="waves-effect">Dispositivos <i class="material-icons icon-slateblue">phonelink</i></a></li>
      <li><a href="/app/reparaciones" class="waves-effect">Reparaciones <i class="material-icons icon-slateblue">build</i></a></li>
      <li><a href="/app/users" class="waves-effect">Usuarios <i class="material-icons">account_circle</i></a></li>
      <li><div class="divider"></div></li>
      <li><a href="/app/logout" class="waves-effect">
        <i class="material-icons">power_settings_new</i>Cerrar Sesión</a>
      </li>
      <li><a href="/app/soporte" class="waves-effect">
        <i class="material-icons">mail_outline</i>Soporte</a>
      </li>
    </ul>

    <!-- recipes -->
    <div class="recipes container grey-text text-darken-1">
      @yield('body-content')
    </div>   
    @yield('add-button')
    @yield('add-form')
    <!-- Modal Confirm Sidenav close -->
    <div id="modal-confirm-sidenav-close" class="modal">
      <div class="modal-content">
        <h4>Confirmar</h4>
        <p>¿Desea Cerrar el Form?</p>
      </div>
      <div class="modal-footer">
        <button class="modal-close waves-effect waves-green btn-small red">No</button>
        <button class="modal-close waves-effect waves-green btn-small">Si</button>
      </div>
    </div>
@endsection
@section ('script')
    <script src="/js/ui.js"></script>
    @yield('scripts-sections')
@endsection