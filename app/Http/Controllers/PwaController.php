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

     public function suppliers()
     {
         return view('pwa.suppliers', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }

     public function compras()
     {
         return view('pwa.compras', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }

     public function stock()
     {
         return view('pwa.stock', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }
 
     public function repuestos()
     {
         return view('pwa.repuestos', [
             // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
         ]);
         // check token
         // Stay on login or accept request
     }

     public function garantias()
     {
         return view('pwa.garantias', [
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
 
     public function devices()
     {
        //dd(getcwd ());
        $devices = json_decode(file_get_contents(getcwd () . '/apple_devices.json'), true);
        return response()
            ->view('pwa.devices', [
                'devices' => $devices
                // 'turnos' => Turno::whereDate('fecha_turno', $today)->orderBy('fullname', 'asc')->get()
            ], 200)
            ->header('Service-Worker-Allowed', '/');
         // check token
         // Stay on login or accept request
     }
 
     public function reparaciones()
     {
         return view('pwa.reparaciones', [
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
}
