import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { MasterTable } from '../../model/common/mastertable';
import { DropDownList, PersonManagerJp } from '../../model/dropdownlist/DropDownList';
import { PersonCostHist } from '../../model/person/person.model';
import { FilterProject } from '../../model/project/filterproject';
import { ProgressDetail, ProjectEstimate, ProjectStep3Investment, WeeksProjectPerson } from '../../model/project/project';
import { ClientService } from '../../services/client/client.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { Client } from '../../model/client/client';

@Component({
  selector: 'app-indicador-proyectos',
  templateUrl: './indicador-proyectos.component.html',
  styleUrls: ['./indicador-proyectos.component.css']
})
export class IndicadorProyectosComponent implements OnInit {

  public BreadLevel01 = 'Indicadores';
  public Title = 'Indicadores de Desempeño del Proyecto';

  filterProject: FilterProject = new FilterProject();
  projectList: any[] = [];
  currentPage: number = 1; // seteamos a la pagina 1
  itemsPerPage: number = 20; // mostramos 5 registros por pagina
  totalItems: number = 0; // Total de registro

  listState: MasterTable[] = [];
  ClientDropDownList: Client[];
  ProjectTypeDropDownList: any[];
  PersonDropDownList: DropDownList[];
  personManagerJpList: PersonManagerJp[];

  listInvestment: ProjectStep3Investment[] = [];
  listCost: PersonCostHist[] = [];
  ListWeekPerson: WeeksProjectPerson[] = [];
  listProjectEstimate: ProjectEstimate[] = [];
  listProjectPersonal: ProjectEstimate[] = [];
  listProjectEstimateAuxiliary: ProjectEstimate[] = [];
  listProjectHoursLog: any[] = [];

  dataToPush = [];

  grafico1: Chart;

  mensajeError = "";
  
  tablaProjectos: any[] = [];

