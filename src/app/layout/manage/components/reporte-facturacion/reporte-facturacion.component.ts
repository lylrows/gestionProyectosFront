import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { MasterTable } from '../../model/common/mastertable';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProject } from '../../model/project/filterproject';
import { ProjectInvoicing, ProjectStep2 } from '../../model/project/project';
import { ClientService } from '../../services/client/client.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { PermisoService } from '../../services/common/permiso.service';
import { Client } from '../../model/client/client';

import * as fs from 'file-saver';
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
let workbook: ExcelProper.Workbook = new Excel.Workbook();


@Component({
  selector: 'app-reporte-facturacion',
  templateUrl: './reporte-facturacion.component.html',
  styleUrls: ['./reporte-facturacion.component.css']
})
export class ReporteFacturacionComponent implements OnInit {

  public BreadLevel01 = 'Reportes';
  public Title = 'Reportes de Facturación';

  filterProject: FilterProject = new FilterProject();
  projectList: any[] = [];
  currentPage: number = 1; // seteamos a la pagina 1
  itemsPerPage: number = 999; // mostramos 5 registros por pagina
  totalItems: number = 0; // Total de registro

  listState: MasterTable[] = [];
  ClientDropDownList: Client[];
  ProjectTypeDropDownList: DropDownList[];
  PersonDropDownList: DropDownList[];

  listReporteFacturacion: any[] = [];

  permisoExcel = false;

  @ViewChild('table') table: ElementRef;


  constructor(
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private mastertableService: MastertableService,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private permisoService: PermisoService
  ) {
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
  }

