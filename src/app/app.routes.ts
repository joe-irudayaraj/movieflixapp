import {Routes} from '@angular/router';
import {MoviesGridComponent} from './components/movies-grid-component';
import {MovieDetailsComponent} from './components/movie-details-component';

export const routes: Routes = [
  {
    path: '', component: MoviesGridComponent,
    children: [
      {path: 'movie/:id', outlet: 'details', component: MovieDetailsComponent}
    ]
  },

  {path: '**', redirectTo: ''}
];
