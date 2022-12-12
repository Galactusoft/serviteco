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

class ReportesDistribuidorController extends Controller
{
    protected $user;

    public function __construct(Request $request)
    {
        $token = $request->header("Authorization");

        if ($token != "") {
            //En caso de que requiera autentifiación la ruta obtenemos el usuario y lo almacenamos en una variable, nosotros no lo utilizaremos.
            $this->user = JWTAuth::parseToken()->authenticate();
        }
    }

    //Función que utilizaremos para obtener los importadores activos por distribuidor.
    public function api_reporte_importadores_activos_paginator(Request $request)
    {
        $items = DB::select("
		select imp.id, imp.nombre, imp.direccion, imp.telefono, imp.correo, imp.correo_contabilidad, imp.estado, imp.fecha_sistema
        from distribuidores_importadores di inner join importadores imp on imp.id = di.id_importador
        where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(di.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(di.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(di.id_distribuidor) = '$request->id_distribuidor')))
        LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		select count(di.id) as total from distribuidores_importadores di inner join importadores imp on imp.id = di.id_importador
        WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(di.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(di.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(di.id_distribuidor) = '$request->id_distribuidor')))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de importadores activos por distribuidor.
    public function api_export_reporte_importadores_activos_paginator(
        Request $request
    ) {
        $items = DB::select("
		select imp.id, imp.nombre, imp.direccion, imp.telefono, imp.correo, imp.correo_contabilidad, imp.estado, imp.fecha_sistema
        from distribuidores_importadores di inner join importadores imp on imp.id = di.id_importador
        where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(di.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(di.fecha_sistema) <= '$request->fecha_final')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(di.id_distribuidor) = '$request->id_distribuidor')));
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
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //------------------------------------------------------------------------------------------

    //Función que utilizaremos para obtener los importadores activos por distribuidor.
    public function api_reporte_talleres_asociados_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
    select distinct t.id, t.nombre, t.direccion, t.telefono, t.correo, t.correo_contabilidad, t.estado, t.fecha_sistema
    from talleres_importadores ti inner join talleres t on t.id = ti.id_taller
    where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(ti.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(ti.fecha_sistema) <= '$request->fecha_final')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(ti.id_importador) IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))))
    LIMIT $request->pageIndex , $request->pageSize;
    ");

        $count = DB::select("
    select count(distinct ti.id_taller) as total from talleres_importadores ti inner join talleres t on t.id = ti.id_taller
    WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(ti.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(ti.fecha_sistema) <= '$request->fecha_final')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(ti.id_importador) IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))))
    ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de importadores activos por distribuidor.
    public function api_export_reporte_talleres_asociados_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
    select distinct t.id, t.nombre, t.direccion, t.telefono, t.correo, t.correo_contabilidad, t.estado, t.fecha_sistema
    from talleres_importadores ti inner join talleres t on t.id = ti.id_taller
    where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(ti.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(ti.fecha_sistema) <= '$request->fecha_final')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(ti.id_importador) IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))))
    ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items]);
    }

    //------------------------------------------------------------------------------------------

    //Función que utilizaremos para obtener las referencias activas por distribuidor.
    public function api_reporte_referencias_activas_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
    select ref.id, ref.nombre, ref.descripcion, tp.nombre as categoria, imp.nombre as importador, m.nombre as marca, ref.estado, ref.fecha_sistema
    from referencias ref inner join tipo_productos tp on tp.id = ref.id_tipo_producto inner join marcas m on m.id = ref.id_marca
    inner join importadores imp on imp.id = ref.id_importador
    where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(ref.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(ref.fecha_sistema) <= '$request->fecha_final')))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(ref.id_importador) IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))))
    LIMIT $request->pageIndex , $request->pageSize;
    ");

        $count = DB::select("
    select count(ref.id) as total from referencias ref
    inner join tipo_productos tp on tp.id = ref.id_tipo_producto inner join marcas m on m.id = ref.id_marca
    WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(ref.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(ref.fecha_sistema) <= '$request->fecha_final')))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) = '$request->id_importador')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(ref.id_importador) IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))))
    ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de las referencias activas por distribuidor
    public function api_export_reporte_referencias_activas_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
    select ref.id, ref.nombre, ref.descripcion, tp.nombre as categoria, imp.nombre as importador, m.nombre as marca, ref.estado, ref.fecha_sistema
    from referencias ref inner join tipo_productos tp on tp.id = ref.id_tipo_producto inner join marcas m on m.id = ref.id_marca
    inner join importadores imp on imp.id = ref.id_importador
    where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(ref.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(ref.fecha_sistema) <= '$request->fecha_final')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(ref.id_importador) IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))));
    ");

        $count = DB::select("
    select count(ref.id) as total from referencias ref
    inner join tipo_productos tp on tp.id = ref.id_tipo_producto inner join marcas m on m.id = ref.id_marca
    WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(ref.fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(ref.fecha_sistema) <= '$request->fecha_final')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(ref.id_importador) IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))))
    ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //---------------------------------------------------------------------------------//

    public function api_reporte_repuestos_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("

    select r.material, r.pieza_fabricante, r.nombre, r.descripcion, m.nombre as marca, imp.nombre as importador,
    ref.nombre as referencia, cat.nombre as categoria from repuestos r
    inner join referencias ref on ref.id = r.id_referencia inner join importadores imp on imp.id = ref.id_importador inner join marcas m on m.id = ref.id_marca
    inner join tipo_productos cat on cat.id = r.id_categoria where m.id IN
    (select im.id_marca from importadores_marcas im where im.id_importador IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
    AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(m.id) = '$request->id_marca')))
    AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(cat.id) = '$request->id_categoria')))
    AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(ref.id) = '$request->id_referencia')))
    LIMIT $request->pageIndex , $request->pageSize;
    ");

        $count = DB::select("
    select count(r.id) as total from repuestos r
    inner join referencias ref on ref.id = r.id_referencia inner join importadores imp on imp.id = ref.id_importador inner join marcas m on m.id = ref.id_marca
    inner join tipo_productos cat on cat.id = r.id_categoria where m.id
    IN (select im.id_marca from importadores_marcas im where im.id_importador IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
    AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(m.id) = '$request->id_marca')))
    AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(cat.id) = '$request->id_categoria')))
    AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(ref.id) = '$request->id_referencia')))
    ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de las referencias activas por importador
    public function api_export_reporte_repuestos_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
        select r.material, r.pieza_fabricante, r.nombre, r.descripcion, m.nombre as marca, imp.nombre as importador,
        ref.nombre as referencia, cat.nombre as categoria from repuestos r
        inner join referencias ref on ref.id = r.id_referencia inner join importadores imp on imp.id = ref.id_importador inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = r.id_categoria where m.id IN
        (select im.id_marca from importadores_marcas im where im.id_importador IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor'))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
        AND (('$request->id_marca' = '') OR (('$request->id_marca' != '') AND (LOWER(m.id) = '$request->id_marca')))
        AND (('$request->id_categoria' = '') OR (('$request->id_categoria' != '') AND (LOWER(cat.id) = '$request->id_categoria')))
        AND (('$request->id_referencia' = '') OR (('$request->id_referencia' != '') AND (LOWER(ref.id) = '$request->id_referencia')))
        ");

        $count = DB::select("
    select count(r.id) as total from repuestos r
    inner join referencias ref on ref.id = r.id_referencia inner join marcas m on m.id = ref.id_marca
    inner join tipo_productos cat on cat.id = r.id_categoria where m.id
    IN (select im.id_marca from importadores_marcas im where im.id_importador = (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(ref.id_importador) IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor')))))
    ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //------------------------------- REPORTES GRAFICOS --------------------------------

    //Función que utilizaremos para obtener los seriales bajo bodega del por importador.
    public function api_reporte_grafico_referencias_mas_vendidas_distribuidor(
        Request $request
    ) {
        $items = DB::select("
        select count(p.id_referencia) total,p.id_referencia ,d.nombre as distribuidora, p.id_importador ,r.nombre  from producto p
        inner join referencias r on r.id = p.id_referencia
        inner join distribuidores d on d.id = p.id_distribuidor
        where p.id_distribuidor = '$request->id_distribuidor' and p.usuario != 0 group by p.id_referencia
        order by id_distribuidor DESC, total DESC LIMIT 2;
		");

        //Devolvemos la data para visualizar en la gráfica.
        return response()->json(["registros" => $items]);
    }

    //Función que utilizaremos para obtener las garantias solicitadas del distribuidor.
    public function api_reporte_grafico_garantias_solicitadas_distribuidor(
        Request $request
    ) {
        $items = DB::select("
        SELECT imp.nombre as distribuidora,
        (select count(res.id) from recepcion_solicitud res inner join producto p on p.id = res.id_producto where res.es_garantia = 'SI' and
        tipo_recepcion = 'Garantía' and p.id_distribuidor = di.id_distribuidor and p.id_importador = di.id_importador) as garantias
        FROM distribuidores_importadores di inner join importadores imp on imp.id = di.id_importador where di.id_distribuidor = '$request->id_distribuidor' and (select count(res.id) from recepcion_solicitud res inner join producto p on p.id = res.id_producto where res.es_garantia = 'SI' and
        tipo_recepcion = 'Garantía' and p.id_distribuidor = di.id_distribuidor and p.id_importador = di.id_importador) > 0;
		");

        //Devolvemos la data para visualizar en la gráfica.
        return response()->json(["registros" => $items]);
    }

    //Función que utilizaremos para obtener información general por distribuidor.
    public function api_reporte_grafico_info_general_distribuidor(
        Request $request
    ) {
        $items = DB::select("
        (select count(p.id_referencia) total, r.nombre, 'referenciaMasVendida' clave, (SELECT AVG((SELECT TIMESTAMPDIFF(DAY,
        (select rs.fecha_sistema from recepcion_solicitud_estado rs where rs.id_recepcion_solicitud =
        rse.id_recepcion_solicitud and id_estado = 2), (select rs.fecha_sistema from recepcion_solicitud_estado rs where rs.id_recepcion_solicitud =
        rse.id_recepcion_solicitud and id_estado = 3)))) FROM `recepcion_solicitud_estado` rse
        inner join recepcion_solicitud sol on sol.id = rse.id_recepcion_solicitud inner
        join producto p on p.id = sol.id_producto where p.id_distribuidor = '$request->id_distribuidor') as promedio_evaluacion from producto p
        left join referencias r on r.id = p.id_referencia where p.id_distribuidor = '$request->id_distribuidor' and p.usuario != 0 group by p.id_referencia
        order by   total DESC LIMIT 1)
        UNION
        (select count(p.id_referencia) total,r.nombre,  'referenciaMenosVendida' clave,
        (SELECT AVG((SELECT TIMESTAMPDIFF(DAY, (select rs.fecha_sistema from recepcion_solicitud_estado rs where rs.id_recepcion_solicitud =
        rse.id_recepcion_solicitud and id_estado = 4), (select rs.fecha_sistema from recepcion_solicitud_estado rs where rs.id_recepcion_solicitud =
        rse.id_recepcion_solicitud and id_estado = 7)))) FROM `recepcion_solicitud_estado` rse
        inner join recepcion_solicitud sol on sol.id = rse.id_recepcion_solicitud
        inner join producto p on p.id = sol.id_producto where p.id_distribuidor = '$request->id_distribuidor') as promedio_reparacion from producto p
        left join referencias r on r.id = p.id_referencia where p.id_distribuidor = '$request->id_distribuidor' and p.usuario != 0 group by p.id_referencia
        order by   total ASC LIMIT 1)
		");

        //Devolvemos la data para visualizar en la gráfica.
        return response()->json(["registros" => $items]);
    }

    //Función que utilizaremos para obtener el comparativo de costros de mano de obra por taller autorizado del distribuidor.
    public function api_reporte_grafico_costos_mano_obra_taller_distribuidor(
        Request $request
    ) {
        $items = DB::select("
        SELECT distinct t.nombre as taller, TRUNCATE((select sum((rsmo.valor_unitario * rsmo.cantidad)) from recepcion_solicitud_mano_obra rsmo
        inner join recepcion_solicitud sol on sol.id = rsmo.id_recepcion_solicitud inner join producto p on p.id = sol.id_producto inner join talleres t on t.id = sol.id_taller
        where t.id = ti.id_taller AND p.id_distribuidor = '$request->id_distribuidor'), 2) as mano_obra
        FROM talleres_importadores ti inner join talleres t on t.id = ti.id_taller where ti.id_importador IN (select di.id_importador from distribuidores_importadores di where di.id_distribuidor = '$request->id_distribuidor');
		");

        //Devolvemos la data para visualizar en la gráfica.
        return response()->json(["registros" => $items]);
    }

    //------------------------------------------------------------------------------------------

    //Función que utilizaremos para obtener las solicitudes de garantia activas por importador.
    public function api_reporte_solicitud_garantias_distribuidor_paginator(
        Request $request
    ) {
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
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(d.id) = '$request->id_distribuidor')))
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
     AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(d.id) = '$request->id_distribuidor')))
     ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de las referencias activas por importador
    public function api_export_reporte_solicitud_garantias_distribuidor_paginator(
        Request $request
    ) {
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
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(d.id) = '$request->id_distribuidor')))
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
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))
     ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //---------------------------------------------------------------

    //Función que utilizaremos para obtener los repuestos mas solicitados por distribuidor.
    public function api_reporte_repuestos_solicitados_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
		select  sol.id as ticket, r.nombre as repuesto, r.material, r.pieza_fabricante,ref.nombre as referencia, cat.nombre as categoria,
        m.nombre as marca, d.nombre as distribuidor, t.nombre as taller, rsr.cantidad, (SELECT CONVERT(rsr.valor_unitario, DECIMAL)) as valor_unitario, (rsr.cantidad * rsr.valor_unitario) as total
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
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
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
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de los repuestos mas solicitados por distribuidor
    public function api_export_reporte_repuestos_solicitados_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
		select  sol.id as ticket, r.nombre as repuesto, r.material, r.pieza_fabricante,ref.nombre as referencia, cat.nombre as categoria,
        m.nombre as marca, d.nombre as distribuidor, t.nombre as taller, rsr.cantidad, (SELECT CONVERT(rsr.valor_unitario, DECIMAL)) as valor_unitario, (rsr.cantidad * rsr.valor_unitario) as total
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
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))

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
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //---------------------------------------------------------------

    //Función que utilizaremos para obtener las manos de obra mas solicitados y sus costos por importador.
    public function api_reporte_tickets_por_cobrar_paginator(Request $request)
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
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de las manos de obra mas solicitados y sus costos por importador
    public function api_export_reporte_tickets_por_cobrar_paginator(
        Request $request
    ) {
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
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //----------------------------------------------------

    //Función que utilizaremos para obtener los usuarios activos por distribuidora.
    public function api_reporte_usuarios_asociados_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
       select username, nombre_completo,identificacion,correo,telefono,cargo , estado, fecha_sistema
       from usuarios
       where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
       AND (LOWER(fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
       OR (('$request->fecha_final' != '') AND (LOWER(fecha_sistema) <= '$request->fecha_final')))
       AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(id_distribuidor) = '$request->id_distribuidor')))
       LIMIT $request->pageIndex , $request->pageSize;
       ");

        $count = DB::select("
       select count(username) as total
       from usuarios
       WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
       AND (LOWER(fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
       OR (('$request->fecha_final' != '') AND (LOWER(fecha_sistema) <= '$request->fecha_final')))
       AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(id_distribuidor) = '$request->id_distribuidor')))
       ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener los usuarios activos por distribuidora.
    public function api_export_usuarios_asociados_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
       select username, nombre_completo,identificacion,correo,telefono,cargo , estado, fecha_sistema
       from usuarios
       where (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
       AND (LOWER(fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
       OR (('$request->fecha_final' != '') AND (LOWER(fecha_sistema) <= '$request->fecha_final')))
       AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(id_distribuidor) = '$request->id_distribuidor')))
       ");

        $count = DB::select("
       select count(username) as total
       from usuarios
       WHERE (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
       AND (LOWER(fecha_sistema) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
       OR (('$request->fecha_final' != '') AND (LOWER(fecha_sistema) <= '$request->fecha_final')))
       AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(id_distribuidor) = '$request->id_distribuidor')))
       ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //----------------------------------------------------

    //Función que utilizaremos para obtener los usuarios activos por distribuidora.
    public function api_reporte_usuarios_finales_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
        select distinct(uf.identificacion), uf.apellidos, uf.nombres, uf.correo, uf.telefono, uf.direccion
        from producto p inner join usuario_final uf on p.usuario = uf.id
       where (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
       LIMIT $request->pageIndex , $request->pageSize;
       ");

        $count = DB::select("
        select count(distinct(uf.identificacion)) as total
        from producto p inner join usuario_final uf on p.usuario = uf.id
       WHERE (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
       ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener los usuarios activos por distribuidora.
    public function api_export_usuarios_finales_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
        select distinct(uf.identificacion), uf.apellidos, uf.nombres, uf.correo, uf.telefono, uf.direccion
        from producto p inner join usuario_final uf on p.usuario = uf.id
       where (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
       ");

        $count = DB::select("
        select uf.nombres, uf.apellidos, uf.identificacion, uf.correo, uf.telefono, uf.direccion
        from producto p inner join usuario_final uf on p.usuario = uf.id
       WHERE (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
       ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //---------------------------------------------------------------

    //Función que utilizaremos para obtener las referencias que mas solicita garantia por distribuidor.
    public function api_reporte_referencias_mas_garantias_distribuidor_paginator(
        Request $request
    ) {
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
        and (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
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
        and (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de las referencias que mas solicita garantia  por distribuidor
    public function api_export_referencias_mas_garantias_distribuidor_paginator(
        Request $request
    ) {
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
        and (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
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
        and (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //---------------------------------------------------------------

    //Función que utilizaremos para obtener las marcas que mas solicita garantia por distribuidor.
    public function api_reporte_marcas_mas_garantias_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
		select distinct(m.nombre), m.descripcion, cat.nombre as categoria, d.nombre as distribuidor, (select count(rs.id) from recepcion_solicitud rs inner join producto pr on pr.id = rs.id_producto where pr.id_referencia = ref.id) as cantidad
        from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join importadores imp on imp.id = p.id_importador
        where tipo_recepcion = 'Garantía' and es_garantia = 'SI'
        and (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        and (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
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
        and (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
         ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //Función que utilizaremos para obtener el export de las marcas que mas solicita garantia  por distribuidor
    public function api_export_marcas_mas_garantias_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
		select distinct(m.nombre), m.descripcion, cat.nombre as categoria, d.nombre as distribuidor, (select count(rs.id) from recepcion_solicitud rs inner join producto pr on pr.id = rs.id_producto where pr.id_referencia = ref.id) as cantidad
        from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
        inner join producto p on p.id = sol.id_producto
        inner join referencias ref on ref.id = p.id_referencia
        inner join marcas m on m.id = ref.id_marca
        inner join tipo_productos cat on cat.id = ref.id_tipo_producto
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join importadores imp on imp.id = p.id_importador
        where tipo_recepcion = 'Garantía' and es_garantia = 'SI'
        and (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(p.id_importador) = '$request->id_importador')))
        and (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
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
        and (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND (LOWER(p.id_distribuidor) = '$request->id_distribuidor')))
        ");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(["registros" => $items, "cantidad" => $count]);
    }

    //---------------------------------------------------------------

    //Función que utilizaremos para obtener las ayudas.
    public function api_reporte_aprobacion_rechazo_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
    select sol.id as ticket, CONCAT(sol.nombres, ' ', sol.apellidos) as nombre_completo, sol.identificacion, sol.telefono,
    sol.correo, sol.ciudad, sol.fecha_ingreso, sol.descripcion_falla, sol.diagnostico_falla, sol.observacion_diagnostico,
    sol.observacion_respuesta, sol.creado_por, e.nombre as estado_actual, d.nombre as distribuidor
    from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
    inner join producto p on p.id = sol.id_producto
    inner join distribuidores d on d.id = p.id_distribuidor
    inner join importadores imp on imp.id = p.id_importador
    where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and garantia_aprobada = 1 and
    (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))
    LIMIT $request->pageIndex , $request->pageSize;
     ");

        $count = DB::select("
     select count(sol.id) as total
     from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
     inner join producto p on p.id = sol.id_producto
     inner join distribuidores d on d.id = p.id_distribuidor
     inner join importadores imp on imp.id = p.id_importador
     where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and garantia_aprobada = 1 and
     (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
     AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
     OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
     AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
     AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))
     ");

        $itemsTalleres = DB::select("
        select sol.id as ticket, CONCAT(sol.nombres, ' ', sol.apellidos) as nombre_completo, sol.identificacion, sol.telefono,
    sol.correo, sol.ciudad, sol.fecha_ingreso, sol.descripcion_falla, sol.diagnostico_falla, sol.observacion_diagnostico,
    sol.observacion_respuesta, sol.creado_por, e.nombre as estado_actual, d.nombre as distribuidor
    from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
    inner join producto p on p.id = sol.id_producto
    inner join distribuidores d on d.id = p.id_distribuidor
    inner join importadores imp on imp.id = p.id_importador
    where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and garantia_aprobada = 0 and
    (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))
    LIMIT $request->pageIndex , $request->pageSize;
		");

        $countTalleres = DB::select("
        select count(sol.id) as total
     from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
     inner join producto p on p.id = sol.id_producto
     inner join distribuidores d on d.id = p.id_distribuidor
     inner join importadores imp on imp.id = p.id_importador
     where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and garantia_aprobada = 0 and
     (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
     AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
     OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
     AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
     AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json([
            "registros" => $items,
            "cantidad" => $count,
            "talleres" => $itemsTalleres,
            "talleresCount" => $countTalleres,
        ]);
    }

    //Función que utilizaremos para obtener las ayudas.
    public function api_export_reporte_aprobacion_rechazo_distribuidor_paginator(
        Request $request
    ) {
        $items = DB::select("
        select sol.id as ticket, CONCAT(sol.nombres, ' ', sol.apellidos) as nombre_completo, sol.identificacion, sol.telefono,
        sol.correo, sol.ciudad, sol.fecha_ingreso, sol.descripcion_falla, sol.diagnostico_falla, sol.observacion_diagnostico,
        sol.observacion_respuesta, sol.creado_por, e.nombre as estado_actual, d.nombre as distribuidor
        from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
        inner join producto p on p.id = sol.id_producto
        inner join distribuidores d on d.id = p.id_distribuidor
        inner join importadores imp on imp.id = p.id_importador
        where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and garantia_aprobada = 1 and
        (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
        AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
        OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
        AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
        AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))

     ");

        $count = DB::select("
     select count(sol.id) as total
     from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
     inner join producto p on p.id = sol.id_producto
     inner join distribuidores d on d.id = p.id_distribuidor
     inner join importadores imp on imp.id = p.id_importador
     where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and garantia_aprobada = 1 and
     (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
     AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
     OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
     AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
     AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))
     ");

        $itemsTalleres = DB::select("
		select sol.id as ticket, CONCAT(sol.nombres, ' ', sol.apellidos) as nombre_completo, sol.identificacion, sol.telefono,
    sol.correo, sol.ciudad, sol.fecha_ingreso, sol.descripcion_falla, sol.diagnostico_falla, sol.observacion_diagnostico,
    sol.observacion_respuesta, sol.creado_por, e.nombre as estado_actual, d.nombre as distribuidor
    from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
    inner join producto p on p.id = sol.id_producto
    inner join distribuidores d on d.id = p.id_distribuidor
    inner join importadores imp on imp.id = p.id_importador
    where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and garantia_aprobada = 0 and
    (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
    AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
    OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
    AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
    AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))
		");

        $countTalleres = DB::select("
		select count(sol.id) as total
     from recepcion_solicitud sol inner join estados e on e.id = sol.id_estado_actual
     inner join producto p on p.id = sol.id_producto
     inner join distribuidores d on d.id = p.id_distribuidor
     inner join importadores imp on imp.id = p.id_importador
     where tipo_recepcion = 'Garantía' and es_garantia = 'SI' and garantia_aprobada = 0 and
     (('$request->fecha_inicial' = '') OR (('$request->fecha_inicial' != '')
     AND (LOWER(sol.fecha_ingreso) >= '$request->fecha_inicial'))) AND (('$request->fecha_final' = '')
     OR (('$request->fecha_final' != '') AND (LOWER(sol.fecha_ingreso) <= '$request->fecha_final')))
     AND (('$request->id_importador' = '') OR (('$request->id_importador' != '') AND (LOWER(imp.id) = '$request->id_importador')))
     AND (('$request->id_distribuidor' = '') OR (('$request->id_distribuidor' != '') AND sol.creado_por = 'distribuidor' AND (LOWER(sol.id_creador) = '$request->id_distribuidor')))
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json([
            "registros" => $items,
            "cantidad" => $count,
            "talleres" => $itemsTalleres,
            "talleresCount" => $countTalleres,
        ]);
    }
}