  costo_real= 0;
  costo_planificado= 0;
  horas_real= 0;
  horas_planificado= 0;
  cumpli_costo = 0;
  cumpli_horas = 0;
  cronograma_planificado=0;
  cronograma_real=0;
  listProjectHoursExt: any[];
  
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private mastertableService: MastertableService,
    private clientService: ClientService,
    private personService: PersonService,
    private projectTypeService: ProjectTypeService,
  ) {
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
  }

  ngOnInit() {
    this.filterProject.nid_status = 1;
    this.getPersonManagerJp();
    this.getState();
    this.getClientDropDown();
    this.getProjectTypeDropDown();
    this.getPersonDropDown();
    this.RenderChart();
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
    this.mastertableService.getmastertable(9052).subscribe((response: any) => {

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

  getPersonManagerJp(){
    this.spinner.show('SpinnerProject');
    this.personService.personmanagerjp(0).subscribe((response: any) => {
      if (response == null) {
        return;
      }
      console.log(response);
      
      this.personManagerJpList = response;
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  search() {
    // this.showFormDetails = false;

    this.spinner.show();

    this.filterProject.nid_manager = Number(this.filterProject.nid_manager);


    this.filterProject.nid_project_type = Number(this.filterProject.nid_project_type);
    this.filterProject.nid_status = +this.filterProject.nid_status;

    this.filterProject.nid_client = Number(this.filterProject.nid_client);
    console.log(this.filterProject);
    
    this.projectService.getprojectpagination(this.filterProject).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.projectList = res.data;
        this.totalItems = res.pagination.totalItems;
        this.getDataGraphic();
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

  getDataGraphic() {
    // this.grafico1.data.datasets.pop();
    // this.grafico1.data.datasets = [];
    this.grafico1.data.labels = [];

    this.grafico1.data.datasets[0].data = [];
    this.grafico1.data.datasets[1].data = [];
    this.grafico1.data.datasets[2].data = [];

    this.mensajeError = "";

    this.tablaProjectos = [];
    this.costo_real= 0;
    this.costo_planificado= 0;
    this.horas_real= 0;
    this.horas_planificado= 0;
    this.cumpli_costo = 0;
    this.cumpli_horas = 0;

    this.projectList.forEach((project) => {

      let dataproject = [project.scodproject ,0,0, 0];
      // Registro de tareas, servirá para obtene el ultimo registrado
      var progressRegistration = lastValueFrom(this.projectService.getprojectprogress(project.scodproject));

      var projectStep3 = lastValueFrom(this.projectService.getprojectdtep3(project.scodproject));

      // Devuelve el costo para cada integrante del proyecto  
      var costoIntegrantes = lastValueFrom(this.personService.getPersonCostByScodproject(project.scodproject));

      // Esto devuelve las horas estimadas
      var horasEstimadas = lastValueFrom(this.projectService.getprojectweekperson(project.scodproject));

      // La lista de personal estimado
      var personalEstimado = lastValueFrom(this.projectService.getprojectestimate(project.scodproject, 2));

      // Devuelve las horas registradas para el proyecto
      var horasRegistradas = lastValueFrom(this.projectService.getprojecthourslog(project.scodproject));

      // Obtener horas registradas de personal externo y proveedores
      var horasRegistradasExt = lastValueFrom(this.projectService.getprojecthoursext(project.scodproject));


      Promise.all([progressRegistration, projectStep3, costoIntegrantes, horasEstimadas, personalEstimado, horasRegistradas, horasRegistradasExt]).then((value: any) => {
        // Obtener el ultimo registro de tareas
        let lastProgressRegistration: ProgressDetail[] = [];
        let cumpli_cronograma = [];

        if (value[0] != null && value[0] != undefined) {
          lastProgressRegistration = value[0][0].listProgressDetail;
          cumpli_cronograma = this.calcularCumplimientoCronograma(lastProgressRegistration);
          dataproject[3] =  cumpli_cronograma[1] + " / " + cumpli_cronograma[2]; 
        }


        // Step 3
        this.listInvestment = value[1].listInvestment;

        // Costo Integrante
        this.listCost = value[2];
        if (this.listCost === null || this.listCost === undefined) {
          this.mensajeError += project.scodproject + ": Debe asignar personal al proyecto" + "\n";
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
        let planificado = this.calculateCostoPlanificado();
        this.costo_planificado = planificado[0];
        this.horas_planificado = planificado[1];

        if (value[5] === null || value[5] === undefined) {
          this.mensajeError += "No existen horas registradas en el proyecto: " + project.scodproject + "\n";
          return;
        }

        this.listProjectHoursLog = value[5].filter(x => x.sstate == "A");

        if(value[6]!=null){
          this.listProjectHoursExt = value[6].filter(x => x.sstate == "A");
          console.log(this.listProjectHoursExt);
        }
        
        let real = this.calcularCostoReal();
        this.costo_real = real[0];
        this.horas_real = real[1];

        this.cumpli_costo = this.costo_real / this.costo_planificado;
        this.cumpli_horas = this.horas_real / this.horas_planificado;

        dataproject[1] = this.horas_planificado + " / " + this.horas_real;
        dataproject[2] = this.costo_planificado + " / " + this.costo_real;



        this.tablaProjectos.push(dataproject);
        this.llenarNuevoGrafico(project.scodproject + " - "  + project.snameproject  , cumpli_cronograma[0]* 100, this.cumpli_costo*100, this.cumpli_horas*100);
        
      });


    })
  }

  llenarNuevoGrafico(scodproject, cumpli_cronograma, cumpli_costo, cumpli_horas) {
    this.grafico1.data.labels.push(scodproject)
    this.grafico1.data.datasets[0].data.push(cumpli_horas);
    this.grafico1.data.datasets[1].data.push(cumpli_costo);
    this.grafico1.data.datasets[2].data.push(cumpli_cronograma);
    this.grafico1.update();
  }

  calcularCumplimientoCronograma(lastProgressRegistration: ProgressDetail[]) {
    let respuesta = 0;
    this.cronograma_planificado = 0;
    this.cronograma_real = 0;
    lastProgressRegistration.forEach(registration => {
      if (registration.planificado != 0) {
        this.cronograma_planificado += registration.planificado;
        this.cronograma_real += registration.real;
        //respuesta += (registration.real / registration.planificado) Mal Cálculo
      }
    })
    this.cronograma_planificado = this.cronograma_planificado / lastProgressRegistration.length;
    this.cronograma_real = this.cronograma_real / lastProgressRegistration.length;
    //Este calculo es un porcentaje respecto al total de tareas que hay, no es una estadística muy representativa del avance
    //Un mejor criterio para calcular este porcentaje sería ponderar cada tarea según la cantidad de dias estimados que toma desarrollar
    respuesta = this.cronograma_real / this.cronograma_planificado;
    return [Number(respuesta), this.cronograma_planificado, this.cronograma_real];
  }

  calculateCostoPlanificado() {
    let respuesta1 = 0;
    let respuesta2 = 0;

    let respuesta = [];
    for (let person of this.listProjectEstimate) {
      let rol = this.listInvestment.find(x => x.nid_rol == person.nid_rol);
      let horas_estimada = this.ListWeekPerson?.filter(x => (x.nid_person == person.nid_person)).reduce((sum, current) => Number(sum) + Number(current.nhours_asigned), 0);
      let costoPlanificado = Number(rol.ncost_per_hour) * Number(horas_estimada);
      respuesta1 += Number(costoPlanificado);
      respuesta2 += Number(horas_estimada);
    }

    respuesta.push(Number(respuesta1.toFixed(2)));
    respuesta.push(Number(respuesta2.toFixed(2)));
    return respuesta;
  }

  calcularCostoReal() {
    let fechaRegistro;
    let horas;
    let respuesta1 = 0;
    let respuesta2 = 0;
    let respuesta = [];

    for (let i = 0; i < this.listProjectHoursLog.length; i++) {
      fechaRegistro = new Date(this.listProjectHoursLog[i].dregistration_date);
      fechaRegistro.setDate(fechaRegistro.getDate() + 1);

      let costoRealIntegrante = this.getCostoReal(this.listProjectHoursLog[i].nid_person, fechaRegistro);
      horas = this.listProjectHoursLog[i].nnumber_hours;
      respuesta1 += (Number(costoRealIntegrante) * Number(horas));
      respuesta2 += horas;
    }

    let horas1;
    let sumHoras=0;
    let sumCostoReal=0;
    for(let i=0; i<this.listProjectHoursExt?.length;i++){
      let costoReal = this.listProjectHoursExt[i].costohora;
      horas1 = this.listProjectHoursExt[i].nnumber_hours;
      sumHoras=sumHoras+horas1;
      sumCostoReal=sumCostoReal+costoReal;
    }
    respuesta1+=sumCostoReal;
    respuesta2+=sumHoras;
    respuesta.push(Number(respuesta1.toFixed(2)));
    respuesta.push(Number(respuesta2.toFixed(2)));

    return respuesta;
  }


  getCostoReal(nid_person, fechaRegistro) {
    // Number(this.listCost.find(x=>x.nid_person == nid_person).ncost)
    var histCost = this.listCost.filter(x => x.nid_person == nid_person);
    histCost.sort(function (a, b): any {
      return a.dcost_date.getTime() - b.dcost_date.getTime();
    });

    var ultima_pos = histCost.length - 1;
    if (ultima_pos < 0) {
      // show error message
      console.log("No hay costos para esta persona");
      return 0;
    }
    // La lista ordenada DESC
    if (fechaRegistro >= histCost[ultima_pos].dcost_date) {
      return histCost[ultima_pos].ncost;
    } else {
      // Validar a que rango corresponde
      for (let i = 0; i < ultima_pos; i++) {
        if (fechaRegistro >= histCost[i].dcost_date && fechaRegistro < histCost[i + 1].dcost_date) {
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


  RenderChart() {
    this.grafico1 = new Chart("barchart", {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Cumplimiento horas',
            data: [],
            borderWidth: 1,
            backgroundColor: ["#41cfe3"]
          },
          {
            label: 'Cumplimiento Costo',
            data: [],
            borderWidth: 1,
            backgroundColor: ["#ec7c1c"]
          },
          {
            label: 'Cumplimiento Cronograma',
            data: [],
            borderWidth: 1,
            backgroundColor: ["#54df88"]
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            suggestedMax: 100,
            ticks: {
              callback: function(value, index, ticks) {
                return Number(value).toFixed(0) + "%";
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
            text: 'CUMPLIMIENTO DE HORAS,COSTO Y CRONOGRAMA POR PROYECTO'
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
                    label += context.parsed.y.toFixed(2) + "%";
                }
                return label;
              }
            }
          }
        }
      },
    })
    this.search();
  }

  paginarTablaProyectos() {
    let indiceInicial = (this.paginaActual  - 1) * this.elementosPorPagina;
    let indiceFinal = indiceInicial + this.elementosPorPagina;
    return this.tablaProjectos.slice(indiceInicial, indiceFinal);
  }
  totalPaginas(): number {
    return Math.ceil(this.tablaProjectos.length/this.elementosPorPagina);
  }
}
