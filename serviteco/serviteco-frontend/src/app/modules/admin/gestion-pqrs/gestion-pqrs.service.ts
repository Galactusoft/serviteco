import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Pqrs, PqrsPaginator } from './pqrs';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { TipoIdentificacion } from './tipo-identificacion';
import { TipoSolicitud } from './tipo-solicitud';
import { Evidencias } from '../gestion-solicitudes/recepcion-solicitud';

@Injectable({
    providedIn: 'root'
})
export class GestionPqrsService {
    url: string = `${environment.HOST}/pqrs`;
    // Private
    private _pqrs: BehaviorSubject<Pqrs | null> = new BehaviorSubject(null);
    private _pqrss: BehaviorSubject<Pqrs[] | null> = new BehaviorSubject(null);
    private _tiposIdentificacion: BehaviorSubject<TipoIdentificacion[] | null> = new BehaviorSubject(null);
    private _tiposSolicitud: BehaviorSubject<TipoSolicitud[] | null> = new BehaviorSubject(null);
    private _pqrsPaginator: BehaviorSubject<PqrsPaginator | null> = new BehaviorSubject(null);
    private _seriales: BehaviorSubject<String[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _aut: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for pqrs
     */
    get pqrs$(): Observable<Pqrs> {
        return this._pqrs.asObservable();
    }

    /**
     * Getter for pqrss
     */
    get pqrss$(): Observable<Pqrs[]> {
        return this._pqrss.asObservable();
    }

    /**
     * Getter for pqrsPaginator
     */
    get pqrsPaginator$(): Observable<PqrsPaginator> {
        return this._pqrsPaginator.asObservable();
    }

    /**
     * Getter for tiposIdentificacion
     */
     get tiposIdentificacion$(): Observable<TipoIdentificacion[]> {
        return this._tiposIdentificacion.asObservable();
    } 
    
    /**
     * Getter for tiposSolicitud
     */
     get tiposSolicitud$(): Observable<TipoIdentificacion[]> {
        return this._tiposSolicitud.asObservable();
    }    
    
    /**
     * Getter for seriales
     */
     get seriales$(): Observable<String[]> {
        return this._seriales.asObservable();
    }     

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get pqrss
     */
    getpqrss(): Observable<Pqrs[]> {
        const data = {
            tipo: 'administrador',
        }
        return this._httpClient.post<Pqrs[]>(`${this.url}/api_pqrs.php`, JSON.stringify(data)).pipe(
            tap((pqrs) => {
                this._pqrss.next(pqrs);
            })
        );
    }

    /**
     * Get tipos identificacion
     */
     getTiposIdentificacion(): Observable<TipoIdentificacion[]> {
        return this._httpClient.get<TipoIdentificacion[]>(`${this.url}/api_tipos_identificacion.php`).pipe(
            tap((tipoIdentificacion) => {
                this._tiposIdentificacion.next(tipoIdentificacion);
            })
        );
    }
    
    /**
     * Get tipos identificacion
     */
     getSeriales(identificacion: string): Observable<String[]> {
        const data = {
            identificacion: identificacion,
        }
        return this._httpClient.post<String[]>(`${this.url}/api_seriales.php`, JSON.stringify(data)).pipe(
            tap((seriales) => {
                this._seriales.next(seriales);
            })
        );
    }    
    
    /**
     * Get tipos solicitud
     */
     getTiposSolicitud(): Observable<TipoSolicitud[]> {
        return this._httpClient.get<TipoSolicitud[]>(`${this.url}/api_tipos_solicitud.php`).pipe(
            tap((tipoSolicitud) => {
                this._tiposSolicitud.next(tipoSolicitud);
            })
        );
    }      

    /**
    * Get pqrss paginator
    */
    getPqrsPaginator(paginator: Paginator): Observable<PqrsPaginator> {
            return this._httpClient.post<PqrsPaginator>(`${this.url}/api_pqrs.php`, JSON.stringify(paginator)).pipe(
                tap((pqrsPaginator) => {
                    this._pqrsPaginator.next(pqrsPaginator);
                })
            );
    }

    /**
     * Search pqrss with given query
     *
     * @param query
     */
    searchPqrs(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Pqrs[]> {
        return this._httpClient.get<Pqrs[]>(`${this.url}/pqrss/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((pqrss) => {
                this._pqrss.next(pqrss);
            })
        );
    }

    /**
     * Get pqrs by id
     */
    getPqrsById(id: string): Observable<Pqrs> {
        const user = {
            id: id
        }
        return this._httpClient.post<Pqrs>(`${this.url}/api_get_pqrs.php`, JSON.stringify(user)).pipe(
            tap((pqrs) => {
                this._pqrs.next(pqrs);
            })
        );
    }

    /**
     * createpqrs
     */
    createPqrs(pqrs: Pqrs): Observable<Pqrs> {
        return this.pqrsPaginator$.pipe(
            take(1),
            switchMap(pqrss => this._httpClient.post<Pqrs>(`${this.url}/api_registro_pqrs.php`, JSON.stringify(pqrs)).pipe(
                map((pqrsNew: Pqrs) => {

                    pqrss.registros.push(pqrsNew);

                    // Update the pqrs
                    this._pqrsPaginator.next(pqrss);

                    // Return the updated pqrs
                    return pqrsNew;
                }),
            ))
        );
    }

    /**
     * Update pqrs
     *
     * @param id
     * @param pqrs
     */
    updatePqrs(id: string, pqrs: Pqrs): Observable<Pqrs> {
        return this.pqrsPaginator$.pipe(
            take(1),
            switchMap(pqrss => this._httpClient.post<Pqrs>(`${this.url}/api_actualizacion_pqrs.php`, JSON.stringify(pqrs)).pipe(
                map((pqrsEdit: Pqrs) => {


                    pqrs.id = pqrsEdit.id;
                    // Find the index of the updated pqrs
                    const index = pqrss.registros.findIndex(item => item.id === id);

                    // Update the pqrs
                    pqrss.registros[index] = pqrs;

                    // Update the pqrss
                    this._pqrsPaginator.next(pqrss);

                    // Return the updated pqrs
                    return pqrs;
                }),
                switchMap(pqrsEdit => this.pqrs$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the pqrs if it's selected
                        this._pqrs.next(pqrsEdit);

                        // Return the updated pqrs
                        return pqrsEdit;
                    })
                ))
            ))
        );
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

    getFile(id: string): Observable<Evidencias[]> {
        const pago = {
            id: id
        }
        return this._httpClient.post<Evidencias[]>(`${this.url}/get-file.php`, JSON.stringify(pago))
    }

    deleteFile(id: number): Observable<any> {
        const pago = {
            id: id
        }
        return this._httpClient.post(`${this.url}/delete-file.php`, JSON.stringify(pago))
    }

    /**
     * Delete the pqrs
     *
     * @param id
     */
    deletePqrs(id: string): Observable<boolean> {
        return this.pqrss$.pipe(
            take(1),
            switchMap(pqrss => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted pqrs
                    const index = pqrss.findIndex(item => item.id === id);

                    // Delete the pqrs
                    pqrss.splice(index, 1);

                    // Update the pqrss
                    this._pqrss.next(pqrss);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
