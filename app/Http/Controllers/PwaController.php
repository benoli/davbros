<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PwaController extends Controller
{
     //
     public function index()
     {
         return view('pwa.login', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
     }
 
     public function inicio()
     {
         return view('pwa.inicio', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }

     public function clientes()
     {
         return view('pwa.clientes', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }

     public function sectores()
     {
         return view('pwa.sectores', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }

     public function planillas()
     {
         return view('pwa.planillas', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }
 
     public function notificaciones()
     {
         return view('pwa.notificaciones', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }

     public function users()
     {
         return view('pwa.users', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }
 
     public function logout()
     {
         return view('pwa.logout', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }

     public function soporte()
     {
         return view('pwa.soporte', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }
}
