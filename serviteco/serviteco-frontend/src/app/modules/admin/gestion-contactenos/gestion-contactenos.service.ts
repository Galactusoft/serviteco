import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Contactenos, ContactenosPaginator } from './contactenos';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { Evidencias } from '../gestion-solicitudes/recepcion-solicitud';
import { TipoIdentificacion } from '../gestion-pqrs/tipo-identificacion';

@Injectable({
    providedIn: 'root'
})
export class GestionContactenosService {
    url: string = `${environment.HOST}/contactenos`;
    // Private
    private _contactenos: BehaviorSubject<Contactenos | null> = new BehaviorSubject(null);
    private _contactenoss: BehaviorSubject<Contactenos[] | null> = new BehaviorSubject(null);
    private _tiposIdentificacion: BehaviorSubject<TipoIdentificacion[] | null> = new BehaviorSubject(null);
    private _contactenosPaginator: BehaviorSubject<ContactenosPaginator | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _aut: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contactenos
     */
    get contactenos$(): Observable<Contactenos> {
        return this._contactenos.asObservable();
    }

    /**
     * Getter for contactenoss
     */
    get contactenoss$(): Observable<Contactenos[]> {
        return this._contactenoss.asObservable();
    }

    /**
     * Getter for contactenosPaginator
     */
    get contactenosPaginator$(): Observable<ContactenosPaginator> {
        return this._contactenosPaginator.asObservable();
    }

    /**
     * Getter for tiposIdentificacion
     */
     get tiposIdentificacion$(): Observable<TipoIdentificacion[]> {
        return this._tiposIdentificacion.asObservable();
    } 
    
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get contactenoss
     */
    getContactenos(): Observable<Contactenos[]> {
        const data = {
            tipo: 'administrador',
        }
        return this._httpClient.post<Contactenos[]>(`${this.url}/api_contactenos.php`, JSON.stringify(data)).pipe(
            tap((contactenos) => {
                this._contactenoss.next(contactenos);
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
    * Get contactenoss paginator
    */
    getContactenosPaginator(paginator: Paginator): Observable<ContactenosPaginator> {
            return this._httpClient.post<ContactenosPaginator>(`${this.url}/api_contactenos.php`, JSON.stringify(paginator)).pipe(
                tap((contactenosPaginator) => {
                    this._contactenosPaginator.next(contactenosPaginator);
                })
            );
    }

    /**
     * Search contactenoss with given query
     *
     * @param query
     */
    searchContactenos(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Contactenos[]> {
        return this._httpClient.get<Contactenos[]>(`${this.url}/contactenoss/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((contactenoss) => {
                this._contactenoss.next(contactenoss);
            })
        );
    }

    /**
     * Get contactenos by id
     */
    getContactenosById(id: string): Observable<Contactenos> {
        const user = {
            id: id
        }
        return this._httpClient.post<Contactenos>(`${this.url}/api_get_contactenos.php`, JSON.stringify(user)).pipe(
            tap((contactenos) => {
                this._contactenos.next(contactenos);
            })
        );
    }

    /**
     * createcontactenos
     */
    createContactenos(contactenos: Contactenos): Observable<Contactenos> {
        return this.contactenosPaginator$.pipe(
            take(1),
            switchMap(contactenoss => this._httpClient.post<Contactenos>(`${this.url}/api_registro_contactenos.php`, JSON.stringify(contactenos)).pipe(
                map((contactenosNew: Contactenos) => {

                    contactenoss.registros.push(contactenosNew);

                    // Update the contactenos
                    this._contactenosPaginator.next(contactenoss);

                    // Return the updated contactenos
                    return contactenosNew;
                }),
            ))
        );
    }

    /**
     * Update contactenos
     *
     * @param id
     * @param contactenos
     */
    updateContactenos(id: string, contactenos: Contactenos): Observable<Contactenos> {
        return this.contactenosPaginator$.pipe(
            take(1),
            switchMap(contactenoss => this._httpClient.post<Contactenos>(`${this.url}/api_actualizacion_contactenos.php`, JSON.stringify(contactenos)).pipe(
                map((contactenosEdit: Contactenos) => {


                    contactenos.id = contactenosEdit.id;
                    // Find the index of the updated contactenos
                    const index = contactenoss.registros.findIndex(item => item.id === id);

                    // Update the contactenos
                    contactenoss.registros[index] = contactenos;

                    // Update the contactenoss
                    this._contactenosPaginator.next(contactenoss);

                    // Return the updated contactenos
                    return contactenos;
                }),
                switchMap(contactenosEdit => this.contactenos$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contactenos if it's selected
                        this._contactenos.next(contactenosEdit);

                        // Return the updated contactenos
                        return contactenosEdit;
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
     * Delete the contactenos
     *
     * @param id
     */
    deleteContactenos(id: string): Observable<boolean> {
        return this.contactenoss$.pipe(
            take(1),
            switchMap(contactenoss => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted contactenos
                    const index = contactenoss.findIndex(item => item.id === id);

                    // Delete the contactenos
                    contactenoss.splice(index, 1);

                    // Update the contactenoss
                    this._contactenoss.next(contactenoss);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
