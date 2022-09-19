import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Empresa } from './empresa';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionEmpresasService {
    url: string = `${environment.HOST}/empresa`;
    // Private
    private _empresa: BehaviorSubject<Empresa | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for empresa
     */
    get empresa$(): Observable<Empresa> {
        return this._empresa.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get empresa con logo
     */
    getDatosEmpresa(idEmpresa: string): Observable<Empresa> {
        const empresa = {
            id: idEmpresa
        }
        return this._httpClient.post<Empresa>(`${this.url}/api_empresa_logo.php`, JSON.stringify(empresa)).pipe(
            tap((empresa) => {
                this._empresa.next(empresa);
            })
        );
    }

}
