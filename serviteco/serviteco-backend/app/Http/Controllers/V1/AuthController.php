<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use JWTAuth;
use App\Models\User;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;


class AuthController extends Controller
{
    //Función que utilizaremos para registrar al usuario
    public function register(Request $request)
    {
        //Indicamos que solo queremos recibir name, email y password de la request
        $data = $request->only('name', 'email', 'password');

        //Realizamos las validaciones
        $validator = Validator::make($data, [
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|max:50',
        ]);

        //Devolvemos un error si fallan las validaciones
        if ($validator->fails()) {
            return response()->json(['error' => $validator->messages()], 400);
        }

        //Creamos el nuevo usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password)
        ]);

        //Nos guardamos el usuario y la contraseña para realizar la petición de token a JWTAuth
        $credentials = $request->only('email', 'password');

        //Devolvemos la respuesta con el token del usuario
        return response()->json([
            'message' => 'User created',
            'token' => JWTAuth::attempt($credentials),
            'user' => $user
        ], Response::HTTP_OK);
    }

	//Función que utilizaremos para registrar al usuario
    public function registrarUsuario(Request $request)
    {
        //Indicamos que solo queremos recibir name, email y password de la request
        $data = $request->only('username', 'correo', 'password');

        //Realizamos las validaciones
        $validator = Validator::make($data, [
            'username' => 'required|string',
            'correo' => 'required|email|unique:usuarios',
            'password' => 'required|string|min:6|max:50',
        ]);

        //Devolvemos un error si fallan las validaciones
        if ($validator->fails()) {
            return response()->json(['error' => $validator->messages()], 400);
        }

        //Creamos el nuevo usuario
        $usuario = Usuarios::create([
            'username' => $request->username,
            'correo' => $request->correo,
            'password' => bcrypt($request->password)
        ]);

        //Nos guardamos el usuario y la contraseña para realizar la petición de token a JWTAuth
        $credentials = $request->only('username', 'password');

        //Devolvemos la respuesta con el token del usuario
        return response()->json([
            'message' => 'Usuario creado con exito',
            'token' => JWTAuth::attempt($credentials),
            'usuario' => $usuario
        ], Response::HTTP_OK);
    }

    //Funcion que utilizaremos para hacer login
    public function authenticate(Request $request)
    {
        //Indicamos que solo queremos recibir email y password de la request
        $credentials = $request->only('email', 'password');

        //Validaciones
        $validator = Validator::make($credentials, [
            'email' => 'required|email',
            'password' => 'required|string|min:6|max:50'
        ]);

        //Devolvemos un error de validación en caso de fallo en las verificaciones
        if ($validator->fails()) {
            return response()->json(['error' => $validator->messages()], 400);
        }

        //Intentamos hacer login
        try {
            if (!$token = JWTAuth::attempt($credentials)) {

                //Credenciales incorrectas.
                return response()->json([
                    'message' => 'Login failed',
                ], 401);

            }
        } catch (JWTException $e) {

            //Error chungo
            return response()->json([
                'message' => 'Error',
            ], 500);

        }

        //Devolvemos el token
        return response()->json([
            'token' => $token,
            'user' => Auth::user()
        ]);
    }

	//Funcion que utilizaremos para hacer el inicio de sesion
    public function iniciarSesion(Request $request)
    {
        //Indicamos que solo queremos recibir username y password de la request
        $credentials = $request->only('username', 'password');

        //Validaciones
        $validator = Validator::make($credentials, [
            'username' => 'required',
            'password' => 'required'
        ]);

        //Devolvemos un error de validación en caso de fallo en las verificaciones
        if ($validator->fails()) {
            return response()->json(['error' => $validator->messages()], 400);
        }

        //Intentamos hacer login
        try {
            if (!$token = JWTAuth::attempt($credentials)) {

                //Credenciales incorrectas.
                return response()->json([
                    'message' => 'Inicio de sesión incorrecto',
                ], 404);

            }
        } catch (JWTException $e) {

            //Error chungo
            return response()->json([
                'message' => 'Error',
            ], 500);

        }

		$usuario = DB::selectOne("
		select 'OK' as resultado, id, correo, id_establecimiento from usuarios where username = '$request->username' LIMIT 1");

        //Devolvemos el token
        return response()->json([
            'token' => $token,
            'es' => base64_encode($usuario->id_establecimiento),
            'us' => base64_encode($usuario->id)
        ]);
    }

    //Función que utilizaremos para eliminar el token y desconectar al usuario
    public function logout(Request $request)
    {
        //Validamos que se nos envie el token
        $validator = Validator::make($request->only('token'), [
            'token' => 'required'
        ]);

        //Si falla la validación
        if ($validator->fails()) {
            return response()->json(['error' => $validator->messages()], 400);
        }


        try {
            //Si el token es valido eliminamos el token desconectando al usuario.
            JWTAuth::invalidate($request->token);

            return response()->json([
                'success' => true,
                'message' => 'User disconnected'
            ]);

        } catch (JWTException $exception) {

            //Error chungo

            return response()->json([
                'success' => false,
                'message' => 'Error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);

        }
    }

    //Función que utilizaremos para obtener los datos del usuario y validar si el token a expirado.
    public function getUser(Request $request)
    {
        //Validamos que la request tenga el token
        $this->validate($request, [
            'token' => 'required'
        ]);

        //Realizamos la autentificación
        $user = JWTAuth::authenticate($request->token);

        //Si no hay usuario es que el token no es valido o que ha expirado
        if(!$user)
            return response()->json([
                'message' => 'Invalid token / token expired',
            ], 401);

        //Devolvemos los datos del usuario si todo va bien.
        return response()->json(['user' => $user]);
    }

	//Función que utilizaremos para obtener los datos del usuario y validar si el token a expirado.
    public function getNativo(Request $request)
    {
        //Validamos que la request tenga el token
        $this->validate($request, [
            'token' => 'required'
        ]);

        //Realizamos la autentificación
        $user = JWTAuth::authenticate($request->token);

		$cards = DB::select("SELECT id from usuarios where id = 1");

		$sql = 'SELECT id from usuarios where id = 1 ';
		DB::statement($sql);

        //Si no hay usuario es que el token no es valido o que ha expirado
        if(!$user)
            return response()->json([
                'message' => 'Invalid token / token expired',
            ], 401);

        //Devolvemos los datos del usuario si todo va bien.
        return response()->json(['user' => $cards]);
    }

    public function api_validar_token($token, Request $request)
    {
        $tokenDb = DB::selectOne("
             SELECT token from establecimiento where id_establecimiento = (select id_establecimiento from mesa where uuid = '".$request->uuid."') LIMIT 1
		    ");

		if($token != $tokenDb->token)
            return response()->json([
				'resultado' => 'ERROR',
                'mensaje' => 'Token invalido',
            ], 404);

        //Si hay producto lo devolvemos
        return response()->json(['resultado' => 'OK']);
    }

    public function api_get_token($uuid)
    {

        $uuid = DB::selectOne("
             SELECT token from establecimiento where id_establecimiento = (select id_establecimiento from mesa where uuid = '".$uuid."') LIMIT 1
		    ");

		if(!$uuid)
            return response()->json([
				'resultado' => 'ERROR',
                'mensaje' => 'El establecimiento no tiene token registrado',
            ], 404);

        //Si hay producto lo devolvemos
        return response()->json(['resultado' => $uuid->token]);
    }
}
