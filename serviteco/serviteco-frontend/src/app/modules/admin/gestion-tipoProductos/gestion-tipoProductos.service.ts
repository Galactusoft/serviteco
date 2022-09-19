import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { TipoProducto } from './tipoProductos';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionTipoProductosService {
    url: string = `${environment.HOST}/tipoProducto`;
    // Private
    private _tipoProducto: BehaviorSubject<TipoProducto | null> = new BehaviorSubject(null);
    private _tipoProductos: BehaviorSubject<TipoProducto[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for tipo producto
     */
    get tipoProducto$(): Observable<TipoProducto> {
        return this._tipoProducto.asObservable();
    }

    /**
     * Getter for tipo de productos
     */
    get tipoProductos$(): Observable<TipoProducto[]> {
        return this._tipoProductos.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get tipo productos
     */
    getTipoProductos(): Observable<TipoProducto[]> {
        return this._httpClient.get<TipoProducto[]>(`${this.url}/api_tipoProducto.php`).pipe(
            tap((tipoProducto) => {
                this._tipoProductos.next(tipoProducto);
            })
        );
    }

  


    /**
    * Get tipo de productos paginator
    */
    getTipoProductoPaginator(paginator: Paginator): Observable<TipoProducto[]> {
        return this._httpClient.post<TipoProducto[]>(`${this.url}/api_tipoProducto.php`, JSON.stringify(paginator)).pipe(
            tap((tipoProductos) => {
                this._tipoProductos.next(tipoProductos);
            })
        );
    }

    /**
     * Search tipo de productos with given query
     *
     * @param query
     */
    searchTipoProducto(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<TipoProducto[]> {
        return this._httpClient.get<TipoProducto[]>(`${this.url}/tipoProducto/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((tipoProductos) => {
                this._tipoProductos.next(tipoProductos);
            })
        );
    }

    /**
     * Get tipo producto by id
     */
    getTipoProductoById(id: string): Observable<TipoProducto> {
        const user = {
            id: id
        }
        return this._httpClient.post<TipoProducto>(`${this.url}/api_get_tipoProducto.php`, JSON.stringify(user)).pipe(
            tap((tipoProducto) => {
                this._tipoProducto.next(tipoProducto);
            })
        );
    }

    /**
     * createTipoProducto
     */
    createTipoProducto(tipoProducto: TipoProducto): Observable<TipoProducto> {
        return this.tipoProductos$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<TipoProducto>(`${this.url}/api_registro_tipoProducto.php`, JSON.stringify(tipoProducto)).pipe(
                map((tipoProductoNew: TipoProducto) => {

                    contacts.push(tipoProductoNew);

                    // Update the contacts
                    this._tipoProductos.next(contacts);

                    // Return the updated contact
                    return tipoProductoNew;
                }),
            ))
        );
    }

    /**
     * Update TipoProducto
     *
     * @param id
     * @param tipoProducto
     */
    updateTipoProducto(id: string, tipoProducto: TipoProducto): Observable<TipoProducto> {
        return this.tipoProductos$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<TipoProducto>(`${this.url}/api_actualizacion_tipoProducto.php`, JSON.stringify(tipoProducto)).pipe(
                map((tipoProductoEdit: TipoProducto) => {

                
                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = tipoProducto;

                    // Update the contacts
                    this._tipoProductos.next(contacts);

                    // Return the updated contact
                    return tipoProductoEdit;
                }),
                switchMap(tipoProductoEdit => this.tipoProducto$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._tipoProducto.next(tipoProductoEdit);

                        // Return the updated contact
                        return tipoProductoEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update tipo Producto
     *
     * @param id
     * @param tipoProducto
     */
    updateTipoProductoGeneral(id: string, tipoProducto: TipoProducto): Observable<TipoProducto> {
        return this._httpClient.post<TipoProducto>(`${this.url}/api_actualizacion_tipoProducto_general.php`, JSON.stringify(tipoProducto));
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
     * Delete the Tipo Producto
     *
     * @param id
     */
    deleteTipoProducto(id: string): Observable<boolean> {
        return this.tipoProductos$.pipe(
            take(1),
            switchMap(tipoProductos => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted Tipo Prdocuto
                    const index = tipoProductos.findIndex(item => item.id === id);

                    // Delete the tipo producto
                    tipoProductos.splice(index, 1);

                    // Update the tipo producto
                    this._tipoProductos.next(tipoProductos);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
