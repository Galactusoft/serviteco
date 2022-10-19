export class UsuarioFinal {
    id: string;
    nombres: string;
    apellidos: string;
    identificacion: string;
    correo: string;
    telefono: string;
    direccion: string;
    ubicacion: string;
    latitud: string;
    longitud: string;

    /**
     * Constructor
     *
     * @param usuarioFinal
     */
    constructor(usuarioFinal?) {
        {
            this.id = usuarioFinal?.id || null;
        }
    }
}
