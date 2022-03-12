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
      <a href="/app/inicio" style="font-size: xx-large; color:white"><span style="color: white; font-weight: bold;">DAVBROS</span><small style="margin-left: .3rem; font-size: 45%;font-weight: bold;">SRL</small></a>
        <span class="right black-text text-darken-1">
          <i class="material-icons sidenav-trigger" data-target="side-menu" style="color:white">menu</i>
        </span>
      </div>
      <div style="border-bottom: 6px solid #6191bd;"></div>
      <div style="border-bottom: 6px solid #d58d7c;"></div>
      <div style="border-bottom: 6px solid #e2dbca;"></div>
    </nav>

    <!-- side nav -->
    <ul id="side-menu" class="sidenav side-menu">
      <li>
          <a class="subheader menu-icon" style="height:180px;">
              <img src="https://davbros.test/images/manifest-icon-512.png" style="width: 180px;margin: 0rem 1rem;">
          </a>
      </li>
      <li><a href="/app/inicio" class="waves-effect">Inicio <i class="material-icons">assessment</i></a></li>
      <li><a href="/app/clientes" class="waves-effect">Clientes <i class="material-icons">domain</i></a></li>
      <li><a href="/app/sectores" class="waves-effect">Sectores <i class="material-icons">border_inner</i></a></li>
      <li><a href="/app/planillas" class="waves-effect">Planillas <i class="material-icons">assignment</i></a></li>
      <li><a href="/app/control" class="waves-effect">Control de Servicio <i class="material-icons">check</i></a></li>
      <li><a href="/app/notificaciones" class="waves-effect">Notificaciones <i class="material-icons">notifications</i></a></li>
      <li><a href="/app/users" class="waves-effect" data-offlinemsg="Debe tener conexión para gestionar usuarios">Usuarios <i class="material-icons">account_circle</i></a></li>
      <li><div class="divider"></div></li>
      <li>
        <a href="/app/logout" class="waves-effect" data-offlinemsg="Debe tener conexión para cerrar sesión">
          <i class="material-icons">power_settings_new</i>Cerrar Sesión
        </a>
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