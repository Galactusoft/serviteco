import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    url: string = `${environment.HOST}/notificaciones`;

    private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _authService: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for notifications
     */
    get notifications$(): Observable<Notification[]> {
        return this._notifications.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all notifications
     */
    getAll(): Observable<Notification[]> {
        return this._httpClient.get<Notification[]>('api/common/notifications').pipe(
            tap((notifications) => {
                this._notifications.next(notifications);
            })
        );

    }

    /**
     * Get notificaciones por usuario logueado
     */
    getNotificaciones(): Observable<Notification[]> {
        const usuario = {
            id: localStorage.getItem('accessUserId')
        }
        return this._httpClient.post<Notification[]>(`${this.url}/api_get_notificaciones.php`, JSON.stringify(usuario)).pipe(
            tap((notifications) => {
                this._notifications.next(notifications);
            })
        );
    }

    /**
     * Create a notification
     *
     * @param notification
     */
    create(idUsuario: string, titulo: string, descripcion: string): Observable<Notification> {
        const notification = {
            id_usuario: idUsuario,
            titulo: titulo,
            descripcion: descripcion
        }
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.post<Notification>(`${this.url}/api_registro_notificaciones.php`, JSON.stringify(notification)).pipe(
                map((newNotification) => {

                    // Return the new notification from observable
                    return newNotification;
                })
            ))
        );
    }

    /**
     * Update the notification
     *
     * @param id
     * @param notification
     */
    update(id: string, notification: Notification): Observable<Notification> {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.post<Notification>(`${this.url}/api_actualizacion_notificaciones.php`, JSON.stringify(notification)).pipe(
                map((updatedNotification: Notification) => {

                    // Find the index of the updated notification
                    const index = notifications.findIndex(item => item.id === id);

                    // Update the notification
                    notifications[index] = updatedNotification;

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the updated notification
                    return updatedNotification;
                })
            ))
        );
    }

    /**
     * Delete the notification
     *
     * @param id
     */
    delete(idDelete: string): Observable<boolean> {
        const notification = {
            id: idDelete
        }
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.post<boolean>(`${this.url}/api_eliminacion_notificaciones.php`, JSON.stringify(notification)).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted notification
                    const index = notifications.findIndex(item => item.id === idDelete);

                    // Delete the notification
                    notifications.splice(index, 1);

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): Observable<boolean> {
        const usuario = {
            id: localStorage.getItem('accessUserId')
        }
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.post<boolean>(`${this.url}/api_marcar_notificaciones_leidas.php`, JSON.stringify(usuario)).pipe(
                map((isUpdated: boolean) => {

                    // Go through all notifications and set them as read
                    notifications.forEach((notification, index) => {
                        notifications[index].leido = "1";
                    });

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the updated status
                    return isUpdated;
                })
            ))
        );
    }
}
