import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { UsuarioFinal } from './usuario-final';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionUsuarioFinalService {
    url: string = `${environment.HOST}/usuarioFinal`;
    // Private
    private _usuarioFinal: BehaviorSubject<UsuarioFinal | null> = new BehaviorSubject(null);
    private _usuariosFinales: BehaviorSubject<UsuarioFinal[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for usuarioFinal
     */
    get usuarioFinal$(): Observable<UsuarioFinal> {
        return this._usuarioFinal.asObservable();
    }

    /**
     * Getter for usuarios finales
     */
    get usuariosFinales$(): Observable<UsuarioFinal[]> {
        return this._usuariosFinales.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get usuarios
     */
    getUsuariosFinales(): Observable<UsuarioFinal[]> {
        return this._httpClient.get<UsuarioFinal[]>(`${this.url}/api_usuarios_finales.php`).pipe(
            tap((usuarios) => {
                this._usuariosFinales.next(usuarios);
            })
        );
    }

    /**
     * Get usuario by id
     */
    getUsuarioFinalByIdentificacion(identificacion: string): Observable<UsuarioFinal> {
        const user = {
            identificacion: identificacion
        }
        return this._httpClient.post<UsuarioFinal>(`${this.url}/api_get_usuario_final.php`, JSON.stringify(user)).pipe(
            tap((usuario) => {
                this._usuarioFinal.next(usuario);
            })
        );
    }

    /**
     * Get usuario by id
     */
     getUsuarioFinalById(id: string): Observable<UsuarioFinal> {
        const user = {
            id: id
        }
        return this._httpClient.post<UsuarioFinal>(`${this.url}/api_get_usuario_final_por_id.php`, JSON.stringify(user)).pipe(
            tap((usuario) => {
                this._usuarioFinal.next(usuario);
            })
        );
    }    

    /**
     * Create usuario
     */
    createUsuarioFinal(usuario: UsuarioFinal): Observable<UsuarioFinal> {
        return this.usuariosFinales$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<UsuarioFinal>(`${this.url}/api_registro_usuario_final.php`, JSON.stringify(usuario)).pipe(
                map((userNew: UsuarioFinal) => {

                    // Return the updated contact
                    return userNew;
                }),
            ))
        );
    }

    /**
     * Create usuario
     */
     registroUsuarioFinal(usuario: UsuarioFinal): Observable<UsuarioFinal> {
        return this.usuariosFinales$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<UsuarioFinal>(`${this.url}/api_registro_usuario_final.php`, JSON.stringify(usuario)).pipe(
                map((userNew: UsuarioFinal) => {

                    contacts.push(userNew);

                    // Update the contacts
                    this._usuariosFinales.next(contacts);

                    // Return the updated contact
                    return userNew;
                }),
            ))
        );
    }    

    /**
     * Update usuario
     *
     * @param id
     * @param usuario
     */
    updateUsuarioFinal(id: string, usuario: UsuarioFinal): Observable<UsuarioFinal> {
        return this.usuariosFinales$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<UsuarioFinal>(`${this.url}/api_actualizacion_usuario_final.php`, JSON.stringify(usuario)).pipe(
                map((userEdit: UsuarioFinal) => {


                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = usuario;

                    // Update the contacts
                    this._usuariosFinales.next(contacts);

                    // Return the updated contact
                    return userEdit;
                }),
                switchMap(userEdit => this.usuarioFinal$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._usuarioFinal.next(userEdit);

                        // Return the updated contact
                        return userEdit;
                    })
                ))
            ))
        );
    }
}
