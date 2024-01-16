import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { Chart, registerables } from 'node_modules/chart.js';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { PersonCostHist } from '../../../model/person/person.model';
import { ProjectEstimate, ProjectInvoicing, ProjectStep2, ProjectStep3Investment, ProjectStep5, WeekAvance, WeeksProjectPerson } from '../../../model/project/project';
import { PersonService } from '../../../services/person/person.service';
import { ProjectService } from '../../../services/project/project.service';

Chart.register(...registerables);

@Component({
  selector: 'app-modal-indicador-proyecto',
  templateUrl: './modal-indicador-proyecto.component.html',
  styleUrls: ['./modal-indicador-proyecto.component.css']
})
export class ModalIndicadorProyectoComponent implements OnInit {

    
  scodproject = "";
  sstatusname = "";
  snameproject = "";
  titleProjectModal = "";

  projectStep5 :ProjectStep5 = new ProjectStep5();
  listInvoicing: ProjectInvoicing[] = [];
  ingresosReales: number = 0;
  costoReal: number = 0;
  listCost:PersonCostHist[] = [];

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

  graphCostoPlanificadoMensual: number[] = [];
  graphCostoRealMensual: number[] = [];


  listProjectEstimate:ProjectEstimate[] = [];

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
  
  grafico1: Chart;
  grafico2: Chart;

  simbMoneda = "";

  constructor(    
    private projectService: ProjectService,
    private servicePerson: PersonService,
    private spinner: NgxSpinnerService,
    private dialogRef: MatDialogRef<ModalIndicadorProyectoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) { 
    dialogRef.disableClose = true;

    }


  ngOnInit(): void {
    this.scodproject       = this.data['scodproject'];
    this.sstatusname       = this.data['sstatusname'];
    this.snameproject      = this.data['snameproject'];
    this.titleProjectModal = this.data['titleProjectModal'];
    this.getProjectdtep5();
    this.getFacturacion();
    this.esperarRespuesta();
  }

  getProjectdtep5(){
    this.projectService.getprojectdtep5(this.scodproject).subscribe((response: any) => {
      this.projectStep5 = response;
    }, (error) => {
      console.error(error);
    });
  }

