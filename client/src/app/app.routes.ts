import { Routes } from '@angular/router';
import { BannerList } from './components/banner-list/banner-list';
import { BannerForm } from './components/banner-form/banner-form';
import { PageNotFound } from './components/page-not-found/page-not-found';

export const routes: Routes = [
  { path: '', component: BannerList },
  { path: 'create', component: BannerForm },
  { path: 'edit/:id', component: BannerForm },
  { path: '**', component: PageNotFound },
];
