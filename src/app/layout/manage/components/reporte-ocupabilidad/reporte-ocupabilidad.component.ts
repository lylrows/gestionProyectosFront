import { Component, OnInit } from '@angular/core';
import { MastertableService } from '../../services/common/mastertable.service';
import { MasterTable } from '../../model/common/mastertable';
import { ProjectService } from '../../services/project/project.service';
import { eachDayOfInterval, isWeekend, format } from 'date-fns';
import * as ApexCharts from 'apexcharts';
import * as moment from 'moment';

@Component({
  selector: 'app-reporte-ocupabilidad',
  templateUrl: './reporte-ocupabilidad.component.html',
  styleUrls: ['./reporte-ocupabilidad.component.css']
})
export class ReporteOcupabilidadComponent implements OnInit {

  Title = "Reporte de Ocupabilidad"
  BreadLevel01 = "Reporte"

  perfilSeleccionado = 0;
  listProfileAdministrador: MasterTable[] = [];
  listProfileRrhh: MasterTable[] = [];
  listProfileOperativo: MasterTable[] = [];

  listEmployees: Array<any>[] = [];
  listProjects: Array<any>[] = [];
  listEmployeesReal: Array<any>[] = [];
  listWeekPerson: Array<any>[] = [];

  listAreas: any[];

  dias_meses = [];
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

  dateInicial: Date = new Date();
  dateFinal: Date = new Date();

  listArregloHorasEstimadasDias: Array<any>[] = [];
  listTotalArregloHorasEstimadasDias: Array<any>[] = [];

  listProjectSemanas: Array<any>[] = [];

  finesDeSemana = [];
  totalDias = 0;

  date1String = '';
  date2String = '';
  
  nid_area: number = 0;
  
  chart: any;

  constructor(
    private mastertableService: MastertableService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.getProfiles();
    this.getareas();
    this.RenderChart();

    let actualDay = new Date();
    this.date1String = actualDay.getFullYear()  + "-" + String(actualDay.getMonth()+1).padStart(2, '0')
    this.date2String = actualDay.getFullYear()  + "-" + String(actualDay.getMonth()+1).padStart(2, '0')

    this.search();
  }

  getareas(){
    this.mastertableService.getmastertable(32).subscribe(response=>{
      this.listAreas=response;
    })
  }

  getProfiles() {
    this.mastertableService.getmastertable(34).subscribe((response: any) => {
      if (response != null) {
        response.forEach(element => {
          this.listProfileAdministrador.push(element);
        });
      }
    })

    this.mastertableService.getmastertable(35).subscribe((response: any) => {
      if (response != null) {
        response.forEach(element => {
          this.listProfileOperativo.push(element);
        });
      }
    })

    this.mastertableService.getmastertable(36).subscribe((response: any) => {
      if (response != null) {
        response.forEach(element => {
          this.listProfileRrhh.push(element);
        });
      }
    })
  }

  search() {    
    this.projectService.getocupabilidad(this.perfilSeleccionado, this.nid_area, this.date1String, this.date2String).subscribe({
      next: (response) => {
        let empleados_proyectos = response.employees;
        this.listWeekPerson = response.weekperson;
        this.listProjects = response.projects;
        this.listEmployeesReal  = response.employeesReal;
        
        this.generateArregloMeses();
        this.createListaEmpleadosProyectos(empleados_proyectos);
        this.createWeekPerson();
      }
    });
  }

