<?php

use App\Http\Controllers\V1\ProductsController;
use App\Http\Controllers\V1\AuthController;
use App\Http\Controllers\V1\UsuariosController;
use App\Http\Controllers\V1\SeccionController;
use App\Http\Controllers\V1\MesaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\CategoriaController;


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

Route::prefix('v1')->group(function () {
    //Prefijo V1, todo lo que este dentro de este grupo se accedera escribiendo v1 en el navegador, es decir /api/v1/*

    Route::post('login', [AuthController::class, 'authenticate']);
	Route::post('iniciar-sesion', [AuthController::class, 'iniciarSesion']);
    Route::post('register', [AuthController::class, 'register']);
	Route::post('registrar', [AuthController::class, 'registrarUsuario']);
    Route::get('api_validar_token/{id}', [AuthController::class, 'api_validar_token']);
    Route::get('api_get_token/{id}', [AuthController::class, 'api_get_token']);

    Route::get('products', [ProductsController::class, 'index']);
    Route::get('products/{id}', [ProductsController::class, 'show']);

    Route::group(['middleware' => ['jwt.verify']], function() {
        //Todo lo que este dentro de este grupo requiere verificación de usuario.

        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('get-user', [AuthController::class, 'getUser']);
		Route::post('get-nativo', [AuthController::class, 'getNativo']);

        Route::post('products', [ProductsController::class, 'store']);
        Route::put('products/{id}', [ProductsController::class, 'update']);
        Route::delete('products/{id}', [ProductsController::class, 'destroy']);

		Route::post('api_usuarios', [UsuariosController::class, 'api_usuarios']);
		Route::post('api_actualizar_password_usuario', [UsuariosController::class, 'api_actualizar_password_usuario']);
		Route::put('api_actualizar_usuario', [UsuariosController::class, 'api_actualizar_usuario']);
		Route::get('usuarios/usuario', [UsuariosController::class, 'api_get_usuario']);
		Route::post('api_crear_usuario', [UsuariosController::class, 'api_crear_usuario']);
		Route::post('api_validar_username', [UsuariosController::class, 'api_validar_username']);
		Route::post('usuarios/getImagen', [UsuariosController::class, 'get_file']);
		Route::post('api_eliminar_usuario', [UsuariosController::class, 'api_eliminar_usuario']);

        //Gestión seccion
        Route::post('api_secciones', [SeccionController::class, 'api_secciones']);
        Route::post('api_secciones_catalogo', [SeccionController::class, 'api_secciones_catalogo']);
        Route::post('api_crear_seccion', [SeccionController::class, 'api_crear_seccion']);
        Route::put('api_actualizar_seccion', [SeccionController::class, 'api_actualizar_seccion']);
        Route::post('api_eliminar_seccion', [SeccionController::class, 'api_eliminar_seccion']);

        //Gestión seccion
        Route::post('api_mesas', [MesaController::class, 'api_mesas']);
        Route::post('api_crear_mesa', [MesaController::class, 'api_crear_mesa']);
        Route::put('api_actualizar_mesa', [MesaController::class, 'api_actualizar_mesa']);
        Route::post('api_eliminar_mesa', [MesaController::class, 'api_eliminar_mesa']);
        Route::post('api_validar_mesa', [MesaController::class, 'api_validar_mesa']);

           //Gestión categoria -
        Route::post('api_categorias', [CategoriaController::class, 'api_categorias']);
        Route::post('api_crear_categoria', [CategoriaController::class, 'api_crear_categoria']);
        Route::put('api_actualizar_categoria', [CategoriaController::class, 'api_actualizar_categoria']);
        Route::post('api_eliminar_categoria', [CategoriaController::class, 'api_eliminar_categoria']);
    });
});
