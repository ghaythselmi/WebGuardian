import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Website } from '../entity/website';

@Injectable({
  providedIn: 'root'
})
export class WebsitesService {
  private apiUrl = 'http://127.0.0.1:8000/api/websites';

  constructor(private http: HttpClient) { }

  getWebsites(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`);
  }

  getWebsiteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getWebsiteChecks(id: number): Observable<WebsiteCheck[]> {
    return this.http.get<WebsiteCheck[]>(`${this.apiUrl}/${id}/checks`);
  }
  checkWebsite(id: number): Observable<Website> {
    return this.http.post<Website>(`${this.apiUrl}/${id}/check`, {});
  }
  createWebsite(website: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/new`, website, { headers });
  }
  
  
 
  updateWebsite(id: number, websiteData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}/${id}`, websiteData, { headers });
  }

 
  deleteWebsite(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getWebsitesByUser(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }

}

export interface WebsiteCheck {
  checkedAt: string;
  availability: string;
  httpStatusCode: number | null;
  responseTimeMs: number | null;
  sslStatus: string;
  sslExpiresInDays: number | null;
  headersScore: number | null;
  headersGrade: string | null;
}
