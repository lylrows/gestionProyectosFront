import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// General
import { ManageComponent } from './manage.component';
import { AdminGuard } from './admin/admin.guard';
// Components+
import { ErrorComponent } from './components/error/error.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PersonComponent } from './components/person/person.component';
import { BandejaProyectosComponent } from './components/bandeja-proyectos/bandeja-proyectos.component';
import { EstimacionProyectosComponent } from './components/estimacion-proyectos/estimacion-proyectos.component';
import { FacturacionProyectosComponent } from './components/facturacion-proyectos/facturacion-proyectos.component';
import { RegistroHorasComponent } from './components/registro-horas/registro-horas.component';
import { RegistroAvanceComponent } from './components/registro-avance/registro-avance.component';
import { BandejaSolicitudComponent } from './components/bandeja-solicitud/bandeja-solicitud.component';
import { MasivaSunatComponent } from './components/masiva-sunat/masiva-sunat.component';
import { MasivaFinancierosComponent } from './components/masiva-financieros/masiva-financieros.component';
import { IndicadorGestionComponent } from './components/indicador-gestion/indicador-gestion.component';
import { IndicadorRentabilidadComponent } from './components/indicador-rentabilidad/indicador-rentabilidad.component';
import { IndicadorRecursosComponent } from './components/indicador-recursos/indicador-recursos.component';
import { IndicadorProyectosComponent } from './components/indicador-proyectos/indicador-proyectos.component';
import { ReporteProyectosComponent } from './components/reporte-proyectos/reporte-proyectos.component';
import { ReporteRecursosComponent } from './components/reporte-recursos/reporte-recursos.component';
import { ReporteFacturacionComponent } from './components/reporte-facturacion/reporte-facturacion.component';
import { ReporteHorasExtrasComponent } from './components/reporte-horas-extras/reporte-horas-extras.component';
import { MasivaIngresosGastosComponent } from './components/masiva-ingresos-gastos/masiva-ingresos-gastos.component';
import { MantenimientoParametrosComponent } from './components/mantenimiento/mantenimiento-parametros/mantenimiento-parametros.component';
import { MantenimientoPermisosComponent } from './components/mantenimiento/mantenimiento-permisos/mantenimiento-permisos.component';
import { MantenimientoRolesComponent } from './components/mantenimiento/mantenimiento-roles/mantenimiento-roles.component';
import { ModuloControlHorasComponent } from './components/modulo-control-horas/modulo-control-horas.component';
import { LoginComponent } from './components/login/login.component';
import { ReporteExportablePdfComponent } from './components/reporte-exportable-pdf/reporte-exportable-pdf.component';
import { BandejaAdministrativaComponent } from './components/bandeja-administrativa/bandeja-administrativa.component';
import { ReporteOcupabilidadComponent } from './components/reporte-ocupabilidad/reporte-ocupabilidad.component';
import { ReporteMargenContribucionPersonalComponent } from './components/reporte-margen-contribucion-personal/reporte-margen-contribucion-personal.component';

const broutes: Routes = [
  {
    path: '',
    component: ManageComponent,
    children: [
      { path: '', component: LoginComponent},
      { path: 'login', component: LoginComponent },
      { path: 'inicio', component: DashboardComponent, canActivate: [AdminGuard] },
      { path: 'bandeja-personal', component: PersonComponent, canActivate: [AdminGuard] },
      { path: 'bandeja-proyectos', component: BandejaProyectosComponent, canActivate: [AdminGuard] },
      { path: 'estimacion-proyectos', component: EstimacionProyectosComponent, canActivate: [AdminGuard] },
      { path: 'facturacion-proyectos', component: FacturacionProyectosComponent, canActivate: [AdminGuard] },
      { path: 'registro-horas', component: RegistroHorasComponent, canActivate: [AdminGuard] },
      { path: 'registro-avance', component: RegistroAvanceComponent, canActivate: [AdminGuard] },
      { path: 'modulo-control-horas', component: ModuloControlHorasComponent, canActivate: [AdminGuard] },
      { path: 'bandeja-solicitud', component: BandejaSolicitudComponent, canActivate: [AdminGuard] },
      { path: 'masiva-sunat', component: MasivaSunatComponent, canActivate: [AdminGuard] },
      { path: 'masiva-financieros', component: MasivaFinancierosComponent, canActivate: [AdminGuard] },
      { path: 'masiva-gastos-ingresos', component: MasivaIngresosGastosComponent, canActivate: [AdminGuard] },
      { path: 'indicador-gestion', component: IndicadorGestionComponent, canActivate: [AdminGuard] },
      { path: 'indicador-rentabilidad', component: IndicadorRentabilidadComponent, canActivate: [AdminGuard] },
      { path: 'indicador-recursos', component: IndicadorRecursosComponent, canActivate: [AdminGuard] },
      { path: 'indicador-proyectos', component: IndicadorProyectosComponent, canActivate: [AdminGuard] },
      { path: 'reporte-proyectos', component: ReporteProyectosComponent, canActivate: [AdminGuard] },
      { path: 'reporte-recursos', component: ReporteRecursosComponent, canActivate: [AdminGuard] },
      { path: 'reporte-facturacion', component: ReporteFacturacionComponent, canActivate: [AdminGuard] },
      { path: 'reporte-ocupabilidad', component: ReporteOcupabilidadComponent, canActivate: [AdminGuard] },
      { path: 'reporte-horas-extras', component: ReporteHorasExtrasComponent, canActivate: [AdminGuard] },
      { path: 'mantenimiento-parametros', component: MantenimientoParametrosComponent, canActivate: [AdminGuard] },
      { path: 'mantenimiento-permisos', component: MantenimientoPermisosComponent, canActivate: [AdminGuard] },
      { path: 'mantenimiento-roles', component: MantenimientoRolesComponent, canActivate: [AdminGuard] },
      { path: 'error', component: ErrorComponent },
      { path: 'bandeja-administrativa', component:BandejaAdministrativaComponent},
      { path: 'reporte-exportable-pdf', component: ReporteExportablePdfComponent, canActivate: [AdminGuard] },
      { path: 'reporte-contribucion', component: ReporteMargenContribucionPersonalComponent, canActivate: [AdminGuard]}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(broutes)],
  declarations: [],
  exports: [RouterModule]
})

export class ManageRoutingModule { }
