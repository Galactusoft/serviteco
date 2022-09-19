import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Producto, ProductoImportador, ProductoPaginator, ProductoPropietario, ProductoUbicacion } from './productos';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { UsuarioFinal } from '../gestion-usuario-final/usuario-final';
import { Importador } from '../gestion-importadores/importadores';

@Injectable({
    providedIn: 'root'
})
export class GestionProductosService {
    url: string = `${environment.HOST}/productos`;
    // Private
    private _producto: BehaviorSubject<Producto | null> = new BehaviorSubject(null);
    private _productos: BehaviorSubject<Producto[] | null> = new BehaviorSubject(null);
    private _productoPaginator: BehaviorSubject<ProductoPaginator | null> = new BehaviorSubject(null);
    private _productoPaginatorAvanzado: BehaviorSubject<ProductoPaginator | null> = new BehaviorSubject(null);
    private _productosUbicacion: BehaviorSubject<ProductoUbicacion[] | null> = new BehaviorSubject(null);
    private _importadores: BehaviorSubject<ProductoImportador | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _aut: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for producto
     */
    get producto$(): Observable<Producto> {
        return this._producto.asObservable();
    }

    /**
     * Getter for productos
     */
    get productos$(): Observable<Producto[]> {
        return this._productos.asObservable();
    }

    /**
     * Getter for productoPaginator
     */
    get productoPaginator$(): Observable<ProductoPaginator> {
        return this._productoPaginator.asObservable();
    }

    /**
     * Getter for productoPaginator
     */
    get productoPaginatorAvanzado$(): Observable<ProductoPaginator> {
        return this._productoPaginatorAvanzado.asObservable();
    }

    /**
     * Getter for importadores
     */
     get importadores$(): Observable<ProductoImportador> {
        return this._importadores.asObservable();
    }

    /**
     * Getter for productosUbicacion
     */
     get productosUbicacion$(): Observable<ProductoUbicacion[]> {
        return this._productosUbicacion.asObservable();
    }    

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get productos
     */
    getProductos(): Observable<Producto[]> {
        if (this._aut.accessAdmin == 'administrador') {
            const data = {
                tipo: 'administrador',
            }
            return this._httpClient.post<Producto[]>(`${this.url}/api_productos.php`, JSON.stringify(data)).pipe(
                tap((producto) => {
                    this._productos.next(producto);
                })
            );
        } else {
            if (this._aut.accessDistribuidor != '0') {
                const data = {
                    tipo: 'distribuidor',
                    id: localStorage.getItem('accessDistribuidor')
                }
                return this._httpClient.post<Producto[]>(`${this.url}/api_productos.php`, JSON.stringify(data)).pipe(
                    tap((producto) => {
                        this._productos.next(producto);
                    })
                );
            } else if (this._aut.accessImportador != '0') {
                const data = {
                    tipo: 'importador',
                    id: localStorage.getItem('accessImportador')
                }
                return this._httpClient.post<Producto[]>(`${this.url}/api_productos.php`, JSON.stringify(data)).pipe(
                    tap((producto) => {
                        this._productos.next(producto);
                    })
                );
            }

        }
    }

    /**
     * Get productos
     */
     getImportadores(): Observable<ProductoImportador> {
        if (this._aut.accessAdmin == 'administrador') {
            const data = {
                tipo: 'administrador',
            }
            return this._httpClient.post<ProductoImportador>(`${this.url}/api_productos_importadores.php`, JSON.stringify(data)).pipe(
                tap((importadores) => {
                    this._importadores.next(importadores);
                })
            );
        } else {
            if (this._aut.accessDistribuidor != '0') {
                const data = {
                    tipo: 'distribuidor',
                    id: localStorage.getItem('accessDistribuidor')
                }
                return this._httpClient.post<ProductoImportador>(`${this.url}/api_productos_importadores.php`, JSON.stringify(data)).pipe(
                    tap((importadores) => {
                        this._importadores.next(importadores);
                    })
                );
            } else if (this._aut.accessImportador != '0') {
                const data = {
                    tipo: 'importador',
                    id: localStorage.getItem('accessImportador')
                }
                return this._httpClient.post<ProductoImportador>(`${this.url}/api_productos_importadores.php`, JSON.stringify(data)).pipe(
                    tap((importadores) => {
                        this._importadores.next(importadores);
                    })
                );
            } else if (this._aut.accessTaller != '0') {
                const data = {
                    tipo: 'taller autorizado',
                    id: localStorage.getItem('accessTaller')
                }
                return this._httpClient.post<ProductoImportador>(`${this.url}/api_productos_importadores.php`, JSON.stringify(data)).pipe(
                    tap((importadores) => {
                        this._importadores.next(importadores);
                    })
                );
            }

        }
    }    