  ngOnInit() {
    this.filterProject.nid_status = 1;
    this.obtenerPermisos();
    this.getState();
    this.getClientDropDown();
    this.getProjectTypeDropDown();
    this.getPersonDropDown();
    this.search();
  }

  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(22).subscribe((response: any) => {
      console.log("permisos",response)
      response.forEach(element => {
        if(element.sname=="Exportar Excel"){
          this.permisoExcel = element.permission
        }        
      });
    }, (error) => {
      console.error(error);
    });
  }

  getState() {
    this.spinner.show('SpinnerProject');
    //let idFather=this.listCategory.find(x=>x.nid_mastertable_type==id).nid_mastertable;
    this.mastertableService.getmastertable(50).subscribe((response: any) => {
      this.listState = response;
      this.listState = this.listState.filter(x => x.sshort_value == "ACTIVO" ||  x.sshort_value == "CERRADO")

      this.spinner.hide('SpinnerProject');

    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getClientDropDown() {

    this.spinner.show('SpinnerProject');
    this.clientService.getDropdownlist(0).subscribe((response: any) => {
      if (response == null) {
        this.filterProject.nid_client = 0;
        return;
      }
      this.ClientDropDownList = response;
      if (this.ClientDropDownList.length > 0) {
        this.filterProject.nid_client = 0;
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getProjectTypeDropDown() {

    this.spinner.show('SpinnerProject');
    this.projectTypeService.getDropdownlist().subscribe((response: any) => {

      if (response == null) {
        this.filterProject.nid_project_type = 0;
        return;
      }
      this.ProjectTypeDropDownList = response;
      if (this.ProjectTypeDropDownList.length > 0) {
        this.filterProject.nid_project_type = 0;
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  getPersonDropDown() {
    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {

      if (response == null) {
        return;
      }
      this.PersonDropDownList = response;
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  ExportToExcel() {
    const worksheet = workbook.addWorksheet('ReporteFacturacion');
    const header = ['Responsable', 'Codigo Proyecto', 'Cliente', 'Description', '% Facturación', 'Hito', 'Moneda', 'Monto', 'Semáforo', 'Fch Planificada', 'Fch Fact', 'Fch Deposito', 'Estado'];
    const headerRow = worksheet.addRow(header);
  
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ff022a5b' } 
    };
    
    worksheet.getRow(1).font = {
      color: { argb: 'ffffff' },
      bold: true
    };

    for (let i = 1; i <= header.length; i++) {
      worksheet.getCell(1, i).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }


    worksheet.getColumn('A').width = 25;
    worksheet.getColumn('B').width = 13;
    worksheet.getColumn('C').width = 50;
    worksheet.getColumn('D').width = 20;
    worksheet.getColumn('E').width = 10;
    worksheet.getColumn('F').width = 20;
    worksheet.getColumn('G').width = 8;
    worksheet.getColumn('H').width = 17;
    worksheet.getColumn('J').width = 13;
    worksheet.getColumn('K').width = 13;
    worksheet.getColumn('L').width = 13;
    worksheet.getColumn('M').width = 19;

    worksheet.getColumn('E').style = {numFmt: '0.00%'};
    worksheet.getColumn('H').style = {numFmt: '"S/."#,##0.00;[Red]\-"S/."#,##0.00'};

    worksheet.getColumn('J').style = {numFmt: 'dd/MM/yyyy'};
    worksheet.getColumn('K').style = {numFmt: 'dd/MM/yyyy'};
    worksheet.getColumn('L').style = {numFmt: 'dd/MM/yyyy'};

    // Agregar datos a la hoja de cálculo
    this.listReporteFacturacion.forEach((item) => {
      worksheet.addRow([item[0], item[1], item[2],item[3],(item[5]/100),item[4],item[7] == 1? "Soles": "Dolares", item[8], this.indicadorSemaforo(item), this.formatDate(item[6]), this.formatDate(item[9]), this.formatDate(item[10]), item[11]]);
      const semaphoreColumnIndex = 9; // índice de la columna Semáforo (0-indexed)
      const semaphoreCell = worksheet.getCell(worksheet.rowCount, semaphoreColumnIndex ); // obtener la celda Semáforo de la última fila agregada
      
      semaphoreCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      }

      if (semaphoreCell.value === 'green') {
        semaphoreCell.font = {
          color: { argb: '00FF00' },
          size: 15
        };
      } else {
        semaphoreCell.font = {
          color: { argb: 'FF0000' },
          size: 15  
        };
      }
      semaphoreCell.value = '⚫';
    });    

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.height = 20;
    });

    // Descargar archivo
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      workbook.removeWorksheet(worksheet.id);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'ReporteFacturacion.xlsx');
    });
  }
  

  formatDate(dateString: string) {
    const dateParts = dateString.split('-');
    if(dateParts.length < 3) {
      return '';
    }
    return new Date(dateString)
  }

  search() {
    this.filterProject.nid_manager = Number(this.filterProject.nid_manager);
    this.filterProject.nid_project_type = Number(this.filterProject.nid_project_type);
    this.filterProject.nid_status = +this.filterProject.nid_status;
    this.filterProject.nid_client = Number(this.filterProject.nid_client);

    this.spinner.show();
    this.projectService.getprojectpagination(this.filterProject).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.projectList = res.data;
        this.obtenerReporteFacturacion();
        this.totalItems = res.pagination.totalItems;
      },
      error: (err) => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al obtener los registros.',
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
        this.projectList = null;
        this.totalItems = 0;
      }
    }
    );

  }

  obtenerReporteFacturacion() {
    this.listReporteFacturacion = [];

    this.projectList.forEach(proyecto => {

      var projectStep2 = lastValueFrom(this.projectService.getprojectdtep2(proyecto.scodproject));
      var projectinvoicing = lastValueFrom(this.projectService.getprojectinvoicing(proyecto.scodproject));

      Promise.all([projectStep2, projectinvoicing]).then((value: any) => {
        // Project 2
        let projectStep2: ProjectStep2 = value[0];

        // Project Invoicing
        let listProjectInvoicing: ProjectInvoicing[] = value[1];

        if (listProjectInvoicing === null) {
          // No tiene hitos
          // Swal.fire('Error', 'Debe programar Hitos', 'info');
          console.log("No existe hitos");
        } else {
          listProjectInvoicing.forEach(reporte => {

            let monto = (projectStep2.nexpected_income * reporte.npercentage_invoice) / 100
            monto = Number(monto.toFixed(2));


            let fechaPlanificada = null;

            fechaPlanificada = new Date(reporte.dplanned_date);
            if (fechaPlanificada != 'Invalid Date') {
              fechaPlanificada.setDate(fechaPlanificada.getDate() + 1);
              fechaPlanificada.setMilliseconds(0);
              fechaPlanificada.setSeconds(0);
              fechaPlanificada.setMinutes(0);
              fechaPlanificada.setHours(0);
            } else {
              fechaPlanificada = null;
            }


            let fechaFacturada = null;
            fechaFacturada = new Date(reporte.dbilling_date)
            if (fechaFacturada != 'Invalid Date') {
              fechaFacturada.setDate(fechaFacturada.getDate() + 1);
              fechaFacturada.setMilliseconds(0);
              fechaFacturada.setSeconds(0);
              fechaFacturada.setMinutes(0);
              fechaFacturada.setHours(0);
            } else {
              fechaFacturada = null;
            }

            let fechaPago = null;
            fechaPago = new Date(reporte.dinvoice_payment_date);

            if (fechaPago != 'Invalid Date') {
              fechaPago.setDate(fechaPago.getDate() + 1);
              fechaPago.setMilliseconds(0);
              fechaPago.setSeconds(0);
              fechaPago.setMinutes(0);
              fechaPago.setHours(0);
            } else {
              fechaPago = null;
            }



            let estado = this.obtenerEstadoHito(reporte.binvoiced, reporte.bpaid, fechaPlanificada, fechaFacturada, fechaPago);

            this.listReporteFacturacion.push([proyecto.smanagername, proyecto.scodproject, proyecto.sclientname, proyecto.snameproject,
            reporte.sdescription, reporte.npercentage_invoice, reporte.dplanned_date, projectStep2.ncurrency,
              monto, reporte.dbilling_date, reporte.dinvoice_payment_date, estado
            ]);
          })
        }

      });
    })
  }

  obtenerEstadoHito(binvoiced, bpaid, fechaPlanifacada, fechaFacturacion, fechaPago): string {
    let actual_day = new Date();
    actual_day.setMilliseconds(0);
    actual_day.setSeconds(0);
    actual_day.setMinutes(0);
    actual_day.setHours(0);


    // Si aun no se ha facturado
    if (!binvoiced) {
      if (fechaPlanifacada > actual_day) {
        return "Facturación Atrasada";
      }
    }
    if (fechaFacturacion && fechaPago) {
      return "Cobrado";
    }

    if (fechaFacturacion && !fechaPago) {
      return "Facturado";
    }

    if (fechaPlanifacada < actual_day) {
      return "Por Facturar";
    }

    let newFechTemp = fechaFacturacion;
    newFechTemp.setDate(newFechTemp.getDate() + 30);
    if (fechaFacturacion && !bpaid && (actual_day > newFechTemp)) {
      return "Cobro Atrasado";
    }

    return "";
  }

  thereAreProjectsLoad(): boolean {

    if (typeof this.listReporteFacturacion === 'undefined') return false;
    if (this.listReporteFacturacion === null) return false;
    if (this.listReporteFacturacion.length === 0) return false;

    return true;
  }

  indicadorSemaforo(item) {
    let fechaPlani = item[6];
    let dateFechaPlani = new Date(fechaPlani);
    dateFechaPlani.setDate(dateFechaPlani.getDate() + 1);
    
    if(item[9]== "") {
      let actual_day = new Date();
      return actual_day > dateFechaPlani? 'red': 'green';
    } else {
      let fechaFact = item[9];
      let dateFechaFact = new Date(fechaFact);
      dateFechaFact.setDate(dateFechaFact.getDate() + 1);
      return dateFechaFact > dateFechaPlani? 'red': 'green';
    }
  }
}
