import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  private apiUrl = 'http://localhost:8000/api/monitor/check';
  constructor(private http: HttpClient) { }

  checkWebsite(url: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { url });
  }
}
