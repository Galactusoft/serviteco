import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Distribuidor, DistribuidorOrganigrama } from './distribuidores';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionDistribuidoresService {
    url: string = `${environment.HOST}/distribuidores`;
    // Private
    private _distribuidor: BehaviorSubject<Distribuidor | null> = new BehaviorSubject(null);
    private _distribuidores: BehaviorSubject<Distribuidor[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for distribuidor
     */
    get distribuidor$(): Observable<Distribuidor> {
        return this._distribuidor.asObservable();
    }

    /**
     * Getter for distribuidores
     */
    get distribuidores$(): Observable<Distribuidor[]> {
        return this._distribuidores.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get distribuidores
     */
    getDistribuidores(): Observable<Distribuidor[]> {
        return this._httpClient.get<Distribuidor[]>(`${this.url}/api_distribuidores.php`).pipe(
            tap((distribuidores) => {
                this._distribuidores.next(distribuidores);
            })
        );
    }

    /**
    * Get distribuidores
    */
    getDistribuidoresPorTipoDistribuidor(tipoDistribuidor: string): Observable<Distribuidor[]> {
        const distribuidor = {
            tipo_distribuidor: tipoDistribuidor
        }
        return this._httpClient.post<Distribuidor[]>(`${this.url}/api_distribuidores_tipo.php`, JSON.stringify(distribuidor)).pipe(
            tap((distribuidores) => {
                this._distribuidores.next(distribuidores);
            })
        );
    }


    /**
    * Get marcas por importador
    */
     getDistribuidoresPorImportador(idImportador: string): Observable<Distribuidor[]> {
        const importador = {
            id: idImportador
        }
        return this._httpClient.post<Distribuidor[]>(`${this.url}/api_distribuidores_importador.php`, JSON.stringify(importador)).pipe(
            tap((distribuidores) => {
                this._distribuidores.next(distribuidores);
            })
        );
    }   
    
    /**
    * Get marcas por importador
    */
     getDistribuidoresConImportador(): Observable<DistribuidorOrganigrama[]> {
        return this._httpClient.get<DistribuidorOrganigrama[]>(`${this.url}/api_distribuidores_importadores_organigrama.php`);
    }          

    /**
    * Get distribuidores
    */
    actualizarPassword(password: string, idDistribuidor: string): Observable<Distribuidor[]> {
        const distribuidor = {
            password: password,
            id: idDistribuidor
        }
        return this._httpClient.post<Distribuidor[]>(`${this.url}/api_actualizacion_password_distribuidor.php`, JSON.stringify(distribuidor)).pipe(
            tap((distribuidores) => {
                this._distribuidores.next(distribuidores);
            })
        );
    }

    /**
    * Get distribuidores paginator
    */
    getDistribuidoresPaginator(paginator: Paginator): Observable<Distribuidor[]> {
        return this._httpClient.post<Distribuidor[]>(`${this.url}/api_distribuidores.php`, JSON.stringify(paginator)).pipe(
            tap((distribuidores) => {
                this._distribuidores.next(distribuidores);
            })
        );
    }

    /**
     * Search distribuidores with given query
     *
     * @param query
     */
    searchDistribuidor(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Distribuidor[]> {
        return this._httpClient.get<Distribuidor[]>(`${this.url}/clientes/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((distribuidores) => {
                this._distribuidores.next(distribuidores);
            })
        );
    }

    /**
     * Get distribuidor by id
     */
    getDistribuidorById(id: string): Observable<Distribuidor> {
        const user = {
            id: id
        }
        return this._httpClient.post<Distribuidor>(`${this.url}/api_get_distribuidor.php`, JSON.stringify(user)).pipe(
            tap((distribuidor) => {
                this._distribuidor.next(distribuidor);
            })
        );
    }

    /**
     * Create distribuidor
     */
    createDistribuidor(distribuidor: Distribuidor): Observable<Distribuidor> {
        return this.distribuidores$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Distribuidor>(`${this.url}/api_registro_distribuidor.php`, JSON.stringify(distribuidor)).pipe(
                map((userNew: Distribuidor) => {


                    contacts.push(userNew);

                    // Update the contacts
                    this._distribuidores.next(contacts);

                    // Return the updated contact
                    return userNew;
                }),
            ))
        );
    }

    /**
     * Update distribuidor
     *
     * @param id
     * @param distribuidor
     */
    updateDistribuidor(id: string, distribuidor: Distribuidor): Observable<Distribuidor> {
        return this.distribuidores$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Distribuidor>(`${this.url}/api_actualizacion_distribuidor.php`, JSON.stringify(distribuidor)).pipe(
                map((userEdit: Distribuidor) => {


                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = distribuidor;

                    // Update the contacts
                    this._distribuidores.next(contacts);

                    // Return the updated contact
                    return userEdit;
                }),
                switchMap(userEdit => this.distribuidor$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._distribuidor.next(userEdit);

                        // Return the updated contact
                        return userEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update distribuidor
     *
     * @param id
     * @param distribuidor
     */
    updateDistribuidorGeneral(id: string, distribuidor: Distribuidor): Observable<Distribuidor> {
        return this._httpClient.post<Distribuidor>(`${this.url}/api_actualizacion_distribuidor_general.php`, JSON.stringify(distribuidor));
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
     * Delete the distribuidor
     *
     * @param id
     */
    deleteDistribuidor(id: string): Observable<boolean> {
        return this.distribuidores$.pipe(
            take(1),
            switchMap(distribuidores => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted distribuidor
                    const index = distribuidores.findIndex(item => item.id === id);

                    // Delete the distribuidor
                    distribuidores.splice(index, 1);

                    // Update the distribuidores
                    this._distribuidores.next(distribuidores);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
