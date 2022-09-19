import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Importador, ImportadorOrganigrama } from './importadores';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionImportadoresService {
    url: string = `${environment.HOST}/importadores`;
    // Private
    private _importador: BehaviorSubject<Importador | null> = new BehaviorSubject(null);
    private _importadores: BehaviorSubject<Importador[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for importador
     */
    get importador$(): Observable<Importador> {
        return this._importador.asObservable();
    }

    /**
     * Getter for importadores
     */
    get importadores$(): Observable<Importador[]> {

        return this._importadores.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get importadores
     */
    getImportadores(): Observable<Importador[]> {
        return this._httpClient.get<Importador[]>(`${this.url}/api_importadores.php`).pipe(
            tap((importadores) => {
                this._importadores.next(importadores);
            })
        );
    }

    /**
     * Get importadores con logo
     */
    getImportadoresLogo(): Observable<Importador[]> {
        return this._httpClient.get<Importador[]>(`${this.url}/api_importadores_logo.php`).pipe(
            tap((importadores) => {
                this._importadores.next(importadores);
            })
        );
    }

    /**
    * Get importadores con logo
    */
    getImportadorLogo(idEmpresa: string): Observable<Importador> {
        const empresa = {
            id: idEmpresa
        }
        return this._httpClient.post<Importador>(`${this.url}/api_importador_logo.php`, JSON.stringify(empresa)).pipe(
            tap((importador) => {
                this._importador.next(importador);
            })
        );
    }

    /**
    * Get talleres distribuidor autorizado organigrama
    */
    getImportadoresPorDistribuidor(idDistribuidor: string): Observable<ImportadorOrganigrama[]> {
        const distribuidor = {
            id: idDistribuidor
        }
        return this._httpClient.post<ImportadorOrganigrama[]>(`${this.url}/api_importadores_autorizados_distribuidor_organigrama.php`, JSON.stringify(distribuidor));
    }

    /**
    * Get talleres distribuidor autorizado organigrama
    */
     getDistribuidoresPorImportador(idImportador: string): Observable<ImportadorOrganigrama[]> {
        const importador = {
            id: idImportador
        }
        return this._httpClient.post<ImportadorOrganigrama[]>(`${this.url}/api_distribuidores_autorizados_importador_organigrama.php`, JSON.stringify(importador));
    }

    /**
    * Get imnportadoras por taller
    */
    getImportadorasPorTaller(idTaller: string): Observable<Importador[]> {
        const taller = {
            id: idTaller
        }
        return this._httpClient.post<Importador[]>(`${this.url}/api_importadoras_taller.php`, JSON.stringify(taller)).pipe(
            tap((importadores) => {
                this._importadores.next(importadores);
            })
        );
    }

    /**
    * Get importadores paginator
    */
    getImportadoresPaginator(paginator: Paginator): Observable<Importador[]> {
        return this._httpClient.post<Importador[]>(`${this.url}/api_importadores.php`, JSON.stringify(paginator)).pipe(
            tap((importadores) => {
                this._importadores.next(importadores);
            })
        );
    }

    /**
     * Search importadores with given query
     *
     * @param query
     */
    searchImportador(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Importador[]> {
        return this._httpClient.get<Importador[]>(`${this.url}/clientes/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((importadores) => {
                this._importadores.next(importadores);
            })
        );
    }

    /**
     * Get importador by id
     */
    getImportadorById(id: string): Observable<Importador> {
        const user = {
            id: id
        }
        return this._httpClient.post<Importador>(`${this.url}/api_get_importador.php`, JSON.stringify(user)).pipe(
            tap((importador) => {
                this._importador.next(importador);
            })
        );
    }

    /**
     * Create importador
     */
    createImportador(importador: Importador): Observable<Importador> {
        return this.importadores$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Importador>(`${this.url}/api_registro_importador.php`, JSON.stringify(importador)).pipe(
                map((userNew: Importador) => {


                    contacts.push(userNew);

                    // Update the contacts
                    this._importadores.next(contacts);

                    // Return the updated contact
                    return userNew;
                }),
            ))
        );
    }

    /**
     * Update importador
     *
     * @param id
     * @param importador
     */
    updateImportador(id: string, importador: Importador): Observable<Importador> {
        return this.importadores$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Importador>(`${this.url}/api_actualizacion_importador.php`, JSON.stringify(importador)).pipe(
                map((userEdit: Importador) => {


                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = importador;

                    // Update the contacts
                    this._importadores.next(contacts);

                    // Return the updated contact
                    return userEdit;
                }),
                switchMap(userEdit => this.importador$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._importador.next(userEdit);

                        // Return the updated contact
                        return userEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update importador
     *
     * @param id
     * @param importador
     */
    updateImportadorGeneral(id: string, importador: Importador): Observable<Importador> {
        return this._httpClient.post<Importador>(`${this.url}/api_actualizacion_importador_general.php`, JSON.stringify(importador));
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
     * Delete the importador
     *
     * @param id
     */
    deleteImportador(id: string): Observable<boolean> {
        return this.importadores$.pipe(
            take(1),
            switchMap(importadores => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted importador
                    const index = importadores.findIndex(item => item.id === id);

                    // Delete the importador
                    importadores.splice(index, 1);

                    // Update the importadores
                    this._importadores.next(importadores);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
