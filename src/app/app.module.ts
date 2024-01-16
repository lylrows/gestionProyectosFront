import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
// import { FilterPipeModule } from 'ngx-filter-pipe';
import { registerLocaleData } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RecaptchaModule, RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { NgxEchartsModule } from 'ngx-echarts';
import localeEs from '@angular/common/locales/es-PE';
registerLocaleData(localeEs, 'es-PE');
import { HttpConfigInterceptor } from './layout/interceptor/HttpConfig';
// modules
import { AppRoutingModule } from './app-routing';
// components
import { AppComponent } from './app.component';
// enviroments
import { environment } from 'src/environments/environment';
// import { FormlyModule } from '@ngx-formly/core';
// import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MaintanceComponent } from './layout/others/components/maintance/maintance.component';
import { CaucionesValidationComponent } from './layout/others/components/cauciones-validation/cauciones-validation.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({ 
   declarations: [
      AppComponent,
      MaintanceComponent,
      CaucionesValidationComponent,
      //AvanceProyectoComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      // FilterPipeModule,
      CommonModule,
      FormsModule,
      HttpClientModule,
      NgbModule,
      NgxSpinnerModule,
      RecaptchaModule,
      // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
      // NgxEchartsModule,
      ReactiveFormsModule,
      // FormlyModule.forRoot(),
      // FormlyBootstrapModule,
      FormsModule,
      MatAutocompleteModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      BsDatepickerModule.forRoot(),
      BrowserAnimationsModule
   ],
   providers: [DatePipe,
      { provide: LOCALE_ID, useValue: 'en-US' },
      { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
   ],
   bootstrap: [
      AppComponent
   ]
})

export class AppModule {

}
