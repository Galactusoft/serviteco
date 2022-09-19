import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Empresa, Estadisticas } from './estadisticas';
import { environment } from 'environments/environment';
import { Importador } from '../gestion-importadores/importadores';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);

    url: string = `${environment.HOST}`;



    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/project').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }

    /**
    * Get estadisticas distribuidor by id
    */
    getEstadisticas(tipo: string, id?: string): Observable<Estadisticas> {
        const data = {
            id: id,
            tipo: tipo
        }
        return this._httpClient.post<Estadisticas>(`${this.url}/api_get_estadisticas.php`, JSON.stringify(data))
    }

    CallGeoAPI(postalCode: string) {
        let apiURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}&key=${environment.API_KEY_GOOGLE_MAPS}`;
        return this._httpClient.get<any>(apiURL).pipe(
            map((data) => data.results[0].geometry.location),
            catchError((error) => {
                console.error(error);
                return of(null);
            })
        );
    }

    getDataTest() {
        return this._httpClient.get('https://gist.githubusercontent.com/bumbeishvili/dc0d47bc95ef359fdc75b63cd65edaf2/raw/c33a3a1ef4ba927e3e92b81600c8c6ada345c64b/orgChart.json');
    }

    getLogoEmpresa(empresa: string): Observable<Importador> {
        const pago = {
            id: empresa
        }
        return this._httpClient.post<Importador>(`${this.url}/get_logo_empresa.php`, JSON.stringify(pago))
    }

}
