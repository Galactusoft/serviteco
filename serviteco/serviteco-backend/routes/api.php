<?php

use App\Http\Controllers\V1\ProductsController;
use App\Http\Controllers\V1\AuthController;
use App\Http\Controllers\V1\UsuariosController;
use App\Http\Controllers\V1\SeccionController;
use App\Http\Controllers\V1\MesaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\CategoriaController;
use App\Http\Controllers\V1\AyudaController;
use App\Http\Controllers\V1\ReportesImportadorController;
use App\Http\Controllers\V1\ReportesDistribuidorController;


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

    Route::get('api_get_notificaciones', [ProductsController::class, 'show']);

    // generales
    Route::post('/ayuda/api_ayudas', [AyudaController::class, 'api_ayudas']);
    Route::post('/ayuda/api_get_ayuda', [AyudaController::class, 'api_get_ayuda']);
    Route::post('/ayuda/api_get_file', [AyudaController::class, 'api_get_file']);
    Route::post('/ayuda/api_upload_file', [AyudaController::class, 'api_upload_file']);
    Route::post('/ayuda/api_registrar_ayuda', [AyudaController::class, 'api_registrar_ayuda']);
    Route::post('/ayuda/api_actualizar_ayuda', [AyudaController::class, 'api_actualizar_ayuda']);
    Route::post('/ayuda/api_delete_file', [AyudaController::class, 'api_delete_file']);

    Route::post('/reportes/api_reporte_cuentas_pagar_importador_paginator', [ReportesImportadorController::class, 'api_reporte_cuentas_pagar_importador_paginator']);
    Route::post('/reportes/api_export_reporte_cuentas_pagar_importador', [ReportesImportadorController::class, 'api_export_reporte_cuentas_pagar_importador']);

    Route::post('/reportes/api_reporte_distribuidores_talleres_activos_paginator', [ReportesImportadorController::class, 'api_reporte_distribuidores_talleres_activos_paginator']);
    Route::post('/reportes/api_export_reporte_distribuidores_talleres_activos_paginator', [ReportesImportadorController::class, 'api_export_reporte_distribuidores_talleres_activos_paginator']);
    Route::post('/reportes/api_reporte_referencias_activas_paginator', [ReportesImportadorController::class, 'api_reporte_referencias_activas_paginator']);
    Route::post('/reportes/api_export_reporte_referencias_activas_paginator', [ReportesImportadorController::class, 'api_export_reporte_referencias_activas_paginator']);
    Route::post('/reportes/api_reporte_productos_activos_paginator', [ReportesImportadorController::class, 'api_reporte_productos_activos_paginator']);
    Route::post('/reportes/api_export_reporte_productos_activos_paginator', [ReportesImportadorController::class, 'api_export_reporte_productos_activos_paginator']);
    Route::post('/reportes/api_export_reporte_usuarios_activos_paginator', [ReportesImportadorController::class, 'api_export_reporte_usuarios_activos_paginator']);
    Route::post('/reportes/api_reporte_usuarios_activos_paginator', [ReportesImportadorController::class, 'api_reporte_usuarios_activos_paginator']);
    Route::post('/reportes/api_reporte_repuestos_activos_paginator', [ReportesImportadorController::class, 'api_reporte_repuestos_activos_paginator']);
    Route::post('/reportes/api_export_reporte_repuestos_activos_paginator', [ReportesImportadorController::class, 'api_export_reporte_repuestos_activos_paginator']);
    Route::post('/reportes/api_export_reporte_solicitud_garantias_paginator', [ReportesImportadorController::class, 'api_export_reporte_solicitud_garantias_paginator']);
    Route::post('/reportes/api_reporte_solicitud_garantias_paginator', [ReportesImportadorController::class, 'api_reporte_solicitud_garantias_paginator']);
    Route::post('/reportes/api_reporte_referencia_solicita_garantia_paginator', [ReportesImportadorController::class, 'api_reporte_referencia_solicita_garantia_paginator']);
    Route::post('/reportes/api_export_reporte_referencia_solicita_garantia_paginator', [ReportesImportadorController::class, 'api_export_reporte_referencia_solicita_garantia_paginator']);
    Route::post('/reportes/api_reporte_repuestos_solicitados_paginator', [ReportesImportadorController::class, 'api_reporte_repuestos_solicitados_paginator']);
    Route::post('/reportes/api_export_reporte_repuestos_solicitados_paginator', [ReportesImportadorController::class, 'api_export_reporte_repuestos_solicitados_paginator']);
    Route::post('/reportes/api_reporte_mano_obra_costos_paginator', [ReportesImportadorController::class, 'api_reporte_mano_obra_costos_paginator']);
    Route::post('/reportes/api_export_reporte_mano_obra_costos_paginator', [ReportesImportadorController::class, 'api_export_reporte_mano_obra_costos_paginator']);
    Route::post('/reportes/api_reporte_adquisicion_equipos_paginator', [ReportesImportadorController::class, 'api_reporte_adquisicion_equipos_paginator']);
    Route::post('/reportes/api_export_reporte_adquisicion_equipos_paginator', [ReportesImportadorController::class, 'api_export_reporte_adquisicion_equipos_paginator']);
    Route::post('/reportes/api_reporte_colocacion_mercado_paginator', [ReportesImportadorController::class, 'api_reporte_colocacion_mercado_paginator']);
    Route::post('/reportes/api_export_reporte_colocacion_mercado_paginator', [ReportesImportadorController::class, 'api_export_reporte_colocacion_mercado_paginator']);

    Route::post('/reportes/api_reporte_seriales_bodega_paginator', [ReportesImportadorController::class, 'api_reporte_seriales_bodega_paginator']);
    Route::post('/reportes/api_export_reporte_seriales_bodega_paginator', [ReportesImportadorController::class, 'api_export_reporte_seriales_bodega_paginator']);

    Route::post('/reportes/api_reporte_grafico_referencias_mas_vendidas', [ReportesImportadorController::class, 'api_reporte_grafico_referencias_mas_vendidas']);
    Route::post('/reportes/api_reporte_grafico_garantias_solicitadas_importador', [ReportesImportadorController::class, 'api_reporte_grafico_garantias_solicitadas_importador']);
    Route::post('/reportes/api_reporte_grafico_info_general_importador', [ReportesImportadorController::class, 'api_reporte_grafico_info_general_importador']);
    Route::post('/reportes/api_reporte_grafico_costos_mano_obra_taller_importador', [ReportesImportadorController::class, 'api_reporte_grafico_costos_mano_obra_taller_importador']);


    Route::post('/reportes/api_reporte_grafico_referencias_mas_vendidas_distribuidor', [ReportesDistribuidorController::class, 'api_reporte_grafico_referencias_mas_vendidas_distribuidor']);
    Route::post('/reportes/api_reporte_grafico_garantias_solicitadas_distribuidor', [ReportesDistribuidorController::class, 'api_reporte_grafico_garantias_solicitadas_distribuidor']);
    Route::post('/reportes/api_reporte_grafico_info_general_distribuidor', [ReportesDistribuidorController::class, 'api_reporte_grafico_info_general_distribuidor']);
    Route::post('/reportes/api_reporte_grafico_costos_mano_obra_taller_distribuidor', [ReportesDistribuidorController::class, 'api_reporte_grafico_costos_mano_obra_taller_distribuidor']);

    Route::post('/reportes/api_reporte_importadores_activos_paginator', [ReportesDistribuidorController::class, 'api_reporte_importadores_activos_paginator']);
    Route::post('/reportes/api_export_reporte_importadores_activos_paginator', [ReportesDistribuidorController::class, 'api_export_reporte_importadores_activos_paginator']);
    Route::post('/reportes/api_reporte_talleres_asociados_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_talleres_asociados_distribuidor_paginator']);
    Route::post('/reportes/api_export_reporte_talleres_asociados_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_reporte_talleres_asociados_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_referencias_activas_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_referencias_activas_distribuidor_paginator']);
    Route::post('/reportes/api_export_reporte_referencias_activas_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_reporte_referencias_activas_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_repuestos_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_repuestos_distribuidor_paginator']);
    Route::post('/reportes/api_export_reporte_repuestos_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_reporte_repuestos_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_solicitud_garantias_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_solicitud_garantias_distribuidor_paginator']);
    Route::post('/reportes/api_export_reporte_solicitud_garantias_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_reporte_solicitud_garantias_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_repuestos_solicitados_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_repuestos_solicitados_distribuidor_paginator']);
    Route::post('/reportes/api_export_reporte_repuestos_solicitados_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_reporte_repuestos_solicitados_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_tickets_por_cobrar_paginator', [ReportesDistribuidorController::class, 'api_reporte_tickets_por_cobrar_paginator']);
    Route::post('/reportes/api_export_reporte_tickets_por_cobrar_paginator', [ReportesDistribuidorController::class, 'api_export_reporte_tickets_por_cobrar_paginator']);
    Route::post('/reportes/api_reporte_usuarios_asociados_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_usuarios_asociados_distribuidor_paginator']);
    Route::post('/reportes/api_export_usuarios_asociados_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_usuarios_asociados_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_usuarios_finales_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_usuarios_finales_distribuidor_paginator']);
    Route::post('/reportes/api_export_usuarios_finales_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_usuarios_finales_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_referencias_mas_garantias_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_referencias_mas_garantias_distribuidor_paginator']);
    Route::post('/reportes/api_export_referencias_mas_garantias_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_referencias_mas_garantias_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_marcas_mas_garantias_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_marcas_mas_garantias_distribuidor_paginator']);
    Route::post('/reportes/api_export_marcas_mas_garantias_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_marcas_mas_garantias_distribuidor_paginator']);
    Route::post('/reportes/api_reporte_aprobacion_rechazo_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_reporte_aprobacion_rechazo_distribuidor_paginator']);
    Route::post('/reportes/api_export_reporte_aprobacion_rechazo_distribuidor_paginator', [ReportesDistribuidorController::class, 'api_export_reporte_aprobacion_rechazo_distribuidor_paginator']);


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
