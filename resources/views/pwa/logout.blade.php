@extends ('pwa.pwashell')
  @section ('title')
    <title>Logout</title>
  @endsection
  @section ('body')
  <body class="grey lighten-4">
    <form method="POST" action="/app/logout">
    @csrf
    <button id="logout" type="submit">Logout</button>
    </form>
  @endsection
  @section ('script')
    <script src="{{ mix('js/app_logout.js') }}" defer></script>
  @endsection