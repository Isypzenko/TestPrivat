import { Routes } from '@angular/router';
import { BannerList } from './components/banner-list/banner-list';
import { BannerForm } from './components/banner-form/banner-form';

export const routes: Routes = [
  { path: '', component: BannerList },
  { path: 'create', component: BannerForm },
  { path: 'edit/:id', component: BannerForm },
];
