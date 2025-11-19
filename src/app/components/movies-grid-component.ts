import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Movie} from '../core/models/movie.model';
import {MoviesService} from '../core/service/movies.service';
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from '@angular/router';
import {CacheImgDirective} from '../shared/cache-img.directive';

@Component({
  selector: 'app-movies-grid-component',
  imports: [
    RouterOutlet,
    RouterLink,
    CacheImgDirective
  ],
  templateUrl: './movies-grid-component.html',
  styleUrl: './movies-grid-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesGridComponent {
  private api = inject(MoviesService);

  limit = 8;                           // show between 5–10
  movies = signal<Movie[] | null>(null);
  loading = signal<boolean>(true);

  // selection for details panel
// server pagination
  pageSize = 8;

  pageIndex = signal(0);
  total = signal(0);
  items = signal<Movie[]>([]);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  constructor() {
   /* this.api.top(this.limit).subscribe({
      next: list => this.movies.set(list),
      error: () => this.movies.set([]),
      complete: () => this.loading.set(false)
    });*/
    this.loadPage(0);


  }

  posterSrc(raw?: string) {
    // Avoid backend proxy call; use poster URL from page response directly
    return this.api.posterSrc(raw);
  }

  loadPage(index: number) {
    this.loading.set(true);
    this.api.page(index, this.pageSize).subscribe({
      next: (pg) => {
        this.pageIndex.set(pg.page);
        this.total.set(pg.total);
        this.items.set(pg.items ?? []);
      },
      error: () => {
        this.items.set([]);
      },
      complete: () => this.loading.set(false)
    });
  }

  prev() {
    if (this.pageIndex() > 0) this.loadPage(this.pageIndex() - 1);
  }

  next() {
    if (this.pageIndex() + 1 < this.totalPages()) this.loadPage(this.pageIndex() + 1);
  }

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  // Jump to first page
  first() {
    if (this.pageIndex() > 0) this.loadPage(0);
  }

  // Jump to last page
  last() {
    const lastIdx = this.totalPages() - 1;
    if (this.pageIndex() < lastIdx) this.loadPage(lastIdx);
  }
}
