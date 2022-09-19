import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Paginator } from '../paginator';
import { environment } from 'environments/environment';
import { Funcionario } from './funcionarios';

@Injectable({
    providedIn: 'root'
})
export class GestionFuncionariosService {
    url: string = `${environment.HOST}/funcionarios`;
    // Private
    private _funcionario: BehaviorSubject<Funcionario | null> = new BehaviorSubject(null);
    private _funcionarios: BehaviorSubject<Funcionario[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for funcionario
     */
    get funcionario$(): Observable<Funcionario> {
        return this._funcionario.asObservable();
    }

    /**
     * Getter for funcionarios
     */
    get funcionarios$(): Observable<Funcionario[]> {
        return this._funcionarios.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get funcionario
     */
    getFuncionarios(): Observable<Funcionario[]> {
        return this._httpClient.get<Funcionario[]>(`${this.url}/api_funcionarios.php`).pipe(
            tap((funcionarios) => {
                this._funcionarios.next(funcionarios);
            })
        );
    }

    /**
     * Get usuarios funcionarios
     */
     getUsuariosFuncionarios(): Observable<Funcionario[]> {
        return this._httpClient.get<Funcionario[]>(`${this.url}/api_usuarios_funcionarios.php`).pipe(
            tap((funcionarios) => {
                this._funcionarios.next(funcionarios);
            })
        );
    }

    /**
     * Get usuarios funcionarios
     */
     getUsuariosFuncionariosTaller(idTaller: string): Observable<Funcionario[]> {
        const taller = {
            id: idTaller
        }
        return this._httpClient.post<Funcionario[]>(`${this.url}/api_usuarios_funcionarios_taller.php`, JSON.stringify(taller)).pipe(
            tap((funcionarios) => {
                this._funcionarios.next(funcionarios);
            })
        );
    }    


    /**
     * Get funcionario jefe de taller by idTaller
     */
     getFuncionarioJefeTallerByTaller(idTaller: string): Observable<Funcionario> {
        const taller = {
            id: idTaller
        }
        return this._httpClient.post<Funcionario>(`${this.url}/api_get_funcionario_jefe_taller.php`, JSON.stringify(taller));
    }    

    /**
    * Get funcionarios paginator
    */
    getFuncionariosPaginator(paginator: Paginator): Observable<Funcionario[]> {
        return this._httpClient.post<Funcionario[]>(`${this.url}/api_funcionarios.php`, JSON.stringify(paginator)).pipe(
            tap((funcionarios) => {
                this._funcionarios.next(funcionarios);
            })
        );
    }

    /**
     * Search funcionarios with given query
     *
     * @param query
     */
    searchFuncionario(f: string = "all", p: string, s: string, sortBy: string = "", sort: string = ""): Observable<Funcionario[]> {
        return this._httpClient.get<Funcionario[]>(`${this.url}/funcionarios/${f}?page=${p}&size=${s}&sort=${sortBy},${sort}`).pipe(
            tap((funcionarios) => {
                this._funcionarios.next(funcionarios);
            })
        );
    }

    /**
     * Get funcionario by id
     */
    getFuncionarioById(id: string): Observable<Funcionario> {
        const funcionario = {
            id: id
        }
        return this._httpClient.post<Funcionario>(`${this.url}/api_get_funcionario.php`, JSON.stringify(funcionario)).pipe(
            tap((funcionario) => {
                this._funcionario.next(funcionario);
            })
        );
    }

    /**
     * create funcionario
     */
    createFuncionario(funcionario: Funcionario): Observable<Funcionario> {
        return this.funcionarios$.pipe(
            take(1),
            switchMap(funcionarios => this._httpClient.post<Funcionario>(`${this.url}/api_registro_funcionario.php`, JSON.stringify(funcionario)).pipe(
                map((funcionarioNew: Funcionario) => {

                    funcionarios.push(funcionarioNew);

                    // Update the funcionarios
                    this._funcionarios.next(funcionarios);

                    // Return the updated funcionario
                    return funcionarioNew;
                }),
            ))
        );
    }

    /**
     * Update funcionario
     *
     * @param id
     * @param funcionario
     */
    updateFuncionario(id: string, funcionario: Funcionario): Observable<Funcionario> {
        return this.funcionarios$.pipe(
            take(1),
            switchMap(funcionarios => this._httpClient.post<Funcionario>(`${this.url}/api_actualizacion_funcionario.php`, JSON.stringify(funcionario)).pipe(
                map((funcionarioEdit: Funcionario) => {

                
                    // Find the index of the updated funcionario
                    const index = funcionarios.findIndex(item => item.id === id);

                    // Update the funcionario
                    funcionarios[index] = funcionario;

                    // Update the funcionarios
                    this._funcionarios.next(funcionarios);

                    // Return the updated funcionario
                    return funcionarioEdit;
                }),
                switchMap(funcionarioEdit => this.funcionario$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._funcionario.next(funcionarioEdit);

                        // Return the updated contact
                        return funcionarioEdit;
                    })
                ))
            ))
        );
    }

    /**
     * Update funcionario
     *
     * @param id
     * @param funcionario
     */
    updateFuncionarioGeneral(id: string, funcionario: Funcionario): Observable<Funcionario> {
        return this._httpClient.post<Funcionario>(`${this.url}/api_actualizacion_funcionario_general.php`, JSON.stringify(funcionario));
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
     * Delete the funcionario
     *
     * @param id
     */
    deleteFuncionario(id: string): Observable<boolean> {
        return this.funcionarios$.pipe(
            take(1),
            switchMap(funcionarios => this._httpClient.delete('api/apps/clientes/cliente', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted funcionario
                    const index = funcionarios.findIndex(item => item.id === id);

                    // Delete the funcionario
                    funcionarios.splice(index, 1);

                    // Update the funcionarios
                    this._funcionarios.next(funcionarios);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

}
