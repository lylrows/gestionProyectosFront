import { Component, OnInit } from '@angular/core';
import { FilterProjectAssigned } from '../../model/project/filterproject';
import { FormControl } from '@angular/forms';
import { Observable, lastValueFrom, map, startWith } from 'rxjs';
import { MasterTable } from '../../model/common/mastertable';
import { MastertableService } from '../../services/common/mastertable.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { User } from '../../model/user/user';
import { ProjectService } from '../../services/project/project.service';
import Swal from 'sweetalert2';
import { Progress, ProgressDetail, ProjectEstimate, ProjectInvoicing, ProjectStep2, ProjectStep3Investment, ProjectStep5, WeekAvance, WeeksProjectPerson } from '../../model/project/project';
import { PersonService } from '../../services/person/person.service';
import { PersonCostHist } from '../../model/person/person.model';
import { Chart } from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reporte-exportable-pdf',
  templateUrl: './reporte-exportable-pdf.component.html',
  styleUrls: ['./reporte-exportable-pdf.component.css']
})
export class ReporteExportablePdfComponent implements OnInit {

  public BreadLevel01 = 'Reportes';
  public Title = 'Reporte exportable en PDF';

  filterProject: FilterProjectAssigned = new FilterProjectAssigned();

  projectList: any[] = [];
  listProjectFilter: any[] = [];

  listState: MasterTable[] = [];
  ProjectTypeDropDownList: DropDownList[];

  codigoProyecto: Observable<any[]>;
  nombreProyecto: Observable<any[]>;
  
  myControl: FormControl = new FormControl();
  myControll: FormControl = new FormControl();
  
  inputNombreServicio = "";

  permisoAdministrador: boolean = true;
  user: User = new User();

  currentPage: number = 1;
  itemsPerPage: number = 999;
  totalItems: number = 0;

  grafico1: Chart;
  grafico2: Chart;
  grafico3: Chart;
  
  // Operación
  scodproject = "";
  projectStep5 :ProjectStep5 = new ProjectStep5();
  listInvoicing: ProjectInvoicing[] = [];
  ingresosReales: number = 0;
  costoReal: number = 0;
  costoReal1: number = 0;
  listCost:PersonCostHist[] = [];

  listprogress: Progress[] = []; 
  listAvanceProyecto: ProgressDetail[] = []; 

  listInvestment :ProjectStep3Investment[]=[];
  projectStep2: ProjectStep2 = new ProjectStep2();
  ListWeekProgressn: WeekAvance[] = [];
  ListWeekPerson: WeeksProjectPerson[] = [];
  ncantidadsemanas: number = 0;
  arrayNumberWeek: number[] = [];
  listProjectHoursLog:any[] = [];

  listSemanasStart: Date[]=[];
  listSemanasFinish: Date[]=[]; 
  listhoras: number[]=[];
  listCostoPlanificado: number[]=[];
  listCostoReal: number[]=[];
  
  
  listProjectEstimate:ProjectEstimate[] = [];
  listProjectEstimateAuxiliary: ProjectEstimate[];
  listProjectPersonal: ProjectEstimate[];

  cantidad_columnas = 2;
  personHours: Array<[any, number[], any]>; 

  facturacion_montoesperado = [];
  facturacion_montofacturado = [];
  facturacion_montoreal = [];
  facturacion_labels = [];

