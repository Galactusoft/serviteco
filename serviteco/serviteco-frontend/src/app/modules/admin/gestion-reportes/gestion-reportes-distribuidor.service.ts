import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { Paginator } from '../paginator';

@Injectable({
    providedIn: 'root'
})
export class GestionReporteDistribuidorService {
    url: string = `${environment.HOST}/reportes`;
    urlLaravel: string = `${environment.HOST_LARAVEL}/reportes`;

    private _dataPaginator: BehaviorSubject<any | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _aut: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for productoPaginator
     */
    get dataPaginator$(): Observable<any> {
        return this._dataPaginator.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data reporte grafico referencia mas vendida
    */
    getDataReporteGraficoReferenciasVendidas(idDistribuidor): Observable<any> {
        const distribuidor = {
            id_distribuidor: idDistribuidor
        }
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_grafico_referencias_mas_vendidas_distribuidor`, distribuidor).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data reporte grafico garantias solicitadas por distribuidor
    */
    getDataReporteGraficoGarantiasSolicitadasDistribuidor(idDistribuidor): Observable<any> {
        const distribuidor = {
            id_distribuidor: idDistribuidor
        }
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_grafico_garantias_solicitadas_distribuidor`, distribuidor).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data reporte grafico garantias solicitadas por distribuidor
    */
    getDataReporteGraficoInfoGeneralDistribuidor(idDistribuidor): Observable<any> {
        const distribuidor = {
            id_distribuidor: idDistribuidor
        }
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_grafico_info_general_distribuidor`, distribuidor).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data reporte grafico costos de mano obra de obra de los talleres autorizados del Distribuidor
    */
    getDataReporteGraficoCostosManoObraTallerDistribuidor(idDistribuidor): Observable<any> {
        const distribuidor = {
            id_distribuidor: idDistribuidor
        }
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_grafico_costos_mano_obra_taller_distribuidor`, distribuidor).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator importadores activos asociados
    */
    getImportadoresActivosAsociadosPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_importadores_activos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export importadores activos asociados
       */
    getExportImportadoresActivosAsociadosPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_importadores_activos_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator importadores activos asociados
    */
    getTalleresAsociadosDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_talleres_asociados_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export importadores activos asociados
       */
    getExportTalleresAsociadosDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_talleres_asociados_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator referencias activas por distribuidor
    */
    getReferenciasActivasDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_referencias_activas_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export referencias activas por distribuidor
       */
    getExportReferenciasActivasDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_referencias_activas_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator repuesots por distribuidor
    */
    getRepuestosDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_repuestos_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
       * Get data export repuesots por distribuidor
       */
    getExportRepuestosDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_repuestos_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator solicitud garantias Distribuidor
    */
    getSolicitudGarantiasDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_solicitud_garantias_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data export solicitud garantias por Distribuidor
    */
    getExportSolicitudGarantiasDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_solicitud_garantias_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator repuestos solicitados Distribuidor
    */
    getRepuestosSolicitadosDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_repuestos_solicitados_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data export repuestos solicitados por Distribuidor
    */
    getExportRepuestosSolicitadosDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_repuestos_solicitados_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator tickets por cobrar por Distribuidor
    */
    getTicketsPorCobrarDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_tickets_por_cobrar_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data export tickets por cobrar por Distribuidor
    */
    getExportTicketsPorCobrarDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_tickets_por_cobrar_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator usuarios Asociados por Distribuidor
    */
    getUsuariosAsociadosDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_usuarios_asociados_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data export usuarios Asociados por Distribuidor
    */
    getExportUsuariosAsociadosDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_usuarios_asociados_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator usuarios finales por Distribuidor
    */
    getUsuariosFinalesDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_usuarios_finales_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data export usuarios finales por Distribuidor
    */
    getExportUsuariosFinalesDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_usuarios_finales_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator referencias con mas garantias por Distribuidor
    */
    getReferenciasMasGarantiasDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_referencias_mas_garantias_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data export referencias con mas garantias por Distribuidor
    */
    getExportReferenciasMasGarantiasDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_referencias_mas_garantias_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------

    /**
    * Get data paginator marcas con mas garantias por Distribuidor
    */
    getMarcasMasGarantiasDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_marcas_mas_garantias_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    /**
    * Get data export marcas con mas garantias por Distribuidor
    */
    getExportMarcasMasGarantiasDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_marcas_mas_garantias_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------


    /**
    * Get data paginator aprobación y rechazo de solicitudes por distribuidor
    */
    getAprobacionRechazoSolicitudesDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_reporte_aprobacion_rechazo_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }


    /**
    * Get data export aprobación y rechazo de solicitudes por distribuidor
    */
    getExportAprobacionRechazoSolicitudesDistribuidorPaginator(paginator: Paginator): Observable<any> {
        return this._httpClient.post<any>(`${this.urlLaravel}/api_export_reporte_aprobacion_rechazo_distribuidor_paginator`, paginator).pipe(
            tap((dataPaginator) => {
                this._dataPaginator.next(dataPaginator);
            })
        );
    }

}
