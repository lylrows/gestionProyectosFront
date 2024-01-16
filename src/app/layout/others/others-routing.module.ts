import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaintanceComponent } from './components/maintance/maintance.component';

const routes: Routes = [
  {
    path: '',
    component: MaintanceComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})
  ],
  exports: [RouterModule]
})
export class OthersRoutingModule { }
