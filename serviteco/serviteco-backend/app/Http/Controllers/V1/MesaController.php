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


class MesaController extends Controller
{

	protected $user;

    public function __construct(Request $request)
    {
        $token = $request->header('Authorization');

        if($token != '')
            //En caso de que requiera autentifiación la ruta obtenemos el usuario y lo almacenamos en una variable, nosotros no lo utilizaremos.
            $this->user = JWTAuth::parseToken()->authenticate();
    }

	//Función que utilizaremos para obtener las secciones y validar si el token a expirado.
    public function api_mesas(Request $request)
    {
		$items = DB::select("
		select TO_BASE64(m.id_mesa) as id_mesa, m.uuid, m.observacion, TO_BASE64(m.id_seccion) as id_seccion, sec.descripcion, m.estado, m.fecha_sistema, TO_BASE64(m.id_establecimiento) as id_establecimiento
        from mesa m inner join seccion sec on sec.id_seccion = m.id_seccion  where m.id_establecimiento = ".base64_decode($request->id_establecimiento)." ORDER BY m.id_mesa DESC LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		select count(id_mesa) as total from mesa where id_establecimiento = ".base64_decode($request->id_establecimiento)."
		");

        //Devolvemos el listado de mesas si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

    //Función que utilizaremos para registrar una mesa y validar si el token a expirado.
    public function api_crear_mesa(Request $request)
    {
        try {

            $uuid = DB::selectOne("
             SELECT UUID() AS random_num WHERE 'random_num' NOT IN (SELECT uuid FROM mesa) LIMIT 1
		    ");

		    $items = DB::select("
		    insert into mesa (uuid, observacion, id_seccion, estado, id_establecimiento) values ('".$uuid->random_num."', '".$request->observacion."', '".base64_decode($request->id_seccion)."', ".$request->estado.", '".base64_decode($request->id_establecimiento)."');
		    ");

            //Devolvemos el listado de mesas si todo va bien.
            return response()->json(['rpta' => 'OK'], Response::HTTP_OK);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR '.$ex], 404);
        }
    }

    //Función que utilizaremos para actualizar una mesa y validar si el token a expirado.
    public function api_actualizar_mesa(Request $request)
    {
        try {
		    $items = DB::select("
		    update mesa set observacion = '".$request->observacion."', id_seccion = ".base64_decode($request->id_seccion).", estado = ".$request->estado." where id_mesa =  ".base64_decode($request->id_mesa).";
		    ");
            //Devolvemos la respuesta si todo va bien.
            return response()->json(['rpta' => 'OK'], Response::HTTP_OK);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR'], 404);
        }
    }

    //Función que utilizaremos para eliminar una mesa y validar si el token a expirado.
    public function api_eliminar_mesa(Request $request)
    {
        try {
		    $items = DB::select("
		    delete from mesa where id_mesa =  ".base64_decode($request->id_mesa).";
		    ");

            //Devolvemos la respuesta si todo va bien.
            return response()->json(['rpta' => 'OK']);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR'], 404);
        }
    }

	//Función que utilizaremos para validar el uuid de la mesa
    public function api_validar_mesa(Request $params)
    {

		$usuario = DB::selectOne("select id_mesa from mesa where uuid = '$params->uuid' LIMIT 1");

		if(!$usuario)
            return response()->json([
				'resultado' => 'ERROR',
                'mensaje' => 'No existe mesa con uuid enviado',
            ], 404);

        //Devolvemos los datos de la mesa si todo va bien.
        return response()->json(['resultado' => 'OK']);

    }

}
