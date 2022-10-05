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

    reporteCuentasPagarImportador(busqueda: any): Observable<any> {
        return this._httpClient.post(`${this.urlLaravel}/api_export_reporte_cuentas_pagar_importador`, busqueda)
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
    * Get data paginator cuentas por pagar importador
    */
    getCuentasPorPagarImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_cuentas_pagar_importador_paginator`, paginator).pipe(
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


    /**
    * Get data paginator productos activos importador
    */
    getReferenciasMasGarantiasPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_referencia_solicita_garantia_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data export productos activos por importador
    */
    getExportReferenciasMasGarantiasPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_referencia_solicita_garantia_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data paginator usuarios activos importador
    */
    getRepuestosSolicitadosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_repuestos_solicitados_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export referencias activas por importador
       */
    getExportRepuestosSolicitadosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_repuestos_solicitados_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data paginator usuarios activos importador
    */
    getManoObraCostosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_mano_obra_costos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export referencias activas por importador
       */
    getExportManoObraCostosImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_mano_obra_costos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data paginator  adquisición de equipos importador
    */
    getAdquisicionEquiposImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_adquisicion_equipos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export adquisición de equipos por importador
       */
    getExportAdquisicionEquiposImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_adquisicion_equipos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data paginator  adquisición de equipos importador
    */
    getColocacionMercadoImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_colocacion_mercado_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export adquisición de equipos por importador
       */
    getExportColocacionMercadoImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_colocacion_mercado_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data paginator seriales en bodega del importador
    */
    getSerialesBodegaImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_seriales_bodega_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export seriales en bodega del importador
       */
    getExportSerialesBodegaImportadorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_seriales_bodega_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data reporte grafico referencia mas vendida
    */
    getDataReporteGraficoReferenciasVendidas(idImportador): Observable<any> {
        const importador = {
            id_importador: idImportador
        }
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_grafico_referencias_mas_vendidas`, importador).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data reporte grafico garantias solicitadas por distribuidores de importador
    */
     getDataReporteGraficoGarantiasSolicitadasImportador(idImportador): Observable<any> {
        const importador = {
            id_importador: idImportador
        }
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_grafico_garantias_solicitadas_importador`, importador).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data reporte grafico garantias solicitadas por distribuidores de importador
    */
     getDataReporteGraficoInfoGeneralImportador(idImportador): Observable<any> {
        const importador = {
            id_importador: idImportador
        }
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_grafico_info_general_importador`, importador).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data reporte grafico costos de mano obra de obra de los talleres autorizados del importador
    */
     getDataReporteGraficoCostosManoObraTallerImportador(idImportador): Observable<any> {
        const importador = {
            id_importador: idImportador
        }
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_grafico_costos_mano_obra_taller_importador`, importador).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

}
