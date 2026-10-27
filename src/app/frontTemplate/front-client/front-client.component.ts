import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../entity/user';
import { WebsitesService } from '../../services/websites.service';
import { Website } from '../../entity/website';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-front-client',
  templateUrl: './front-client.component.html',
  styleUrls: ['./front-client.component.css']
})
export class FrontClientComponent implements OnInit, OnDestroy {
  headersHelpOpen = false;
  url: string = '';
  result: any;
  userId!: number;
  user!: User;
  websites: Website[] = [];
  loading: boolean = false;
  addingWebsite = false;
  monitoringError = '';
  refreshTimer: ReturnType<typeof setInterval> | undefined;
  showScrollTop: boolean = false;
  readonly currentYear = new Date().getFullYear();
  emailCopyLabel = 'Copy email';

  constructor(
    private userService: UserService,
    private websitesService: WebsitesService
  ) {}

  ngOnInit(): void {
    this.user = new User();

    this.userService.me().subscribe(
      data => {
        this.user = data;
        this.userId = data.id!;
        this.getWebsitesByUserId();
      },
      error => console.error(error)
    );
    // Check saved sites every five minutes while the dashboard is open.
    this.refreshTimer = setInterval(() => {
      if (!document.hidden && !this.loading && this.websites.length > 0) this.updatedCheck();
    }, 300000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  // Listen to scroll event from window
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollTop = window.scrollY > 300;
  }

  checkWebsite() {
    if (!this.url.trim()) return;
    this.addWebsite(this.url.trim());
  }

  addWebsite(url: string) {
    this.addingWebsite = true;
    this.monitoringError = '';
    this.websitesService.createWebsite({ url, user_id: this.user.id }).subscribe(
      (response: Website) => {
        this.websites.push(response);
        this.result = { availability: { status: response.availability }, ssl: { status: response.ssl_status, expires_in_days: response.expires_in } };
        this.url = '';
        this.addingWebsite = false;
      },
      error => {
        this.monitoringError = error.error?.error || 'Could not add and check this website.';
        this.addingWebsite = false;
      }
    );
  }

  getWebsitesByUserId() {
    if (!this.userId) return;
    this.websitesService.getWebsitesByUser(this.userId).subscribe(
      (data: Website[]) => { this.websites = data; },
      error => console.error('Error fetching websites:', error)
    );
  }

  updatedCheck() {
    this.loading = true;

    const requests = this.websites.map(website => {
      if (website.url) {
        return this.websitesService.checkWebsite(website.id!).toPromise().then(
          checked => {
            if (!checked) return null;
            const index = this.websites.findIndex(item => item.id === checked.id);
            if (index !== -1) this.websites[index] = checked;
            return checked;
          },
          error => {
            console.error(`Error checking ${website.url}:`, error);
            return null;
          }
        );
      }
      return Promise.resolve(null);
    });

    Promise.allSettled(requests).then(() => {
      this.loading = false;
    });
  }

  updateWebsite(website: Website) {
    if (!website.url) return;

    this.websitesService.checkWebsite(website.id!).subscribe(
      updatedWebsite => {
        const index = this.websites.findIndex(w => w.id === website.id);
        if (index !== -1) this.websites[index] = updatedWebsite;
      },
      error => console.error('Error checking website:', error)
    );
  }

  deleteWebsite(id: number) {
    if (confirm('Are you sure you want to delete this website?')) {
      this.websitesService.deleteWebsite(id).subscribe(
        response => {
          this.websites = this.websites.filter(website => website.id !== id);
        },
        error => console.error('Error deleting website:', error)
      );
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading = true;

      Papa.parse(file, {
        complete: (result) => {
          const urls = result.data.map((row: any) => row[0]).filter((url: string) => url && url.trim());
          this.checkMultipleWebsites(urls);
        },
        header: false,
        skipEmptyLines: true
      });
    }
  }

  checkMultipleWebsites(urls: string[]) {
    const requests = urls.map(url => {
      return new Promise<void>((resolve) => {
        this.websitesService.createWebsite({ url, user_id: this.user.id }).subscribe({
          next: () => resolve(),
          error: error => { console.error(`Error adding ${url}:`, error); resolve(); }
        });
      });
    });

    Promise.allSettled(requests).then(() => {
      this.loading = false;
      this.getWebsitesByUserId();
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToSection(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (!section) {
      window.location.assign(`/h#${sectionId}`);
      return;
    }
    window.history.replaceState(null, '', `/home#${sectionId}`);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText('ghaith.selmi1905@gmail.com');
      this.emailCopyLabel = 'Copied!';
    } catch {
      this.emailCopyLabel = 'Copy unavailable';
    }
    window.setTimeout(() => this.emailCopyLabel = 'Copy email', 2000);
  }
}
