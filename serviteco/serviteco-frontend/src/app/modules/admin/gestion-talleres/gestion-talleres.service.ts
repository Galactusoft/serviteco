import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Talleres, TalleresOrganigrama } from './talleres';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionTalleresService {
    url: string = `${environment.HOST}/talleres`;
    // Private
    private _taller: BehaviorSubject<Talleres | null> = new BehaviorSubject(null);
    private _talleres: BehaviorSubject<Talleres[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for taller
     */
    get taller$(): Observable<Talleres> {
        return this._taller.asObservable();
    }

    /**
     * Getter for talleres
     */
    get talleres$(): Observable<Talleres[]> {
        return this._talleres.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get talleres
     */
    getTalleres(): Observable<Talleres[]> {
        return this._httpClient.get<Talleres[]>(`${this.url}/api_talleres.php`).pipe(
            tap((talleres) => {
                this._talleres.next(talleres);
            })
        );
    }

    /**
     * Get talleres
     */
     getTalleresImportadorAutorizado(idImportador): Observable<Talleres[]> {
        const importador = {
            id: idImportador
        }
        return this._httpClient.post<Talleres[]>(`${this.url}/api_talleres_importador_autorizado.php`, importador).pipe(
            tap((talleres) => {
                this._talleres.next(talleres);
            })
        );
    }

    /**
     * Get talleres distribudior
     */
     getTalleresAutorizadosDistribuidor(idDistribuidor: string): Observable<Talleres[]> {
        const distribuidor = {
            id: idDistribuidor
        }
        return this._httpClient.post<Talleres[]>(`${this.url}/api_talleres_autorizados_distribuidor.php`, distribuidor).pipe(
            tap((talleres) => {
                this._talleres.next(talleres);
            })
        );
    }
    /**
    * Get talleres
    */
    getTalleresPorTipoTaller(tipoTaller: string): Observable<Talleres[]> {
        const taller = {
            tipo_taller: tipoTaller
        }
        return this._httpClient.post<Talleres[]>(`${this.url}/api_talleres_tipo.php`, JSON.stringify(taller)).pipe(
            tap((talleres) => {
                this._talleres.next(talleres);
            })
        );
    }

    /**
    * Get talleres
    */
    actualizarPassword(password: string, idTaller: string): Observable<Talleres[]> {
        const taller = {
            password: password,
            id: idTaller
        }
        return this._httpClient.post<Talleres[]>(`${this.url}/api_actualizacion_password_taller.php`, JSON.stringify(taller)).pipe(
            tap((talleres) => {
                this._talleres.next(talleres);
            })
        );
    }

    /**
    * Get talleres paginator
    */
    getTalleresPaginator(paginator: Paginator): Observable<Talleres[]> {
        return this._httpClient.post<Talleres[]>(`${this.url}/api_talleres.php`, JSON.stringify(paginator)).pipe(
            tap((talleres) => {
                this._talleres.next(talleres);
            })
        );
    }

    /**
     * Search talleres with given query
     *
     * @param query
     */
    searchTaller(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Talleres[]> {
        return this._httpClient.get<Talleres[]>(`${this.url}/clientes/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((talleres) => {
                this._talleres.next(talleres);
            })
        );
    }

    /**
     * Get taller by id
     */
    getTallerById(id: string): Observable<Talleres> {
        const user = {
            id: id
        }
        return this._httpClient.post<Talleres>(`${this.url}/api_get_taller.php`, JSON.stringify(user)).pipe(
            tap((taller) => {
                this._taller.next(taller);
            })
        );
    }


    /**
    * Get talleres distribuidor autorizado organigrama
    */
     getTalleresConDistribuidor(idDistribuidor: string): Observable<TalleresOrganigrama[]> {
        const distribuidor = {
            id: idDistribuidor
        }
        return this._httpClient.post<TalleresOrganigrama[]>(`${this.url}/api_talleres_autorizados_distribuidor_organigrama.php`, JSON.stringify(distribuidor));
    }

    /**
    * Get talleres importador autorizado organigrama
    */
     getTalleresConImportador(idImportador: string): Observable<TalleresOrganigrama[]> {
        const importador = {
            id: idImportador
        }
        return this._httpClient.post<TalleresOrganigrama[]>(`${this.url}/api_talleres_autorizados_importador_organigrama.php`, JSON.stringify(importador));
    }

    /**
     * Create taller
     */
    createTaller(taller: Talleres): Observable<Talleres> {
        return this.talleres$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Talleres>(`${this.url}/api_registro_taller.php`, JSON.stringify(taller)).pipe(
                map((userNew: Talleres) => {


                    contacts.push(userNew);

                    // Update the contacts
                    this._talleres.next(contacts);

                    // Return the updated contact
                    return userNew;
                }),
            ))
        );
    }

    /**
     * Update taller
     *
     * @param id
     * @param taller
     */
    updateTaller(id: string, taller: Talleres): Observable<Talleres> {
        return this.talleres$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Talleres>(`${this.url}/api_actualizacion_taller.php`, JSON.stringify(taller)).pipe(
                map((userEdit: Talleres) => {


                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = taller;

                    // Update the contacts
                    this._talleres.next(contacts);

                    // Return the updated contact
                    return userEdit;
                }),
                switchMap(userEdit => this.taller$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._taller.next(userEdit);

                        // Return the updated contact
                        return userEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update taller
     *
     * @param id
     * @param taller
     */
    updateTallerGeneral(id: string, taller: Talleres): Observable<Talleres> {
        return this._httpClient.post<Talleres>(`${this.url}/api_actualizacion_taller_general.php`, JSON.stringify(taller));
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
     * Delete the taller
     *
     * @param id
     */
    deleteTaller(id: string): Observable<boolean> {
        return this.talleres$.pipe(
            take(1),
            switchMap(talleres => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted taller
                    const index = talleres.findIndex(item => item.id === id);

                    // Delete the taller
                    talleres.splice(index, 1);

                    // Update the talleres
                    this._talleres.next(talleres);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
