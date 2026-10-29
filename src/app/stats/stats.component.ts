import { Component, OnDestroy, OnInit } from '@angular/core';
import { Website } from '../entity/website';
import { WebsiteCheck, WebsitesService } from '../services/websites.service';

type Period = '24h' | '7d' | '30d' | 'all';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, OnDestroy {
  websites: Website[] = [];
  selectedWebsiteId?: number;
  checkHistory: WebsiteCheck[] = [];
  period: Period = '7d';
  siteSearch = '';
  isLoading = true;
  historyLoading = false;
  errorMessage = '';
  private refreshTimer?: ReturnType<typeof setInterval>;

  readonly periods: Array<{ id: Period; label: string }> = [
    { id: '24h', label: '24 hours' }, { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' }, { id: 'all', label: 'All time' }
  ];

  constructor(private readonly websitesService: WebsitesService) {}

  ngOnInit(): void {
    this.loadWebsites();
    this.refreshTimer = setInterval(() => this.loadWebsites(), 300000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  loadWebsites(): void {
    this.websitesService.getWebsites().subscribe({
      next: websites => {
        this.websites = websites;
        if (!this.websites.some(site => site.id === this.selectedWebsiteId)) this.selectedWebsiteId = this.websites[0]?.id;
        this.isLoading = false;
        this.loadHistory();
      },
      error: () => { this.errorMessage = 'Could not load your monitored websites.'; this.isLoading = false; }
    });
  }

  selectWebsite(id: number | undefined): void {
    if (id === this.selectedWebsiteId) return;
    this.selectedWebsiteId = id;
    this.loadHistory();
  }

  loadHistory(): void {
    if (!this.selectedWebsiteId) { this.checkHistory = []; this.historyLoading = false; return; }
    this.historyLoading = true;
    this.errorMessage = '';
    this.websitesService.getWebsiteChecks(this.selectedWebsiteId).subscribe({
      next: checks => { this.checkHistory = checks.slice().reverse(); this.historyLoading = false; },
      error: () => { this.checkHistory = []; this.errorMessage = 'Could not load monitoring history. Try refreshing or running a check.'; this.historyLoading = false; }
    });
  }

  get selectedWebsite(): Website | undefined { return this.websites.find(site => site.id === this.selectedWebsiteId); }
  get filteredWebsites(): Website[] {
    const query = this.siteSearch.trim().toLowerCase();
    return this.websites.filter(site => !query || (site.url || '').toLowerCase().includes(query) || (site.page_title || '').toLowerCase().includes(query));
  }
  get visibleHistory(): WebsiteCheck[] {
    if (this.period === 'all') return this.checkHistory;
    const hours = this.period === '24h' ? 24 : this.period === '7d' ? 168 : 720;
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.checkHistory.filter(check => new Date(check.checkedAt).getTime() >= cutoff);
  }
  get uptimeRate(): number {
    const history = this.visibleHistory;
    return history.length ? Math.round(history.filter(check => check.availability === 'Online').length * 100 / history.length) : 0;
  }
  get averageResponseMs(): number | null {
    const samples = this.visibleHistory.map(check => check.responseTimeMs).filter((value): value is number => value !== null);
    return samples.length ? Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length) : null;
  }
  get fastestResponseMs(): number | null {
    const samples = this.visibleHistory.map(check => check.responseTimeMs).filter((value): value is number => value !== null);
    return samples.length ? Math.min(...samples) : null;
  }
  get incidentCount(): number { return this.visibleHistory.filter(check => check.availability !== 'Online').length; }
  get latestCheck(): WebsiteCheck | undefined { return this.visibleHistory[this.visibleHistory.length - 1]; }
  get latencyPoints(): Array<{ x: number; y: number; value: number }> {
    const samples = this.visibleHistory.map(check => check.responseTimeMs);
    const valid = samples.filter((value): value is number => value !== null);
    const max = Math.max(...valid, 1);
    const min = Math.min(...valid, 0);
    const range = Math.max(max - min, max * .18, 1);
    return samples.flatMap((value, index) => value === null ? [] : [{
      x: samples.length <= 1 ? 380 : 48 + index * 664 / (samples.length - 1),
      y: 176 - (value - min) / range * 126,
      value
    }]);
  }
  get responsePoints(): string { return this.latencyPoints.map(point => `${point.x},${point.y}`).join(' '); }
  get chartArea(): string {
    const points = this.latencyPoints;
    return points.length > 1 ? `48,184 ${points.map(point => `${point.x},${point.y}`).join(' ')} 712,184` : '';
  }
  get chartMax(): number { return Math.max(...this.visibleHistory.map(check => check.responseTimeMs ?? 0), 0); }
  get recentHistory(): WebsiteCheck[] { return this.visibleHistory.slice(-30); }
  get lastCheckedLabel(): string {
    const date = this.selectedWebsite?.last_check;
    return date ? new Date(date).toLocaleString() : 'No checks yet';
  }
  siteLabel(site: Website): string { return site.page_title?.trim() || this.domain(site.url); }
  domain(url?: string): string {
    if (!url) return 'Unknown website';
    try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, ''); }
    catch { return url; }
  }
  initials(site: Website): string { return this.domain(site.url).replace(/^www\./, '').slice(0, 1).toUpperCase(); }
  isOnline(site: Website): boolean { return (site.availability || '').toLowerCase() === 'online'; }
}