  procesarDataAMostrar() {
    let stringfechaIni = this.date1String.split('-')
    let stringfechaFin = this.date2String.split('-')

    let diasAnteriores = 0;
    let diasPosFinal = 0;
    let mesPosIni = 0;
    let mesPosFin = 0;

    this.dias_meses.forEach(dm => {
      let stringFecha = dm[1] + "-" + (dm[0] + 1).toString().padStart(2, '0');
      let stringDataIngresadaIni = stringfechaIni[0] + '-' + stringfechaIni[1].toString().padStart(2,'0');
      let stringDataIngresadaFin = stringfechaFin[0] + '-' + stringfechaFin[1].toString().padStart(2,'0');
      
      let comparacionIni = stringDataIngresadaIni.localeCompare(stringFecha)
      let comparacionFin = stringDataIngresadaFin.localeCompare(stringFecha)

      

      if (comparacionIni > 0) {
        diasAnteriores += dm[2];
        mesPosIni++;
      }
      if(comparacionFin >= 0) {
        diasPosFinal += dm[2];
        mesPosFin++;
      }

    })
    
    this.dias_meses = this.dias_meses.slice(mesPosIni, mesPosFin);

    let listaGrafico = [];


    this.listArregloHorasEstimadasDias.forEach(element => {
      
      element[2] = element[2].slice(diasAnteriores, diasPosFinal);

      let posInicio = 0;
      let menor = 999;
      let mayor = -1;

      let primeraPosicion = -1;
      let ultimaPosicion = -1;

      let diaprimeraPosicion = 0;
      let diaultimaPosicion = 0;

      this.dias_meses.forEach((meses, index) => {
        let numDias = meses[2];
        let posFinal = posInicio + numDias;
        let diasMes = element[2].slice(posInicio, posFinal);
        posInicio = posFinal;

        let isNotNull = diasMes.some((value) => value !== 0 && value !== '');
        if(isNotNull) {
          menor = index < menor? index: menor;
          mayor = index > mayor? index : mayor;

          for (let i = 0; i < this.dias_meses[index][2]; i++) {
            const valor = diasMes[i];
            if (valor !== 0 && valor !== '') {
              if (primeraPosicion === -1) {
                primeraPosicion = i;
                diaprimeraPosicion = (i + 1)
              }
              ultimaPosicion = i;
              diaultimaPosicion = i + 1;
            }
          }

        }
      });

      let existEmployee = this.listEmployees.find(x => x[0].nid_person == element[0]);
      let nombre = existEmployee? existEmployee[0].sperson : 'No Encontrado'
      
      if(menor != 999 && mayor != -1) {

        let existPerson = listaGrafico.find(x => x[0] == element[0]);
 
        let menorFechaIni =  new Date(this.dias_meses[menor][1] + '-' + (this.dias_meses[menor][0] + 1) + '-' +  diaprimeraPosicion.toString().padStart(2,'0')).getTime();
        let mayorFechaFin = new Date(this.dias_meses[mayor][1] + '-' + (this.dias_meses[mayor][0] + 1) + '-' + diaultimaPosicion.toString().padStart(2,'0')).getTime();

        if(!existPerson) {
          // codigo, [x, y1,y2, nombre]
          listaGrafico.push([element[0], nombre, menorFechaIni , mayorFechaFin])
        } else {
          existPerson[2] = menorFechaIni < existPerson[2]?menorFechaIni:existPerson[2]
          existPerson[3] = mayorFechaFin > existPerson[3]?mayorFechaFin:existPerson[3]
        }
      }
    });

    this.listTotalArregloHorasEstimadasDias.forEach(element => {
      element[1] = element[1].slice(diasAnteriores, diasPosFinal);
    });

    this.actualizarData(listaGrafico);
    
  }


  actualizarData(listaGrafico) {

    let ArrayEstimado = [];


    listaGrafico.forEach(element => {
      ArrayEstimado.push({
        x: element[1],
        y: [element[2], element[3]]
      })
    });

    // Seria 200 cuando se tenga los reales
    let altoGrafico = 50 * listaGrafico.length;

    altoGrafico = altoGrafico < 300? 300: altoGrafico;

    this.chart.updateOptions({
      chart: {
        height: altoGrafico
      },
    });

    let ArrayReal = [];

    if(this.listEmployeesReal != null) {
      this.listEmployeesReal.forEach((employee: any) => {

        let fechaIni = new Date(employee.dstart_date).getTime();
        let fechaFin = new Date(employee.dend_date).getTime();

        ArrayReal.push({
          x: employee.sperson,
          y: [fechaIni, fechaFin]
        })
      })
    }

    this.chart.updateSeries([{
      name: 'Estimado',
      data: [...ArrayEstimado]
    }, {
      name: 'Real',
      data: [...ArrayReal]
    }])
    

  }

