@extends ('pwa.pwashell')
@section ('title')
    <title>Inicio</title>
@endsection
@section('body-content')
  <div class="flex-card-container">
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">attach_money</i>
              Ventas
              <i class="material-icons right">more_vert</i></span>
          <p style="font-size: 1rem; margin-bottom:1rem;">
          <span>Desde: 1/12/2021</span>
          <span>Hasta: 31/12/2021</span>
          </p>
          <p>$2.754.546</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">Seleccionar período<i class="material-icons right">close</i></span>
          <p>Ver que info</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">attach_money</i>
              Compras
              <i class="material-icons right">more_vert</i></span>
              <p style="font-size: 1rem; margin-bottom:1rem;">
          <span>Desde: 1/12/2021</span>
          <span>Hasta: 31/12/2021</span>
          </p>
          <p>$1.574.465</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">Seleccionar período<i class="material-icons right">close</i></span>
          <p>Ver que info</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">build</i>
              Reparaciones
              <i class="material-icons right">more_vert</i></span>
          <p>Pendientes: 20</p>
          <p>En proceso: 7</p>
          <p>Terminadas: 60</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">+ Info reparaciones<i class="material-icons right">close</i></span>
          <p>Ver que info</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">phonelink</i>
              Dispositivos
              <i class="material-icons right">more_vert</i></span>
          <p>Registrados: 150</p>
          <p>Reparados: 78</p>
          <p>Vendidos: 30</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">+ Info dispositivos<i class="material-icons right">close</i></span>
          <p>Ver que info</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">person</i>
              Clientes
              <i class="material-icons right">more_vert</i></span>
          <p>De reparaciones: 30</p>
          <p>De ventas: 12</p>
          <p>Registrados: 42</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">+ Info Clientes<i class="material-icons right">close</i></span>
          <p>Último registro: 07/01/2022</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">account_circle</i>
              Usuarios
              <i class="material-icons right">more_vert</i></span>
          <p>Registrados: 95</p>
          <p>Admin: 2</p>
          <p>Empleados: 4</p>
          <p>Clientes: 42</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">+ Info usuarios<i class="material-icons right">close</i></span>
          <p>Activos ultima semana: 32</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">chat</i>
              ChatBot
              <i class="material-icons right">more_vert</i></span>
          <p>Recibidos: 270<i class="material-icons small">keyboard_arrow_down</i></p>
          <p>Enviados: 256<i class="material-icons small">keyboard_arrow_up</i></p>
          <p>Chats: 57</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">+ ChatBot<i class="material-icons right">close</i></span>
          <p>Consultas por reparaciones: 27</p>
          <p>Consultas de precios: 30</p>
        </div>
    </div>
  </div>
@endsection
@section ('scripts-sections')
    <!-- <script src="/js/jquery-3.3.1.min.js" defer></script> -->
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_inicio.js') }}" defer></script>
@endsection