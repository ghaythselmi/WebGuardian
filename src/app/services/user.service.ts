import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../entity/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://127.0.0.1:8000/api/user';
  private readonly tokenKey = 'webguardian_access_token';
  private readonly userKey = 'webguardian_user';

  constructor(private http: HttpClient) { }


  login(email: string, password: string): Observable<{ token: string; expiresIn: number; user: User }> {
    return this.http.post<{ token: string; expiresIn: number; user: User }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        sessionStorage.setItem(this.tokenKey, response.token);
        sessionStorage.setItem(this.userKey, JSON.stringify(response.user));
      })
    );
  }

  getToken(): string | null { return sessionStorage.getItem(this.tokenKey); }
  isAuthenticated(): boolean { return !!this.getToken(); }
  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }
  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(tap(user => sessionStorage.setItem(this.userKey, JSON.stringify(user))));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/new`, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/edit`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
