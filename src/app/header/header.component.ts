import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../entity/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  /** Pass userId when mode = 'client' */
  @Input() userId?: number;

  /**
   * 'public'  → Home page navbar  (Login + Sign Up, no user info)
   * 'client'  → Front-client navbar (user links, profile dropdown, NO login/signup)
   */
  @Input() mode: 'public' | 'client' = 'public';

  lastScrollTop    = 0;
  navbarVisible    = true;
  dropdownVisible  = false;
  user!: User;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.mode === 'client' && this.userId) {
      this.user = new User();
      this.userService.getUser(this.userId).subscribe(
        data  => { this.user = data; },
        error => console.error(error)
      );
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownVisible = !this.dropdownVisible;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.dropdownVisible = false;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 120) {
      this.navbarVisible = scrollTop <= this.lastScrollTop;
    } else {
      this.navbarVisible = true;
    }
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
