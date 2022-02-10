@extends ('pwa.pwashell')
@section ('title')
    <title>Inicio</title>
@endsection
@section('body-content')
  <div class="flex-card-container">
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">domain</i>
              Clientes
              <i class="material-icons right">more_vert</i></span>
          <!-- <p style="font-size: 1rem; margin-bottom:1rem;">
          <span>Desde: 1/12/2021</span>
          <span>Hasta: 31/12/2021</span>
          </p> -->
          <p>5</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">Seleccionar período<i class="material-icons right">close</i></span>
          <p>Ver que info</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">person</i>
              Cantidad de Servicios
              <i class="material-icons right">more_vert</i></span>
              <p style="font-size: 1rem; margin-bottom:1rem;">
          <span>Desde: 01/02/2022</span>
          <span>Hasta: 10/02/2022</span>
          </p>
          <p>125</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">Seleccionar período<i class="material-icons right">close</i></span>
          <p>Ver que info</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">border_inner</i>
              Sectores
              <i class="material-icons right">more_vert</i></span>
              <p style="font-size: 1rem; margin-bottom:1rem;">
          <span>Desde: 01/02/2022</span>
          <span>Hasta: 10/02/2022</span>
          <p>Activos: 38</p>
          <p>Inactivos: 7</p>
          <p>Total: 37</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">Seleccionar Cliente<i class="material-icons right">close</i></span>
          <p>Ver que info</p>
        </div>
    </div>
    <div class="card small sticky-action flex-card">
        <div class="card-content">
          <span class="card-title activator grey-text text-darken-4">
              <i class="material-icons card-icon" style="color: #1e88e5;">account_circle</i>
              Usuarios
              <i class="material-icons right">more_vert</i></span>
          <p>Registrados: 13</p>
          <p>Admin: 2</p>
          <p>Empleados: 7</p>
          <p>Supervisores Externos: 4</p>
        </div>
        <div class="card-reveal">
          <span class="card-title grey-text text-darken-4">+ Info usuarios<i class="material-icons right">close</i></span>
          <p>Activos ultima semana: 32</p>
        </div>
    </div>
  </div>
@endsection
@section ('scripts-sections')
    <!-- <script src="/js/jquery-3.3.1.min.js" defer></script> -->
    <script src="/js/datatables.min.js" defer></script>
    <script src="{{ mix('js/app_inicio.js') }}" defer></script>
@endsection