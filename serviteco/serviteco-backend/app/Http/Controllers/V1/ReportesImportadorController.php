<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use JWTAuth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ReportesImportadorController extends Controller
{

	protected $user;

    public function __construct(Request $request)
    {
        $token = $request->header('Authorization');

        if($token != '')
            //En caso de que requiera autentifiación la ruta obtenemos el usuario y lo almacenamos en una variable, nosotros no lo utilizaremos.
            $this->user = JWTAuth::parseToken()->authenticate();
    }

    //---------------------------------------------------------------




    //Función que utilizaremos para obtener las referencias que mas solicita garantia por importador.
    public function api_reporte_cuentas_pagar_importador_paginator(Request $request)
    {

        if ($request->proceso == 'all') {

		$items = DB::select("
		SELECT imp.nombre as importadora, sol.id as ticket, concat(sol.nombres, ' ', sol.apellidos) as cliente, t.nombre as taller, mo.nombre as descripcion, (rsmo.valor_unitario * rsmo.cantidad) as valor, rsmo.fecha_sistema as fecha, 'Mano de Obra' as tipo
        FROM recepcion_solicitud_mano_obra rsmo inner join mano_obra mo on mo.id = rsmo.id_mano_obra inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador inner join talleres t on t.id = sol.id_taller
        where sol.id_estado_actual > 3 AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '')
        AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final'))) AND (('$request->id_importador' = '') OR (('$request->id_importador' != '')
        AND (LOWER(p.id_importador) = '$request->id_importador'))) AND (('$request->id_marca' = '') OR (('$request->id_marca' != '')
        AND (LOWER(p.id_marca) = '$request->id_marca'))) AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '')
        AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        UNION ALL SELECT imp.nombre as importadora, sol.id, concat(sol.nombres, ' ', sol.apellidos), t.nombre as taller, r.nombre, (rsr.valor_unitario * rsr.cantidad), rsr.fecha_sistema, 'Repuesto'
        FROM recepcion_solicitud_repuestos rsr inner join repuestos r on r.id = rsr.id_repuesto inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador inner join talleres t on t.id = sol.id_taller where sol.id_estado_actual > 3
        AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial')))
        AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        order by 2 LIMIT $request->pageIndex , $request->pageSize
		");

        $count = DB::select("
		SELECT COUNT(*) as total FROM (SELECT concat(rsmo.id, '_rsmo ') FROM recepcion_solicitud_mano_obra rsmo inner join mano_obra mo on mo.id = rsmo.id_mano_obra
        inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador inner join talleres t on t.id = sol.id_taller
        where sol.id_estado_actual > 3 AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '')
        AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final'))) AND (('$request->id_importador' = '') OR (('$request->id_importador' != '')
        AND (LOWER(p.id_importador) = '$request->id_importador'))) AND (('$request->id_marca' = '') OR (('$request->id_marca' != '')
        AND (LOWER(p.id_marca) = '$request->id_marca'))) AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '')
        AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor'))) UNION SELECT rsr.id FROM recepcion_solicitud_repuestos rsr
        inner join repuestos r on r.id = rsr.id_repuesto inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador where sol.id_estado_actual > 3
        AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial')))
        AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor'))) ) C
        ");

    } else if ($request->proceso == 'mano_obra') {

        $items = DB::select("
		SELECT imp.nombre as importadora, sol.id as ticket, concat(sol.nombres, ' ', sol.apellidos) as cliente, t.nombre as taller, mo.nombre as descripcion, (rsmo.valor_unitario * rsmo.cantidad) as valor, rsmo.fecha_sistema as fecha, 'Mano de Obra' as tipo
        FROM recepcion_solicitud_mano_obra rsmo inner join mano_obra mo on mo.id = rsmo.id_mano_obra inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud  inner join talleres t on t.id = sol.id_taller
        inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador where sol.id_estado_actual > 3
        AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial')))
        AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        order by sol.id LIMIT $request->pageIndex , $request->pageSize
		");

        $count = DB::select("
		SELECT count(rsmo.id) as total  FROM recepcion_solicitud_mano_obra rsmo inner join mano_obra mo on mo.id = rsmo.id_mano_obra
        inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud inner join producto p on p.id = sol.id_producto  inner join talleres t on t.id = sol.id_taller
        inner join importadores imp on imp.id = p.id_importador where sol.id_estado_actual > 3
        AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial')))
        AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

    } else {

        $items = DB::select("
        SELECT imp.nombre as importadora, sol.id as ticket, concat(sol.nombres, ' ', sol.apellidos) as cliente, t.nombre as taller, r.nombre as descripcion, (rsr.valor_unitario * rsr.cantidad) as valor, rsr.fecha_sistema as fecha, 'Repuesto' as tipo FROM recepcion_solicitud_repuestos rsr
        inner join repuestos r on r.id = rsr.id_repuesto inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud  inner join talleres t on t.id = sol.id_taller
        inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador where sol.id_estado_actual > 3
        AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial')))
        AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        order by sol.id LIMIT $request->pageIndex , $request->pageSize
        ");

        $count = DB::select("
        SELECT count(rsr.id) as total FROM recepcion_solicitud_repuestos rsr inner join repuestos r on r.id = rsr.id_repuesto inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador  inner join talleres t on t.id = sol.id_taller where sol.id_estado_actual > 3
        AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial')))
        AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

    }

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de las referencias que mas solicita garantia  por importador
    public function api_export_reporte_cuentas_pagar_importador(Request $request)
    {
		if ($request->proceso == 'all') {

            $items = DB::select("
            SELECT imp.nombre as importadora, sol.id, concat(sol.nombres, ' ', sol.apellidos), t.nombre as taller, mo.nombre, (rsmo.valor_unitario * rsmo.cantidad) as valor, rsmo.fecha_sistema, 'Mano de Obra' as tipo
            FROM recepcion_solicitud_mano_obra rsmo inner join mano_obra mo on mo.id = rsmo.id_mano_obra inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud
            inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador inner join talleres t on t.id = sol.id_taller
            where sol.id_estado_actual > 3 AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
            AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '')
            AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final'))) AND (('$request->id_importador' = '') OR (('$request->id_importador' != '')
            AND (LOWER(p.id_importador) = '$request->id_importador'))) AND (('$request->id_marca' = '') OR (('$request->id_marca' != '')
            AND (LOWER(p.id_marca) = '$request->id_marca'))) AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '')
            AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor'))) UNION ALL SELECT imp.nombre as importadora, sol.id, concat(sol.nombres, ' ', sol.apellidos), t.nombre as taller, r.nombre, (rsr.valor_unitario * rsr.cantidad) as valor, rsr.fecha_sistema, 'Repuesto' as tipo
            FROM recepcion_solicitud_repuestos rsr inner join repuestos r on r.id = rsr.id_repuesto inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
            inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador inner join talleres t on t.id = sol.id_taller where sol.id_estado_actual > 3
            AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial')))
            AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
            AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
            AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
            AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
            order by 2
            ");

            $count = DB::select("
            SELECT COUNT(*) as total FROM (SELECT concat(rsmo.id, '_rsmo ') FROM recepcion_solicitud_mano_obra rsmo inner join mano_obra mo on mo.id = rsmo.id_mano_obra
            inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador
            where sol.id_estado_actual > 3 AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
            AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '')
            AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final'))) AND (('$request->id_importador' = '') OR (('$request->id_importador' != '')
            AND (LOWER(p.id_importador) = '$request->id_importador'))) AND (('$request->id_marca' = '') OR (('$request->id_marca' != '')
            AND (LOWER(p.id_marca) = '$request->id_marca'))) AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '')
            AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor'))) UNION SELECT rsr.id FROM recepcion_solicitud_repuestos rsr
            inner join repuestos r on r.id = rsr.id_repuesto inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
            inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador where sol.id_estado_actual > 3
            AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial')))
            AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
            AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
            AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
            AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor'))) ) C
            ");

        } else if ($request->proceso == 'mano_obra') {

            $items = DB::select("
            SELECT imp.nombre as importadora, sol.id, concat(sol.nombres, ' ', sol.apellidos), t.nombre as taller, mo.nombre, (rsmo.valor_unitario * rsmo.cantidad) as valor, rsmo.fecha_sistema, 'Mano de Obra' as tipo
            FROM recepcion_solicitud_mano_obra rsmo inner join mano_obra mo on mo.id = rsmo.id_mano_obra inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud
            inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador  inner join talleres t on t.id = sol.id_taller where sol.id_estado_actual > 3
            AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial')))
            AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final')))
            AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
            AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
            AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
            order by sol.id
            ");

            $count = DB::select("
            SELECT count(rsmo.id) as total FROM recepcion_solicitud_mano_obra rsmo inner join mano_obra mo on mo.id = rsmo.id_mano_obra
            inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud inner join producto p on p.id = sol.id_producto
            inner join importadores imp on imp.id = p.id_importador inner join talleres t on t.id = sol.id_taller where sol.id_estado_actual > 3
            AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial')))
            AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final')))
            AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
            AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
            AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
            ");

        } else {

            $items = DB::select("
            SELECT imp.nombre as importadora, sol.id, concat(sol.nombres, ' ', sol.apellidos), t.nombre as taller, r.nombre, CAST((rsr.valor_unitario * rsr.cantidad) AS INTEGER) as valor, rsr.fecha_sistema, 'Repuesto' as tipo FROM recepcion_solicitud_repuestos rsr
            inner join repuestos r on r.id = rsr.id_repuesto inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud  inner join talleres t on t.id = sol.id_taller
            inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador where sol.id_estado_actual > 3
            AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial')))
            AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
            AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
            AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
            AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
            order by sol.id
            ");

            $count = DB::select("
            SELECT count(rsr.id) as total FROM recepcion_solicitud_repuestos rsr inner join repuestos r on r.id = rsr.id_repuesto inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
            inner join producto p on p.id = sol.id_producto inner join importadores imp on imp.id = p.id_importador where sol.id_estado_actual > 3
            AND (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '') AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial')))
            AND (('$request->fecha_final' = '') OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
            AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
            AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
            AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
            ");

        }

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }




    //---------------------------------------------------------------





	//Función que utilizaremos para obtener las ayudas.
    public function api_reporte_distribuidores_talleres_activos_paginator(Request $request)
    {
		$items = DB::select("
		select d.id, d.nombre, d.direccion, d.telefono, d.correo, d.correo_contabilidad, d.estado, d.fecha_sistema
        from distribuidores_importadores di inner join distribuidores d on d.id = di.id_distribuidor
        where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(di.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(di.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(di.id_importador) = '$request->id_importador')))
        LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		select count(di.id) as total from distribuidores_importadores di
        inner join distribuidores d on d.id = di.id_distribuidor WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(di.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(di.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(di.id_importador) = '$request->id_importador')))
		");

        $itemsTalleres = DB::select("
		select t.id, t.nit, t.nombre, t.nombre, t.direccion, t.telefono, t.correo, t.correo_contabilidad, t.estado, t.fecha_sistema
        from talleres_importadores ti inner join talleres t on t.id = ti.id_taller
        where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(ti.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(ti.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ti.id_importador) = '$request->id_importador')))
        LIMIT $request->pageIndex , $request->pageSize;
		");

        $countTalleres = DB::select("
		select count(ti.id) as total from talleres_importadores ti
        inner join talleres t on t.id = ti.id_taller WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(ti.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(ti.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ti.id_importador) = '$request->id_importador')))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count, 'talleres' => $itemsTalleres, 'talleresCount' => $countTalleres]);
    }

    //Función que utilizaremos para obtener las ayudas.
    public function api_export_reporte_distribuidores_talleres_activos_paginator(Request $request)
    {
		$items = DB::select("
		select d.id, d.nombre, d.direccion, d.telefono, d.correo, d.correo_contabilidad, d.estado, d.fecha_sistema
        from distribuidores_importadores di inner join distribuidores d on d.id = di.id_distribuidor
        where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(di.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(di.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(di.id_importador) = '$request->id_importador')))
		");

        $count = DB::select("
		select count(di.id) as total from distribuidores_importadores di
        inner join distribuidores d on d.id = di.id_distribuidor WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(di.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(di.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(di.id_importador) = '$request->id_importador')))
		");

        $itemsTalleres = DB::select("
		select t.id, t.nit, t.nombre, t.nombre, t.direccion, t.telefono, t.correo, t.correo_contabilidad, t.estado, t.fecha_sistema
        from talleres_importadores ti inner join talleres t on t.id = ti.id_taller
        where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(ti.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(ti.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ti.id_importador) = '$request->id_importador')))
		");

        $countTalleres = DB::select("
		select count(ti.id) as total from talleres_importadores ti
        inner join talleres t on t.id = ti.id_taller WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(ti.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(ti.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ti.id_importador) = '$request->id_importador')))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count, 'talleres' => $itemsTalleres, 'talleresCount' => $countTalleres]);
    }

    //Función que utilizaremos para obtener las referencias activas por importador.
    public function api_reporte_referencias_activas_paginator(Request $request)
    {
		$items = DB::select("
		select ref.id, ref.nombre, ref.descripcion, tp.nombre as categoria, imp.nombre as importador, m.nombre as marca, ref.estado, ref.fecha_sistema
        from referencias ref inner join tipo_productos tp on tp.id = ref.id_tipo_producto inner join marcas m on m.id = ref.id_marca
        inner join importadores imp on imp.id = ref.id_importador
        where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(ref.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(ref.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador')))
        LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		select count(ref.id) as total from referencias ref
        inner join tipo_productos tp on tp.id = ref.id_tipo_producto inner join marcas m on m.id = ref.id_marca
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(ref.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(ref.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador')))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de las referencias activas por importador
    public function api_export_reporte_referencias_activas_paginator(Request $request)
    {
		$items = DB::select("
		select ref.id, ref.nombre, ref.descripcion, tp.nombre as categoria, imp.nombre as importador, m.nombre as marca, ref.estado, ref.fecha_sistema
        from referencias ref inner join tipo_productos tp on tp.id = ref.id_tipo_producto inner join marcas m on m.id = ref.id_marca
        inner join importadores imp on imp.id = ref.id_importador
        where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(ref.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(ref.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador')));
		");

        $count = DB::select("
		select count(ref.id) as total from referencias ref
        inner join tipo_productos tp on tp.id = ref.id_tipo_producto inner join marcas m on m.id = ref.id_marca
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(ref.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(ref.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador')))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }




//------------------------------------------------------------------------------------------

 //Función que utilizaremos para obtener las solicitudes de garantia activas por importador.
 public function api_reporte_solicitud_garantias_paginator(Request $request)
 {
     $items = DB::select("
    select sol.id as ticket, CONCAT(sol.nombres, ' ', sol.apellidos) as nombre_completo, sol.identificacion, sol.telefono,
    sol.correo, sol.ciudad, sol.fecha_ingreso, sol.descripcion_falla, sol.diagnostico_falla, sol.observacion_diagnostico,
    sol.observacion_respuesta, sol.creado_por, e.nombre as estado_actual, d.nombre as distribuidor
    from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
    inner join producto p on p.id = sol.id_producto
    inner join distribuidores d on d.id = p.id_distribuidor
    inner join importadores imp on imp.id = p.id_importador
    where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and
    (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
    LIMIT $request->pageIndex , $request->pageSize;
     ");

     $count = DB::select("
     select count(sol.id) as total
     from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
     inner join producto p on p.id = sol.id_producto
     inner join distribuidores d on d.id = p.id_distribuidor
     inner join importadores imp on imp.id = p.id_importador
     where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and
     (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
     AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
     OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
     AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
     ");

     //Devolvemos el listado de usuarios si todo va bien.
     return response()->json(['registros' => $items, 'cantidad' => $count]);
 }

 //Función que utilizaremos para obtener el export de las referencias activas por importador
 public function api_export_reporte_solicitud_garantias_paginator(Request $request)
 {
     $items = DB::select("
    select sol.id as ticket, CONCAT(sol.nombres, ' ', sol.apellidos) as nombre_completo, sol.identificacion, sol.telefono,
    sol.correo, sol.ciudad, sol.fecha_ingreso, sol.descripcion_falla, sol.diagnostico_falla, sol.observacion_diagnostico,
    sol.observacion_respuesta, sol.creado_por, e.nombre as estado_actual, d.nombre as distribuidor
    from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
    inner join producto p on p.id = sol.id_producto
    inner join distribuidores d on d.id = p.id_distribuidor
    inner join importadores imp on imp.id = p.id_importador
    where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and
    (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
     ");

     $count = DB::select("
     select count(sol.id) as total
    from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
    inner join producto p on p.id = sol.id_producto
    inner join distribuidores d on d.id = p.id_distribuidor
    inner join importadores imp on imp.id = p.id_importador
    where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and
    (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
     ");

     //Devolvemos el listado de usuarios si todo va bien.
     return response()->json(['registros' => $items, 'cantidad' => $count]);
 }









//---------------------------------------------------------------------------------//


    public function api_reporte_repuestos_activos_paginator(Request $request)
    {
		$items = DB::select("
		select r.material, r.pieza_fabricante, r.nombre, r.descripcion, m.nombre as marca,
        ref.nombre as referencia, cat.nombre as categoria from repuestos r
        inner join referencias ref on ref.id = r.id_referencia inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = r.id_categoria where m.id
        IN (select im.id_marca from importadores_marcas im where im.id_importador = (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador'))))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(m.id) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(cat.id) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(ref.id) = '$request->id_referencia')))
        LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
        select count(r.id) as total from repuestos r
        inner join referencias ref on ref.id = r.id_referencia inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = r.id_categoria where m.id
        IN (select im.id_marca from importadores_marcas im where im.id_importador = (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador'))))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(m.id) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(cat.id) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(ref.id) = '$request->id_referencia')))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de las referencias activas por importador
    public function api_export_reporte_repuestos_activos_paginator(Request $request)
    {
		$items = DB::select("
		select r.material, r.pieza_fabricante, r.nombre, r.descripcion, m.nombre as marca,
        ref.nombre as referencia, cat.nombre as categoria from repuestos r
        inner join referencias ref on ref.id = r.id_referencia inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = r.id_categoria where m.id
        IN (select im.id_marca from importadores_marcas im where im.id_importador = (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador'))));
		");


        $count = DB::select("
		select count(r.id) as total from repuestos r
        inner join referencias ref on ref.id = r.id_referencia inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = r.id_categoria where m.id
        IN (select im.id_marca from importadores_marcas im where im.id_importador = (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador'))))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }
//----------------------------------------------------
   //Función que utilizaremos para obtener los usuarios activos por importador.
   public function api_reporte_usuarios_activos_paginator(Request $request)
   {
       $items = DB::select("
       select username, nombre_completo,identificacion,correo,telefono,cargo , estado, fecha_sistema
       from usuarios
       where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
       AND (LOWER(fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
       OR (('$request->fecha_final' != '') AND (LOWER(fecha_sistema) <= '$request->fecha_final')))
       AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(id_importador) = '$request->id_importador')))
       LIMIT $request->pageIndex , $request->pageSize;
       ");

       $count = DB::select("
       select count(username) as total
       from usuarios
       WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
       AND (LOWER(fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
       OR (('$request->fecha_final' != '') AND (LOWER(fecha_sistema) <= '$request->fecha_final')))
       AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(id_importador) = '$request->id_importador')))
       ");

       //Devolvemos el listado de usuarios si todo va bien.
       return response()->json(['registros' => $items, 'cantidad' => $count]);
   }

   //Función que utilizaremos para obtener el export de las referencias activas por importador
   public function api_export_reporte_usuarios_activos_paginator(Request $request)
   {
       $items = DB::select("
       select username, nombre_completo,identificacion,correo,telefono,cargo , estado, fecha_sistema
       from usuarios
       where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
       AND (LOWER(fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
       OR (('$request->fecha_final' != '') AND (LOWER(fecha_sistema) <= '$request->fecha_final')))
       AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(id_importador) = '$request->id_importador')));
       ");

       $count = DB::select("
       select count(username) as total
       from usuarios
       WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
       AND (LOWER(fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
       OR (('$request->fecha_final' != '') AND (LOWER(fecha_sistema) <= '$request->fecha_final')))
       AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(id_importador) = '$request->id_importador')))
       ");

       //Devolvemos el listado de usuarios si todo va bien.
       return response()->json(['registros' => $items, 'cantidad' => $count]);
   }




//---------------------------------------------------------------









    //Función que utilizaremos para obtener los productos activos por importador.
    public function api_reporte_productos_activos_paginator(Request $request)
    {
		$items = DB::select("
		SELECT imp.nombre as importador, m.nombre as marca, tp.nombre as categoria, ref.nombre as referencia,
        p.serial, d.nombre, p.numero_factura, p.fecha_venta, concat(uf.nombres, ' ', uf.apellidos) as propietario,
        p.numero_factura_usuario, p.fecha_venta_usuario from producto p
        inner join importadores imp on imp.id = p.id_importador inner join marcas m on m.id = p.id_marca
        inner join referencias ref on ref.id = p.id_referencia
        inner join tipo_productos tp on tp.id = p.id_tipo_producto left join usuario_final uf on uf.id = p.usuario
        left join distribuidores d on d.id = p.id_distribuidor
        where (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->identificacion' = '') OR (('$request->identificacion' != '') AND (LOWER(uf.identificacion) = '$request->identificacion')))
        LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		SELECT count(p.id) as total from producto p
        inner join importadores imp on imp.id = p.id_importador inner join marcas m on m.id = p.id_marca
        inner join referencias ref on ref.id = p.id_referencia
        inner join tipo_productos tp on tp.id = p.id_tipo_producto left join usuario_final uf on uf.id = p.usuario
        left join distribuidores d on d.id = p.id_distribuidor
        where (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->identificacion' = '') OR (('$request->identificacion' != '') AND (LOWER(uf.identificacion) = '$request->identificacion')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de los productos activos por importador
    public function api_export_reporte_productos_activos_paginator(Request $request)
    {
		$items = DB::select("
		SELECT imp.nombre as importador, m.nombre as marca, tp.nombre as categoria, ref.nombre as referencia,
        p.serial, d.nombre, p.numero_factura, p.fecha_venta, concat(uf.nombres, ' ', uf.apellidos) as propietario,
        p.numero_factura_usuario, p.fecha_venta_usuario from producto p
        inner join importadores imp on imp.id = p.id_importador inner join marcas m on m.id = p.id_marca
        inner join referencias ref on ref.id = p.id_referencia
        inner join tipo_productos tp on tp.id = p.id_tipo_producto left join usuario_final uf on uf.id = p.usuario
        left join distribuidores d on d.id = p.id_distribuidor
        where (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->identificacion' = '') OR (('$request->identificacion' != '') AND (LOWER(uf.identificacion) = '$request->identificacion')));
		");

        $count = DB::select("
		SELECT count(p.id) as total from producto p
        inner join importadores imp on imp.id = p.id_importador inner join marcas m on m.id = p.id_marca
        inner join referencias ref on ref.id = p.id_referencia
        inner join tipo_productos tp on tp.id = p.id_tipo_producto left join usuario_final uf on uf.id = p.usuario
        left join distribuidores d on d.id = p.id_distribuidor
        where (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->identificacion' = '') OR (('$request->identificacion' != '') AND (LOWER(uf.identificacion) = '$request->identificacion')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }



//---------------------------------------------------------------









    //Función que utilizaremos para obtener las referencias que mas solicita garantia por importador.
    public function api_reporte_referencia_solicita_garantia_paginator(Request $request)
    {
		$items = DB::select("
		select distinct(ref.nombre), ref.descripcion, m.nombre as marca, cat.nombre as categoria, d.nombre as distribuidor, (select count(rs.id) from recepcion_solicitud rs inner join producto pr on pr.id = rs.id_producto where pr.id_referencia = ref.id) as cantidad
        from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join importadores imp on imp.id = p.id_importador
        where tipo_recepcion = 'Garantía' and es_garantia = 'SI'
        and (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        order by cantidad desc LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		SELECT count(distinct(ref.nombre)) as total
        from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join importadores imp on imp.id = p.id_importador
        where tipo_recepcion = 'Garantía' and es_garantia = 'SI'
        and (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de las referencias que mas solicita garantia  por importador
    public function api_export_reporte_referencia_solicita_garantia_paginator(Request $request)
    {
		$items = DB::select("
		select distinct(ref.nombre), ref.descripcion, m.nombre as marca, cat.nombre as categoria, d.nombre as distribuidor, (select count(rs.id) from recepcion_solicitud rs inner join producto pr on pr.id = rs.id_producto where pr.id_referencia = ref.id) as cantidad
        from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join importadores imp on imp.id = p.id_importador
        where tipo_recepcion = 'Garantía' and es_garantia = 'SI'
        and (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        order by cantidad desc;
		");

        $count = DB::select("
		SELECT count(distinct(ref.nombre)) as total
        from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join importadores imp on imp.id = p.id_importador
        where tipo_recepcion = 'Garantía' and es_garantia = 'SI'
        and (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

//---------------------------------------------------------------



    //Función que utilizaremos para obtener los repuestos mas solicitados por importador.
    public function api_reporte_repuestos_solicitados_paginator(Request $request)
    {
		$items = DB::select("
		select  sol.id as ticket, r.nombre as repuesto, r.material, r.pieza_fabricante,ref.nombre as referencia, cat.nombre as categoria,
        m.nombre as marca, d.nombre as distribuidor, t.nombre as taller, rsr.cantidad, rsr.valor_unitario, (rsr.cantidad * rsr.valor_unitario) as total
        from recepcion_solicitud_repuestos rsr inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join repuestos r on r.id = rsr.id_repuesto
        inner join talleres t on t.id = sol.id_taller
        inner join distribuidores d on d.id = p.id_distribuidor
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        order by cantidad desc LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		SELECT count(rsr.id) as total
        from recepcion_solicitud_repuestos rsr inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join repuestos r on r.id = rsr.id_repuesto
        inner join talleres t on t.id = sol.id_taller
        inner join distribuidores d on d.id = p.id_distribuidor
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de los repuestos mas solicitados por importador
    public function api_export_reporte_repuestos_solicitados_paginator(Request $request)
    {
		$items = DB::select("
		select  sol.id as ticket, r.nombre as repuesto, r.material, r.pieza_fabricante,ref.nombre as referencia, cat.nombre as categoria,
        m.nombre as marca, d.nombre as distribuidor, t.nombre as taller, rsr.cantidad, rsr.valor_unitario, (rsr.cantidad * rsr.valor_unitario) as total
        from recepcion_solicitud_repuestos rsr inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join repuestos r on r.id = rsr.id_repuesto
        inner join talleres t on t.id = sol.id_taller
        inner join distribuidores d on d.id = p.id_distribuidor
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))

		");

        $count = DB::select("
        SELECT count(rsr.id) as total
        from recepcion_solicitud_repuestos rsr inner join recepcion_solicitud sol on sol.id = rsr.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join repuestos r on r.id = rsr.id_repuesto
        inner join talleres t on t.id = sol.id_taller
        inner join distribuidores d on d.id = p.id_distribuidor
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsr.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(rsr.fecha_sistema) <= '$request->fecha_final')))
        AND  (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

//---------------------------------------------------------------



    //Función que utilizaremos para obtener las manos de obra mas solicitados y sus costos por importador.
    public function api_reporte_mano_obra_costos_paginator(Request $request)
    {
		$items = DB::select("
        select  sol.id as ticket, mo.nombre as mano_obra, ref.nombre as referencia, cat.nombre as categoria, m.nombre as marca, d.nombre as distribuidor,
        t.nombre as taller, rsmo.cantidad, rsmo.valor_unitario, (rsmo.cantidad * rsmo.valor_unitario) as total from recepcion_solicitud_mano_obra rsmo
        inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join mano_obra mo on mo.id = rsmo.id_mano_obra
        inner join talleres t on t.id = sol.id_taller
        inner join distribuidores d on d.id = p.id_distribuidor
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        order by cantidad desc LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		SELECT count(rsmo.id) as total
        from recepcion_solicitud_mano_obra rsmo
        inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join mano_obra mo on mo.id = rsmo.id_mano_obra
        inner join talleres t on t.id = sol.id_taller
        inner join distribuidores d on d.id = p.id_distribuidor
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de las manos de obra mas solicitados y sus costos por importador
    public function api_export_reporte_mano_obra_costos_paginator(Request $request)
    {
		$items = DB::select("
        select  sol.id as ticket, mo.nombre, ref.nombre as referencia, cat.nombre as categoria, m.nombre as marca, d.nombre as distribuidor,
        t.nombre as taller, rsmo.cantidad, rsmo.valor_unitario, (rsmo.cantidad * rsmo.valor_unitario) as total from recepcion_solicitud_mano_obra rsmo
        inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join mano_obra mo on mo.id = rsmo.id_mano_obra
        inner join talleres t on t.id = sol.id_taller
        inner join distribuidores d on d.id = p.id_distribuidor
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))

		");

        $count = DB::select("
        SELECT count(rsmo.id) as total
        from recepcion_solicitud_mano_obra rsmo
        inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join mano_obra mo on mo.id = rsmo.id_mano_obra
        inner join talleres t on t.id = sol.id_taller
        inner join distribuidores d on d.id = p.id_distribuidor
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(rsmo.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(rsmo.fecha_sistema) <= '$request->fecha_final')))
        AND  (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

//---------------------------------------------------------------



    //Función que utilizaremos para obtener la adquisición de equipos por distribuidor por importador.
    public function api_reporte_adquisicion_equipos_paginator(Request $request)
    {
		$items = DB::select("
        select distinct(ref.nombre) as referencia, m.nombre as marca, (select count(prd.id) from producto prd where prd.id_referencia = p.id_referencia) as cantidad, d.nombre as distribuidor
        from producto p
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(p.fechaSistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(p.fechaSistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        order by cantidad desc LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		SELECT count(p.id) as total
        from producto p
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(p.fechaSistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(p.fechaSistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de la adquisición de equipos por distribuidor por importador
    public function api_export_reporte_adquisicion_equipos_paginator(Request $request)
    {
		$items = DB::select("
        select distinct(ref.nombre) as referencia, m.nombre as marca, (select count(prd.id) from producto prd where prd.id_referencia = p.id_referencia) as cantidad, d.nombre as distribuidora
        from producto p
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(p.fechaSistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(p.fechaSistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        order by cantidad desc
		");

        $count = DB::select("
		SELECT count(p.id) as total
        from producto p
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(p.fechaSistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(p.fechaSistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

//---------------------------------------------------------------



    //Función que utilizaremos para obtener la adquisición de equipos por distribuidor por importador.
    public function api_reporte_colocacion_mercado_paginator(Request $request)
    {
		$items = DB::select("
        select distinct(ref.nombre) as referencia, m.nombre as marca, cat.nombre as categoria, (select count(prd.id) from producto prd inner join usuario_final usuf on usuf.id = prd.usuario where prd.id_referencia = p.id_referencia) as cantidad, d.nombre as distribuidor
        from producto p
        inner join usuario_final uf on uf.id = p.usuario
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(p.fechaSistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(p.fechaSistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        order by cantidad desc LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		SELECT count(p.id) as total
        from producto p
        inner join usuario_final uf on uf.id = p.usuario
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(p.fechaSistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(p.fechaSistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para obtener el export de la adquisición de equipos por distribuidor por importador
    public function api_export_reporte_colocacion_mercado_paginator(Request $request)
    {
		$items = DB::select("
        select distinct(ref.nombre) as referencia, m.nombre as marca, cat.nombre as categoria, (select count(prd.id) from producto prd inner join usuario_final usuf on usuf.id = prd.usuario where prd.id_referencia = p.id_referencia) as cantidad, d.nombre as distribuidor
        from producto p
        inner join usuario_final uf on uf.id = p.usuario
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(p.fechaSistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(p.fechaSistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        order by cantidad desc
		");

        $count = DB::select("
		SELECT count(p.id) as total
        from producto p
        inner join usuario_final uf on uf.id = p.usuario
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(p.fechaSistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(p.fechaSistema) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }


//---------------------------------------------------------------


    //Función que utilizaremos para obtener los seriales bajo bodega del por importador.
    public function api_reporte_seriales_bodega_paginator(Request $request)
    {
		$items = DB::select("
        SELECT p.serial, ref.nombre as referencia, m.nombre as marca, cat.nombre as categoria
        FROM producto p inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia where id_distribuidor = 0
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        order by p.serial desc LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		SELECT count(p.id) as total
        FROM producto p inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia where id_distribuidor = 0
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para exportar los seriales bajo bodega del importador
    public function api_export_reporte_seriales_bodega_paginator(Request $request)
    {
		$items = DB::select("
        SELECT p.serial, ref.nombre as referencia, m.nombre as marca, cat.nombre as categoria
        FROM producto p inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia where id_distribuidor = 0
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        order by p.serial desc
		");

        $count = DB::select("
		SELECT count(p.id) as total
        FROM producto p inner join marcas m on m.id = p.id_marca
        inner join tipo_productos cat on cat.id = p.id_tipo_producto
        inner join referencias ref on ref.id = p.id_referencia where id_distribuidor = 0
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(p.id_marca) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(p.id_tipo_producto) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(p.id_referencia) = '$request->id_referencia')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }




//------------------------------- REPORTES GRAFICOS --------------------------------


    //Función que utilizaremos para obtener los seriales bajo bodega del por importador.
    public function api_reporte_grafico_referencias_mas_vendidas(Request $request)
    {
		$items = DB::select("
        select count(p.id_referencia) total,p.id_referencia ,d.nombre as distribuidora, p.id_importador ,r.nombre  from producto p
        inner join referencias r on r.id = p.id_referencia
        inner join distribuidores d on d.id = p.id_distribuidor
        where p.id_importador = '$request->id_importador' and p.usuario != 0 group by p.id_referencia
        order by id_distribuidor DESC, total DESC LIMIT 2;
		");

        //Devolvemos la data para visualizar en la gráfica.
        return response()->json(['registros' => $items]);
    }


    //Función que utilizaremos para obtener las garantias solicitadas entre distribuidores por importador.
    public function api_reporte_grafico_garantias_solicitadas_importador(Request $request)
    {
		$items = DB::select("
        SELECT d.nombre as distribuidora,
        (select count(res.id) from recepcion_solicitud res inner join producto p on p.id = res.id_producto where res.es_garantia = 'SI' and
        tipo_recepcion = 'Garantía' and p.id_distribuidor = d.id and p.id_importador = '$request->id_importador') as garantias
        FROM distribuidores_importadores di inner join distribuidores d on d.id = di.id_distribuidor where id_importador = '$request->id_importador';
		");

        //Devolvemos la data para visualizar en la gráfica.
        return response()->json(['registros' => $items]);
    }

    //Función que utilizaremos para obtener información general por importador.
    public function api_reporte_grafico_info_general_importador(Request $request)
    {
		$items = DB::select("
        (select count(p.id_referencia) total, r.nombre, 'referenciaMasVendida' clave, (SELECT AVG((SELECT TIMESTAMPDIFF(DAY,
        (select rs.fecha_sistema from recepcion_solicitud_estado rs where rs.id_recepcion_solicitud =
        rse.id_recepcion_solicitud and id_estado = 3), (select rs.fecha_sistema from recepcion_solicitud_estado rs where rs.id_recepcion_solicitud =
        rse.id_recepcion_solicitud and id_estado = 4)))) FROM `recepcion_solicitud_estado` rse
        inner join recepcion_solicitud sol on sol.id = rse.id_recepcion_solicitud inner
        join producto p on p.id = sol.id_producto where p.id_importador = '$request->id_importador') as promedio_evaluacion from producto p
        left join referencias r on r.id = p.id_referencia where p.id_importador = '$request->id_importador' and p.usuario != 0 group by p.id_referencia
        order by   total DESC LIMIT 1)
        UNION
        (select count(p.id_referencia) total,r.nombre,  'referenciaMenosVendida' clave,
        (SELECT AVG((SELECT TIMESTAMPDIFF(DAY, (select rs.fecha_sistema from recepcion_solicitud_estado rs where rs.id_recepcion_solicitud =
        rse.id_recepcion_solicitud and id_estado = 4), (select rs.fecha_sistema from recepcion_solicitud_estado rs where rs.id_recepcion_solicitud =
        rse.id_recepcion_solicitud and id_estado = 6)))) FROM `recepcion_solicitud_estado` rse
        inner join recepcion_solicitud sol on sol.id = rse.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto where p.id_importador = '$request->id_importador') as promedio_reparacion from producto p
        left join referencias r on r.id = p.id_referencia where p.id_importador = '$request->id_importador' and p.usuario != 0 group by p.id_referencia
        order by   total ASC LIMIT 1)
		");

        //Devolvemos la data para visualizar en la gráfica.
        return response()->json(['registros' => $items]);
    }

    //Función que utilizaremos para obtener el comparativo de costros de mano de obra por taller autorizado del importador.
    public function api_reporte_grafico_costos_mano_obra_taller_importador(Request $request)
    {
		$items = DB::select("
        SELECT t.nombre as taller, TRUNCATE((select sum((rsmo.valor_unitario * rsmo.cantidad)) from recepcion_solicitud_mano_obra rsmo
        inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud inner join talleres t on t.id = sol.id_taller
        where t.id = ti.id_taller), 2) as mano_obra
        FROM talleres_importadores ti inner join talleres t on t.id = ti.id_taller where ti.id_importador = '$request->id_importador';
		");

        //Devolvemos la data para visualizar en la gráfica.
        return response()->json(['registros' => $items]);
    }



}
