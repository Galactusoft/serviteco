import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Marca, MarcaImportador } from './marcas';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionMarcasService {
    url: string = `${environment.HOST}/marcas`;
    // Private
    private _marca: BehaviorSubject<Marca | null> = new BehaviorSubject(null);
    private _marcas: BehaviorSubject<Marca[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for marca
     */
    get marca$(): Observable<Marca> {
        return this._marca.asObservable();
    }

    /**
     * Getter for marcas
     */
    get marcas$(): Observable<Marca[]> {
        return this._marcas.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get marcas
     */
    getMarcas(): Observable<Marca[]> {
        return this._httpClient.get<Marca[]>(`${this.url}/api_marcas.php`).pipe(
            tap((marcas) => {
                this._marcas.next(marcas);
            })
        );
    }

    /**
    * Get marcas
    */
    getMarcasPorTipoMarca(tipoMarca: string): Observable<Marca[]> {
        const marca = {
            tipo_marca: tipoMarca
        }
        return this._httpClient.post<Marca[]>(`${this.url}/api_marcas_tipo.php`, JSON.stringify(marca)).pipe(
            tap((marcas) => {
                this._marcas.next(marcas);
            })
        );
    }

    /**
    * Get marcas por importador
    */
     getMarcasPorImportador(idImportador: string): Observable<Marca[]> {
        const importador = {
            id: idImportador
        }
        return this._httpClient.post<Marca[]>(`${this.url}/api_marcas_importador.php`, JSON.stringify(importador)).pipe(
            tap((marcas) => {
                this._marcas.next(marcas);
            })
        );
    }

    /**
    * Get marcas por importador
    */
     getLogoMarcasPorImportador(idImportador: string): Observable<MarcaImportador> {
        const importador = {
            id: idImportador
        }
        return this._httpClient.post<MarcaImportador>(`${this.url}/api_logo_marcas_importador.php`, JSON.stringify(importador));
    }    


    /**
     * Get marcas con logo
     */
     getMarcasLogo(): Observable<Marca[]> {
        return this._httpClient.get<Marca[]>(`${this.url}/api_logo_marcas.php`).pipe(
            tap((marcas) => {
                this._marcas.next(marcas);
            })
        );
    }      

    /**
    * Get marcas
    */
    actualizarPassword(password: string, idMarca: string): Observable<Marca[]> {
        const marca = {
            password: password,
            id: idMarca
        }
        return this._httpClient.post<Marca[]>(`${this.url}/api_actualizacion_password_marca.php`, JSON.stringify(marca)).pipe(
            tap((marcas) => {
                this._marcas.next(marcas);
            })
        );
    }

    /**
    * Get marcas paginator
    */
    getMarcasPaginator(paginator: Paginator): Observable<Marca[]> {
        return this._httpClient.post<Marca[]>(`${this.url}/api_marcas.php`, JSON.stringify(paginator)).pipe(
            tap((marcas) => {
                this._marcas.next(marcas);
            })
        );
    }

    /**
     * Search marcas with given query
     *
     * @param query
     */
    searchMarca(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Marca[]> {
        return this._httpClient.get<Marca[]>(`${this.url}/clientes/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((marcas) => {
                this._marcas.next(marcas);
            })
        );
    }

    /**
     * Get marca by id
     */
    getMarcaById(id: string): Observable<Marca> {
        const user = {
            id: id
        }
        return this._httpClient.post<Marca>(`${this.url}/api_get_marca.php`, JSON.stringify(user)).pipe(
            tap((marca) => {
                this._marca.next(marca);
            })
        );
    }

    /**
     * Create marca
     */
    createMarca(marca: Marca): Observable<Marca> {
        return this.marcas$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Marca>(`${this.url}/api_registro_marca.php`, JSON.stringify(marca)).pipe(
                map((userNew: Marca) => {


                    contacts.push(userNew);

                    // Update the contacts
                    this._marcas.next(contacts);

                    // Return the updated contact
                    return userNew;
                }),
            ))
        );
    }

    /**
     * Update marca
     *
     * @param id
     * @param marca
     */
    updateMarca(id: string, marca: Marca): Observable<Marca> {
        return this.marcas$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Marca>(`${this.url}/api_actualizacion_marca.php`, JSON.stringify(marca)).pipe(
                map((userEdit: Marca) => {


                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = marca;

                    // Update the contacts
                    this._marcas.next(contacts);

                    // Return the updated contact
                    return userEdit;
                }),
                switchMap(userEdit => this.marca$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._marca.next(userEdit);

                        // Return the updated contact
                        return userEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update marca
     *
     * @param id
     * @param marca
     */
    updateMarcaGeneral(id: string, marca: Marca): Observable<Marca> {
        return this._httpClient.post<Marca>(`${this.url}/api_actualizacion_marca_general.php`, JSON.stringify(marca));
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
     * Delete the marca
     *
     * @param id
     */
    deleteMarca(id: string): Observable<boolean> {
        return this.marcas$.pipe(
            take(1),
            switchMap(marcas => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted marca
                    const index = marcas.findIndex(item => item.id === id);

                    // Delete the marca
                    marcas.splice(index, 1);

                    // Update the marcas
                    this._marcas.next(marcas);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
