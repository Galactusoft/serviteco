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


class CategoriaController extends Controller
{

	protected $user;

    public function __construct(Request $request)
    {
        $token = $request->header('Authorization');

        if($token != '')
            //En caso de que requiera autentifiación la ruta obtenemos el usuario y lo almacenamos en una variable, nosotros no lo utilizaremos.
            $this->user = JWTAuth::parseToken()->authenticate();
    }

	//Función que utilizaremos para obtener las categorias y validar si el token a expirado.
    public function api_categorias(Request $request)
    {
        try{
		$items = DB::select("
		select TO_BASE64(id_categoria) as id_categoria, descripcion, estado, fecha_sistema, TO_BASE64(id_establecimiento) as id_establecimiento
        from categoria where id_establecimiento = 1 ORDER BY id_categoria DESC");

        $count = DB::select("
		select count(id_categoria) as total from categoria where id_establecimiento = 1");

        //Devolvemos el listado de categorias si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
        }catch(\Exception $e){
            return response()->json(['rpta' => $e->getMessage()], 404);
        }
    }

    //Función que utilizaremos para registrar una categoria y validar si el token a expirado.
    public function api_crear_categoria(Request $request)
    {
        try {
		    $items = DB::select("
		    insert into categoria (descripcion, estado, id_establecimiento) values ('".$request->descripcion."', ".$request->estado.", '1');
            ");

            //Devolvemos el listado de categorias si todo va bien.
            return response()->json(['rpta' => 'OK'], Response::HTTP_OK);
        } catch(\Exception $e){
            // Con esta linea retorna el error al laravel 
            // /Storage/logs/laravel.log \Log::debug('Test var fails' . $e->getMessage());
            return response()->json(['rpta' => $e->getMessage()], 404);
        }
    }

    //Función que utilizaremos para actualizar una categoria y validar si el token a expirado.
    public function api_actualizar_categoria(Request $request)
    {
        try {
		    $items = DB::select("
		    update categoria set descripcion = '".$request->descripcion."', estado = ".$request->estado." where id_categoria =  ".$request->id_categoria.";
		    ");
            //Devolvemos el listado de categorias si todo va bien.
            return response()->json(['rpta' => 'OK'], Response::HTTP_OK);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR'], 404);
        }
    }

    //Función que utilizaremos para eliminar una categoria y validar si el token a expirado.
    public function api_eliminar_categoria(Request $request)
    {
        try {
		    $items = DB::select("
		    delete from categoria where id_categoria =  ".$request->id_categoria.";
		    ");

            //Devolvemos el listado de categorias si todo va bien.
            return response()->json(['rpta' => 'OK']);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR'], 404);
        }
    }

}