  getFacturacion() {
    this.projectService.getprojectinvoicing(this.scodproject).subscribe((response: any) => {

      console.log(response, "Lo facturado");
      if(response != null) {
        this.listInvoicing = response;
        this.ingresosReales = 0;
        this.listInvoicing.forEach(invo => {
          if(invo.bpaid) {
            this.ingresosReales +=  Number(invo.namount);
          }
        })
      } else {
        this.listInvoicing = [];
        this.ingresosReales = 0;
      }
    });
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
    var horasRegistradas= lastValueFrom(this.projectService.getprojecthourslog(this.scodproject));

    this.spinner.show('SpinnerProject');
    Promise.all([projectStep3, projectStep2,costoIntegrantes, horasEstimadas, personalEstimado, horasRegistradas]).then((value: any) => {
      this.spinner.hide('SpinnerProject');
      // Step 3
      console.log(value[0]);

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

      // Personal estimado
      this.listProjectEstimate = value[4].filter(x=> x.isAuxiliary == false);

      // Horas Registradas
      this.calculateCostoPlanificado();
      
      if(value[5]=== null || value[5]=== undefined) {
        this.mensajeError("No existen horas registradas en el proyecto");
        return;
      }

      this.listProjectHoursLog = value[5].filter(x => x.sstate == "A");
      this.calculo();
      this.calcularCostoReal();
      this.calculateCostoPlanificadoMensual();
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
    abc.setHours(0,0,0,0);
    this.listSemanasStart.push(abc);
    abd.setHours(0,0,0,0);
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
          abc.setHours(0,0,0,0);
          this.listSemanasStart.push(abc);
          abd.setHours(0,0,0,0);
          this.listSemanasFinish.push(abd);
        } else {
          let abd2 = new Date(fechaFin.setDate(fechaFin.getDate()-7));
          let ultimaSemana = new Date(newDate);
          ultimaSemana.setDate(ultimaSemana.getDate() -1 );
          while (abd2 < ultimaSemana) { // Mientras que sea menor, para que en la ultima iteracion quede igual
            abd2.setDate(abd2.getDate() + 1)
          }
          abc.setHours(0,0,0,0);
          this.listSemanasStart.push(abc);
          abd2.setHours(0,0,0,0);
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

  calculateCostoPlanificadoMensual(render?) {
    let date1 = new Date(this.date1String)
    date1.setDate(date1.getDate() + 1);
    
    let date2 = new Date(this.date2String)
    date2.setDate(date2.getDate() + 1);
    

    let mesInicial = date1.getMonth();
    let anioInicial = date1.getFullYear();
    let mesFinal = date2.getMonth();
    let anioFinal = date2.getFullYear();
    
    let months = (anioFinal - anioInicial) * 12;
    months -= mesInicial;
    months += mesFinal;

    months++;

    let arregloMeses = this.obtenerArregloMeses(mesInicial, months, anioInicial);

    this.mesesLabel = [];
    // Podria ir quitando la semana que ya se uso de la lista
    for(let i = 0; i< arregloMeses.length; i++) {
      this.graphCostoPlanificadoMensual[i] = 0;
      this.graphCostoRealMensual[i] = 0;
      this.mesesLabel.push(arregloMeses[i][0]);
      for(let j = 0; j < this.ncantidadsemanas; j++) {
        if(this.listSemanasStart[j].getMonth() == arregloMeses[i][1] && this.listSemanasStart[j].getFullYear() == arregloMeses[i][2]) {
          this.graphCostoPlanificadoMensual[i] += this.listCostoPlanificado[j];
          this.graphCostoRealMensual[i] += this.listCostoReal[j];
        } else {
          console.log("Este no suma", this.listCostoReal[j])
        }
      }
    }

    if(render != null && render != undefined) {
      this.grafico1.data.labels.pop();
      this.grafico1.data.labels = this.mesesLabel;
      // this.grafico1.data.datasets.pop();
      this.grafico1.data.datasets[0].data = this.graphCostoPlanificadoMensual;
      this.grafico1.data.datasets[1].data = this.graphCostoRealMensual;
      this.grafico1.update();
    } else {
      this.RenderChart();
    }
  }

  RenderChart() {
    
    // Grafico 1
   this.grafico1 = new Chart("linechart", {
      type: 'line',
      data: {
        labels: this.mesesLabel,
        datasets: [
          {
          label: "Costo Planificado",
          data: this.graphCostoPlanificadoMensual,
          borderWidth: 1,
          pointBackgroundColor: '#123d63'
          },
          {
            label: 'Costo Real',
            data: this.graphCostoRealMensual,
            borderWidth: 1,
            pointBackgroundColor: '#ec7c1c'
          }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements:{
          line: {
            backgroundColor: ['#123d63', "#ec7c1c"],
            borderColor: ['#123d63', "#ec7c1c"],
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value, index, ticks) => {
                value = this.addCommas(value)
                return  value;
              }
            }
          }
        },
        plugins:{
          title: {
            display: true,
            text: 'Variación de Costo del Proyecto'
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';

                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {

                  let value = this.addCommas(context.parsed.y)
                  label +=  value;
                }

                return label;
              }
            }
          }
        }
      }
    });

    
    this.grafico2 = new Chart("barchart", {
      type: 'bar',
      data: {
        labels: ['Utilidad Proyectada', 'Real'],
        datasets: [
          {
            label: 'Utilidad',
            data: [(this.projectStep5.nmargin), this.getMargen()],
            borderWidth: 1,
            maxBarThickness: 100,
            backgroundColor: ["#123d63", "#ec7c1c"]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              callback: function(value, index, ticks) {
                return Number(value).toFixed(0) + "%";
              }
            }
          }
        },
        plugins:{
          title: {
            display: true,
            text: 'Utilidad Proyecta vs Real'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                let label1 = "";
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(2) + "%";
                  if(context.label == "Real") {
                    label1 = this.addCommas(this.ingresosReales - this.costoReal)
                  } else {
                    label1 = this.addCommas(this.projectStep5.nexpected_utility)
                  }
                }
                let labelsArr = [label, label1]
                return labelsArr;
              }
            }
          }
        }
      },
    })
  }

  getByValue(searchValue) {
    for (let [key, value] of this.let_mes.entries()) {
      if (value === searchValue)
        return key;
    }
    return 0;
  }

  // arreglo[mesString, mesNumber, year]
  obtenerArregloMeses(mesInicial, months, anioInicial) {
    let array = [];
    
    months = months > 12? 12: months;

    let monthPush = mesInicial;
    for(let i = 1; i <= months; i++) {
      array.push([this.let_mes.get(monthPush), monthPush, anioInicial]);
      if(monthPush >= 11) {
        monthPush = 0;
        anioInicial++;
      } else {
        monthPush++;
      }
    }

    return array;
  }

  calculo(){
    let fechaIni;
    let horas;
    for(let i=0; i<this.listProjectHoursLog.length;i++){
      fechaIni = new Date(this.listProjectHoursLog[i].dregistration_date);
      // fechaIni.setDate(fechaIni.getDate() + 1);
      let costoReal = this.getCostoReal(this.listProjectHoursLog[i].nid_person, fechaIni);
      horas= this.listProjectHoursLog[i].nnumber_hours;
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
      console.log("No pertenece a ninguna semana", costoReal, fechaIni, this.listSemanasStart[0], fechaIni >=this.listSemanasStart[0] );
      
      return;
    }
    this.listhoras[semana_pertenece] += horas;
    this.listCostoReal[semana_pertenece] += Number(horas*costoReal);
    this.listCostoReal[semana_pertenece] = Number(this.listCostoReal[semana_pertenece].toFixed(2));
  }

  calcularCostoReal() {
    let fechaRegistro;
    let horas;
    for(let i=0; i<this.listProjectHoursLog.length;i++){
      fechaRegistro = new Date(this.listProjectHoursLog[i].dregistration_date);
      fechaRegistro.setDate(fechaRegistro.getDate() + 1);

      let costoRealIntegrante = this.getCostoReal(this.listProjectHoursLog[i].nid_person, fechaRegistro);
      horas = this.listProjectHoursLog[i].nnumber_hours;
      this.costoReal += (Number(costoRealIntegrante) * Number(horas));
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
    console.log("Error algoritmo fallido");
    // He tenido problemas porque hay usuarios que tienen su costo 27-3-2023 y registran el 22-03-2023 pues no les retorna una costoReal
    // En este caso retornaré la primera ingresada
    return histCost[0].ncost;
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

  getMargen() {
    return this.ingresosReales > 0? (((this.ingresosReales - this.costoReal)/this.ingresosReales)*100) : 0;
  }

  closeModal() {
    this.dialogRef.close(null);
  }

  addCommas(nStr) {
    nStr = Number(nStr.toFixed(2));
    nStr += '';
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return this.simbMoneda + x1 + x2;
  }

  mensajeError(message: string) {
    Swal.fire('Error', message, 'info');
  }

  cambioFecha() {
    this.calculateCostoPlanificadoMensual(true);
  }
}
