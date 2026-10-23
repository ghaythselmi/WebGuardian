import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private users: UserService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.users.getToken();
    const authenticated = token && request.url.includes('/api/') && !request.url.endsWith('/login')
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;
    return next.handle(authenticated).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.endsWith('/login')) {
        this.users.logout();
        this.router.navigate(['/login']);
      }
      return throwError(() => error);
    }));
  }
}
