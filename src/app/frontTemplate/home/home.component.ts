import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  lastScrollTop   = 0;
  navbarVisible   = true;
  showScrollTop   = false;
  scrollThreshold = 120;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

    // Navbar hide/show on scroll direction
    if (scrollTop > this.scrollThreshold) {
      this.navbarVisible = scrollTop <= this.lastScrollTop;
    } else {
      this.navbarVisible = true;
    }
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

    // Scroll-to-top button visibility
    this.showScrollTop = scrollTop > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
