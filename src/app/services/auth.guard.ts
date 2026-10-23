import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private users: UserService, private router: Router) {}
  canActivate(): boolean | UrlTree {
    return this.users.isAuthenticated() ? true : this.router.createUrlTree(['/login']);
  }
}
