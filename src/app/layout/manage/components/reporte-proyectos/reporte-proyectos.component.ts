import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { lastValueFrom, map, Observable, startWith } from 'rxjs';
import Swal from 'sweetalert2';
import { MasterTable } from '../../model/common/mastertable';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProjectAssigned } from '../../model/project/filterproject';
import { ClientService } from '../../services/client/client.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { PermisoService } from '../../services/common/permiso.service';
import { User } from '../../model/user/user';
import { Client } from '../../model/client/client';

import * as fs from 'file-saver';
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
let workbook: ExcelProper.Workbook = new Excel.Workbook();

export class person{
  nid_person: number = 0;
  sperson: string = "";
}

@Component({
  selector: 'app-reporte-proyectos',
  templateUrl: './reporte-proyectos.component.html',
  styleUrls: ['./reporte-proyectos.component.css']
})
export class ReporteProyectosComponent implements OnInit {

  public BreadLevel01 = 'Reportes';
  public Title = 'Reportes de horas por Proyecto';

  listaPersonas: any[] = [];

  filterProject: FilterProjectAssigned = new FilterProjectAssigned();

  user: User = new User();

  currentPage: number = 1;
  itemsPerPage: number = 999;
  totalItems: number = 0;

  listState: MasterTable[] = [];
  ClientDropDownList: Client[];
  ProjectTypeDropDownList: DropDownList[];
  PersonDropDownList: DropDownList[];

  listProjectHoursLog: any[] = [];

  date1String: string = ""
  date2String: string = ""

  semanas_meses = [];
  horas_registradas_proyecto = [];

  sumaTotalGeneral = 0;

  projectList: any[] = [];
  listProjectFilter: any[] = [];
  
  @ViewChild('table') table: ElementRef;

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
  
  personExt : person = new person();

  codigoProyecto: Observable<any[]>;
  nombreProyecto: Observable<any[]>;

  myControl: FormControl = new FormControl();
  myControll: FormControl = new FormControl();

  inputNombreServicio = "";

