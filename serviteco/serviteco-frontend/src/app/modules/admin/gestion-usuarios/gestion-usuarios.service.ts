import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Usuario } from './usuarios';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GestionUsuariosService {
    url: string = `${environment.HOST}/usuarios`;
    // Private
    private _usuario: BehaviorSubject<Usuario | null> = new BehaviorSubject(null);
    private _usuarios: BehaviorSubject<Usuario[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for usuario
     */
    get usuario$(): Observable<Usuario> {
        return this._usuario.asObservable();
    }

    /**
     * Getter for usuarios
     */
    get usuarios$(): Observable<Usuario[]> {
        return this._usuarios.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get usuarios
     */
    getUsuarios(): Observable<Usuario[]> {
        return this._httpClient.get<Usuario[]>(`${this.url}/api_usuarios.php`).pipe(
            tap((usuarios) => {
                this._usuarios.next(usuarios);
            })
        );
    }


    /**
     * Get usuarios
     */
    getUsuariosExport(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${this.url}/api_usuarios_export.php`);
    }

    /**
    * Get usuarios
    */
    getUsuariosPorTipoUsuario(tipoUsuario: string): Observable<Usuario[]> {
        const usuario = {
            tipo_usuario: tipoUsuario
        }
        return this._httpClient.post<Usuario[]>(`${this.url}/api_usuarios.php`, JSON.stringify(usuario)).pipe(
            tap((usuarios) => {
                this._usuarios.next(usuarios);
            })
        );
    }

    /**
    * Get usuarios
    */
    actualizarPassword(password: string, idUsuario: string): Observable<Usuario[]> {
        const usuario = {
            password: password,
            id: idUsuario
        }
        return this._httpClient.post<Usuario[]>(`${this.url}/api_actualizacion_password_usuario.php`, JSON.stringify(usuario)).pipe(
            tap((usuarios) => {
                this._usuarios.next(usuarios);
            })
        );
    }

    /**
    * Get usuarios paginator
    */
    getUsuariosPaginator(paginator: Paginator): Observable<Usuario[]> {
        return this._httpClient.post<Usuario[]>(`${this.url}/api_usuarios.php`, JSON.stringify(paginator)).pipe(
            tap((usuarios) => {
                this._usuarios.next(usuarios);
            })
        );
    }

    /**
     * Search usuarios with given query
     *
     * @param query
     */
    searchUsuario(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Usuario[]> {
        return this._httpClient.get<Usuario[]>(`${this.url}/clientes/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((usuarios) => {
                this._usuarios.next(usuarios);
            })
        );
    }

    /**
     * Get usuario by id
     */
    getUsuarioById(id: string): Observable<Usuario> {
        const user = {
            id: id
        }
        return this._httpClient.post<Usuario>(`${this.url}/api_get_usuario.php`, JSON.stringify(user)).pipe(
            tap((usuario) => {
                this._usuario.next(usuario);
            })
        );
    }

    /**
     * Create usuario
     */
    createUsuario(usuario: Usuario): Observable<Usuario> {
        return this.usuarios$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Usuario>(`${this.url}/api_registro_usuario.php`, JSON.stringify(usuario)).pipe(
                map((userNew: Usuario) => {

                    userNew.password = '';

                    contacts.push(userNew);

                    // Update the contacts
                    this._usuarios.next(contacts);

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
    updateUsuario(id: string, usuario: Usuario): Observable<Usuario> {
        return this.usuarios$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Usuario>(`${this.url}/api_actualizacion_usuario.php`, JSON.stringify(usuario)).pipe(
                map((userEdit: Usuario) => {

                    userEdit.password = '';

                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = usuario;

                    // Update the contacts
                    this._usuarios.next(contacts);

                    // Return the updated contact
                    return userEdit;
                }),
                switchMap(userEdit => this.usuario$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._usuario.next(userEdit);

                        // Return the updated contact
                        return userEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update usuario
     *
     * @param id
     * @param usuario
     */
    updateUsuarioGeneral(id: string, usuario: Usuario): Observable<Usuario> {
        return this._httpClient.post<Usuario>(`${this.url}/api_actualizacion_usuario_general.php`, JSON.stringify(usuario));
    }

    /**
     * Update usuario
     *
     * @param id
     * @param usuario
     */
    validarUsername(username: string): Observable<any> {
        const usuario = {
            username: username
        }
        return this._httpClient.post<any>(`${this.url}/api_validar_username.php`, JSON.stringify(usuario));
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
     * Delete the usuario
     *
     * @param id
     */
    deleteUsuario(id: string): Observable<any> {
        const usuario = {
            id: id
        }
        return this.usuarios$.pipe(
            take(1),
            switchMap(usuarios => this._httpClient.post(`${this.url}/api_delete_usuarios.php`, JSON.stringify(usuario)).pipe(
                map((request: any) => {

                    if (request['resultado'] == 'OK') {
                        // Find the index of the deleted usuario
                        const index = usuarios.findIndex(item => item.id === id);

                        // Delete the usuario
                        usuarios.splice(index, 1);

                        // Update the usuarios
                        this._usuarios.next(usuarios);

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
