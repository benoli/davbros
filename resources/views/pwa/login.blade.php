@extends ('pwa.structure')
@section ('title')
<title>Inicio Sesión iPro app</title>
<style type="text/css">
	body{
		padding: 0;
		margin: 0;
		background: #ddd;
	}
	.btn{
		margin-top: 10px;

	}
	.container{
		margin:100px auto;
		width: 35%;

	}
	@media(max-width: 952px){
		.container{
			width: 60%;
		}
	}
		@media(max-width: 475px){
		.container{
			width: 80%;
		}
	}
		
</style>
@endsection
</head>
<body>
@section('body')
	<div class="container">
		<div class="row card hoverable">
			<img src="/images/apple-splash-dark-1136-640.png" alt="" class="center col s12">
			<div class="card-content ">
				<h4 class="center">Iniciar Sesión</h4>
				<form class="row s12" method="POST" action="{{url('/login')}}">
					@csrf
					<div class="col s12">
						<div class="input-field">
							<input id="email" type="text" name="email" placeholder="Email*">
						</div>
					</div>
						<div class="col s12">
						<div class="input-field">
							<input type="password" name="password" placeholder="Password*">
						</div>
					</div>
					@error('email')
						<span class="deep-orange-text text-darken-2">{{ $message }}</span>
					@enderror
					<div class="col s12 center">
						<button id="login" type="submit" class="btn btn-large waves-effect waves-light" style="background-color: #002995;">Entrar<i class="material-icons right">send</i></button>
					</div>
				</form>
			</div>
		</div>
	</div>
@endsection
@section ('script')
<script src="{{ mix('js/app.js') }}" defer></script>
@endsection