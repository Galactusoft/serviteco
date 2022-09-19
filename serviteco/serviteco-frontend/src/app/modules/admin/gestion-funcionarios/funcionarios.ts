
export class Funcionario {
    id: string;
    nombre_completo: string;
    identificacion: string;
    correo: string;
    cargo: string;
    estado:string;


    /**
     * Constructor
     *
     * @param funcionario
     */
    constructor(funcionario?) {
        {
            this.id = funcionario?.id || null;
        }
    }
}