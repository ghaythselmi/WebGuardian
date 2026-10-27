import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  showScrollTop = false;
  readonly currentYear = new Date().getFullYear();
  emailCopyLabel = 'Copy email';

  async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText('ghaith.selmi1905@gmail.com');
      this.emailCopyLabel = 'Copied!';
    } catch {
      this.emailCopyLabel = 'Copy unavailable';
    }
    window.setTimeout(() => this.emailCopyLabel = 'Copy email', 2000);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollTop = (window.pageYOffset || document.documentElement.scrollTop) > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToSection(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (!section) {
      window.location.assign(`/h#${sectionId}`);
      return;
    }

    window.history.replaceState(null, '', `/h#${sectionId}`);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
