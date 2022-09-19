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


class UsuariosController extends Controller
{

	protected $user;

    public function __construct(Request $request)
    {
        $token = $request->header('Authorization');

        if($token != '')
            //En caso de que requiera autentifiación la ruta obtenemos el usuario y lo almacenamos en una variable, nosotros no lo utilizaremos.
            $this->user = JWTAuth::parseToken()->authenticate();
    }

	//Función que utilizaremos para actualizar la contraseña del usuario
    public function api_actualizar_password_usuario(Request $request)
    {

		$newPassword = bcrypt($request->password);

		$cards = DB::statement("
		update usuarios set password = '$newPassword' where id = '$request->id'
		");

            return response()->json([
                'resultado' => 'OK',
				'mensaje' => 'datos modificados',
            ], 200);

    }

	//Función que utilizaremos para actualizar el usuario
    public function api_actualizar_usuario(Request $params)
    {

		$cards = DB::statement("
		update usuarios set nombre_completo = UPPER('$params->nombre_completo'), username = UPPER('$params->username'),
		tipo_usuario = '$params->tipo_usuario', estado = '$params->estado', identificacion = '$params->identificacion',
		correo = UPPER('$params->correo'), telefono = '$params->telefono', cargo = UPPER('$params->cargo') where id = '$params->id'
		");

            return response()->json([
                'resultado' => 'OK',
				'mensaje' => 'datos modificados',
            ], 200);

    }

	//Función que utilizaremos para obtener el usuario
    public function api_get_usuario(Request $params)
    {

		$usuario = DB::selectOne("
		SELECT u.id, u.username, u.nombre_completo, u.tipo_usuario, u.tipo_funcionario, u.foto, u.estado, u.fecha_sistema,
		u.identificacion, u.correo, u.telefono, u.cargo, u.jefe_taller, d.nombre as nombre_distribuidor, d.id as id_distribuidor,
		i.nombre as nombre_importador, i.id as id_importador, t.id as id_taller, t.nombre as nombre_taller
		FROM usuarios u left join distribuidores d on d.id = u.id_distribuidor left join importadores i on i.id = u.id_importador
		left join talleres t on t.id = u.id_taller where u.id = '$params->id' LIMIT 1");

        //Devolvemos el token
        return response()->json([
            'usuario' => $usuario
        ]);

    }

	//Función que utilizaremos para registrar el usuario
    public function api_crear_usuario(Request $params)
    {
		$password = bcrypt($params->password);

        $uuid = DB::selectOne("
        SELECT UUID() AS random_num WHERE 'random_num' NOT IN (SELECT uuid FROM usuarios) LIMIT 1
		");

		$cards = DB::insert("
		insert into usuarios(uuid, username, nombre_completo, tipo_usuario, identificacion, correo,
		telefono, cargo, estado, password, id_establecimiento, created_at) values
        ('".$uuid->random_num."', UPPER('$params->username'), UPPER('$params->nombre_completo'), '$params->tipo_usuario',
		'$params->identificacion', UPPER('$params->correo'), '$params->telefono', UPPER('$params->cargo'),
		'$params->estado', '$password', ".base64_decode($params->id_establecimiento).", now())
		");

		$id = DB::getPdo()->lastInsertId();

		$params->id = $id;

            return response()->json([
                'resultado' => $params,
            ], 200);

    }

	//Función que utilizaremos para obtener los datos del usuario y validar si el token a expirado.
    public function api_usuarios(Request $request)
    {
		$items = DB::select("
		select id, uuid, username, password, nombre_completo, tipo_usuario, identificacion, correo,
		telefono, cargo, estado, tipo_usuario from usuarios where id_establecimiento = ".base64_decode($request->id_establecimiento)."
		");

        $count = DB::select("
		select count(id) as total from usuarios where id_establecimiento = ".base64_decode($request->id_establecimiento)."
		");

        //Devolvemos el listado de usuarios si todo va bien.
        return response()->json(['registros' => $items, 'cantidad' => $count]);
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
    public function get_file(Request $params)
    {

		$usuario = DB::selectOne("select imagen from usuarios where id = '$params->id' LIMIT 1");

		$base64Image = base64_encode($usuario->imagen);

		if(!$usuario)
            return response()->json([
				'resultado' => 'ERROR',
                'mensaje' => 'no existe imagen en la base de datos',
            ], 401);

        //Devolvemos los datos del usuario si todo va bien.
        return response()->json(['resultado' => $base64Image]);

    }

	//Función que utilizaremos para guardar la imagen
    public function upload_file(Request $params)
    {

		$json = file_get_contents('php://input');

		$ori_fname=basename($_FILES['file']['name']);
		$ori_ftype=$_FILES['file']['type'];
		$ori_fsize=intval($_FILES['file']['size']);
		$ori_fdata= file_get_contents($_FILES['file']['tmp_name']);
		$image = $_FILES['file']['tmp_name'];
		$imgContent = addslashes(file_get_contents($image));
		$id=$_POST["id"];

		$usuario = DB::statement("update usuarios set foto = '$ori_fname', imagen = '$imgContent' where id = '$id'");

            return response()->json([
				'resultado' => 'OK',
                'mensaje' => $id,
            ], 200);

    }

}
