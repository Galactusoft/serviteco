import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    url: string = `${environment.HOST}`;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
    * Setter & getter for access user
    */
    set accessUser(username: string) {
        localStorage.setItem('accessUser', username);
    }

    get accessUser(): string {
        return localStorage.getItem('accessUser') ?? '';
    }

    /**
    * Setter & getter for access userId
    */
    set accessUserId(id: string) {
        localStorage.setItem('accessUserId', id);
    }

    get accessUserId(): string {
        return localStorage.getItem('accessUserId') ?? '';
    }

    /**
    * Setter & getter for access admin
    */
    set accessAdmin(admin: string) {
        localStorage.setItem('accessAdmin', admin);
    }

    get accessAdmin(): string {
        return localStorage.getItem('accessAdmin') ?? '';
    }

    /**
    * Setter & getter for access jefe
    */
    set accessJefe(jefe: string) {
        localStorage.setItem('accessJefe', jefe);
    }

    get accessJefe(): string {
        return localStorage.getItem('accessJefe') ?? '';
    }

    /**
    * Setter & getter for access disdribuidor
    */
    set accessDistribuidor(distribuidor: string) {
        localStorage.setItem('accessDistribuidor', distribuidor);
    }

    get accessDistribuidor(): string {
        return localStorage.getItem('accessDistribuidor') ?? '';
    }

    /**
    * Setter & getter for access importador
    */
    set accessImportador(importador: string) {
        localStorage.setItem('accessImportador', importador);
    }

    get accessImportador(): string {
        return localStorage.getItem('accessImportador') ?? '';
    }

    /**
    * Setter & getter for access company
    */
     set accessCompany(company: string) {
        localStorage.setItem('accessCompany', company);
    }

    get accessCompany(): string {
        return localStorage.getItem('accessCompany') ?? '';
    }

    /**
    * Setter & getter for access taller
    */
     set accessTaller(taller: string) {
        localStorage.setItem('accessTaller', taller);
    }

    get accessTaller(): string {
        return localStorage.getItem('accessTaller') ?? '';
    }    

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this.login(credentials).pipe(
            switchMap((response: any) => {

                return this._httpClient.post('api/auth/sign-in', response).pipe(
                    switchMap((response: any) => {

                        // Store the access token in the local storage
                        this.accessToken = response.accessToken;

                        // Set the authenticated flag to true
                        this._authenticated = true;

                        // Store the user on the user service
                        this._userService.user = response.user;

                        this._userService.userName = response.user.name;

                        this._userService.admin = this.accessAdmin;

                        this._userService.jefe = this.accessJefe;

                        this._userService.distribuidor = this.accessDistribuidor;

                        this._userService.taller = this.accessTaller;

                        this._userService.importador = this.accessImportador;

                        this._userService.company = this.accessCompany;

                        this.accessUser = response.user.name;

                        this.accessUserId = response.user.id;

                        this.accessAdmin = response.user.admin;

                        this.accessJefe = response.user.jefe;

                        this.accessDistribuidor = response.user.distribuidor;

                        this.accessTaller = response.user.taller;

                        this.accessImportador = response.user.importador;

                        this.accessCompany = response.user.company;

                        // Return a new observable with the response
                        return of(response);
                    })
                );

            })
        );

    }

    login(credentials: { email: string; password: string }) {
        return this._httpClient.post(`${this.url}/api_login.php`, JSON.stringify(credentials));
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Renew token
        return this._httpClient.post('api/auth/refresh-access-token', {
            accessToken: this.accessToken
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                response.user.name = this.accessUser;

                response.user.id = this.accessUserId;

                response.user.admin = this.accessAdmin;

                response.user.jefe = this.accessJefe;

                response.user.distribuidor = this.accessDistribuidor;

                response.user.taller = this.accessTaller;

                response.user.importador = this.accessImportador;

                response.user.company = this.accessCompany;

                // Store the user on the user service
                this._userService.user = response.user;

                this._userService.userName = this.accessUser;

                this._userService.admin = this.accessAdmin;

                this._userService.jefe = this.accessJefe;

                this._userService.distribuidor = this.accessDistribuidor;

                this._userService.taller = this.accessTaller;

                this._userService.importador = this.accessImportador;

                this._userService.company = this.accessCompany;

                this.accessUserId = response.user.id;

                this.accessJefe = response.user.jefe;

                this.accessDistribuidor = response.user.distribuidor;

                this.accessTaller = response.user.taller;

                this.accessImportador = response.user.importador;

                this.accessCompany = response.user.company;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        localStorage.removeItem('accessUser');

        localStorage.removeItem('accessUserId');

        localStorage.removeItem('accessAdmin');

        localStorage.removeItem('accessJefe');

        localStorage.removeItem('accessDistribuidor');

        localStorage.removeItem('accessTaller');

        localStorage.removeItem('accessImportador');

        localStorage.removeItem('accessCompany');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
