import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { User } from 'app/core/user/user.types';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _userName: ReplaySubject<String> = new ReplaySubject<String>(1);
    private _admin: ReplaySubject<String> = new ReplaySubject<String>(1);
    private _jefe: ReplaySubject<String> = new ReplaySubject<String>(1);
    private _distribuidor: ReplaySubject<String> = new ReplaySubject<String>(1);
    private _importador: ReplaySubject<String> = new ReplaySubject<String>(1);
    private _company: ReplaySubject<String> = new ReplaySubject<String>(1);
    private _taller: ReplaySubject<String> = new ReplaySubject<String>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    /**
     * Setter & getter for username
     *
     * @param value
     */
     set userName(value: String)
     {
         // Store the value
         this._userName.next(value);
     }
 
     get userName$(): Observable<String>
     {
         return this._userName.asObservable();
     }

    /**
     * Setter & getter for admin
     *
     * @param value
     */
     set admin(value: String)
     {
         // Store the value
         this._admin.next(value);
     }
 
     get admin$(): Observable<String>
     {
         return this._admin.asObservable();
     }   
     
    /**
     * Setter & getter for jefe
     *
     * @param value
     */
     set jefe(value: String)
     {
         // Store the value
         this._jefe.next(value);
     }
 
     get jefe$(): Observable<String>
     {
         return this._jefe.asObservable();
     }  
     
    /**
     * Setter & getter for distribuidor
     *
     * @param value
     */
     set distribuidor(value: String)
     {
         // Store the value
         this._distribuidor.next(value);
     }
 
     get distribuidor$(): Observable<String>
     {
         return this._distribuidor.asObservable();
     }  

    /**
     * Setter & getter for importador
     *
     * @param value
     */
     set importador(value: String)
     {
         // Store the value
         this._importador.next(value);
     }
 
     get importador$(): Observable<String>
     {
         return this._importador.asObservable();
     }       

    /**
     * Setter & getter for company
     *
     * @param value
     */
     set company(value: String)
     {
         // Store the value
         this._company.next(value);
     }
 
     get company$(): Observable<String>
     {
         return this._company.asObservable();
     } 

    /**
     * Setter & getter for taller
     *
     * @param value
     */
     set taller(value: String)
     {
         // Store the value
         this._taller.next(value);
     }
 
     get taller$(): Observable<String>
     {
         return this._taller.asObservable();
     }      
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User>
    {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
