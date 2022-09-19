import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { Evidencias, PanelSolicitudes, RecepcionSolicitud, RecepcionSolicitudEstado, RecepcionSolicitudManoObra, RecepcionSolicitudRepuestos } from './recepcion-solicitud';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class GestionSolicitudesService {
    url: string = `${environment.HOST}/solicitudes`;

    // Private
    private _solicitud: BehaviorSubject<RecepcionSolicitud | null> = new BehaviorSubject(null);
    private _solicitudes: BehaviorSubject<RecepcionSolicitud[] | null> = new BehaviorSubject(null);
    private _bitacora: BehaviorSubject<RecepcionSolicitudEstado[] | null> = new BehaviorSubject(null);
    private _repuestos: BehaviorSubject<RecepcionSolicitudRepuestos[] | null> = new BehaviorSubject(null);
    private _manosObra: BehaviorSubject<RecepcionSolicitudManoObra[] | null> = new BehaviorSubject(null);
    private _panelSolicitudes: BehaviorSubject<PanelSolicitudes | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _aut: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for solicitud
     */
    get solicitud$(): Observable<RecepcionSolicitud> {
        return this._solicitud.asObservable();
    }

    /**
     * Getter for solicitudes
     */
    get solicitudes$(): Observable<RecepcionSolicitud[]> {
        return this._solicitudes.asObservable();
    }

    get bitacora$(): Observable<RecepcionSolicitudEstado[]> {
        return this._bitacora.asObservable();
    }

    get repuestos$(): Observable<RecepcionSolicitudRepuestos[]> {
        return this._repuestos.asObservable();
    }

    get manosObra$(): Observable<RecepcionSolicitudManoObra[]> {
        return this._manosObra.asObservable();
    }

    get panelSolicitudes$(): Observable<PanelSolicitudes> {
        return this._panelSolicitudes.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get quizs
     */
    getSolicitudes(): Observable<RecepcionSolicitud[]> {
        if (this._aut.accessAdmin == 'funcionario' && this._aut.accessJefe == 'NO') {
            const data = {
                tipo: 'usuario',
                id: localStorage.getItem('accessUserId')
            }
            return this._httpClient.post<RecepcionSolicitud[]>(`${this.url}/api_solicitudes.php`, JSON.stringify(data)).pipe(
                tap((solicitudes) => {
                    this._solicitudes.next(solicitudes);
                })
            );
        } else if (this._aut.accessAdmin == 'importador') {
            const data = {
                tipo: 'importador',
                id: localStorage.getItem('accessImportador')
            }
            return this._httpClient.post<RecepcionSolicitud[]>(`${this.url}/api_solicitudes.php`, JSON.stringify(data)).pipe(
                tap((solicitudes) => {
                    this._solicitudes.next(solicitudes);
                })
            );
        } else if (this._aut.accessAdmin == 'distribuidor') {
            const data = {
                tipo: 'distribuidor',
                id: localStorage.getItem('accessDistribuidor')
            }
            return this._httpClient.post<RecepcionSolicitud[]>(`${this.url}/api_solicitudes.php`, JSON.stringify(data)).pipe(
                tap((solicitudes) => {
                    this._solicitudes.next(solicitudes);
                })
            );
        } else if (this._aut.accessAdmin == 'taller autorizado') {
            const data = {
                tipo: 'taller',
                id: localStorage.getItem('accessTaller')
            }
            return this._httpClient.post<RecepcionSolicitud[]>(`${this.url}/api_solicitudes.php`, JSON.stringify(data)).pipe(
                tap((solicitudes) => {
                    this._solicitudes.next(solicitudes);
                })
            );
        } else if (this._aut.accessAdmin == 'funcionario' && this._aut.accessJefe == 'SI') {
            const data = {
                tipo: 'taller',
                id: localStorage.getItem('accessTaller')
            }
            return this._httpClient.post<RecepcionSolicitud[]>(`${this.url}/api_solicitudes.php`, JSON.stringify(data)).pipe(
                tap((solicitudes) => {
                    this._solicitudes.next(solicitudes);
                })
            );
        } else if (this._aut.accessAdmin == 'administrador') {
            const data = {
                tipo: 'administrador'
            }
            return this._httpClient.post<RecepcionSolicitud[]>(`${this.url}/api_solicitudes.php`, JSON.stringify(data)).pipe(
                tap((solicitudes) => {
                    this._solicitudes.next(solicitudes);
                })
            );
        }

    }

    /**
    * Get solicitudes panel
    */
    getSolicitudesPanel(): Observable<PanelSolicitudes> {
        if (this._aut.accessAdmin == 'funcionario' && this._aut.accessJefe == 'NO') {
            const data = {
                tipo: 'usuario',
                id: localStorage.getItem('accessUserId')
            }
            return this._httpClient.post<PanelSolicitudes>(`${this.url}/api_solicitudes_panel.php`, JSON.stringify(data)).pipe(
                tap((panelSolicitud) => {
                    this._panelSolicitudes.next(panelSolicitud);
                })
            );
        } else if (this._aut.accessAdmin == 'importador') {
            const data = {
                tipo: 'importador',
                id: localStorage.getItem('accessImportador')
            }
            return this._httpClient.post<PanelSolicitudes>(`${this.url}/api_solicitudes_panel.php`, JSON.stringify(data)).pipe(
                tap((panelSolicitud) => {
                    this._panelSolicitudes.next(panelSolicitud);
                })
            );
        } else if (this._aut.accessAdmin == 'distribuidor') {
            const data = {
                tipo: 'distribuidor',
                id: localStorage.getItem('accessDistribuidor')
            }
            return this._httpClient.post<PanelSolicitudes>(`${this.url}/api_solicitudes_panel.php`, JSON.stringify(data)).pipe(
                tap((panelSolicitud) => {
                    this._panelSolicitudes.next(panelSolicitud);
                })
            );
        } else if (this._aut.accessAdmin == 'taller autorizado') {
            const data = {
                tipo: 'taller',
                id: localStorage.getItem('accessTaller')
            }
            return this._httpClient.post<PanelSolicitudes>(`${this.url}/api_solicitudes_panel.php`, JSON.stringify(data)).pipe(
                tap((panelSolicitud) => {
                    this._panelSolicitudes.next(panelSolicitud);
                })
            );
        } else if (this._aut.accessAdmin == 'funcionario' && this._aut.accessJefe == 'SI') {
            const data = {
                tipo: 'taller',
                id: localStorage.getItem('accessTaller')
            }
            return this._httpClient.post<PanelSolicitudes>(`${this.url}/api_solicitudes_panel.php`, JSON.stringify(data)).pipe(
                tap((panelSolicitud) => {
                    this._panelSolicitudes.next(panelSolicitud);
                })
            );
        } else if (this._aut.accessAdmin == 'administrador') {
            const data = {
                tipo: 'administrador'
            }
            return this._httpClient.post<PanelSolicitudes>(`${this.url}/api_solicitudes_panel.php`, JSON.stringify(data)).pipe(
                tap((panelSolicitud) => {
                    this._panelSolicitudes.next(panelSolicitud);
                })
            );
        }
    }

    /**
     * Get quiz by id
     */
    getSolicitudById(id: string): Observable<RecepcionSolicitud> {
        const solicitud = {
            id: id
        }
        return this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_get_solicitud.php`, JSON.stringify(solicitud)).pipe(
            tap((solicitud) => {
                this._solicitud.next(solicitud);
            })
        );
    }

    /**
     * Create solicitud
     */
    createSolicitud(newSolicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitud$.pipe(
            take(1),
            switchMap(solicitud => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_registro_solicitud.php`, JSON.stringify(newSolicitud)).pipe(
                map((solicitudNew: RecepcionSolicitud) => {

                    // Return the new solicitud
                    return solicitudNew;
                }),
            ))
        );
    }

    /**
     * Update solicitud
     *
     * @param id
     * @param solicitud
     */
    updateSolicitud(id: string, solicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_actualizacion_solicitud.php`, JSON.stringify(solicitud)).pipe(
                map((solicituEdit: RecepcionSolicitud) => {

                    // Return the updated solicitud
                    return solicituEdit;
                })
            ))
        );
    }

    confirmarLectura(id: string): Observable<any> {
        const solicitud = {
            id: id
        }
        return this._httpClient.post(`${this.url}/api_confirmacion_lectura_correo.php`, JSON.stringify(solicitud))
    }

    /**
     * Update solicitud
     *
     * @param id
     * @param solicitud
     */
    entregaSolicitud(id: string, solicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_entrega_solicitud.php`, JSON.stringify(solicitud)).pipe(
                map((solicituEdit: RecepcionSolicitud) => {

                    // Return the updated solicitud
                    return solicituEdit;
                })
            ))
        );
    }

    /**
    * Envio solicitud
    *
    * @param id
    * @param solicitud
    */
    envioSolicitud(id: string, solicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_envio_solicitud.php`, JSON.stringify(solicitud)).pipe(
                map((solicituEdit: RecepcionSolicitud) => {

                    // Return the updated solicitud
                    return solicituEdit;
                })
            ))
        );
    }

    /**
    * Envio solicitud
    *
    * @param id
    * @param solicitud
    */
    envioSolicitudServicioTecnico(id: string, solicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_envio_solicitud_servicio_tecnico.php`, JSON.stringify(solicitud)).pipe(
                map((solicituEdit: RecepcionSolicitud) => {

                    // Return the updated solicitud
                    return solicituEdit;
                })
            ))
        );
    }

    /**
     * Update solicitud
     *
     * @param id
     * @param solicitud
     */
    actualizacionEnvioDiagosticoSolicitud(id: string, solicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_actualizacion_envio_solicitud.php`, JSON.stringify(solicitud)).pipe(
                map((solicituEdit: RecepcionSolicitud) => {

                    // Return the updated solicitud
                    return solicituEdit;
                })
            ))
        );
    }


    /**
     * Delete solicitud
     *
     * @param id
     */
    deleteSolicitud(id: string): Observable<any> {
        const solicitud = {
            id: id
        }
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_eliminacion_solicitud.php`, JSON.stringify(solicitud)).pipe(
                map((isDeleted: RecepcionSolicitud) => {
                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
    * Get bitacora
    */
    getBitacoraPorIdSolicitud(id: string): Observable<RecepcionSolicitudEstado[]> {
        const solicitud = {
            id: id
        }
        return this._httpClient.post<RecepcionSolicitudEstado[]>(`${this.url}/api_get_bitacora.php`, JSON.stringify(solicitud)).pipe(
            tap((bitacora) => {
                this._bitacora.next(bitacora);
            })
        );
    }

    /**
    * Get repuestos
    */
    getRepuestosPorIdSolicitud(id: string): Observable<RecepcionSolicitudRepuestos[]> {
        const solicitud = {
            id: id
        }
        return this._httpClient.post<RecepcionSolicitudRepuestos[]>(`${this.url}/api_get_repuestos.php`, JSON.stringify(solicitud)).pipe(
            tap((repuestos) => {
                this._repuestos.next(repuestos);
            })
        );
    }

    /**
    * Get manos de obra
    */
    getManosObraPorIdSolicitud(id: string): Observable<RecepcionSolicitudManoObra[]> {
        const solicitud = {
            id: id
        }
        return this._httpClient.post<RecepcionSolicitudManoObra[]>(`${this.url}/api_get_manos_obra.php`, JSON.stringify(solicitud)).pipe(
            tap((manosObra) => {
                this._manosObra.next(manosObra);
            })
        );
    }

    /**
     * Update solicitud
     *
     * @param id
     * @param solicitud
     */
    updateEvaluacionSolicitud(id: string, solicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_evaluacion_solicitud.php`, JSON.stringify(solicitud)).pipe(
                map((solicituEdit: RecepcionSolicitud) => {

                    // Return the updated solicitud
                    return solicituEdit;
                })
            ))
        );
    }

    /**
     * Update solicitud
     *
     * @param id
     * @param solicitud
     */
    asignacionSolicitud(id: string, solicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_asignacion_solicitud.php`, JSON.stringify(solicitud)).pipe(
                map((solicituEdit: RecepcionSolicitud) => {

                    // Return the updated solicitud
                    return solicituEdit;
                })
            ))
        );
    }

    /**
     * Update solicitud
     *
     * @param id
     * @param solicitud
     */
    asignacionDiagosticoSolicitud(id: string, solicitud: RecepcionSolicitud): Observable<RecepcionSolicitud> {
        return this.solicitudes$.pipe(
            take(1),
            switchMap(solicitudes => this._httpClient.post<RecepcionSolicitud>(`${this.url}/api_diagnostico_solicitud.php`, JSON.stringify(solicitud)).pipe(
                map((solicituEdit: RecepcionSolicitud) => {

                    // Return the updated solicitud
                    return solicituEdit;
                })
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
     * Get solicitudes por producto
     */
    getSolicitudesPorProducto(idProducto: string): Observable<RecepcionSolicitud[]> {
        const data = {
            id: idProducto
        }
        return this._httpClient.post<RecepcionSolicitud[]>(`${this.url}/api_solicitudes_producto.php`, JSON.stringify(data)).pipe(
            tap((solicitudes) => {
                this._solicitudes.next(solicitudes);
            })
        );
    }

}
