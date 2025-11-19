import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Movie} from '../core/models/movie.model';
import {MoviesService} from '../core/service/movies.service';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {catchError, Observable, of, shareReplay} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';

@Component({
  selector: 'movie-details',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './movie-details-component.html',
  styleUrl: './movie-details-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDetailsComponent {
  private route = inject(ActivatedRoute);
  private api = inject(MoviesService);
  private router = inject(Router);


  movie$: Observable<Movie | null> = this.route.paramMap.pipe(
    map(pm => pm.get('id')),
    // don't use distinctUntilChanged() — it blocks re-fetching the same id
    switchMap(id => id ? this.api.byId(id).pipe(catchError(() => of(null))) : of(null)),
    startWith(null),      // show placeholder before first value arrives
    shareReplay(1)        // cache latest for template re-subs
  );
}

