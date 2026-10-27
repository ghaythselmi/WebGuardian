import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppNotification, NotificationFeed } from '../entity/app-notification';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/notifications';

  constructor(private readonly http: HttpClient) {}

  getNotifications(): Observable<NotificationFeed> {
    return this.http.get<NotificationFeed>(this.apiUrl);
  }

  markRead(id: number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.apiUrl}/${id}/read`, {});
  }
}
