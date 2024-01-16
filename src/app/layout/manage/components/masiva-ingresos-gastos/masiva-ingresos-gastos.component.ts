import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { MassiveloadService } from '../../services/massiveload/massiveload.service';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { FilterMassive, MassiveEntity } from '../../model/massive/massive';

@Component({
  selector: 'app-masiva-ingresos-gastos',
  templateUrl: './masiva-ingresos-gastos.component.html',
  styleUrls: ['./masiva-ingresos-gastos.component.css']
})
export class MasivaIngresosGastosComponent implements OnInit {
  public BreadLevel01 = 'Carga Información';
  public Title = 'Carga INGRESOS / GASTOS';

  @ViewChild('fileInput')
  fileInput: ElementRef;

  @ViewChild('filename')
  filename: ElementRef;
  
  public bsConfigInicio: Partial<BsDatepickerConfig>;
  dateRange: Date[];

  public selectedFile: File;
  idSelectedType: Number = 1;
  filterMassive: FilterMassive = new FilterMassive();
  listEntityMassive: MassiveEntity[];
  startDateFilter: any;
  endDateFilter: any;
  listMoneys: any[] = [
    {
      nid_money: 1,
      name: "SOLES"
    },
    {
      nid_money: 2,
      name: "DOLARES"
    }
  ];
  listType: any[] = [
    {
      nid_type: 1,
      name: "INGRESOS"
    },
    {
      nid_type: 2,
      name: "GASTOS"
    }
  ];
  currentPage = 1; // seteamos a la pagina 1
  itemsPerPage = 5; // mostramos 5 registros por pagina
  totalItems = 0; // Total de registro

  constructor(    
    private spinner: NgxSpinnerService,
    private massiveService: MassiveloadService
  ) {     
    moment.locale('es');
    defineLocale('es', esLocale);
  }

  ngOnInit() {
    this.bsConfigInicio = Object.assign({},
      {
        dateInputFormat: 'YYYY/MM/DD',
        locale: 'es',
        containerClass: 'theme-blue',
        showWeekNumbers: false,
        isAnimated: true
      });
      var date = new Date();
      this.dateRange = [new Date(date.getFullYear(), date.getMonth(), 1), new Date(date.getFullYear(), date.getMonth(), date.getDate())];

      this.filterMassive.pagination.CurrentPage = this.currentPage;
      this.filterMassive.pagination.ItemsPerPage = this.itemsPerPage;
      this.filterMassive.pagination.TotalItems = this.totalItems;
      this.getListFilter();
  }

  onFileChanged(event) {
    debugger;
    let _fileSizes = 0;
    const cantidad = event.target.files.length;

    // if (parseInt((_fileSizes / 1024 / 1024).toFixed(1)) > environment.MaxFileSizeLoadMB) {
    //   Swal.fire('El tamaño máximo permitido es: ' + environment.MaxFileSizeLoadMB + "MB");
    //   this.spinner.hide();
    //   this.deletefile();
    //   return;
    // } 
      this.selectedFile = event.target.files[0];

    console.log('this.selectedFiles', this.selectedFile);
  }

  cargarArchivo() {
    if(this.selectedFile != null && typeof this.selectedFile != 'undefined') {

      this.spinner.show();
      const objSessionUser = JSON.parse(sessionStorage.getItem('User'));
      const formData = new FormData();
      formData.append('iduser', JSON.stringify(objSessionUser.niduser));
      formData.append('idtipo', JSON.stringify(this.idSelectedType));
      formData.append(this.selectedFile.name, this.selectedFile);
      this.massiveService.uploadFiles(formData).pipe(
        map(event => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              break;
            case HttpEventType.Response:
              return event;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          
          // obj.inProgress = false;
          console.log('error HttpErrorResponse', error);
          Swal.fire({
            icon: 'error',
            text: 'El Archivo fallo la cargar.',
            preConfirm: () => {
              this.selectedFile = null;                
              this.filename.nativeElement.value = "";
              this.fileInput.nativeElement.value = "";
            }
          });
          return of(`${"archivo"} fallo la cargar.`);
        })
      ).subscribe((event: any) => {
        debugger;
        if (typeof (event) === 'object') {
          
          if (event.body.resultado == 0 || event.body.resultado == -1) {// se encontro un error
            this.spinner.hide();
            Swal.fire({
              icon: 'error',
              text: event.body.mensaje,
              preConfirm: () => {
                this.selectedFile = null;                
                this.filename.nativeElement.value = "";
                this.fileInput.nativeElement.value = "";
              }
            });
          } else {
            Swal.fire({
              icon: 'success',
              text: event.body.mensaje,
              preConfirm: () => {
                this.filename.nativeElement.value = "";
                this.fileInput.nativeElement.value = "";
                this.selectedFile = null;
              }
            });  
            this.spinner.hide();
          }
        }
      },
      error => {
        this.spinner.hide();
        console.log('Ocurrio un error')
      },
      () => {
        this.spinner.hide();
        console.log('Termino proceso de Carga!!!')
      });

    } else {
      Swal.fire({
        icon: 'info',
        text: 'Por favor seleccione un archivo',
      });
    }
  }
  
  selectedType(id: Number): void {
      this.idSelectedType = id;
  }

  search(): void {
    debugger;
    const ngbDateStructI = {
      day: this.dateRange[0].getDate(),
      month: this.dateRange[0].getMonth() + 1,
      year: this.dateRange[0].getFullYear()
    };
    const ngbDateStructf = {
      day: this.dateRange[1].getDate(),
      month: this.dateRange[1].getMonth() + 1,
      year: this.dateRange[1].getFullYear()
    };
    this.startDateFilter = ngbDateStructI;
    this.endDateFilter = ngbDateStructf;
    // this.filterMassive.ntype = this.idSelectedType;
    this.filterMassive.fechaproceso_ini = this.FormatDate(this.startDateFilter, 'S');
    this.filterMassive.fechaproceso_fin = this.FormatDate(this.endDateFilter, 'E');
    this.filterMassive.ntype = Number(this.filterMassive.ntype);
    this.filterMassive.nmoney = Number(this.filterMassive.nmoney);
    this.getListFilter();
  }

  FormatDate(fec: any, type: string): string {
    const hdia = fec.day.toString().padStart(2, '0');
    const hmes = fec.month.toString().padStart(2, '0');
    const hanio = fec.year.toString();
    return hanio + '-' + hmes + '-' + hdia;
  }

  getListFilter(): void {
    this.spinner.show();
    this.massiveService.getListMassive(this.filterMassive).subscribe(
      (res: any) => {
        console.log(res);
        try {
          this.spinner.hide();
          this.listEntityMassive = res.data;
          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.listEntityMassive = null;
          this.totalItems = 0;
        }
      },
    );
  }

  ChangeRegistroPorPagina() {
    this.filterMassive.pagination.ItemsPerPage = Number(this.itemsPerPage);
    this.getListFilter();
  }

  RegistersExist(): boolean {
    let resultado = true;
    if(this.listEntityMassive == null || typeof this.listEntityMassive == 'undefined') resultado = false;
    if(this.listEntityMassive.length == 0) resultado = false;

    return resultado;
  }

  pageChanged(event: any): void {
    this.filterMassive.pagination.CurrentPage = event;
    this.getListFilter();
  };
}
