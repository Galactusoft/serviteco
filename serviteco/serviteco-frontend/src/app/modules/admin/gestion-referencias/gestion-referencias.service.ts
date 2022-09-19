import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Referencia, ReferenciasImportador, ReferenciasMarca, ReferenciasPaginator } from './referencias';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionReferenciasService {
    url: string = `${environment.HOST}/referencias`;
    // Private
    private _referencia: BehaviorSubject<Referencia | null> = new BehaviorSubject(null);
    private _referencias: BehaviorSubject<Referencia[] | null> = new BehaviorSubject(null);
    private _referenciasPaginator: BehaviorSubject<ReferenciasPaginator | null> = new BehaviorSubject(null);
    private _importadores: BehaviorSubject<ReferenciasImportador | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for referencia
     */
    get referencia$(): Observable<Referencia> {
        return this._referencia.asObservable();
    }

    /**
     * Getter for referencias
     */
    get referencias$(): Observable<Referencia[]> {
        return this._referencias.asObservable();
    }

    /**
     * Getter for referenciasPaginator
     */
    get referenciasPaginator$(): Observable<ReferenciasPaginator> {
        return this._referenciasPaginator.asObservable();
    }

    /**
     * Getter for importadores
     */
    get importadores$(): Observable<ReferenciasImportador> {
        return this._importadores.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get referencias
     */
    getReferencias(): Observable<Referencia[]> {
        return this._httpClient.get<Referencia[]>(`${this.url}/api_referencias.php`).pipe(
            tap((referencia) => {
                this._referencias.next(referencia);
            })
        );
    }

    /**
     * Get referencias
     */
    getReferenciasExport(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${this.url}/api_referencias_export.php`);
    }


    /**
    * Get productos paginator
    */
    getReferenciasPaginator(paginator: Paginator): Observable<ReferenciasPaginator> {

        return this._httpClient.post<ReferenciasPaginator>(`${this.url}/api_referencias_paginator.php`, JSON.stringify(paginator)).pipe(
            tap((referenciasPaginator) => {
                this._referenciasPaginator.next(referenciasPaginator);
            })
        );
    }

    /**
     * Get referencias por tipo
     */
    getReferenciasPorTipo(id: string): Observable<Referencia[]> {
        const tipoProducto = {
            idTipoProducto: id
        }
        return this._httpClient.post<Referencia[]>(`${this.url}/api_referencias_tipo.php`, JSON.stringify(tipoProducto)).pipe(
            tap((referencia) => {
                this._referencias.next(referencia);
            })
        );
    }


    /**
     * Get referencias por tipo
     */
    getReferenciasPorTipoImportador(idTipo: string, idImportador: string, idMarca: string): Observable<Referencia[]> {
        const tipoProducto = {
            idTipoProducto: idTipo,
            idImportador: idImportador,
            idMarca: idMarca
        }
        return this._httpClient.post<Referencia[]>(`${this.url}/api_referencias_tipo_importador.php`, JSON.stringify(tipoProducto)).pipe(
            tap((referencia) => {
                this._referencias.next(referencia);
            })
        );
    }

    /**
     * Get referencias por tipo
     */
    getReferenciasImportadores(): Observable<ReferenciasImportador> {
        return this._httpClient.get<ReferenciasImportador>(`${this.url}/api_referencias_importadores.php`).pipe(
            tap((importador) => {
                this._importadores.next(importador);
            })
        );
    }


    /**
    * Get referencias paginator
    */
    getReferenciaPaginator(paginator: Paginator): Observable<Referencia[]> {
        return this._httpClient.post<Referencia[]>(`${this.url}/api_referencia.php`, JSON.stringify(paginator)).pipe(
            tap((referencias) => {
                this._referencias.next(referencias);
            })
        );
    }

    /**
     * Search referencias with given query
     *
     * @param query
     */
    searchReferencia(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Referencia[]> {
        return this._httpClient.get<Referencia[]>(`${this.url}/referencias/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((referencias) => {
                this._referencias.next(referencias);
            })
        );
    }

    /**
     * Get referencia by id
     */
    getReferenciaById(id: string): Observable<Referencia> {
        const user = {
            id: id
        }
        return this._httpClient.post<Referencia>(`${this.url}/api_get_referencia.php`, JSON.stringify(user)).pipe(
            tap((referencia) => {
                this._referencia.next(referencia);
            })
        );
    }


    /**
    * Get referencias por marca
    */
    getLogoReferenciasPorMarca(idMarca: string): Observable<ReferenciasMarca> {
        const marca = {
            id: idMarca
        }
        return this._httpClient.post<ReferenciasMarca>(`${this.url}/api_logo_referencias_marca.php`, JSON.stringify(marca));
    }


    /**
    * Get referencias por marca
    */
     getLogoReferenciasPorMarcaCategoria(idMarca: string, idCategoria: string): Observable<ReferenciasMarca> {
        const marca = {
            id: idMarca,
            idCategoria: idCategoria
        }
        return this._httpClient.post<ReferenciasMarca>(`${this.url}/api_logo_referencias_marca_categoria.php`, JSON.stringify(marca));
    }

    /**
     * createreferencia
     */
    createReferencia(referencia: Referencia): Observable<Referencia> {
        return this.referenciasPaginator$.pipe(
            take(1),
            switchMap(referencias => this._httpClient.post<Referencia>(`${this.url}/api_registro_referencia.php`, JSON.stringify(referencia)).pipe(
                map((referenciaNew: Referencia) => {

                    referencias?.registros.push(referenciaNew);

                    // Update the referencia
                    this._referenciasPaginator.next(referencias);

                    // Return the updated referencia
                    return referenciaNew;
                }),
            ))
        );
    }

    /**
     * Update referencia
     *
     * @param id
     * @param referencia
     */
    updateReferencia(id: string, referencia: Referencia): Observable<Referencia> {
        return this.referenciasPaginator$.pipe(
            take(1),
            switchMap(referencias => this._httpClient.post<Referencia>(`${this.url}/api_actualizacion_referencia.php`, JSON.stringify(referencia)).pipe(
                map((referenciaEdit: Referencia) => {


                    // Find the index of the updated referencia
                    const index = referencias.registros.findIndex(item => item.id === id);

                    // Update the referencia
                    referencias.registros[index] = referencia;

                    // Update the referencias
                    this._referenciasPaginator.next(referencias);

                    // Return the updated referencia
                    return referenciaEdit;
                }),
                switchMap(referenciaEdit => this.referencia$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the referencia if it's selected
                        this._referencia.next(referenciaEdit);

                        // Return the updated referencia
                        return referenciaEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update referencia
     *
     * @param id
     * @param referencia
     */
    updateReferenciaGeneral(id: string, referencia: Referencia): Observable<Referencia> {
        return this._httpClient.post<Referencia>(`${this.url}/api_actualizacion_referencia_general.php`, JSON.stringify(referencia));
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
     * Delete the referencia
     *
     * @param id
     */
    deleteReferencia(id: string): Observable<any> {
        const referencia = {
            id: id
        }
        return this.referenciasPaginator$.pipe(
            take(1),
            switchMap(referencias => this._httpClient.post(`${this.url}/api_delete_referencias.php`, JSON.stringify(referencia)).pipe(
                map((request: any) => {

                    if (request['resultado'] == 'OK') {
                        // Find the index of the deleted referencia
                        const index = referencias.registros.findIndex(item => item.id === id);

                        // Delete the referencia
                        referencias.registros.splice(index, 1);

                        // Update the referencias
                        this._referencias.next(referencias.registros);



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
