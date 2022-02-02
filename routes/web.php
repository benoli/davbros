<?php

use App\Http\Controllers\PwaController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return redirect('/app');
});

Route::get('/app', [PwaController::class, 'index'])->name('app');

Route::group(['middleware' => ['web']], function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/app/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/app/inicio', [PwaController::class, 'inicio']);
    Route::get('/app/clientes', [PwaController::class, 'clientes'])->name('clientes');
    Route::get('/app/sectores', [PwaController::class, 'sectores'])->name('sectores');
    Route::get('/app/planillas', [PwaController::class, 'planillas'])->name('planillas');
    Route::get('/app/notificaciones', [PwaController::class, 'notificaciones'])->name('notificaciones');
    Route::get('/app/users', [PwaController::class, 'users'])->name('users');
});

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
