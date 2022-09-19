import { Importador } from "../gestion-importadores/importadores";
import { Usuario } from "../gestion-usuarios/usuarios";

export class Producto {
    id: string;
    serial: string;
    nombre: string;
    descripcion: string;
    id_marca: string;
    nombre_marca: string;
    id_importador: string;
    nombre_importador: string;
    id_tipo_producto: string;
    nombre_tipo_producto: string;
    id_referencia: string;
    nombre_referencia: string;
    id_distribuidor: string;
    nombre_distribuidor: string;
    estado: string;
    mensaje: string;
    nombres_propietario: string;
    apellidos_propietario: string;
    fecha_venta: string;
    numero_factura: string;
    garantia_meses: string;
    usuario: string;
    creado_por: string;
    id_creador: string;
    nombre_creador: string;
    fecha_venta_usuario: string;
    numero_factura_usuario: string;
    latitud: string;
    longitud: string;

    /**
     * Constructor
     *
     * @param producto
     */
    constructor(producto?) {
        {
            this.id = producto?.id || null;
        }
    }
}

export class ProductoPaginator {
    registros: Producto[];
    cantidad: number;
}

export class ProductoImportador {
    registros: Importador[];
    cantidad: number;
}

export class ProductoUsuario {
    id: string;
    id_producto: Producto;
    id_usuario: Usuario;
    usuario: Usuario;
    fecha_sistema: string;

    /**
     * Constructor
     *
     * @param productoUsuario
     */
    constructor(productoUsuario?) {
        {
            this.id = productoUsuario?.id || null;
        }
    }
}

export class ProductoPropietario {
    id: string;
    serial: string;
    nombre: string;
    descripcion: string;
    id_marca: string;
    nombre_marca: string;
    id_importador: string;
    nombre_importador: string;
    id_tipo_producto: string;
    nombre_tipo_producto: string;
    id_referencia: string;
    nombre_referencia: string;
    id_distribuidor: string;
    nombre_distribuidor: string;
    estado: string;
    mensaje: string;
    nombres_propietario: string;
    apellidos_propietario: string;
    identificacion_propietario: string;
    telefono_propietario: string;
    correo_propietario: string;
    direccion_propietario: string;
    fecha_venta: string;
    numero_factura: string;
    fecha_venta_usuario: string;
    numero_factura_usuario: string;
    usuario: string;
    creado_por: string;
    id_creador: string;
    nombre_creador: string;
    correo_importador: string;

    /**
     * Constructor
     *
     * @param producto
     */
    constructor(producto?) {
        {
            this.id = producto?.id || null;
        }
    }
}

export class ProductoUbicacion {
    id: string;
    latitud: string;
    longitud: string;
    referencia: string;
    nombres: string;
    apellidos: string;
    direccion: string;
    telefono: string;
    codigo_postal: string;
}
