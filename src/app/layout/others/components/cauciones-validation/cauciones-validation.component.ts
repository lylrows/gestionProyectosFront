import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CaucionesvalidationService } from '../../services/caucionesvalidation.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-cauciones-validation',
  templateUrl: './cauciones-validation.component.html',
  styleUrls: ['./cauciones-validation.component.css']
})
export class CaucionesValidationComponent implements OnInit, AfterViewInit  {

  versionApp: string = environment.versionApp;
  dateIinit: string;
  dateFin: string;

  constructor(
    private caucionServie: CaucionesvalidationService,
    private actRoute: ActivatedRoute,    
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.getDataPolicy();
  }

  ngAfterViewInit() {
    // Swal.fire({
    //   type: 'error',
    //   title: 'Error en la validación',
    //   text: 'La Póliza consultada no se encuentra en nuestra Plataforma de Seguros',
    // });
  }

  getDataPolicy() {
    debugger;
    const idSolicitud = this.actRoute.params["value"]["idSolicitud"];
    //const nroPoliza = this.actRoute.params["value"]["nroPoliza"];
    const token = this.actRoute.params["value"]["token"];
    console.log('idSolicitud', idSolicitud);
    console.log('token', token);

    this.caucionServie.getInfoPolicyCauciones({
      idSolicitud: idSolicitud,
      nroPoliza: '0',
      token: token
    }).subscribe((res: any) => {
      debugger;
      
      if(res != null) {
        console.log(res, 'res');
        // Swal.fire(
        //   'Validación Exitosa',
        //   `<div style='text-align: left'>
        //     <strong>Nro. Póliza: 00000050</strong><br>
        //     <strong>Datos del Contratante</strong><br>
        //     <span>Doc. RUC | Nro.Doc.: 2020550754763 | Razon Social: Empresa SAC</span><br>
        //     <strong>Datos de Póliza</strong><br>
        //     <span>Tipo: CaucionesAduaneras | Cobertura: Fiel Cumplimiento | Moneda: Soles | Suma Asegurada: 280000 | Ini. Vig.: 01/01/2020 | Fin Fig.: 01/05/2020</span>
        //     <strong>Datos del Beneficiario</strong><br>
        //     <span>Doc. RUC | Nro.Doc.: 20857455082 | Razon Social: Municipalidad de Juliaca</span>
        //   </div>`,
        //   'success'
        // );

        Swal.fire(
          'Validación Exitosa',
          `<div style='text-align: left'>
            <strong>Nro. Póliza: ${res.nnumerO_POLIZA}</strong><br>
            <strong>Datos del Contratante</strong><br>
            <span>Doc.: ${res.stipodoC_CONTRATANTE} | Nro.Doc.: ${res.snumerodoC_CONTRATANTE} | Razón Social: ${res.srazonsociaL_CONTRATANTE}</span><br>
            <strong>Datos de la Póliza</strong><br>
            <span>Tipo: ${res.stipO_CAUCION}  | Cobertura: ${res.scobertura}  | Moneda: ${res.smoneda}  | Suma Asegurada: ${res.nsumA_ASEGURADA}  | Ini. Vig.: ${this.datePipe.transform(res.diniciO_VIGENCIA, 'dd-MM-yyyy')}  | Fin Vig.: ${this.datePipe.transform(res.dfiN_VIGENCIA, 'dd-MM-yyyy')} </span><br>
            <strong>Datos del Beneficiario</strong><br>
            <span>Doc. ${res.stipodoC_BENEFICIARIO}  | Nro.Doc.: ${res.snumerodoC_BENEFICIARIO}  | Razón Social: ${res.srazonsociaL_BENEFICIARIO} </span>
          </div>`,
          'success'
        );

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en la validación',
          text: 'La Póliza consultada no se encuentra en nuestra Plataforma de Seguros',
        });
      }
    });
  }

}
