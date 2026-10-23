import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../entity/user';
import { WebsitesService, WebsiteCheck } from '../../services/websites.service';
import { Website } from '../../entity/website';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-front-client',
  templateUrl: './front-client.component.html',
  styleUrls: ['./front-client.component.css']
})
export class FrontClientComponent implements OnInit, OnDestroy {
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
  selectedWebsiteId?: number;
  checkHistory: WebsiteCheck[] = [];
  historyLoading = false;
  historyError = '';

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
    // Refresh the saved results; the backend scheduler performs the actual checks.
    this.refreshTimer = setInterval(() => this.getWebsitesByUserId(), 300000);
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

  selectHistoryWebsite(id: number | undefined): void {
    this.selectedWebsiteId = id;
    this.loadCheckHistory();
  }

  loadCheckHistory(): void {
    if (!this.selectedWebsiteId) { this.checkHistory = []; this.historyLoading = false; return; }
    this.historyLoading = true;
    this.historyError = '';
    this.websitesService.getWebsiteChecks(this.selectedWebsiteId).subscribe({
      next: checks => { this.checkHistory = checks.slice().reverse(); this.historyLoading = false; },
      error: () => { this.checkHistory = []; this.historyError = 'Could not load monitoring history.'; this.historyLoading = false; }
    });
  }

  get uptimeRate(): number {
    return this.checkHistory.length ? Math.round(this.checkHistory.filter(check => check.availability === 'Online').length * 100 / this.checkHistory.length) : 0;
  }

  get averageResponseMs(): number | null {
    const samples = this.checkHistory.map(check => check.responseTimeMs).filter((value): value is number => value !== null);
    return samples.length ? Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length) : null;
  }

  get latencyPoints(): Array<{ x: number; y: number; value: number }> {
    const samples = this.checkHistory.map(check => check.responseTimeMs);
    const valid = samples.filter((value): value is number => value !== null);
    const max = Math.max(...valid, 1);
    return samples.flatMap((value, index) => value === null ? [] : [{
      x: samples.length <= 1 ? 380 : 40 + index * 680 / (samples.length - 1),
      y: 184 - value / max * 145,
      value
    }]);
  }

  get responsePoints(): string {
    return this.latencyPoints.map(point => `${point.x},${point.y}`).join(' ');
  }

  get recentHistory(): WebsiteCheck[] { return this.checkHistory.slice(-30); }

  addWebsite(url: string) {
    this.addingWebsite = true;
    this.monitoringError = '';
    this.websitesService.createWebsite({ url, user_id: this.user.id }).subscribe(
      (response: Website) => {
        this.websites.push(response);
        this.selectedWebsiteId = response.id;
        this.result = { availability: { status: response.availability }, ssl: { status: response.ssl_status, expires_in_days: response.expires_in } };
        this.loadCheckHistory();
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
      (data: Website[]) => {
        this.websites = data;
        if (!this.websites.some(site => site.id === this.selectedWebsiteId)) this.selectedWebsiteId = this.websites[0]?.id;
        this.loadCheckHistory();
      },
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
      this.loadCheckHistory();
    });
  }

  updateWebsite(website: Website) {
    if (!website.url) return;

    this.websitesService.checkWebsite(website.id!).subscribe(
      updatedWebsite => {
        const index = this.websites.findIndex(w => w.id === website.id);
        if (index !== -1) this.websites[index] = updatedWebsite;
        if (website.id === this.selectedWebsiteId) this.loadCheckHistory();
      },
      error => console.error('Error checking website:', error)
    );
  }

  deleteWebsite(id: number) {
    if (confirm('Are you sure you want to delete this website?')) {
      this.websitesService.deleteWebsite(id).subscribe(
        response => {
          this.websites = this.websites.filter(website => website.id !== id);
          if (this.selectedWebsiteId === id) {
            this.selectedWebsiteId = this.websites[0]?.id;
            this.loadCheckHistory();
          }
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
}
