import { Component, HostListener, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../entity/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() userId?: number;
  @Input() mode: 'public' | 'client' = 'public';

  navbarVisible = true;
  dropdownVisible = false;
  user: User = new User();
  private lastScrollPosition = 0;
  private scrollThreshold = 50;

  constructor(
    private router: Router,
    private userService: UserService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    if (this.mode === 'client' && this.userId) {
      this.userService.getUser(this.userId).subscribe(
        data => { 
          this.user = data;
        },
        error => console.error(error)
      );
    }
  }

  ngOnDestroy(): void {
    // Clean up
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Don't hide navbar at the very top
    if (currentScroll <= this.scrollThreshold) {
      this.navbarVisible = true;
      this.lastScrollPosition = currentScroll;
      return;
    }
    
    // Hide on scroll down, show on scroll up
    if (currentScroll > this.lastScrollPosition) {
      // Scrolling down
      this.navbarVisible = false;
    } else {
      // Scrolling up
      this.navbarVisible = true;
    }
    
    this.lastScrollPosition = currentScroll;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownVisible = !this.dropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.dropdownVisible && !this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownVisible = false;
    }
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}