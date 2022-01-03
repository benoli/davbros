<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });
Route::Post('/login', [AuthController::class, 'apilogin']);

Route::middleware(['auth:sanctum'])->group(function () {
    // Login
    // Route::get('/login', [LogeadoController::class, 'index']);
    // Users
    // Route::Post('/users', [UsuarioController::class, 'store']);
    // Route::get('/users', [UsuarioController::class, 'index']);
    // Route::put('/users/{id}', [UsuarioController::class, 'update']);
});
