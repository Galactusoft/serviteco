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


class SeccionController extends Controller
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
    public function api_secciones(Request $request)
    {
		$items = DB::select("
		select TO_BASE64(id_seccion) as id_seccion, descripcion, estado, fecha_sistema, TO_BASE64(id_establecimiento) as id_establecimiento
        from seccion where id_establecimiento = ".base64_decode($request->id_establecimiento)." ORDER BY id_seccion DESC LIMIT $request->pageIndex , $request->pageSize;
		");

        $count = DB::select("
		select count(id_seccion) as total from seccion where id_establecimiento = ".base64_decode($request->id_establecimiento)."
		");

        //Devolvemos el listado de secciones si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

	//Función que utilizaremos para obtener las secciones y validar si el token a expirado.
    public function api_secciones_catalogo(Request $request)
    {
		$items = DB::select("
		select TO_BASE64(id_seccion) as id_seccion, descripcion
        from seccion where id_establecimiento = ".base64_decode($request->id_establecimiento)." and estado = 1 ORDER BY id_seccion DESC;
		");

        //Devolvemos el listado de secciones si todo va bien.
        return response()->json(['registros' => $items]);
    }

    //Función que utilizaremos para registrar una seccion y validar si el token a expirado.
    public function api_crear_seccion(Request $request)
    {
        try {
		    $items = DB::select("
		    insert into seccion (descripcion, estado, id_establecimiento) values ('".$request->descripcion."', ".$request->estado.", ".base64_decode($request->id_establecimiento).");
		    ");

            //Devolvemos el listado de secciones si todo va bien.
            return response()->json(['rpta' => 'OK'], Response::HTTP_OK);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR'], 404);
        }
    }

    //Función que utilizaremos para actualizar una seccion y validar si el token a expirado.
    public function api_actualizar_seccion(Request $request)
    {
        try {
		    $items = DB::select("
		    update seccion set descripcion = '".$request->descripcion."', estado = ".$request->estado." where id_seccion =  ".base64_decode($request->id_seccion).";
		    ");
            //Devolvemos el listado de secciones si todo va bien.
            return response()->json(['rpta' => 'OK'], Response::HTTP_OK);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR'], 404);
        }
    }

    //Función que utilizaremos para eliminar una seccion y validar si el token a expirado.
    public function api_eliminar_seccion(Request $request)
    {
        try {
		    $items = DB::select("
		    delete from seccion where id_seccion = ".base64_decode($request->id_seccion).";
		    ");

            //Devolvemos el listado de secciones si todo va bien.
            return response()->json(['rpta' => 'OK']);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR '.$ex], 404);
        }
    }

}
