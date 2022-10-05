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

class AyudaController extends Controller
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
    public function api_ayudas(Request $request)
    {
		$items = DB::select("
		select a.id, a.uuid, a.id_usuario, u.nombre_completo as nombre_usuario, a.estado_actual, a.estado, a.fecha_sistema from mesa_ayuda a
        inner join usuarios u on a.id_usuario = u.id WHERE (('$request->id' = '') OR (('$request->id' != '') AND (a.id_usuario = '$request->id'))) order by a.id desc LIMIT $request->pageIndex , $request->pageSize
		");

        $count = DB::select("
		select count(a.id) as total from mesa_ayuda a
        inner join usuarios u on a.id_usuario = u.id WHERE (('$request->id' = '') OR (('$request->id' != '') AND (a.id_usuario = '$request->id'))) LIMIT $request->pageIndex , $request->pageSize
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
    }

	//Función que utilizaremos para obtener la ayuda
    public function api_get_ayuda(Request $params)
    {

		$ayuda = DB::selectOne("
		SELECT a.id, a.uuid, a.id_usuario, u.nombre_completo as nombre_usuario, a.estado_actual, a.descripcion, a.respuesta, a.estado, a.fecha_sistema from mesa_ayuda a
        inner join usuarios u on a.id_usuario = u.id where a.id = '$params->id' LIMIT 1");

        //Devolvemos el token
        return response()->json($ayuda);

    }

	//Función que utilizaremos para registrar el usuario
    public function api_registrar_ayuda(Request $params)
    {
		$password = bcrypt($params->password);

        $uuid = DB::selectOne("
        SELECT UUID() AS random_num WHERE 'random_num' NOT IN (SELECT uuid FROM mesa_ayuda) LIMIT 1
		");

		$insert = DB::insert("
		insert into mesa_ayuda(uuid, id_usuario, estado_actual, descripcion, estado) values
        ('".$uuid->random_num."', ".$params->id_usuario.", '".$params->estado_actual."', '".$params->descripcion."', '1')
		");

		$id = DB::getPdo()->lastInsertId();

        $estado = DB::insert("
		insert into mesa_ayuda_estados(id_mesa_ayuda, id_usuario, usuario_asignado, estado_ayuda, respuesta, estado) values
        (".$id.", ".$params->id_usuario.", 'admin_mesa_ayuda', 'Creado', 'pendiente asignar', '1')
		");

		$params->id = $id;

            return response()->json([
                'resultado' => 'OK', 'id' => $id
            ], 200);

    }

	//Función que utilizaremos para actualizar la ayuda
    public function api_actualizar_ayuda(Request $params)
    {

		$cards = DB::statement("
		update mesa_ayuda set descripcion = '$params->descripcion' where id = '$params->id'
		");

            return response()->json([
                'resultado' => 'OK',
				'mensaje' => 'datos modificados',
            ], 200);

    }

    //Función que utilizaremos para eliminar un usuario y validar si el token a expirado.
    public function api_eliminar_usuario(Request $request)
    {
        try {
		    $items = DB::select("
		    delete from usuarios where id = ".$request->id.";
		    ");

            //Devolvemos el listado de secciones si todo va bien.
            return response()->json(['rpta' => 'OK']);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR '.$ex], 404);
        }
    }

	//Función que utilizaremos para validar el username
    public function api_validar_username(Request $params)
    {

		$usuario = DB::selectOne("select id from usuarios where username = '$params->username' LIMIT 1");

		if($usuario)
            return response()->json([
				'resultado' => 'ERROR',
                'mensaje' => 'Ya existe username registrado en la base de datos',
            ], 404);

        //Devolvemos los datos del usuario si todo va bien.
        return response()->json(['resultado' => 'OK']);

    }

	//Función que utilizaremos para obtener la imagen
    public function api_get_file(Request $params)
    {

		$evidencias = DB::select("select id, foto, TO_BASE64(imagen) as imagen from mesa_ayuda_evidencias where id_mesa_ayuda = '$params->id'");

        //Devolvemos los datos del usuario si todo va bien.
        return response()->json($evidencias);

    }

	//Función que utilizaremos para guardar la imagen
    public function api_upload_file(Request $params)
    {

		$json = file_get_contents('php://input');

		$ori_fname=basename($_FILES['file']['name']);
		$ori_ftype=$_FILES['file']['type'];
		$ori_fsize=intval($_FILES['file']['size']);
		$ori_fdata= file_get_contents($_FILES['file']['tmp_name']);
		$image = $_FILES['file']['tmp_name'];
		$imgContent = addslashes(file_get_contents($image));
		$id=$_POST["id"];

		$usuario = DB::statement("insert into mesa_ayuda_evidencias (id_mesa_ayuda, foto, imagen, estado) values ('$id', '$ori_fname', '$imgContent', '1')");

            return response()->json([
				'resultado' => 'OK',
                'mensaje' => $id,
            ], 200);

    }

	//Función que utilizaremos para eliminar evidencias de la ayuda
    public function api_delete_file(Request $request)
    {
        try {
		    $items = DB::select("
		    delete from mesa_ayuda_evidencias where id = ".$request->id.";
		    ");

            //Devolvemos el listado de secciones si todo va bien.
            return response()->json(['rpta' => 'OK']);
        } catch(\Illuminate\Database\QueryException $ex){
            return response()->json(['rpta' => 'ERROR '.$ex], 404);
        }
    }

}
