import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  lastScrollTop = 0;
  navbarVisible = true;
  scrollThreshold = 120; 

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (scrollTop > this.scrollThreshold) {
      if (scrollTop > this.lastScrollTop) {
        // scrolling down
        this.navbarVisible = false;
      } else {
        // scrolling up
        this.navbarVisible = true;
      }
    } else {
      // always show navbar near the top
      this.navbarVisible = true;
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
  }
}
