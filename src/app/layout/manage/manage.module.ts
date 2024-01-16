import { LOCALE_ID, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, registerLocaleData,DecimalPipe, LocationStrategy, HashLocationStrategy } from '@angular/common';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxSpinnerModule } from 'ngx-spinner';
// import { NgxEchartsModule } from 'ngx-echarts';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { RecaptchaModule } from 'ng-recaptcha';
import localeEs from '@angular/common/locales/es-PE';
registerLocaleData(localeEs, 'es-PE');

// Modules
import { ManageRoutingModule } from './manage-routing';

// Components
import { environment } from 'src/environments/environment';
import { ManageComponent } from './manage.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { MenuComponent } from './shared/components/menu/menu.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ErrorComponent } from './components/error/error.component';
// import {NgxMaskModule, IConfig } from 'ngx-mask';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
// import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { MatDialogModule } from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs'
import { PersonComponent } from './components/person/person.component';
import { BandejaProyectosComponent } from './components/bandeja-proyectos/bandeja-proyectos.component';
import { EstimacionProyectosComponent } from './components/estimacion-proyectos/estimacion-proyectos.component';
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
import { FacturacionProyectosComponent } from './components/facturacion-proyectos/facturacion-proyectos.component';
import { ProjectComponent } from './components/project/project.component';
import { MasivaIngresosGastosComponent } from './components/masiva-ingresos-gastos/masiva-ingresos-gastos.component';
import { RegistroHitosComponent } from './components/registro-hitos/registro-hitos.component';
import { RegistroEstimacionComponent } from './components/registro-estimacion/registro-estimacion.component';
import { RegistroPagosComponent } from './components/registro-pagos/registro-pagos.component';
import { RegistroHorasDetalleComponent } from './components/registro-horas-detalle/registro-horas-detalle.component';
import { RegistroHorasConceptoComponent } from './components/registro-horas-concepto/registro-horas-concepto.component';
import { AvanceProyectoComponent } from './components/avance-proyecto/avance-proyecto.component';
import { MantenimientoParametrosComponent } from './components/mantenimiento/mantenimiento-parametros/mantenimiento-parametros.component';
import { MantenimientoPermisosComponent } from './components/mantenimiento/mantenimiento-permisos/mantenimiento-permisos.component';
import { MantenimientoRolesComponent } from './components/mantenimiento/mantenimiento-roles/mantenimiento-roles.component';
import { EditParametroComponent } from './components/mantenimiento/mantenimiento-parametros/edit-parametro/edit-parametro.component';
import { ModalEditarComponent } from './components/bandeja-solicitud/modal-editar/modal-editar.component';
import { RegistroSolicitudComponent } from './components/bandeja-solicitud/modal-registro/registro-solicitud/registro-solicitud.component';
import { ControlHorasComponent } from './components/control-horas/control-horas.component';
import { AvanceProyectoModalComponent } from './components/registro-avance/avance-proyecto-modal/avance-proyecto-modal.component';
import { ModuloControlHorasComponent } from './components/modulo-control-horas/modulo-control-horas.component';
import { PersonModalComponent } from './components/person/person-modal/person-modal.component';
import { LoginComponent } from './components/login/login.component';
import { ModalIndicadorProyectoComponent } from './components/indicador-gestion/modal-indicador-proyecto/modal-indicador-proyecto.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ClienteComponent } from './components/cliente/cliente.component';
import { ReporteControlCambiosComponent } from './components/reporte-control-cambios/reporte-control-cambios.component';
import { ReporteExportablePdfComponent } from './components/reporte-exportable-pdf/reporte-exportable-pdf.component';
import { BandejaAdministrativaComponent } from './components/bandeja-administrativa/bandeja-administrativa.component';
import { RegistroProveedorExternoComponent } from './components/registro-horas-detalle/registro-proveedor-externo/registro-proveedor-externo.component';
import { ReporteHorasExtrasComponent } from './components/reporte-horas-extras/reporte-horas-extras.component';
import { ReporteOcupabilidadComponent } from './components/reporte-ocupabilidad/reporte-ocupabilidad.component';
import { ReportePersonaComponent } from './components/reporte-horas-extras/reporte-persona/reporte-persona.component';
import { ReporteMargenContribucionPersonalComponent } from './components/reporte-margen-contribucion-personal/reporte-margen-contribucion-personal.component';
import { FiltroPipe } from './Pipe/filtro.pipe';


// const maskConfigFunction: Partial<IConfig> = {
//    validation: false,
//  };

@NgModule({
   declarations: [
      ManageComponent,
      LoginComponent,
      HeaderComponent,
      FooterComponent,
      MenuComponent,
      DashboardComponent,
      DashboardComponent,
      ErrorComponent,
      PersonComponent,
      BandejaProyectosComponent,
      EstimacionProyectosComponent,
      FacturacionProyectosComponent,
      RegistroHorasComponent,
      RegistroAvanceComponent,
      BandejaSolicitudComponent,
      MasivaSunatComponent,
      MasivaFinancierosComponent,
      IndicadorGestionComponent,
      IndicadorRentabilidadComponent,
      IndicadorRecursosComponent,
      IndicadorProyectosComponent,
      ReporteProyectosComponent,
      ReporteRecursosComponent,
      ReporteFacturacionComponent,
      ProjectComponent,
      MasivaIngresosGastosComponent,
      RegistroHitosComponent,
      RegistroEstimacionComponent,
      RegistroPagosComponent,
      RegistroHorasDetalleComponent,
      RegistroHorasConceptoComponent,
      AvanceProyectoComponent,
      MantenimientoParametrosComponent,
      MantenimientoPermisosComponent,
      MantenimientoRolesComponent,
      EditParametroComponent,
      ModalEditarComponent,
      RegistroSolicitudComponent,
      ControlHorasComponent,
      AvanceProyectoModalComponent,
      ModuloControlHorasComponent,
      PersonModalComponent,
      ModalIndicadorProyectoComponent,
      ClienteComponent,
      ReporteControlCambiosComponent,
      ReporteExportablePdfComponent,
      BandejaAdministrativaComponent,
      RegistroProveedorExternoComponent,
      ReporteHorasExtrasComponent,
      ReporteOcupabilidadComponent,
      ReportePersonaComponent,
      ReporteMargenContribucionPersonalComponent,
      FiltroPipe
   ],
   imports: [
      ManageRoutingModule,
      // FilterPipeModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientModule,
      NgbModule,
      // NgSelectModule, 
      NgxSpinnerModule,
      MatDialogModule,
      MatTabsModule,
      RecaptchaModule,
      RecaptchaV3Module,
      MatAutocompleteModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
      // NgxEchartsModule,
      // NgxMaskModule.forRoot(maskConfigFunction),
      BsDatepickerModule.forRoot(),
   ],
   providers: [DatePipe,DecimalPipe,
      { provide: LocationStrategy, useClass: HashLocationStrategy },
      { provide: LOCALE_ID, useValue: 'es-PE' },
      { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.CAPTCHA_KEY_V3 },
      // { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }, REVISAR
   ],
   bootstrap: [
      ManageComponent
   ],
   // entryComponents: [
   //    FrameComponent
   //  ]
})

export class ManageModule {

}