    /**
    * Get productos paginator
    */
    getProductoPaginator(paginator: Paginator): Observable<ProductoPaginator> {
        if (this._aut.accessAdmin == 'administrador') {
            paginator.tipo = 'administrador';
            return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos.php`, JSON.stringify(paginator)).pipe(
                tap((productoPaginator) => {
                    this._productoPaginator.next(productoPaginator);
                })
            );
        } else {
            if (this._aut.accessDistribuidor != '0') {
                paginator.tipo = 'distribuidor';
                paginator.id = localStorage.getItem('accessDistribuidor');
                return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos.php`, JSON.stringify(paginator)).pipe(
                    tap((productoPaginator) => {
                        this._productoPaginator.next(productoPaginator);
                    })
                );
            } else if (this._aut.accessImportador != '0') {
                paginator.tipo = 'importador';
                paginator.id = localStorage.getItem('accessImportador');
                return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos.php`, JSON.stringify(paginator)).pipe(
                    tap((productoPaginator) => {
                        this._productoPaginator.next(productoPaginator);
                    })
                );
            } else if (this._aut.accessTaller != '0') {
                paginator.tipo = 'taller autorizado';
                paginator.id = localStorage.getItem('accessTaller');
                return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos.php`, JSON.stringify(paginator)).pipe(
                    tap((productoPaginator) => {
                        this._productoPaginator.next(productoPaginator);
                    })
                );
            }

        }
    }

    /**
    * Get productos paginator avanzado
    */
    getProductoPaginatorAvanzado(paginator: Paginator): Observable<ProductoPaginator> {

        if (this._aut.accessAdmin == 'administrador') {
            paginator.tipo = 'administrador';
            return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos_avanzado.php`, JSON.stringify(paginator)).pipe(
                tap((productoPaginator) => {
                    this._productoPaginatorAvanzado.next(productoPaginator);
                })
            );
        } else if (this._aut.accessDistribuidor != '0' && this._aut.accessDistribuidor.length > 0) {
            paginator.tipo = 'distribuidor';
            paginator.id = localStorage.getItem('accessDistribuidor');
            return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos_avanzado.php`, JSON.stringify(paginator)).pipe(
                tap((productoPaginator) => {
                    this._productoPaginatorAvanzado.next(productoPaginator);
                })
            );
        } else if (this._aut.accessImportador != '0' && this._aut.accessImportador.length > 0) {
            paginator.tipo = 'importador';
            paginator.id = localStorage.getItem('accessImportador');
            return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos_avanzado.php`, JSON.stringify(paginator)).pipe(
                tap((productoPaginator) => {
                    this._productoPaginatorAvanzado.next(productoPaginator);
                })
            );
        } else if (this._aut.accessTaller != '0' && this._aut.accessTaller.length > 0) {
            paginator.tipo = 'taller autorizado';
            paginator.id = localStorage.getItem('accessTaller');
            return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos_avanzado.php`, JSON.stringify(paginator)).pipe(
                tap((productoPaginator) => {
                    this._productoPaginatorAvanzado.next(productoPaginator);
                })
            );
        } else if (this._aut.accessAdmin == 'administrador' || this._aut.accessJefe == 'SI') {
            paginator.tipo = 'administrador';
            return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos_avanzado.php`, JSON.stringify(paginator)).pipe(
                tap((productoPaginator) => {
                    this._productoPaginatorAvanzado.next(productoPaginator);
                })
            );
        } else {
            paginator.tipo = 'usuario_final';
            return this._httpClient.post<ProductoPaginator>(`${this.url}/api_productos_avanzado.php`, JSON.stringify(paginator)).pipe(
                tap((productoPaginator) => {
                    this._productoPaginatorAvanzado.next(productoPaginator);
                })
            );
        }


    }

    /**
     * Search productos with given query
     *
     * @param query
     */
    searchProducto(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Producto[]> {
        return this._httpClient.get<Producto[]>(`${this.url}/productos/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((productos) => {
                this._productos.next(productos);
            })
        );
    }

    /**
     * Get producto by id
     */
    getProductoById(id: string): Observable<Producto> {
        const user = {
            id: id
        }
        return this._httpClient.post<Producto>(`${this.url}/api_get_producto.php`, JSON.stringify(user)).pipe(
            tap((producto) => {
                this._producto.next(producto);
            })
        );
    }

    /**
     * Get producto by id
     */
    getProductoByIdParaSolicitud(id: string): Observable<ProductoPropietario> {
        const user = {
            id: id
        }
        return this._httpClient.post<ProductoPropietario>(`${this.url}/api_get_producto_solicitud.php`, JSON.stringify(user));
    }

    /**
     * Get producto by id
     */
    getTransferenciaPropiedadById(id: string): Observable<UsuarioFinal[]> {
        const producto = {
            id: id
        }
        return this._httpClient.post<UsuarioFinal[]>(`${this.url}/api_productos_usuario.php`, JSON.stringify(producto));
    }


    /**
    * Get productos por importador
    */
     getUbicacionProductosPorImportador(idImportador: string): Observable<ProductoUbicacion[]> {
        const importador = {
            id: idImportador
        }
        return this._httpClient.post<ProductoUbicacion[]>(`${this.url}/api_producto_ubicacion_importador.php`, JSON.stringify(importador)).pipe(
            tap((distribuidores) => {
                this._productosUbicacion.next(distribuidores);
            })
        );
    }  

    /**
    * Get productos por distribuidor
    */
     getUbicacionProductosPorDistribuidor(idDistribuidor: string): Observable<ProductoUbicacion[]> {
        const distribuidor = {
            id: idDistribuidor
        }
        return this._httpClient.post<ProductoUbicacion[]>(`${this.url}/api_producto_ubicacion_distribuidor.php`, JSON.stringify(distribuidor)).pipe(
            tap((distribuidores) => {
                this._productosUbicacion.next(distribuidores);
            })
        );
    }      
    
    /**
    * Get productos por importador
    */
     getUbicacionProductos(): Observable<ProductoUbicacion[]> {
        return this._httpClient.get<ProductoUbicacion[]>(`${this.url}/api_producto_ubicacion_admin.php`).pipe(
            tap((distribuidores) => {
                this._productosUbicacion.next(distribuidores);
            })
        );
    }      

    /**
     * createProducto
     */
    createProducto(producto: Producto): Observable<Producto> {
        return this.productoPaginator$.pipe(
            take(1),
            switchMap(productos => this._httpClient.post<Producto>(`${this.url}/api_registro_producto.php`, JSON.stringify(producto)).pipe(
                map((productoNew: Producto) => {

                    productos?.registros.push(productoNew);

                    productoNew.nombre = '';
                    productoNew.descripcion = '';
                    productoNew.estado = '';

                    // Update the producto
                    this._productoPaginator.next(productos);

                    // Return the updated producto
                    return productoNew;
                }),
            ))
        );
    }

    createProductoMasivo(producto: Producto): Observable<Producto> {
        return this._httpClient.post<Producto>(`${this.url}/api_registro_producto.php`, JSON.stringify(producto));
    }

    /**
        * Crear transferencia Prducto
        */
    updateTransfProducto(producto: Producto): Observable<Producto> {
        return this.productos$.pipe(
            take(1),
            switchMap(productos => this._httpClient.post<Producto>(`${this.url}/api_registro_producto.php`, JSON.stringify(producto)).pipe(
                map((productoNew: Producto) => {

                    productoNew.nombre = '';
                    productoNew.descripcion = '';
                    productoNew.estado = '';

                    productos.push(productoNew);

                    // Update the producto
                    this._productos.next(productos);

                    // Return the updated producto
                    return productoNew;
                }),
            ))
        );
    }
    /**
     * Update producto
     *
     * @param id
     * @param producto
     */
    updateProducto(id: string, producto: Producto): Observable<Producto> {
        return this.productoPaginator$.pipe(
            take(1),
            switchMap(productos => this._httpClient.post<Producto>(`${this.url}/api_actualizacion_producto.php`, JSON.stringify(producto)).pipe(
                map((productoEdit: Producto) => {

                    return producto;
                })
            ))
        );
    }

    /**
     * Update producto
     *
     * @param id
     * @param producto
     */
    updateProductoGeneral(id: string, producto: Producto): Observable<Producto> {
        return this._httpClient.post<Producto>(`${this.url}/api_actualizacion_producto_general.php`, JSON.stringify(producto));
    }

    /**
     * Update pago
     *
     * @param id
     * @param pago
     */
    loadFile(file_data: any): Observable<any> {
        return this._httpClient.post(`${this.url}/upload-file.php`, file_data);
    }

    getFile(id: string): Observable<string> {
        const pago = {
            id: id
        }
        return this._httpClient.post(`${this.url}/get-file.php`, JSON.stringify(pago), { responseType: 'text' })
    }

    /**
     * Delete the producto
     *
     * @param id
     */
    deleteProducto(id: string): Observable<boolean> {
        return this.productos$.pipe(
            take(1),
            switchMap(productos => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted producto
                    const index = productos.findIndex(item => item.id === id);

                    // Delete the producto
                    productos.splice(index, 1);

                    // Update the productos
                    this._productos.next(productos);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