  let_mes = new Map([
    [0, "Enero" ],
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
  mesesLabel: string[] = [];
  
  date1String: string = ""
  date2String: string = ""
  
  dateMax: string = "";
  dateMin: string = "";
  
  simbMoneda = "";
  listProjectHoursExt: any[] = [];


  showData = false;

  cumplimiento_tareasATiempo = 0;
  cumplimiento_tareasFueraDeTiempo = 0;
  cumplimiento_tareasTerminadas = 0;
  cumplimiento_avanceDelProyecto = 0;
  cumplimiento_totalTareas = 0;

  constructor(
    private mastertableService: MastertableService,
    private spinner: NgxSpinnerService,
    private projectTypeService: ProjectTypeService,
    private projectService: ProjectService,
    private servicePerson: PersonService,
  ) { 
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
  }

  ngOnInit(): void {
    this.showData = false;

    this.RenderChart();

    if (sessionStorage.getItem('Guard') !== null) {
      this.user = JSON.parse(sessionStorage.getItem('User'));
    }

    this.getState();
    this.getProjectTypeDropDown();
    this.getProyectos();

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

  filter(val: string): string[] {
    return this.listProjectFilter.filter(project =>
      project.scodproject.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  filter2(val: string): string[] {
    return this.listProjectFilter.filter(project =>
      project.snameproject.toLowerCase().indexOf(val.toLowerCase()) === 0);
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

  fisrtChange() {
    this.myControl.setValue("");
    this.myControll.setValue("");
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

  search(){
    this.showData = true;
    this.scodproject = this.filterProject.scodproject;
    this.esperarRespuesta();
  }

  esperarRespuesta() {
    var projectStep3 = lastValueFrom(this.projectService.getprojectdtep3(this.scodproject));
    var projectStep2 = lastValueFrom(this.projectService.getprojectdtep2(this.scodproject));
    var projectStep5 = lastValueFrom(this.projectService.getprojectdtep5(this.scodproject));

    // Devuelve la facturacion
    var facturacionProyecto = lastValueFrom(this.projectService.getprojectinvoicing(this.scodproject));

    // Devuelve el costo para cada integrante del proyecto  
    var costoIntegrantes = lastValueFrom(this.servicePerson.getPersonCostByScodproject(this.scodproject));

    // Esto devuelve las horas estimadas
    var horasEstimadas = lastValueFrom(this.projectService.getprojectweekperson(this.scodproject));

    // La lista de personal estimado
    var personalEstimado = lastValueFrom(this.projectService.getprojectestimate(this.scodproject, 2));

    // Devuelve las horas registradas para el proyecto
    var horasRegistradas= lastValueFrom(this.projectService.getprojecthourslog(this.scodproject));

    // Devuelve los registros
    var registrosAvanceProject= lastValueFrom(this.projectService.getprojectprogress(this.scodproject));

    // Obtener horas registradas de personal externo y proveedores
    var horasRegistradasExt = lastValueFrom(this.projectService.getprojecthoursext(this.scodproject));

    this.spinner.show('SpinnerProject');
    Promise.all([projectStep3, projectStep2, costoIntegrantes, horasEstimadas, personalEstimado, horasRegistradas, projectStep5, facturacionProyecto, registrosAvanceProject, horasRegistradasExt]).then((value: any) => {
      this.spinner.hide('SpinnerProject');


      // Step 3, obtiene la lista de estimados, con su costo estimado por rol
      this.listInvestment = value[0].listInvestment;
      
      // Step 2
      this.projectStep2 = value[1];
      
      if(this.projectStep2.ncurrency == 1) {
        this.simbMoneda = "S/.";
      } else {
        this.simbMoneda = "$";
      }

      this.date1String = this.projectStep2.dbegin_date.substring(0,7)
      this.dateMin = this.projectStep2.dbegin_date.substring(0,7);
      this.date2String = this.projectStep2.dfinish_date.substring(0,7);
      this.dateMax = this.projectStep2.dfinish_date.substring(0,7);
      this.ncantidadsemanas = this.projectStep2.nweeks;
      this.arrayNumberWeek = new Array<number>(this.ncantidadsemanas);
      this.generateArregloSemanas();
      
      // Costo Real Integrantes del proyecto
      this.listCost = value[2];
      if(this.listCost === null || this.listCost === undefined) {
        this.mensajeError("Debe asignar personal al proyecto");
        return;
      }
      console.log("La lista de costos", this.listCost);
      
      this.listCost.forEach(element => {
        element.dcost_date = new Date(element.dcost_date);
      });

      // Horas estimadas
      this.ListWeekPerson = value[3];
      

      // Personal
      this.listProjectPersonal = value[4];
      // Personal estimado no auxiliar
      this.listProjectEstimate = value[4].filter(x=> x.isAuxiliary == false);
      // Personal Auxiliar
      this.listProjectEstimateAuxiliary = value[4].filter(ls => ls.isAuxiliary == true);
      
      
      // Horas Registradas
      this.calculateCostoPlanificado();
      
      if(value[5]=== null || value[5]=== undefined) {
        this.mensajeError("No existen horas registradas en el proyecto");
        return;
      }

      this.listProjectHoursLog = value[5].filter(x => x.sstate == "A");

      // Step 5
      this.projectStep5 = value[6];
      console.log(this.projectStep5);
      
      // Facturacion del proyecto
      this.listInvoicing = value[7];
      this.calculoFacturacion();
      
      // Obtener ultimo registro de avance
      this.listprogress = value[8];
      if(this.listprogress != null && this.listprogress.length >= 1) {
        this.listAvanceProyecto = this.listprogress[0].listProgressDetail;
        this.llenarGrafico2();
      } else {
        this.listAvanceProyecto = [];
      }

      if(value[9]!=null){
        this.listProjectHoursExt = value[9].filter(x => x.sstate == "A");
        console.log(this.listProjectHoursExt);     
      } else {
        this.listProjectHoursExt = [];
      }

    
      this.calculo();
      this.calcularCostoReal();
      this.llenarNuevoGrafico();

    })
  }

  calculoFacturacion() {
    let esperado = [];
    let real = [];
    let facturado = [];

    this.facturacion_montoesperado = [];
    this.facturacion_montofacturado = [];
    this.facturacion_montoreal = [];
    this.facturacion_labels = [];

    if(this.listInvoicing != null) {
      this.ingresosReales = 0;
      this.listInvoicing.forEach(invo => {
        let date_esperado = new Date(invo.dplanned_date);
        date_esperado.setDate(date_esperado.getDate() + 1);
        date_esperado.setHours(0,0,0,0);
        esperado.push([date_esperado, 1, invo.namount]);
        
        if(invo.binvoiced) {
          let date_facturado = new Date(invo.dbilling_date);
          date_facturado.setDate(date_facturado.getDate() + 1);
          date_facturado.setHours(0,0,0,0);
          facturado.push([date_facturado, 2, invo.namount]);
        }

        if(invo.bpaid) {
          this.ingresosReales +=  Number(invo.namount);
          let date_real = new Date(invo.dinvoice_payment_date);
          date_real.setDate(date_real.getDate()+1);
          date_real.setHours(0,0,0,0);
          real.push([date_real, 3, invo.namount]);
        }

      });

      let allDates = [...esperado, ...real, ...facturado];
      allDates.sort((a: [Date, number, number], b: [Date, number, number]) => a[0].getTime() - b[0].getTime());

      let fechasUnicas: string[] = [];
      let fechaAnterior: string = '';

      for (let fecha of allDates) {
        let fechaString: string = this.convertDatetoString(fecha[0]);
        if (fechaString !== fechaAnterior) {
          fechasUnicas.push(fechaString);
          fechaAnterior = fechaString;
        }
      }

      let montoEsperado= [];
      let montoFacturado= [];
      let montoReal = [];

      for(let fecha of fechasUnicas) {
        montoEsperado.push([fecha, 0]);
        montoFacturado.push([fecha, 0]);
        montoReal.push([fecha, 0]);
      }

      for (let fecha of allDates) {
        let fechaString: string = this.convertDatetoString(fecha[0]);
        let encontrado;
        if(fecha[1] == 1) {
          encontrado = montoEsperado.find(x=>x[0] == fechaString);
          encontrado[1] += fecha[2];
        }
        if(fecha[1] == 2) {
          encontrado = montoFacturado.find(x=>x[0] == fechaString);
          encontrado[1] += fecha[2];
        }
        if(fecha[1] == 3) {
          encontrado = montoReal.find(x=>x[0] == fechaString);
          encontrado[1] += fecha[2];
        }
      }
      
      // Esto es solo por decoracion
      let suma_valor1 = 0;
      for (let i = 0 ; i < montoEsperado.length; i ++) {
        suma_valor1 += montoEsperado[i][1];
        montoEsperado[i][1] = suma_valor1;
      }

      let suma_valor2 = 0;
      for (let i = 0 ; i < montoFacturado.length; i ++) {
        suma_valor2 += montoFacturado[i][1];
        montoFacturado[i][1] = suma_valor2;
      }

      let suma_valor3 = 0;
      for (let i = 0 ; i < montoReal.length; i ++) {
        suma_valor3 += montoReal[i][1];
        montoReal[i][1] = suma_valor3;
      }

      this.facturacion_montoesperado = montoEsperado;
      this.facturacion_montofacturado = montoFacturado;
      this.facturacion_montoreal = montoReal;
      this.facturacion_labels = fechasUnicas;
      this.llenarGrafico3()
      
    } else {
      this.listInvoicing = [];
      this.ingresosReales = 0;
    }
  }

  convertDatetoString(fecha: Date) {
    return fecha.getDate().toString().padStart(2,'0') + '/' + (fecha.getMonth() + 1).toString().padStart(2,'0') + "/" + fecha.getFullYear()
  }

  generateArregloSemanas() {
    // Limpiar datos
    this.listSemanasStart = [];
    this.listSemanasFinish = [];


    let fechaIni;
    let fechaFin;
    fechaIni = new Date(this.projectStep2.dbegin_date);
    fechaIni.setDate(fechaIni.getDate() + 1);

    // Si la semana empieza miercoles la fecha fin de esta semana termina en 3 dias, sabado
    let dateuno = 6 - fechaIni.getDay();
    // Si empieza sabado vuela todo XXD
    fechaFin = new Date(this.projectStep2.dbegin_date);
    fechaFin.setDate(fechaFin.getDate() + (1+dateuno));

    let abc = new Date(fechaIni.setDate(fechaIni.getDate() + 0));
    let abd = new Date(fechaFin.setDate(fechaFin.getDate() + 0));
    this.listSemanasStart.push(abc);
    this.listSemanasFinish.push(abd);

    let newDate = new Date(this.projectStep2.dfinish_date);
    newDate.setDate(newDate.getDate() + 1);
    let primeraIteracion = true;
    while(fechaFin <= newDate){
      // Si entra es porque fechaFin aun no es menor que newDate
      let abc;
      if(primeraIteracion) {
        let sumarPrimeraIteracion = 8 - fechaIni.getDay();
        abc =new Date(fechaIni.setDate(fechaIni.getDate()+sumarPrimeraIteracion));
        primeraIteracion = false;
      } else {
        abc =new Date(fechaIni.setDate(fechaIni.getDate()+7));
      }

      let abd;         
      if(abc <= newDate) {
        abd =new Date(fechaFin.setDate(fechaFin.getDate()+7));
        if(abd <= newDate) {
          this.listSemanasStart.push(abc);
          this.listSemanasFinish.push(abd);
        } else {
          let abd2 = new Date(fechaFin.setDate(fechaFin.getDate()-7));
          let ultimaSemana = new Date(newDate);
          ultimaSemana.setDate(ultimaSemana.getDate() -1 );
          while (abd2 < ultimaSemana) { // Mientras que sea menor, para que en la ultima iteracion quede igual
            abd2.setDate(abd2.getDate() + 1)
          }
          this.listSemanasStart.push(abc);
          this.listSemanasFinish.push(abd2);
        }
      } else {
        // Ya no deberia entrar a otra semana si es mayor que el newdate
        fechaFin.setDate(fechaFin.getDate()+1);
      }
    }
    this.listhoras = [];
    // Una vez que obtengo las semana se debe crear el arreglo de horas
    
    for (let index = 0; index < this.listSemanasStart.length; index++) {
      this.listhoras[index] = 0;
      this.listCostoPlanificado[index] = 0;
      this.listCostoReal[index] = 0;
    }
  }

  calculateCostoPlanificado() {
    for(let i=0; i<this.ncantidadsemanas; i++) {
      for(let person of this.listProjectEstimate) {
        let rol = this.listInvestment.find(x=> x.nid_rol == person.nid_rol);
        let hora_estimada_semana = this.ListWeekPerson.filter(x => (x.nweeknumber == i+1 && x.nid_person==person.nid_person)).reduce((sum, current) => Number(sum) + Number(current.nhours_asigned), 0);
        let costoPlanificado = Number(rol.ncost_per_hour) * Number(hora_estimada_semana);
        this.listCostoPlanificado[i] += Number(costoPlanificado);
        this.listCostoPlanificado[i] = Number(this.listCostoPlanificado[i].toFixed(2));
        }
    }
  }

  getCostoReal(nid_person, fechaRegistro) {
    // Number(this.listCost.find(x=>x.nid_person == nid_person).ncost)
    var histCost = this.listCost.filter(x=>x.nid_person == nid_person);
    histCost.sort(function(a,b): any{
      return a.dcost_date.getTime() - b.dcost_date.getTime();
    });

    var ultima_pos = histCost.length - 1;
    if(ultima_pos < 0) {
      // show error message
      console.log("No hay costos para esta persona");
      return 0;
    }
    // La lista ordenada DESC
    if(fechaRegistro >= histCost[ultima_pos].dcost_date) {
      return histCost[ultima_pos].ncost;
    } else {
      // Validar a que rango corresponde
      for(let i = 0; i< ultima_pos; i++) {
        if(fechaRegistro >= histCost[i].dcost_date && fechaRegistro < histCost[i+1].dcost_date) {
          return histCost[i].ncost;
        } 
      }
    }


    // Si llega aca, el algoritmo esta mal xd o un personal registro hora cuando no tenia asignado costo (registra 09/10 y su primer costo registrado es 10/10)
    console.log("Error algoritmo fallido", nid_person, fechaRegistro);
    // He tenido problemas porque hay usuarios que tienen su costo 27-3-2023 y registran el 22-03-2023 pues no les retorna una costoReal
    // En este caso retornaré la primera ingresada
    return histCost[0].ncost;
  }

  calculo(){
    let fechaIni;
    let horas;
    let personId

    this.personHours = [];

    for(let i=0; i<this.listProjectHoursLog.length;i++){
      fechaIni = new Date(this.listProjectHoursLog[i].dregistration_date);

      personId = this.listProjectHoursLog[i].nid_person;
      horas= this.listProjectHoursLog[i].nnumber_hours;

      let costoReal = this.getCostoReal(personId, fechaIni);
      let sperson = this.listProjectHoursLog[i].sperson;

      let existingPerson = this.personHours.find((person) => person[0] === personId);

      if (!existingPerson) {
        let newArrayHoursForPerson = this.createArraySemanasWithCeros();
        this.personHours.push([personId, newArrayHoursForPerson, sperson]); // Agregar nueva persona y sus horas
      } 

      this.PerteneceSemana(fechaIni,horas, costoReal, personId);
    }

    for (let i = 0; i < this.listProjectHoursExt.length; i++) {
      fechaIni = new Date(this.listProjectHoursExt[i].dregistration_date);

      personId = this.listProjectHoursExt[i].nid_person;
      horas = this.listProjectHoursExt[i].nnumber_hours;

      let costoReal = this.listProjectHoursExt[i].costohora;
      let sperson = this.listProjectHoursExt[i].sperson;

      let existingPerson = this.personHours.find((person) => person[0] === personId);

      if (!existingPerson) {
        let newArrayHoursForPerson = this.createArraySemanasWithCeros();
        this.personHours.push([personId, newArrayHoursForPerson, sperson]); // Agregar nueva persona y sus horas
      }
      this.PerteneceSemana(fechaIni, horas, costoReal, personId);
    }

    // Lista de todos los integrantes y en caso no este su id dentro de personHours deberia crearles su arreglo con todo 0
    for(let i=0; i< this.listProjectPersonal.length; i++) {
      let existingPerson2 = this.personHours.find((personHour) => personHour[0] == this.listProjectPersonal[i].nid_person);
      if(!existingPerson2) {
        let newArrayHoursForPerson = this.createArraySemanasWithCeros();
        this.personHours.push([personId, newArrayHoursForPerson, this.listProjectPersonal[i].sperson]); // Agregar nueva persona y sus horas
      }
    }
  }


  createArraySemanasWithCeros() {
    let newArrayHoursForPerson = [];
    for (let index = 0; index < this.listSemanasStart.length; index++) {
      newArrayHoursForPerson[index] = 0;
    }
    return newArrayHoursForPerson;
  }

  PerteneceSemana(fechaIni,horas,costoReal, personId){
    let semana_pertenece = -1;
    for(let i=0; i<this.listSemanasFinish.length;i++){
      if(fechaIni >=this.listSemanasStart[i] && fechaIni<=this.listSemanasFinish[i]){
        semana_pertenece = i;
        break;
      }
    }
    
    if(semana_pertenece == -1) {
      return;
    }

    this.listhoras[semana_pertenece] += horas;
    this.listCostoReal[semana_pertenece] += Number(horas*costoReal);
    this.listCostoReal[semana_pertenece] = Number(this.listCostoReal[semana_pertenece].toFixed(2));

    // Agrego horas en las semanas de una persona
    this.personHours.find((person) => person[0] === personId)[1][semana_pertenece] += horas;
  }

  calcularCostoReal() {
    let fechaRegistro;
    let horas;
    this.costoReal = 0;

    for(let i=0; i<this.listProjectHoursLog.length;i++){
      fechaRegistro = new Date(this.listProjectHoursLog[i].dregistration_date);
      fechaRegistro.setDate(fechaRegistro.getDate() + 1);

      let costoRealIntegrante = this.getCostoReal(this.listProjectHoursLog[i].nid_person, fechaRegistro);
      horas = this.listProjectHoursLog[i].nnumber_hours;
      this.costoReal += (Number(costoRealIntegrante) * Number(horas));
    }

    for(let i = 0; i< this.listProjectHoursExt.length; i++) {
      horas= this.listProjectHoursExt[i].nnumber_hours;
      let costoReal = this.listProjectHoursExt[i].costohora;
      this.costoReal += (Number(costoReal) * Number(horas));
    }
  }

  FilterPersonWeek(nidperson: number) {
    let lista = this.ListWeekPerson.filter(x => x.nid_person == nidperson);
    return lista.slice(0, this.ncantidadsemanas);
  }

  mensajeError(message: string) {
    Swal.fire('Error', message, 'info');
  }

  llenarGrafico2() {
    this.grafico2.data.datasets = [];


    this.cumplimiento_tareasATiempo = 0;
    this.cumplimiento_tareasFueraDeTiempo = 0;
    this.cumplimiento_tareasTerminadas = 0;
    this.cumplimiento_avanceDelProyecto = 0;
    this.cumplimiento_totalTareas = this.listAvanceProyecto.length;
  

    for (let i = 0; i < this.listAvanceProyecto.length; i++) {
      
      const tarea = this.listAvanceProyecto[i];
      
      let color;
      if(tarea.real >= tarea.planificado) {
        color = "#00ff00";
        tarea.planificado == 100? this.cumplimiento_tareasTerminadas += 1 : this.cumplimiento_tareasATiempo += 1;
      } else {
        this.cumplimiento_tareasFueraDeTiempo += 1;
        color = "#ff0000";
      }

      let newData = {
        label: tarea.name,
        data: [{x: tarea.planificado, y: tarea.real}],
        borderWidth: 1,
        backgroundColor: [color],
        pointRadius: 8
      }

      this.grafico2.data.datasets.push(newData);

    }
    this.grafico2.update();

  }

  llenarGrafico3(){
    this.grafico3.data.labels = this.facturacion_labels;

    this.grafico3.data.datasets = [];
    this.grafico3.data.datasets.push({
      label: 'Esperado',
      data: this.facturacion_montoesperado,
      borderWidth: 2,
    })
    this.grafico3.data.datasets.push({
      label: 'Real',
      data: this.facturacion_montoreal,
      borderWidth: 2,
    })
    this.grafico3.data.datasets.push({
      label: 'Facturado',
      data: this.facturacion_montofacturado,
      borderWidth: 2,
    })
    this.grafico3.update();
  }

  llenarNuevoGrafico() {
    this.grafico1.data.labels = [];
    this.grafico1.data.datasets[0].data = [];
    this.grafico1.data.datasets[1].data = [];

    this.grafico1.data.labels.push("Ingresos")
    this.grafico1.data.datasets[0].data.push(this.projectStep5.nexpected_income);
    this.grafico1.data.datasets[1].data.push(this.ingresosReales);
    
    this.grafico1.data.labels.push("Costos")
    this.grafico1.data.datasets[0].data.push(this.projectStep5.ntotal_investment + this.projectStep5.ntotal_external_cost);
    this.grafico1.data.datasets[1].data.push(this.costoReal);

    this.grafico1.data.labels.push("Utilidad")
    this.grafico1.data.datasets[0].data.push(this.projectStep5.nexpected_utility);
    this.grafico1.data.datasets[1].data.push((this.ingresosReales - this.costoReal));
    
    this.grafico1.update();
  }

  RenderChart() {
    this.grafico1 = new Chart("barchart1", {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Esperado',
            data: [],
            borderWidth: 1,
            backgroundColor: ["#41cfe3"]
          },
          {
            label: 'Real',
            data: [],
            borderWidth: 1,
            backgroundColor: ["#ec7c1c"]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            // min: 0,
            // suggestedMax: 100,
            ticks: {
              callback: function(value, index, ticks) {
                return "S/." + Number(value).toFixed(0);
              }
            }
          }
        },
        datasets: {
          bar: {
            barPercentage: 1
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'RENTABILIDAD DEL PROYECTO'
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';

                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += "S/." +  context.parsed.y.toFixed(2);
                }
                return label;
              }
            }
          },
          datalabels: {
            anchor: 'center',
            align: 'center',
            font: {
              weight: 'bold'
            },
            color: '#fff',
            formatter: function(value, context) {
              return "S/." + Number(value).toFixed(0);
            }
          }
        }
      },
    });

    this.grafico2 = new Chart('chartCanvas', {
      type: 'scatter',
      data: {
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Avance Planificado'
            },
            ticks: {
              callback: function (value, index, ticks) {
                return Number(value).toFixed(0) + '%';
              }
            }
          },
          y: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Avance Real'
            },
            ticks: {
              callback: function (value, index, ticks) {
                return Number(value).toFixed(0) + '%';
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'CUMPLIMIENTO DEL CRONOGRAMA'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
      
                if (label) {
                  label += ': ';
                }
                if (context.parsed.x !== null && context.parsed.y !== null) {
                  const planificado = context.parsed.x;
                  const real = context.parsed.y;
      
                  label += 'Planificado: ' + planificado.toFixed(2) + '%, Real: ' + real.toFixed(2) + '%';
                }
                return label;
              }
            }
          }
        },
       
      }
    });

    this.grafico3 = new Chart('ganttChart', {
      type: 'line',
      data: {
        labels: ['17-Enero', '30-Enero', '1-Febrero'],
        datasets: [
          {
            label: 'Real',
            data: [1000, 2000, 3000 ],
          },
          {
            label: 'Esperado',
            data: [2000, 3000,5000]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Cumplimiento de hitos de facturación del proyecto'
          }
        },
        elements: {
          line: {
            backgroundColor: ['#123d63', "#ec7c1c", "#94bb68"],
            borderColor: ['#123d63', "#ec7c1c", "#94bb68"],
          }   
        }
      }
    });
  }

  indicadorSemaforo(nweeknumber) {
    let numero = this.listCostoPlanificado[nweeknumber];
    let numero2 = this.listCostoReal[nweeknumber];
    return numero >= numero2? 'green': 'red' ;
  }

  indicadorSemaforoNumber(nweeknumber) {
    let numero = this.listCostoPlanificado[nweeknumber];
    let numero2 = this.listCostoReal[nweeknumber];
    return (numero - numero2).toFixed(2);
  }

  downloadAsPDF() {
    const pdf = new jsPDF();

    let nombre = this.filterProject.scodproject + '-' + this.inputNombreServicio
    // Selecciona el elemento HTML que deseas convertir en PDF
    const element = document.getElementById('pruebita')!;

    // Convierte el elemento en una imagen utilizando html2canvas
    html2canvas(element).then((canvas) => {
      const imageData = canvas.toDataURL('image/png');

      // Agrega la imagen al PDF
      pdf.addImage(imageData, 'PNG', 10, 10, 190, 0);

      // Descarga el PDF
      pdf.save(`${nombre}.pdf`);
      
    });
  }
}
