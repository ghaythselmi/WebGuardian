import { Component,HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  lastScrollTop = 0;
  navbarVisible = true;
  scrollThreshold = 120; 

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.scrollThreshold) {
      if (scrollTop > this.lastScrollTop) {
        
        this.navbarVisible = false;
      } else {
        
        if (scrollTop <= this.scrollThreshold) {
          this.navbarVisible = true;
        }
      }
    } else {
      this.navbarVisible = true; 
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
  }
}
