import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { Paginator } from '../paginator';

@Injectable({
    providedIn: 'root'
})
export class GestionReporteService {
    url: string = `${environment.HOST}/reportes`;
    urlLaravel: string = `${environment.HOST_LARAVEL}/reportes`;

    private _productoPaginator: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _dataPaginator: BehaviorSubject<any | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _aut: AuthService) {
    }


    /**
     * Getter for productoPaginator
     */
    get productoPaginator$(): Observable<any> {
        return this._productoPaginator.asObservable();
    }

    /**
     * Getter for productoPaginator
     */
    get dataPaginator$(): Observable<any> {
        return this._dataPaginator.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    reporteCuentasCobrarImportador(busqueda: any): Observable<any> {
        return this._httpClient.post(`${this.url}/api_reporte_cuentas_cobrar_importador.php`, JSON.stringify(busqueda))
    }

    reporteProductosCreados(busqueda: any): Observable<any> {
        return this._httpClient.post(`${this.url}/api_reporte_productos_creados.php`, JSON.stringify(busqueda))
    }

    /**
    * Get productos paginator
    */
    getProductoPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.url}/api_reporte_productos_creados_paginator.php`, JSON.stringify(paginator)).pipe(
            tap((productoPaginator) => {
                this._productoPaginator.next(productoPaginator);
            })
        );
    }

    /**
    * Get data paginator cuentas por cobrar importador
    */
    getCuentasPorCobrarImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.url}/api_reporte_cuentas_cobrar_importador_paginator.php`, JSON.stringify(paginator)).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data paginator distribuidores y talleres activos por cobrar importador
    */
    getDistribuidoresTalleresActivosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_distribuidores_talleres_activos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data export distribuidores y talleres activos por cobrar importador
    */
    getExportDistribuidoresTalleresActivosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_distribuidores_talleres_activos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    getReferenciasActivasImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_referencias_activas_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data paginator solicitud garantias importador
    */
    getSolicitudGarantiasImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_solicitud_garantias_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

        /**
    * Get data export solicitud garantias por importador
    */
         getExportSolicitudGarantiasImportadorPaginator(paginator: Paginator): Observable<any> {
            return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_solicitud_garantias_paginator`, paginator).pipe(
                tap((dataPaginator) => {
                    this._dataPaginator.next(dataPaginator);
                })
            );
        }
    

        /**
    * Get data paginator repuestos activos importador
    */
         getRepuestosActivosImportadorPaginator(paginator: Paginator): Observable<any> {
            return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_repuestos_activos_paginator`, paginator).pipe(
                tap((dataPaginator) => {
                    this._dataPaginator.next(dataPaginator);
                })
            );
        }
    

        
    /**
    * Get data export referencias activas por importador
    */
    getExportReferenciasActivasImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_referencias_activas_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }
        /**
    * Get data export solicitudGarantias activas por importador
    */
         getExportRepuestosActivosImportadorPaginator(paginator: Paginator): Observable<any> {
            return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_repuestos_activos_paginator`, paginator).pipe(
                tap((dataPaginator) => {
                    this._dataPaginator.next(dataPaginator);
                })
            );
        }
    
        
    /**
    * Get data paginator usuarios activos importador
    */
     getUsuariosActivosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_usuarios_activos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    
 /**
    * Get data export referencias activas por importador
    */
  getExportUsuariosActivosImportadorPaginator(paginator: Paginator): Observable<any> {
    return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_usuarios_activos_paginator`, paginator).pipe(
        tap((dataPaginator) => {
            this._dataPaginator.next(dataPaginator);
        })
    );
}

    

    /**
    * Get data paginator productos activos importador
    */
     getProductosActivosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_productos_activos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data export productos activos por importador
    */
    getExportProductosActivosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_productos_activos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

}
