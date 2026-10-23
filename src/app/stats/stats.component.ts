import { Component, OnDestroy, OnInit } from '@angular/core';
import { Website } from '../entity/website';
import { WebsiteCheck, WebsitesService } from '../services/websites.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, OnDestroy {
  websites: Website[] = [];
  selectedWebsiteId?: number;
  checkHistory: WebsiteCheck[] = [];
  isLoading = true;
  historyLoading = false;
  errorMessage = '';
  private refreshTimer?: ReturnType<typeof setInterval>;

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

  get responsePoints(): string { return this.latencyPoints.map(point => `${point.x},${point.y}`).join(' '); }
  get recentHistory(): WebsiteCheck[] { return this.checkHistory.slice(-30); }
}
