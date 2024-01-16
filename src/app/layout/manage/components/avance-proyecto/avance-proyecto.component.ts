import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef, Inject } from '@angular/core';
import { ProjectEstimate, WeeksProjectPerson, WeekAvance, Project, ProjectStep2, ProjectStep2Detail, ProjectStep3, ProjectStep3Investment, ProjectStep3Cost, ProjectStep4, ProjectStep5, ProjectStep4Detail } from '../../model/project/project';
import { ClientService } from '../../services/client/client.service';
import { ProjectService } from '../../services/project/project.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'src/app/layout/manage/model/user/user';
import { MastertableService } from '../../services/common/mastertable.service';
import { PersonService } from '../../services/person/person.service';
import { PersonCostHist } from '../../model/person/person.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-avance-proyecto',
  templateUrl: './avance-proyecto.component.html',
  styleUrls: ['./avance-proyecto.component.css']
})
export class AvanceProyectoComponent implements OnInit {

  scodproject = "";
  snameproject = "";
  titleProjectModal = "";

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
  listCostoPlanificadoReal: number[]=[];
  listCostoReal: number[]=[];

  listProjectEstimate:ProjectEstimate[] = [];
  listProjectPersonal: ProjectEstimate[] = [];
  listProjectEstimateAuxiliary: ProjectEstimate[] = [];
  listhorasRegistradasExt: any[] = [];

  listCost:PersonCostHist[] = [];

  listInvestment :ProjectStep3Investment[]=[];
  

  constructor(
    private dialogRef: MatDialogRef<AvanceProyectoComponent>,
    private clientService: ClientService,
    private servicePerson: PersonService,
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private mastertableService:MastertableService,
    private modalService: NgbModal,
    @Inject(MAT_DIALOG_DATA) private data: any
    ) 
    {
    dialogRef.disableClose = true;

     }

  ngOnInit() {
    this.scodproject       = this.data['scodproject'];
    this.snameproject      = this.data['snameproject'];
    this.titleProjectModal = this.data['titleProjectModal'];

    if (this.scodproject != "") {
      this.esperarRespuesta();
    }
  }

  esperarRespuesta() {
    var projectStep3 = lastValueFrom(this.projectService.getprojectdtep3(this.scodproject));
    var projectStep2 = lastValueFrom(this.projectService.getprojectdtep2(this.scodproject));
  
    // Devuelve el costo para cada integrante del proyecto  
    var costoIntegrantes = lastValueFrom(this.servicePerson.getPersonCostByScodproject(this.scodproject));

    // Esto devuelve las horas estimadas
    var horasEstimadas = lastValueFrom(this.projectService.getprojectweekperson(this.scodproject));

    // La lista de personal estimado
    var personalEstimado = lastValueFrom(this.projectService.getprojectestimate(this.scodproject, 2));

    // Devuelve las horas registradas para el proyecto
    var horasRegistradas = lastValueFrom(this.projectService.getprojecthourslog(this.scodproject));

    // Obtener horas registradas de personal externo y proveedores
    var horasRegistradasExt = lastValueFrom(this.projectService.getprojecthoursext(this.scodproject));

    this.spinner.show('SpinnerProject');
    Promise.all([projectStep3, projectStep2,costoIntegrantes, horasEstimadas, personalEstimado, horasRegistradas,horasRegistradasExt]).then((value: any) => {
      this.spinner.hide('SpinnerProject');
      // Step 3
      this.listInvestment = value[0].listInvestment;

      // Step 2
      this.projectStep2 = value[1];
      this.ncantidadsemanas = this.projectStep2.nweeks;
      this.arrayNumberWeek = new Array<number>(this.ncantidadsemanas);
      this.generateArregloSemanas();
      
      // Costo Integrante
      this.listCost = value[2];
      if(this.listCost === null || this.listCost === undefined) {
        this.mensajeError("Debe asignar personal al proyecto");
        return;
      }
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

      this.calculo();

      // Las horas resgistradas del personal externo o proveedores
      this.listhorasRegistradasExt = value[6].filter(x => x.sstate == "A");

      console.log(this.listhorasRegistradasExt);
      

      this.calculoExt();
      
    })
  }

