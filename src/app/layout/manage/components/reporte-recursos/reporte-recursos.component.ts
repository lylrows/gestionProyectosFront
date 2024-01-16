import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MasterTable } from '../../model/common/mastertable';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProjectAssigned } from '../../model/project/filterproject';
import { ClientService } from '../../services/client/client.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';

import * as fs from 'file-saver';
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
let workbook: ExcelProper.Workbook = new Excel.Workbook();

@Component({
  selector: 'app-reporte-recursos',
  templateUrl: './reporte-recursos.component.html',
  styleUrls: ['./reporte-recursos.component.css']
})
export class ReporteRecursosComponent implements OnInit {

  public BreadLevel01 = 'Reportes';
  public Title = 'Reportes de horas por Recurso';


  filterProject: FilterProjectAssigned = new FilterProjectAssigned();
  currentPage :number= 1; // seteamos a la pagina 1
  itemsPerPage :number= 10; // mostramos 5 registros por pagina
  totalItems :number= 0; // Total de registro

  PersonDropDownList:DropDownList[];
  listState : MasterTable[]=[];

  projectList:any[];

  date1String: string = ""
  date2String: string = ""
  listProjectHoursLog: any[] = [];

  semanas_meses = [];
  horas_registradas_proyecto = [];

  sumaTotalGeneral = 0;

  let_mes = new Map([
    [0, "Enero"],
    [1, "Febrero"],
    [2, "Marzo"],
    [3, "Abril"],
    [4, "Mayo"],
    [5, "Junio"],
    [6, "Julio"],
    [7, "Agosto"],
    [8, "Septiembre"],
    [9, "Octubre"],
    [10, "Noviembre"],
    [11, "Diciembre"]
  ])

  @ViewChild('table') table: ElementRef;


  constructor(
    private mastertableService:MastertableService,
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private projectTypeService: ProjectTypeService,
    private clientService: ClientService,
    private personService: PersonService
  ) {
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
   }

  ngOnInit() {
    this.filterProject.nid_status = 1;
    this.getPersonDropDown();
    this.getState();
  }

