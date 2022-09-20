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

}