  RenderChart() {
    var options = {
      series: [],
      chart: {
      height: 700,
      type: 'rangeBar'
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        var a = moment(val[0])
        var b = moment(val[1])
        return a.format('MMM/yyyy') + '-' + b.format('MMM/yyyy')
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [50, 0, 100, 100]
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'MMM'
      }
    },
    title: {
      text: 'Asignación de recursos Proy vs Real',
      align: 'center',
    },
    legend: {
      position: 'bottom'
    }
    };
    this.chart = new ApexCharts(document.querySelector("#chart"), options);
    this.chart.render();
  }

  
  createListaEmpleadosProyectos(empleados_proyectos) {

    this.listEmployees = [];

    if (empleados_proyectos != null) {
      empleados_proyectos.forEach(ep => {
        let existEmployee = this.listEmployees.find(x => x[0].nid_person == ep.nid_person);

        let newObjectInformationProject = {
          dend_date: ep.dend_date,
          dstart_date: ep.dstart_date,

          nid_project: ep.nid_project,
          nid_project_estimate: ep.nid_project_estimate,
          scodproject: ep.scodproject,
          snameproject: ep.snameproject
        }
        if (!existEmployee) {
          let newObjectInformationEmployee = {
            nid_person: ep.nid_person,
            isAuxiliary: ep.isAuxiliary,
            nid_rol: ep.nid_rol,
            sperson: ep.sperson,
            showProjects: false
          }

          this.listEmployees.push([newObjectInformationEmployee, [newObjectInformationProject]]);
        } else {
          existEmployee[1].push(newObjectInformationProject);
        }
      });

    } else {
      this.listEmployees = [];
    }
  }

  generateArregloMeses() {

    this.dateInicial = null;
    this.dateFinal = null;
    this.dias_meses = [];
    this.listProjectSemanas = [];
    this.totalDias = 0;

    if (this.listProjects != null) {

      this.listProjects.forEach((p: any) => {

        if (p.dbegin_date != null) {
          let beginDate = new Date(p.dbegin_date);
          this.dateInicial = this.dateInicial == null ? beginDate : beginDate < this.dateInicial ? beginDate : this.dateInicial;
        }

        if (p.dfinish_date != null) {
          let finishDate = new Date(p.dfinish_date);
          this.dateFinal = this.dateFinal == null ? finishDate : finishDate > this.dateFinal ? finishDate : this.dateFinal;
        }

        // Generate listaSemanaStart, listaSemanaFinish
        let resp = this.generateListSemana(p);
        this.listProjectSemanas.push([p.nid_project, resp]);
      });

      let finishDate = new Date(this.dateFinal.getFullYear(), this.dateFinal.getMonth());
      let beginDate = new Date(this.dateInicial.getFullYear(), this.dateInicial.getMonth());

      do {
        let currentMonth = beginDate.getMonth();
        let numberOfDays = new Date(beginDate.getFullYear(), currentMonth + 1, 0).getDate();
        this.totalDias += numberOfDays;
        this.dias_meses.push([beginDate.getMonth(), beginDate.getFullYear(), numberOfDays]);
        beginDate.setMonth(beginDate.getMonth() + 1);
      } while (beginDate <= finishDate);

      // Generar fines de semana
      const fechaIni = new Date(this.dateInicial.getFullYear(), this.dateInicial.getMonth());
      const fechaFin = new Date(this.dateFinal.getFullYear(), this.dateFinal.getMonth() + 1);
      const daysBetweenDates = eachDayOfInterval({ start: fechaIni, end: fechaFin });
      this.finesDeSemana = daysBetweenDates.reduce((acc, date, index) => {
        if (isWeekend(date)) {
          acc.push(index);
        }
        return acc;
      }, []);
      
    }
  }

  generateListSemana(project) {
    let fechaIni;
    let fechaFin;

    let listSemanasStart = [];
    let listSemanasFinish = [];

    fechaIni = new Date(project.dbegin_date);
    let fechaIniPrueba = new Date(project.dbegin_date);

    
    // Si la semana empieza miercoles la fecha fin de esta semana termina en 3 dias, sabado
    let dateuno = 4 - fechaIni.getDay();

    fechaFin = new Date(project.dbegin_date);
    fechaFin.setDate(fechaFin.getDate() + (1 + dateuno));

    let fechaFinPrueba = new Date(project.dbegin_date);
    fechaFinPrueba.setDate(fechaFinPrueba.getDate() + (1 + dateuno));


    let abc = new Date(fechaIni.setDate(fechaIni.getDate() + 0));
    let abd = new Date(fechaFin.setDate(fechaFin.getDate() + 0));
    listSemanasStart.push(abc);
    listSemanasFinish.push(abd);

    let newDate = new Date(project.dfinish_date);
    newDate.setDate(newDate.getDate() + 1);
    
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

  createWeekPerson() {

    this.listArregloHorasEstimadasDias = [];


    if (this.listWeekPerson != null) {
      this.listWeekPerson.forEach((week: any) => {
        let existPerson = this.listArregloHorasEstimadasDias.find(x => x[0] == week.nid_person && x[1] == week.nid_project);

        if (!existPerson) {
          let arreglo_horas = this.generateArregloHoras(week, []);
          this.listArregloHorasEstimadasDias.push([week.nid_person, week.nid_project, arreglo_horas])
        } else {
          let arreglo_horas = this.generateArregloHoras(week, existPerson[2]);
          existPerson[2] = arreglo_horas;
        }
      });

      this.completeWithCerosArreglo();
      this.createTotalArreglosHorasEstimadasDias();
      this.procesarDataAMostrar();
    }
  }

  completeWithCerosArreglo() {
    this.listArregloHorasEstimadasDias.forEach(x => {
      let tamanioActual = x[2].length;

      if (tamanioActual < this.totalDias) {
        let diasFaltantes = this.totalDias - tamanioActual
        for (let i = 0; i < diasFaltantes; i++) {
          x[2][tamanioActual + i] = '';
        }
      }
    })
  }

  generateArregloHoras(week, array) {
        
    let project = this.listProjectSemanas.find(x => x[0] == week.nid_project);

    if (project) {
      let i = week.nweeknumber - 1;
      let dateStart = project[1][0][i];
      let dateFinish = project[1][1][i];

      let diferenciaEnMilisegundos = dateFinish.getTime() - dateStart.getTime();
      let diferenciaEnDias = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24)) + 1;

      let horasPorDia = Number((week.nhours_asigned / diferenciaEnDias).toFixed(1));

      let diasAnteriores = 0;

      this.dias_meses.forEach(dm => {
        let stringFecha = dm[1] + "-" + (dm[0]).toString().padStart(2, '0');
        let stringFechaWeek = dateStart.getFullYear() + "-" + dateStart.getMonth().toString().padStart(2, '0');
        let comparacion = stringFechaWeek.localeCompare(stringFecha)

        if (comparacion > 0) {
          diasAnteriores += dm[2];
        }
        if (comparacion == 0) {
          diasAnteriores += dateStart.getDate();

          for (let k = 0; k < diferenciaEnDias; k++) {

            if (array[diasAnteriores + k - 1] != undefined) {
              array[diasAnteriores + k - 1] += horasPorDia;
            } else {
              array[diasAnteriores + k - 1] = horasPorDia;
            }
          }

          if (dateFinish.getDay() == 5) {
            array[diasAnteriores + diferenciaEnDias - 1] = '';
            array[diasAnteriores + diferenciaEnDias] = '';
          }
        }
      })
    } else {
      // no tiene horas registradas
      console.log("No deberia pasar");
    }

    return array; // array
  }

  createTotalArreglosHorasEstimadasDias() {

    this.listTotalArregloHorasEstimadasDias = [];

    this.listEmployees.forEach(employees => {
      let arregloTotalEmpleado = []
      let arreglosFiltrados = this.listArregloHorasEstimadasDias.filter(x => x[0] == employees[0].nid_person && x[2].length > 0);
      
      arreglosFiltrados.forEach(x => {
        for (let i = 0; i < x[2].length; i++) {
          if (this.finesDeSemana.includes(i)) {
            arregloTotalEmpleado[i] = '';
          } else {
            if (arregloTotalEmpleado[i] == undefined || arregloTotalEmpleado[i] == null) {
              arregloTotalEmpleado[i] = (x[2][i] == undefined || x[2][i] == null || x[2][i] === '') ? 0 : x[2][i];
            } else {
              let valorCambiado = (x[2][i] == undefined || x[2][i] == null || x[2][i] === '') ? 0 : x[2][i];
              arregloTotalEmpleado[i] += valorCambiado;
            }
          }

        }
      });
      
      this.listTotalArregloHorasEstimadasDias.push([employees[0].nid_person, arregloTotalEmpleado]);
    });


  }

  toggleProjects(employee) {
    employee.showProjects = !employee.showProjects
  }

  titleTable(mes, anio) {
    return this.let_mes.get(mes) + "-" + anio;
  }

  getRange(num: number): number[] {
    return Array(num).fill(0).map((_, index) => index + 1);
  }

  arrayForPersonProject(nid_person, nid_project) {
    let resp = this.listArregloHorasEstimadasDias.find(x => x[0] == nid_person && x[1] == nid_project)
    return resp ? resp[2] : [];
  }

  arrayForPerson(nid_person) {
    let resp = this.listTotalArregloHorasEstimadasDias.find(x => x[0] == nid_person);

    return resp ? resp[1] : [];
  }

}
