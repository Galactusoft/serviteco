import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Ayuda, AyudaPaginator } from './ayuda';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { Evidencias } from '../gestion-solicitudes/recepcion-solicitud';

@Injectable({
    providedIn: 'root'
})
export class GestionAyudaService {
    url: string = `${environment.HOST_LARAVEL}/ayuda`;
    // Private
    private _ayuda: BehaviorSubject<Ayuda | null> = new BehaviorSubject(null);
    private _ayudas: BehaviorSubject<Ayuda[] | null> = new BehaviorSubject(null);
    private _ayudaPaginator: BehaviorSubject<AyudaPaginator | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _aut: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for ayuda
     */
    get ayuda$(): Observable<Ayuda> {
        return this._ayuda.asObservable();
    }

    /**
     * Getter for ayudas
     */
    get ayudas$(): Observable<Ayuda[]> {
        return this._ayudas.asObservable();
    }

    /**
     * Getter for ayudaPaginator
     */
    get ayudaPaginator$(): Observable<AyudaPaginator> {
        return this._ayudaPaginator.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get ayudas
     */
    getAyuda(): Observable<Ayuda[]> {
        const data = {
            tipo: 'administrador',
        }
        return this._httpClient.post<Ayuda[]>(`${this.url}/api_get_ayuda`, JSON.stringify(data)).pipe(
            tap((ayuda) => {
                this._ayudas.next(ayuda);
            })
        );
    }

    /**
    * Get ayudas paginator
    */
    getAyudaPaginator(paginator: Paginator): Observable<AyudaPaginator> {
        if (this._aut.accessAdmin != '0') {

        } else {
            paginator.id = this._aut.accessUserId;
        }
        return this._httpClient.post<AyudaPaginator>(`${this.url}/api_ayudas`, paginator).pipe(
            tap((ayudaPaginator) => {
                this._ayudaPaginator.next(ayudaPaginator);
            })
        );
    }

    /**
     * Search ayudas with given query
     *
     * @param query
     */
    searchAyuda(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Ayuda[]> {
        return this._httpClient.get<Ayuda[]>(`${this.url}/ayudas/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((ayudas) => {
                this._ayudas.next(ayudas);
            })
        );
    }

    /**
     * Get ayuda by id
     */
    getAyudaById(id: string): Observable<Ayuda> {
        const user = {
            id: id
        }
        return this._httpClient.post<Ayuda>(`${this.url}/api_get_ayuda`, user).pipe(
            tap((ayuda) => {
                this._ayuda.next(ayuda);
            })
        );
    }

    /**
     * createAyuda
     */
    createAyuda(ayuda: Ayuda): Observable<Ayuda> {
        return this.ayudaPaginator$.pipe(
            take(1),
            switchMap(ayudas => this._httpClient.post<Ayuda>(`${this.url}/api_registrar_ayuda`, ayuda).pipe(
                map((ayudaNew: Ayuda) => {

                    ayudas.registros.push(ayudaNew);

                    // Update the ayuda
                    this._ayudaPaginator.next(ayudas);

                    // Return the updated ayuda
                    return ayudaNew;
                }),
            ))
        );
    }

    /**
     * Update ayuda
     *
     * @param id
     * @param ayuda
     */
    updateAyuda(id: string, ayuda: Ayuda): Observable<Ayuda> {
        return this.ayudaPaginator$.pipe(
            take(1),
            switchMap(ayudas => this._httpClient.post<Ayuda>(`${this.url}/api_actualizar_ayuda`, ayuda).pipe(
                map((ayudaEdit: Ayuda) => {


                    ayuda.id = ayuda.id;
                    // Find the index of the updated ayuda
                    const index = ayudas.registros.findIndex(item => item.id === id);

                    // Update the ayuda
                    ayudas.registros[index] = ayuda;

                    // Update the ayudas
                    this._ayudaPaginator.next(ayudas);

                    // Return the updated ayuda
                    return ayuda;
                }),
                switchMap(ayudaEdit => this.ayuda$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the ayuda if it's selected
                        this._ayuda.next(ayuda);

                        // Return the updated ayuda
                        return ayuda;
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
        return this._httpClient.post(`${this.url}/api_upload_file`, file_data);
    }

    getFile(id: string): Observable<Evidencias[]> {
        const pago = {
            id: id
        }
        return this._httpClient.post<Evidencias[]>(`${this.url}/api_get_file`, pago)
    }

    deleteFile(id: number): Observable<any> {
        const pago = {
            id: id
        }
        return this._httpClient.post(`${this.url}/api_delete_file`, pago)
    }

    /**
     * Delete the Ayuda
     *
     * @param id
     */
    deleteAyuda(id: string): Observable<boolean> {
        return this.ayudas$.pipe(
            take(1),
            switchMap(ayudas => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted ayuda
                    const index = ayudas.findIndex(item => item.id === id);

                    // Delete the ayuda
                    ayudas.splice(index, 1);

                    // Update the ayudas
                    this._ayudas.next(ayudas);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
