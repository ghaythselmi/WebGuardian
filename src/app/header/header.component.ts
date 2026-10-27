import { Component, HostListener, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../entity/user';
import { AppNotification } from '../entity/app-notification';
import { NotificationsService } from '../services/notifications.service';

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
  notificationsOpen = false;
  notifications: AppNotification[] = [];
  unreadNotificationCount = 0;
  private notificationTimer?: ReturnType<typeof setInterval>;
  user: User = new User();
  private lastScrollPosition = 0;
  private scrollThreshold = 50;

  constructor(
    private router: Router,
    private userService: UserService,
    private notificationsService: NotificationsService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    if (this.mode === 'client') {
      this.userService.me().subscribe(
        data => { 
          this.user = data;
          this.userId = data.id!;
          this.loadNotifications();
          this.notificationTimer = setInterval(() => this.loadNotifications(), 30000);
        },
        error => console.error(error)
      );
    }
  }

  ngOnDestroy(): void {
    if (this.notificationTimer) clearInterval(this.notificationTimer);
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

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) this.loadNotifications();
  }

  loadNotifications(): void {
    if (this.mode !== 'client' || !this.userId) return;
    this.notificationsService.getNotifications().subscribe({
      next: feed => {
        this.notifications = feed.notifications || [];
        this.unreadNotificationCount = feed.unreadCount || 0;
      },
      error: error => console.error('Could not load website notifications:', error)
    });
  }

  markNotificationRead(notification: AppNotification): void {
    if (notification.read) return;
    this.notificationsService.markRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadNotificationCount = Math.max(0, this.unreadNotificationCount - 1);
      },
      error: error => console.error('Could not mark notification as read:', error)
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.notificationsOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.notificationsOpen = false;
    }
    if (this.dropdownVisible && !this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownVisible = false;
    }
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/h']);
  }

  navigateToSection(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      window.history.replaceState(null, '', `${this.mode === 'client' ? '/home' : '/h'}#${sectionId}`);
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const route = this.mode === 'client' ? '/home' : '/h';
    this.router.navigate([route], { fragment: sectionId }).then(() => {
      requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    });
  }
}