  generateArregloSemanas() {
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
      this.listCostoPlanificadoReal[index] = 0;
      this.listCostoReal[index] = 0;
    }
  }

  calculo(){
    let fechaIni;
    let horas;
    for(let i=0; i<this.listProjectHoursLog.length;i++){
      fechaIni = new Date(this.listProjectHoursLog[i].dregistration_date);
      // fechaIni.setDate(fechaIni.getDate() + 1);
      // let nid_rol = this.listProjectEstimate.find(x=>x.nid_person == this.listProjectHoursLog[i].nid_person).nid_rol
      let costoReal = this.getCostoReal(this.listProjectHoursLog[i].nid_person, fechaIni);
      horas= this.listProjectHoursLog[i].nnumber_hours;
      this.PerteneceSemana(fechaIni,horas, costoReal);
    }
  }

  calculoExt(){
    let fechaIni;
    let horas;
    for(let i=0; i<this.listhorasRegistradasExt.length;i++){
      fechaIni = new Date(this.listhorasRegistradasExt[i].dregistration_date);
      // fechaIni.setDate(fechaIni.getDate() + 1);
      // let nid_rol = this.listProjectEstimate.find(x=>x.nid_person == this.listProjectHoursLog[i].nid_person).nid_rol
      let costoReal = this.listhorasRegistradasExt[i].costohora;
      horas= this.listhorasRegistradasExt[i].nnumber_hours;
      this.PerteneceSemana(fechaIni,horas, costoReal);
    }
  }

  PerteneceSemana(fechaIni,horas,costoReal){
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
  }

  calculateCostoPlanificado() {
    for(let i=0; i<this.ncantidadsemanas; i++) {
      for(let person of this.listProjectEstimate) {
        let rol = this.listInvestment.find(x=> x.nid_rol == person.nid_rol);
        let hora_estimada_semana = this.ListWeekPerson.filter(x => (x.nweeknumber == i+1 && x.nid_person==person.nid_person)).reduce((sum, current) => Number(sum) + Number(current.nhours_asigned), 0);
        let costoPlanificado = Number(rol.ncost_per_hour) * Number(hora_estimada_semana);
        this.listCostoPlanificado[i] += Number(costoPlanificado);
        this.listCostoPlanificado[i] = Number(this.listCostoPlanificado[i].toFixed(2));
        
        // TODO: ESTE COSTO REAL esta mal porque obtiene el costo real x persona segunda la fecha que se iinicio el proyecto
        var fechaIni = new Date(this.projectStep2.dbegin_date);
        fechaIni.setDate(fechaIni.getDate() + 1);

        let costoReal = this.getCostoReal(person.nid_person,fechaIni);
        this.listCostoPlanificadoReal[i] += Number(hora_estimada_semana * costoReal);
        this.listCostoPlanificadoReal[i] = Number(this.listCostoPlanificadoReal[i].toFixed(2));
      }
    }
  }

  getCostoReal(nid_person, fechaIni) {
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
    if(fechaIni >= histCost[ultima_pos].dcost_date) {
      return histCost[ultima_pos].ncost;
    } else {
      // Validar a que rango corresponde
      for(let i = 0; i< ultima_pos; i++) {
        if(fechaIni >= histCost[i].dcost_date && fechaIni < histCost[i+1].dcost_date) {
          return histCost[i].ncost;
        } 
      }
    }
    // Si llega aca, el algoritmo esta mal xd o un personal registro hora cuando no tenia asignado costo (registra 09/10 y su primer costo registrado es 10/10)
    console.log("Error algoritmo fallido");
    // He tenido problemas porque hay usuarios que tienen su costo 27-3-2023 y registran el 22-03-2023 pues no les retorna una costoReal
    // En este caso retornaré la primera ingresada
    return histCost[0].ncost;
  }
 
  totalxweek(nweeknumber) {
    let numero = this.ListWeekPerson.filter(x => x.nweeknumber == nweeknumber).reduce((sum, current) => Number(sum) + Number(current.nhours_asigned), 0);
    return numero;
  }

  indicadorSemaforo(nweeknumber) {
    let numero = this.ListWeekPerson.filter(x => x.nweeknumber == nweeknumber).reduce((sum, current) => Number(sum) + Number(current.nhours_asigned), 0);
    let numero2 = this.listhoras[nweeknumber-1];
    return numero >= numero2? 'green': 'red' ;
  }

  close(): void {
    this.dialogRef.close(null);
  }

  mensajeError(message: string) {
    Swal.fire('Error', message, 'info');
  }
}