  permisoAdministrador: boolean = false;
  permisoJefeDeProyecto: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private mastertableService: MastertableService,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
    private permisoService: PermisoService,
  ) {
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
  }

  ngOnInit() {
    this.obtenerPermisos();

    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
   }

    this.codigoProyecto = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map((val: any) => this.filter(val))
      );

    this.nombreProyecto = this.myControll.valueChanges
      .pipe(
        startWith(''),
        map((val: any) => this.filter2(val))
      );

  }

  obtenerPermisos()
  {
    this.permisoService.getpermissionbyuser(20).subscribe((response: any) => {
      console.log("permisos",response)
      response.forEach(element => {
        if(element.sname=="Permiso_Administrador"){
          this.permisoAdministrador = element.permission
        }
        if(element.sname=="Permiso_Jefe_Proyecto"){
          this.permisoJefeDeProyecto = element.permission
        }
        
      });

      this.getState();
      this.getProjectTypeDropDown();
      this.getProyectos();

    }, (error) => {
      console.error(error);
    });
  }

  ExportToExcel()
  {
    const worksheet = workbook.addWorksheet('ReporteFacturacion', {
      views: [{ showGridLines: false }]
    });

    worksheet.getCell("A1").value = "Reporte de Horas de Proyecto";
    const cellA1 = worksheet.getCell("A3");
    cellA1.value = "Codigo        Proyecto / Servicio";
    cellA1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.getColumn('A').width = 18;
    worksheet.getRow(3).height = 30
    
    worksheet.getCell("B3").value = this.filterProject.scodproject + '-' + this.inputNombreServicio;
    worksheet.getCell("B3").alignment = { vertical: 'middle' };

    // Cabecera de la tabla
    worksheet.mergeCells("B5:B6");
    worksheet.getCell("B5").value = "Colaboradores";
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

    let rowColaborador = 7;
    for(let i= 0; i < this.listaPersonas.length; i++) {
      let cellColaborador = worksheet.getCell(rowColaborador, 2);
      cellColaborador.value = this.listaPersonas[i].sperson;

      if(i == this.listaPersonas.length - 1) {
        this.getStyleColaborador(cellColaborador, 1);
      } else {
        this.getStyleColaborador(cellColaborador);
      }

      let rowValorSemana = 3;
      let semanaporMeses = this.SemanasPorMeses(this.listaPersonas[i].nid_person);
      for(let j= 0; j < semanaporMeses.length; j ++) {
        for( let k = 0; k < semanaporMeses[j].length; k++) {
          let cellValorSemana = worksheet.getCell(rowColaborador, rowValorSemana);
          cellValorSemana.value = semanaporMeses[j][k];

          if(i == this.listaPersonas.length - 1) {
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
      let valorTotalProyecto = worksheet.getCell(rowColaborador, rowValorSemana);
      valorTotalProyecto.value = this.totalPorProyecto(this.listaPersonas[i].nid_person)

      if(i == this.listaPersonas.length - 1) {
        this.getStyleTotalGeneral(valorTotalProyecto, 1);
      } else {
        this.getStyleTotalGeneral(valorTotalProyecto);
      }

      rowColaborador ++;
    }

    let cellRowTotalGeneral = worksheet.getCell(rowColaborador, 2);
    cellRowTotalGeneral.value = "Total General";
    this.getStyleCabecera(cellRowTotalGeneral);

    let rowValorSemana = 3;
        for( let i = 0; i < this.semanas_meses.length; i ++) {
      let semanas = this.semanas_meses[i][2][0];
      for(let j = 0; j < semanas.length; j++) {
        let cellValorSemana = worksheet.getCell(rowColaborador, rowValorSemana);
        cellValorSemana.value = this.totalPorMes(i,j);        
        this.getStyleValorSemana(cellValorSemana, 1);
        rowValorSemana++;
      }
      let cellTotalMes = worksheet.getCell(rowColaborador, rowValorSemana);
      cellTotalMes.value = this.totalPorMes(i, semanas.length);
      rowValorSemana++;
      this.getStyleValorTotalPorMes(cellTotalMes, 1);
    }

    let cellTotalGeneral = worksheet.getCell(rowColaborador, rowValorSemana);
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
      fs.saveAs(blob, 'ReportePorProyecto.xlsx');
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
  
  fisrtChange() {
    this.myControl.setValue("");
    this.myControll.setValue("");
  }

  changeNombreServicio() {
    let proyecto = this.projectList.find(project => project.snameproject == this.inputNombreServicio);
    if(proyecto !== null && proyecto !== undefined) {
      this.filterProject.scodproject = proyecto.scodproject;
    }
  }

  changeCodigoServicio() {
    console.log(this.filterProject.scodproject);
    let proyecto = this.projectList.find(project => project.scodproject == this.filterProject.scodproject);
    console.log("A ver", proyecto);
    if(proyecto !== null && proyecto !== undefined) {
      this.inputNombreServicio = proyecto.snameproject;
    }
  }

  changeEstado() {
    if(this.filterProject.nid_status == 0) {
      this.listProjectFilter = this.projectList;
    } else {
      let cadena = this.listState.find(stado => stado.nid_mastertable_type == this.filterProject.nid_status).sshort_value.toUpperCase();
      this.listProjectFilter = this.projectList.filter(proyecto => proyecto.sstatusname.toUpperCase() == cadena);
    }
    this.myControl.setValue("");
    this.myControll.setValue("");
  }

  filter(val: string): string[] {
    return this.listProjectFilter.filter(project =>
      project.scodproject.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  filter2(val: string): string[] {
    return this.listProjectFilter.filter(project =>
      project.snameproject.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  getProyectos() {
    this.filterProject.nid_manager = 0;
    this.filterProject.nid_status = 0;
    
    if(this.permisoAdministrador) {
      this.filterProject.nid_manager=0;
      this.filterProject.nid_person = 0;
    } else {
      this.filterProject.nid_manager=0;
      this.filterProject.nid_person = this.user.nid_person;
    }
    
    this.spinner.show();
    this.projectService.getassignedprojectpagination(this.filterProject).subscribe(
      (res: any) => {
        try {
          if (res == null) {
            Swal.fire({
              icon: 'error',
              title: 'Ocurrió un error al obtener los registros.',
              //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
            });
          }
          this.spinner.hide();
          this.projectList = res.data;
          this.listProjectFilter = res.data;
          this.fisrtChange();
          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    );

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

  search() {
    let scodproject = this.filterProject.scodproject;
    
    let actualDay = new Date();

    if(this.date1String == '' || this.date2String ==  '') {
      this.date1String = actualDay.getFullYear()  + "-" + String(actualDay.getMonth()+1).padStart(2, '0')
      this.date2String = actualDay.getFullYear()  + "-" + String(actualDay.getMonth()+1).padStart(2, '0')
    }
    
    this.generateArregloSemanas();

  }

  obtenerHorasRegistradas(scodproject) {

    // Obtener los estimados
    var projectEstimate = lastValueFrom(this.projectService.getprojectestimate(scodproject, 2));
    // Obtener horas registradas
    var horasRegistradas = lastValueFrom(this.projectService.getprojecthourslog(scodproject));
    console.log(horasRegistradas);
    // Obtener horas registradas de personal externo y proveedores
    var horasRegistradasExt = lastValueFrom(this.projectService.getprojecthoursext(scodproject));
    

    Promise.all([projectEstimate, horasRegistradas, horasRegistradasExt]).then((value: any) => {

      this.horas_registradas_proyecto = [];
      this.sumaTotalGeneral = 0;


      // Las personas estimadas
      if (value[0] === null || value[0] === undefined) {
        Swal.fire('Error', "No hay personal asignado a este proyecto", 'info');
        return;
      }
      this.listaPersonas = value[0];

      // Las horas registradas
      let horasRegistradas = value[1];
      if (horasRegistradas === null || horasRegistradas === undefined) {
        //No existen horas registradas en el proyecto
        Swal.fire('Advertencia', "No hay horas registradas en este proyecto", 'info');
        return;
      }
      // Las horas resgistradas del personal externo o proveedores
      let horasRegistradasExt = value[2];
      //console.log(horasRegistradasExt);
      if (horasRegistradasExt!=null && horasRegistradasExt!= undefined) {
        horasRegistradasExt.forEach(valueh=>{
          horasRegistradas.push(valueh);
          let fila = this.listaPersonas.find(x=>x.nid_person==valueh.nid_person)
          if(fila==null || fila==undefined){
            this.personExt.nid_person=valueh.nid_person;
            this.personExt.sperson=valueh.sperson;
            this.listaPersonas.push(this.personExt)
            this.personExt = new person();
          }
        })
      }

      

      // Filtro las horas aprobadas
      let listHorasRegistradas: any[] = horasRegistradas.filter(x => x.sstate == "A");

      if (listHorasRegistradas === null || listHorasRegistradas === undefined) {
        Swal.fire('Adventencia', "No hay horas aprobadas en este proyecto", 'info');
        return;
      }

      this.listaPersonas.forEach(personal => {
        let listHorasRegistradasPersonal = listHorasRegistradas.filter(x => x.nid_person == personal.nid_person);
        let arregloSemana = this.obtenerHorasPorSemana(listHorasRegistradasPersonal);
        this.horas_registradas_proyecto.push([personal.nid_person, arregloSemana]);
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

  obtenerHorasPorSemana(listHorasRegistradas: any[]) {
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
    
    if (!this.thereAreProjectsLoad) {
      return null;
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

    this.obtenerHorasRegistradas(this.filterProject.scodproject);
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

  thereAreProjectsLoad(): boolean {

    if (typeof this.listaPersonas === 'undefined') return false;
    if (this.listaPersonas === null) return false;
    if (this.listaPersonas.length === 0) return false;
    return true;
  }


  SemanasPorMeses(nid_person): any[] {
    let proyecto = this.horas_registradas_proyecto.find(x => x[0] == nid_person);
    if (proyecto !== null && proyecto !== undefined) {
      return proyecto[1];
    }
    return null;
  }

  totalPorProyecto(nid_person) {
    let suma = 0;

    let proyecto = this.horas_registradas_proyecto.find(x => x[0] == nid_person);
    if (proyecto === null || proyecto === undefined) {
      return 0;
    }

    let arreglo_Semanas = proyecto[1];

    for (let i = 0; i < arreglo_Semanas.length; i++) {
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
