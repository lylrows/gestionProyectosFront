import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintanceComponent } from './layout/others/components/maintance/maintance.component'
import { CaucionesValidationComponent } from './layout/others/components/cauciones-validation/cauciones-validation.component'
import { ManageRoutingModule } from './layout/manage/manage-routing';

const AppRoutes: Routes = [
  { path: 'manage', loadChildren: () => import('./layout/manage/manage.module').then(x=> x.ManageModule) },
  { path: 'maintance', component: MaintanceComponent},
  { path: 'cauciones/:idSolicitud/:token', component: CaucionesValidationComponent},
  // { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [
    RouterModule.forRoot(AppRoutes, {onSameUrlNavigation: 'reload'})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
