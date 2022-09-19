import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Repuesto, RepuestoMarca, RepuestoPaginator, RepuestoReferencias } from './repuestos';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionRepuestosService {
    url: string = `${environment.HOST}/repuestos`;
    // Private
    private _repuesto: BehaviorSubject<Repuesto | null> = new BehaviorSubject(null);
    private _repuestos: BehaviorSubject<Repuesto[] | null> = new BehaviorSubject(null);
    private _repuestoPaginator: BehaviorSubject<RepuestoPaginator | null> = new BehaviorSubject(null);
    private _marcas: BehaviorSubject<RepuestoMarca | null> = new BehaviorSubject(null);
    private _referencias: BehaviorSubject<RepuestoReferencias | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for repuesto
     */
    get repuesto$(): Observable<Repuesto> {
        return this._repuesto.asObservable();
    }

    /**
     * Getter for repuestos
     */
    get repuestos$(): Observable<Repuesto[]> {
        return this._repuestos.asObservable();
    }

    /**
     * Getter for repuestoPaginator
     */
    get repuestoPaginator$(): Observable<RepuestoPaginator> {
        return this._repuestoPaginator.asObservable();
    }

    /**
     * Getter for marcas
     */
    get marcas$(): Observable<RepuestoMarca> {
        return this._marcas.asObservable();
    }

    /**
     * Getter for referencias
     */
     get referencias$(): Observable<RepuestoReferencias> {
        return this._referencias.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get repuestos
     */
    getRepuestos(): Observable<Repuesto[]> {
        return this._httpClient.get<Repuesto[]>(`${this.url}/api_repuestos.php`).pipe(
            tap((repuesto) => {
                this._repuestos.next(repuesto);
            })
        );
    }

    /**
     * Get repuestos
     */
     getRepuestosExport(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${this.url}/api_repuestos_export.php`);
    }


    /**
     * Get referencias por tipo
     */
     getRepuestosMarcas(): Observable<RepuestoMarca> {
        return this._httpClient.get<RepuestoMarca>(`${this.url}/api_repuestos_marcas.php`).pipe(
            tap((marcas) => {
                this._marcas.next(marcas);
            })
        );
    }


    /**
     * Get referencias por tipo
     */
     getRepuestosReferencias(idMarca: string): Observable<RepuestoReferencias> {
        const marca = {
            id: idMarca
        }
        return this._httpClient.post<RepuestoReferencias>(`${this.url}/api_repuestos_referencias.php`, JSON.stringify(marca)).pipe(
            tap((referencias) => {
                this._referencias.next(referencias);
            })
        );
    }


    /**
    * Get repuestos paginator
    */
    getRepuestoPaginator(paginator: Paginator): Observable<RepuestoPaginator> {
        return this._httpClient.post<RepuestoPaginator>(`${this.url}/api_repuestos.php`, JSON.stringify(paginator)).pipe(
            tap((repuestoPaginator) => {
                this._repuestoPaginator.next(repuestoPaginator);
            })
        );
    }

    /**
    * Get repuestos paginator avanzado
    */
    getRepuestoPaginatorAvanzado(paginator: Paginator): Observable<RepuestoPaginator> {
        return this._httpClient.post<RepuestoPaginator>(`${this.url}/api_repuestos_avanzado.php`, JSON.stringify(paginator)).pipe(
            tap((repuestoPaginator) => {
                this._repuestoPaginator.next(repuestoPaginator);
            })
        );
    }

    /**
     * Search repuestos with given query
     *
     * @param query
     */
    searchRepuesto(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Repuesto[]> {
        const paginator = {
            page: p,
            size: s,
            sortBy: sortBy,
            sort: sort
        }
        return this._httpClient.post<Repuesto[]>(`${this.url}/api_repuestos.php`, JSON.stringify(paginator)).pipe(
            tap((repuestos) => {
                this._repuestos.next(repuestos);
            })
        );
    }

    /**
     * Get repuesto by id
     */
    getRepuestoById(id: string): Observable<Repuesto> {
        const user = {
            id: id
        }
        return this._httpClient.post<Repuesto>(`${this.url}/api_get_repuesto.php`, JSON.stringify(user)).pipe(
            tap((repuesto) => {
                this._repuesto.next(repuesto);
            })
        );
    }

    /**
     * createRepuesto
     */
    createRepuesto(repuesto: Repuesto): Observable<Repuesto> {
        return this.repuestoPaginator$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Repuesto>(`${this.url}/api_registro_repuesto.php`, JSON.stringify(repuesto)).pipe(
                map((repuestoNew: Repuesto) => {

                    contacts?.registros.push(repuestoNew);

                    //repuestoNew.nombre = '';
                    //repuestoNew.descripcion = '';
                    //repuestoNew.estado = '';


                    // Update the contacts
                    this._repuestoPaginator.next(contacts);

                    // Return the updated contact
                    return repuestoNew;
                }),
            ))
        );
    }

    /**
     * Update Repuesto
     *
     * @param id
     * @param repuesto
     */
    updateRepuesto(id: string, repuesto: Repuesto): Observable<Repuesto> {
        return this.repuestoPaginator$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Repuesto>(`${this.url}/api_actualizacion_repuesto.php`, JSON.stringify(repuesto)).pipe(
                map((repuestoEdit: Repuesto) => {


                    // Find the index of the updated contact
                    const index = contacts.registros.findIndex(item => item.id === id);

                    // Update the contact
                    contacts.registros[index] = repuesto;


                    // Update the contacts
                    this._repuestoPaginator.next(contacts);

                    // Return the updated contact
                    return repuestoEdit;
                }),
                switchMap(repuestoEdit => this.repuesto$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._repuesto.next(repuestoEdit);

                        // Return the updated contact
                        return repuestoEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update repuesto
     *
     * @param id
     * @param repuesto
     */
    updateRepuestoGeneral(id: string, repuesto: Repuesto): Observable<Repuesto> {
        return this._httpClient.post<Repuesto>(`${this.url}/api_actualizacion_repuesto_general.php`, JSON.stringify(repuesto));
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
     * Delete the repuesto
     *
     * @param id
     */
    deleteRepuesto(id: string): Observable<any> {
        const repuesto = {
            id: id
        }
        return this.repuestoPaginator$.pipe(
            take(1),
            switchMap(repuestos => this._httpClient.post(`${this.url}/api_delete_repuestos.php`, JSON.stringify(repuesto)).pipe(
                map((request: any) => {

                    if (request['resultado'] == 'OK') {
                        // Find the index of the deleted repuestos
                        const index = repuestos.registros.findIndex(item => item.id === id);

                        // Delete the repuestos
                        repuestos.registros.splice(index, 1);

                        // Update the repuestos
                        this._repuestos.next(repuestos.registros);



                        // Return the deleted status
                        return request;
                    } else {
                        return request;
                    }
                })
            ))
        );
    }

}
