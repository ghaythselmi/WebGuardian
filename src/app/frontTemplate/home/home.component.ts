import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  showScrollTop = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollTop = (window.pageYOffset || document.documentElement.scrollTop) > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
