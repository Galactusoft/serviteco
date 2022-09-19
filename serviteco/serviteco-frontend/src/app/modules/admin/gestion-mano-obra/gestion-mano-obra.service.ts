import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ManoObra } from './mano-obra';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionManoObrasService {
    url: string = `${environment.HOST}/manoObras`;
    // Private
    private _manoObra: BehaviorSubject<ManoObra | null> = new BehaviorSubject(null);
    private _manoObras: BehaviorSubject<ManoObra[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for manoObra
     */
    get manoObra$(): Observable<ManoObra> {
        return this._manoObra.asObservable();
    }

    /**
     * Getter for manoObras
     */
    get manoObras$(): Observable<ManoObra[]> {
        return this._manoObras.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get manoObras
     */
    getManoObras(): Observable<ManoObra[]> {
        return this._httpClient.get<ManoObra[]>(`${this.url}/api_manoObras.php`).pipe(
            tap((manoObras) => {
                this._manoObras.next(manoObras);
            })
        );
    }

    

    /**
    * Get manoObras
    */
    actualizarPassword(password: string, idManoObra: string): Observable<ManoObra[]> {
        const manoObra = {
            password: password,
            id: idManoObra
        }
        return this._httpClient.post<ManoObra[]>(`${this.url}/api_actualizacion_password_manoObra.php`, JSON.stringify(manoObra)).pipe(
            tap((manoObras) => {
                this._manoObras.next(manoObras);
            })
        );
    }

    /**
    * Get manoObras paginator
    */
    getManoObrasPaginator(paginator: Paginator): Observable<ManoObra[]> {
        return this._httpClient.post<ManoObra[]>(`${this.url}/api_manoObras.php`, JSON.stringify(paginator)).pipe(
            tap((manoObras) => {
                this._manoObras.next(manoObras);
            })
        );
    }

    /**
     * Search manoObras with given query
     *
     * @param query
     */
    searchManoObra(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<ManoObra[]> {
        return this._httpClient.get<ManoObra[]>(`${this.url}/clientes/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((manoObras) => {
                this._manoObras.next(manoObras);
            })
        );
    }

    /**
     * Get manoObra by id
     */
    getManoObraById(id: string): Observable<ManoObra> {
        const user = {
            id: id
        }
        return this._httpClient.post<ManoObra>(`${this.url}/api_get_manoObra.php`, JSON.stringify(user)).pipe(
            tap((manoObra) => {
                this._manoObra.next(manoObra);
            })
        );
    }

    /**
     * Create manoobra
     */
    createManoObra(manoObra: ManoObra): Observable<ManoObra> {
        return this.manoObras$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<ManoObra>(`${this.url}/api_registro_manoObra.php`, JSON.stringify(manoObra)).pipe(
                map((userNew: ManoObra) => {


                    contacts.push(userNew);

                    // Update the contacts
                    this._manoObras.next(contacts);

                    // Return the updated contact
                    return userNew;
                }),
            ))
        );
    }

    /**
     * Update manoObra
     *
     * @param id 
     * @param manoObra
     */
    updateManoObra(id: string, manoObra: ManoObra): Observable<ManoObra> {
        return this.manoObras$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<ManoObra>(`${this.url}/api_actualizacion_mano_obra.php`, JSON.stringify(manoObra)).pipe(
                map((userEdit: ManoObra) => {


                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = manoObra;

                    // Update the contacts
                    this._manoObras.next(contacts);

                    // Return the updated contact
                    return userEdit;
                }),
                switchMap(userEdit => this.manoObra$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._manoObra.next(userEdit);

                        // Return the updated contact
                        return userEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update manoObra
     *
     * @param id
     * @param manoObra
     */
    updateManoObraGeneral(id: string, manoObra: ManoObra): Observable<ManoObra> {
        return this._httpClient.post<ManoObra>(`${this.url}/api_actualizacion_manoObra_general.php`, JSON.stringify(manoObra));
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
     * Delete the manoObra
     *
     * @param id
     */
    deleteManoObra(id: string): Observable<boolean> {
        return this.manoObras$.pipe(
            take(1),
            switchMap(manoObras => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted manoObra
                    const index = manoObras.findIndex(item => item.id === id);

                    // Delete the manoObra
                    manoObras.splice(index, 1);

                    // Update the manoObras
                    this._manoObras.next(manoObras);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