  ExportToExcel()
  {
   
    const worksheet = workbook.addWorksheet('ReporteColaborador', {
      views: [{ showGridLines: false }]
    });

    worksheet.getCell("A1").value = "Reporte de Horas por Colaborador";
    worksheet.getCell("A3").value =  this.PersonDropDownList.find(x => x.code == this.filterProject.nid_person).description;

    // Cabecera de la tabla
    worksheet.mergeCells("B5:B6");
    worksheet.getCell("B5").value = "Nombre Proyecto y/o Servicios Asignados";
    this.getStyleCabecera(worksheet.getCell("B5"));
    
    worksheet.getColumn('B').width = 40;
    let column_mes_actual = 3
    for(let i= 0; i < this.semanas_meses.length; i++) {
      let startCell = worksheet.getCell(5, column_mes_actual);
      let endCell = worksheet.getCell(5, column_mes_actual + (this.semanas_meses[i][2][0].length));
      column_mes_actual += (this.semanas_meses[i][2][0].length + 1);
      this.getStyleCabecera(startCell);
      startCell.value = this.titleTable(this.semanas_meses[i][0], this.semanas_meses[i][1]);
      worksheet.mergeCells(startCell.address, endCell.address);
    }

    let column_mes_hijo_actual = 3;
    
    for(let i= 0; i < this.semanas_meses.length; i++) {
      for(let j = 0; j < this.semanas_meses[i][2][0].length; j++) {
        let cell = worksheet.getCell(6, column_mes_hijo_actual)
        column_mes_hijo_actual++;
        
        cell.value = this.subTitleTable(this.semanas_meses[i][2][0][j], this.semanas_meses[i][2][1][j])
        this.getStyleCabecera(cell, 1);
      }

      let cellTotalMes =  worksheet.getCell(6, column_mes_hijo_actual);
      column_mes_hijo_actual++;
      cellTotalMes.value = "Total " + this.let_mes.get(this.semanas_meses[i][0])
      this.getStyleCabecera(cellTotalMes);

    }

    worksheet.getColumn(column_mes_hijo_actual).width = 13;
    let startColumnTotalGeneral = worksheet.getCell(5, column_mes_hijo_actual);
    let endColumnTotalGeneral = worksheet.getCell(6, column_mes_hijo_actual);
    startColumnTotalGeneral.value = "Total General";
    this.getStyleCabecera(startColumnTotalGeneral);

    worksheet.mergeCells(startColumnTotalGeneral.address, endColumnTotalGeneral.address);


    // Cuerpo de la tabla
    let rowProjecto = 7;
    for(let i= 0; i < this.projectList.length; i++) {
      let cellProjecto = worksheet.getCell(rowProjecto, 2);
      cellProjecto.value = this.projectList[i].snameproject;

      if(i == this.projectList.length - 1) {
        this.getStyleColaborador(cellProjecto, 1);
      } else {
        this.getStyleColaborador(cellProjecto);
      }

      let rowValorSemana = 3;
      let semanaporMeses = this.SemanasPorMeses(this.projectList[i].scodproject);
      for(let j= 0; j < semanaporMeses.length; j ++) {
        for( let k = 0; k < semanaporMeses[j].length; k++) {
          let cellValorSemana = worksheet.getCell(rowProjecto, rowValorSemana);
          cellValorSemana.value = semanaporMeses[j][k];

          if(i == this.projectList.length - 1) {
            if(k == semanaporMeses[j].length - 1) {
              this.getStyleValorTotalPorMes(cellValorSemana, 1);
            } else {
              this.getStyleValorSemana(cellValorSemana, 1);
            }
          } else {
            if(k == semanaporMeses[j].length - 1) {
              this.getStyleValorTotalPorMes(cellValorSemana);
            } else {
              this.getStyleValorSemana(cellValorSemana);
            }
          }
          rowValorSemana++;
        }
      }
      let valorTotalProyecto = worksheet.getCell(rowProjecto, rowValorSemana);
      valorTotalProyecto.value = this.totalPorProyecto(this.projectList[i].scodproject)

      if(i == this.projectList.length - 1) {
        this.getStyleTotalGeneral(valorTotalProyecto, 1);
      } else {
        this.getStyleTotalGeneral(valorTotalProyecto);
      }

      rowProjecto ++;
    }

    let cellRowTotalGeneral = worksheet.getCell(rowProjecto, 2);
    cellRowTotalGeneral.value = "Total General";
    this.getStyleCabecera(cellRowTotalGeneral);

    let rowValorSemana = 3
    for( let i = 0; i < this.semanas_meses.length; i ++) {
      let semanas = this.semanas_meses[i][2][0];
      for(let j = 0; j < semanas.length; j++) {
        let cellValorSemana = worksheet.getCell(rowProjecto, rowValorSemana);
        cellValorSemana.value = this.totalPorMes(i,j);        
        this.getStyleValorSemana(cellValorSemana, 1);
        rowValorSemana++;
      }
      let cellTotalMes = worksheet.getCell(rowProjecto, rowValorSemana);
      cellTotalMes.value = this.totalPorMes(i, semanas.length);
      rowValorSemana++;
      this.getStyleValorTotalPorMes(cellTotalMes, 1);
    }   
    let cellTotalGeneral = worksheet.getCell(rowProjecto, rowValorSemana);
    cellTotalGeneral.value = this.sumaTotalGeneral;
    cellTotalGeneral.alignment = {
      horizontal: 'center',
    };
    cellTotalGeneral.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } }
    };

    // Descargar archivo
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      workbook.removeWorksheet(worksheet.id);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'ReportePorColaborador.xlsx');
    });

  }

  
  getStyleCabecera(cell, option?) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ff022a5b' } 
    };
    
    cell.font = {
      color: { argb: 'ffffff' },
      bold: true
    };

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    
    if(!option) {    
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    } else {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } }
      };
    }
  }

  getStyleValorSemana(cell, option?) {
    cell.alignment = {
      horizontal: 'center',
    }; 

    if(option) {    
      cell.border = {
        bottom: { style: 'thin', color: { argb: '000000' } }
      };
    }
  }

  getStyleValorTotalPorMes(cell, option?) {
    cell.alignment = {
      horizontal: 'center',
    }; 

    if(!option) {    
      cell.border = {
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    } else {
      cell.border = {
        bottom: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    }

  }

  getStyleTotalGeneral(cell, option?) {
    cell.alignment = {
      horizontal: 'center',
    }; 
    
    if(!option) {    
      cell.border = {
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    } else {
      cell.border = {
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } }
      };
    }
  }

  getStyleColaborador(cell, option?) {
    if(!option) {    
      cell.border = {
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
    } else {
      cell.border = {
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } }
      };
    }
  }

  getPersonDropDown() {
    
    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {
      
      if (response == null){
        this.filterProject.nid_manager = 0;
        return;
      }
      this.PersonDropDownList = response;
      if ( this.PersonDropDownList.length>0){
        this.filterProject.nid_manager = 0;
      }
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
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

  search() {
    // this.showFormDetails = false;
    this.filterProject.nid_manager= 0;
    this.filterProject.nid_person = Number(this.filterProject.nid_person);
    
    this.filterProject.nid_project_type=Number(this.filterProject.nid_project_type);
    this.filterProject.nid_client=Number(this.filterProject.nid_client);
    this.filterProject.nid_status = Number(this.filterProject.nid_status);
    this.filterProject.facturable = 0;
    this.spinner.show();

    this.projectService.getassignedprojectpagination(this.filterProject).subscribe(
      (res: any) => {
        try {
          this.spinner.hide();

          if (res == null){
            
            Swal.fire({
              icon: 'error',
              title: 'Ocurrió un error al obtener los registros.',
            });
          }

          this.projectList = res.data;

          let actualDay = new Date();

          if(this.date1String == '' || this.date2String ==  '') {
            this.date1String = actualDay.getFullYear()  + "-" + String(actualDay.getMonth()+1).padStart(2, '0')
            this.date2String = actualDay.getFullYear()  + "-" + String(actualDay.getMonth()+1).padStart(2, '0')
          }
          this.generateArregloSemanas();
          
          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    );
    
  }

  obtenerHorasRegistradas() {
    this.horas_registradas_proyecto = [];
    this.sumaTotalGeneral = 0;

    this.projectList.forEach(proyecto => {
      this.projectService.getprojecthourslog(proyecto.scodproject).subscribe((data: any) => {

        if (data === null || data === undefined) {
          //No existen horas registradas en el proyecto
          let arregloSemana = this.inicializarMatriz();
          this.horas_registradas_proyecto.push([proyecto.scodproject, arregloSemana]);
          return;
        }
        
        // Filtro las horas aprobadas
        let listHorasRegistradas: any[] = data.filter(x => x.sstate == "A" && x.nid_person == Number(this.filterProject.nid_person));

        console.log("Probando las horas", listHorasRegistradas);

        let arregloSemana = this.obtenerHorasPorSemana(listHorasRegistradas, proyecto.scodproject);
        this.horas_registradas_proyecto.push([proyecto.scodproject, arregloSemana]);
      })

    });
  }

  inicializarMatriz() {
    let arreglo_mes = []

    let cantidad_meses = this.semanas_meses.length;

    // Inicializo todo en 0
    for (let i = 0; i < cantidad_meses; i++) {
      arreglo_mes[i] = [];
      for (let j = 0; j < this.semanas_meses[i][2][0].length; j++) {
        arreglo_mes[i][j] = 0;
      }
      // este va ser el total
      arreglo_mes[i][this.semanas_meses[i][2][0].length] = 0;
    }

    return arreglo_mes;
  }

  obtenerHorasPorSemana(listHorasRegistradas: any[], scodproject: string) {
    let arreglo_mes = this.inicializarMatriz();

    listHorasRegistradas.forEach(horaRegistrada => {
      let registrationDate: Date = new Date(horaRegistrada.dregistration_date);
      let horasRegistradas = horaRegistrada.nnumber_hours;
      let resp = this.obtenerMatrizHorasProjecto(registrationDate);

      if (resp != null) {
        arreglo_mes[resp[0]][resp[1]] += horasRegistradas;
        // Sumando a la ultima posicion la cual es el total de la semana
        arreglo_mes[resp[0]][this.semanas_meses[resp[0]][2][0].length] += horasRegistradas;
        // Sumando al total General
        this.sumaTotalGeneral += horasRegistradas;
      }
    });

    return arreglo_mes;
  }

  obtenerMatrizHorasProjecto(registrationDate: Date) {
    let index_mes = 0;

    let semana_pertenece = -1;

    for (let mes of this.semanas_meses) {
      // Primero tengo que ver a que mes corresponde
      if (mes[0] == registrationDate.getMonth() && mes[1] == registrationDate.getFullYear()) {
        // Si pertenece a este mes, tengo que ver a que semana pertenece
        semana_pertenece = this.perteneceSemana(registrationDate, mes[2][0], mes[2][1])
        break;
      }
      index_mes++;
    };

    if (semana_pertenece != null && semana_pertenece != -1) {
      return [index_mes, semana_pertenece];
    } else {
      return null
    }
  }

  perteneceSemana(fechaIni, listSemanasStart, listSemanasFinish) {
    let semana_pertenece = -1;
    // TODO: VERIFICAR QUE LAS HORAS REGISTRADAS SIEMPRE VUELVAN CON HORAS_MINUTOS_SEGUNDOS_MILISEGUNDOS EN 0
    for (let i = 0; i < listSemanasFinish.length; i++) {
      if (fechaIni >= listSemanasStart[i] && fechaIni <= listSemanasFinish[i]) {
        semana_pertenece = i;
        break;
      }
    }
    if (semana_pertenece == -1) {
      console.log("No pertence a ninguna semana", fechaIni, listSemanasStart);
      return null;
    }
    return semana_pertenece
  }

  generateArregloSemanas() {
    if(this.date1String == '' || this.date2String == '') {
      return;
    }
    
    let start = new Date(this.date1String);
    start.setDate(start.getDate() + 1)
    let finish = new Date(this.date2String);
    finish.setDate(finish.getDate() + 1)

    this.semanas_meses = [];
    while (start <= finish) {
      let fechaIni: Date = new Date(start);
      let extraDay = 0;
      if (fechaIni.getDay() == 0) {
        extraDay = 1;
      }
      if (fechaIni.getDay() == 6) {
        extraDay = 2;
      }
      fechaIni.setDate(fechaIni.getDate() + extraDay);
      fechaIni.setMilliseconds(0);
      fechaIni.setSeconds(0);
      fechaIni.setMinutes(0);
      fechaIni.setHours(0);
      let semanas_mes = this.generateArregloMonth(fechaIni);
      // [mes(number), año(number), semanas(arreglo, [0]= inicio semana, [1]= fin semana)]
      this.semanas_meses.push([start.getMonth(), start.getFullYear(), semanas_mes])
      start.setMonth(start.getMonth() + 1);
    }

    this.obtenerHorasRegistradas();
  }

  generateArregloMonth(fechaIni: Date) {
    let listSemanasStart = [];
    let listSemanasFinish = [];

    let fechaFin: Date;

    // Si la semana empieza miercoles la fecha fin de esta semana termina en 3 dias, sabado
    // En el primero no hay ningun problema porque siempre empieza el primero de cada mes por lo que es imposible que cambie de mes en un + dateuno
    let dateuno = 6 - fechaIni.getDay();

    fechaFin = new Date(fechaIni);
    fechaFin.setDate(fechaFin.getDate() + dateuno);


    let abc = new Date(fechaIni.setDate(fechaIni.getDate() + 0));
    let abd = new Date(fechaFin.setDate(fechaFin.getDate() + 0));

    listSemanasStart.push(abc);
    listSemanasFinish.push(abd);

    let newDate = new Date(fechaIni.getFullYear(), fechaIni.getMonth() + 1, 0);
    // newDate.setDate(newDate.getDate() + 1);
    let primeraIteracion = true;
    while (fechaFin <= newDate) {
      // Si entra es porque fechaFin aun no es menor que newDate
      let abc;
      if (primeraIteracion) {
        let sumarPrimeraIteracion = 8 - fechaIni.getDay();
        abc = new Date(fechaIni.setDate(fechaIni.getDate() + sumarPrimeraIteracion));
        primeraIteracion = false;
      } else {
        abc = new Date(fechaIni.setDate(fechaIni.getDate() + 7));
      }

      let abd;
      if (abc <= newDate) {
        abd = new Date(fechaFin.setDate(fechaFin.getDate() + 7));
        if (abd <= newDate) {
          listSemanasStart.push(abc);
          listSemanasFinish.push(abd);
        } else {
          let abd2 = new Date(fechaFin.setDate(fechaFin.getDate() - 7));
          let ultimaSemana = new Date(newDate);
          ultimaSemana.setDate(ultimaSemana.getDate() -1 );
          while (abd2 < ultimaSemana) { // Mientras que sea menor, para que en la ultima iteracion quede igual
            abd2.setDate(abd2.getDate() + 1)
          }
          listSemanasStart.push(abc);
          listSemanasFinish.push(abd2);
        }
      } else {
        // Ya no deberia entrar a otra semana si es mayor que el newdate
        fechaFin.setDate(fechaFin.getDate() + 1);
      }
    }

    return [listSemanasStart, listSemanasFinish]
  }

  titleTable(mes, anio) {
    return this.let_mes.get(mes) + "-" + anio;
  }

  subTitleTable(ini, fin) {
    return ('0' + ini.getDate()).slice(-2) + "-" + ('0' + fin.getDate()).slice(-2);
  }

  pageChanged(event: any): void {
    this.currentPage = event;
    this.filterProject.pagination.CurrentPage = this.currentPage;
    this.search();
  }

  thereAreProjectsLoad(): boolean {

    if (typeof this.projectList === 'undefined') return false;
    if (this.projectList === null) return false;
    if (this.projectList.length === 0) return false;
    return true;
  }

  ChangeRecordByPage() {
    this.filterProject.pagination.ItemsPerPage = Number(this.itemsPerPage);
    this.search();
  }

  SemanasPorMeses(scodproject): any[] {
    let proyecto = this.horas_registradas_proyecto.find(x => x[0] == scodproject);
    if(proyecto !== null && proyecto !== undefined) {
      return proyecto[1];
    } 
    return null;
  }

  totalPorProyecto(scodproject) {
    let suma = 0;

    let proyecto = this.horas_registradas_proyecto.find(x => x[0] == scodproject);
    if(proyecto === null || proyecto === undefined) {
      return 0;
    } 

    let arreglo_Semanas = proyecto[1];

    for(let i = 0; i < arreglo_Semanas.length; i ++) {
      suma += arreglo_Semanas[i][arreglo_Semanas[i].length - 1];
    }
    return suma;
  }

  totalPorMes(i, j) {
    let suma = 0;
    this.horas_registradas_proyecto.forEach(item => {
      if (item && item[1] && item[1].length > 0 && item[1][i] && item[1][i][j]) {
        suma += item[1][i][j];
      }
    })
    return suma;
  }
}
