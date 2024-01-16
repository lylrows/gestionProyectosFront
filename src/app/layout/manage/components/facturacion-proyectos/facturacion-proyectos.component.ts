import { Component, OnInit } from '@angular/core';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { FilterProject } from '../../model/project/filterproject';
import { ClientService } from '../../services/client/client.service';
import { PersonService } from '../../services/person/person.service';
import { ProjectService } from '../../services/project/project.service';
import { ProjectTypeService } from '../../services/project/projecttype.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { User } from 'src/app/layout/manage/model/user/user';
import { PermisoService } from '../../services/common/permiso.service';
import { MastertableService } from '../../services/common/mastertable.service';
import { MasterTable } from '../../model/common/mastertable';
import { MatDialog } from '@angular/material/dialog';
import { RegistroPagosComponent } from '../registro-pagos/registro-pagos.component';

import { Workbook } from 'exceljs'; import * as fs from 'file-saver';
import { lastValueFrom } from 'rxjs';
import { Client } from '../../model/client/client';

@Component({
  selector: 'app-facturacion-proyectos',
  templateUrl: './facturacion-proyectos.component.html',
  styleUrls: ['./facturacion-proyectos.component.css']
})
export class FacturacionProyectosComponent implements OnInit {

  filterProject: FilterProject = new FilterProject();
  currentPage: number = 1; // seteamos a la pagina 1
  itemsPerPage: number = 10; // mostramos 5 registros por pagina
  totalItems: number = 0; // Total de registro
  public BreadLevel01 = 'Gestión de Proyectos';
  public Title = 'Facturación de Proyectos';
  public titleProjectModal = 'Proyecto | Nuevo'
  projectList: any[] = [];
  ClientDropDownList: Client[];
  PersonDropDownList: DropDownList[];
  ProjectTypeDropDownList: DropDownList[];
  listState: MasterTable[] = [];
  scodprojectSeleccionado: string = "";
  snameprojectSeleccionado: string = "";
  user: User = new User();

  sstatusnameSeleccionado: string = "";

  permisoConsultar: boolean = false;
  permisoRegistrarPago: boolean = false;
  permisoAdministrador: boolean = false;
  permisoJefeDeProyecto: boolean = false;

  constructor(

    private spinner: NgxSpinnerService,
    private projectService: ProjectService,
    private modalService: NgbModal,
    private clientService: ClientService,
    private personService: PersonService,
    private permisoService: PermisoService,
    private projectTypeService: ProjectTypeService,
    private servicePerson: PersonService,
    private mastertableService: MastertableService,
    private dialog: MatDialog
  ) {
    this.filterProject.pagination.ItemsPerPage = this.itemsPerPage;
    this.filterProject.pagination.TotalItems = this.totalItems;
    this.filterProject.pagination.CurrentPage = this.currentPage;
  }
  nidchannel = 0;
  startDateFilter: any;
  endDateFilter: any;
  ngOnInit() {
    this.obtenerPermisos();
  }

  projectIngresosList() {
    let actualDate = new Date();


    this.projectService.insupprojectingresoslist(actualDate.getFullYear(), actualDate.getMonth() + 1).subscribe(response => {

      var data = [];
      var header = ["Fecha Facturación", "TIPO MONEDA", "En Soles", "Código", "Línea de Negocio", "Estado", "Cliente", "Descripción del servicio", "CODIGO PAIS"];


      for (var i = 0; i < response.length; i++) {
        let fechaFactura = new Date(response[i].fechaFactura)

        var item = {};
        item[header[0]] = ('0' + fechaFactura.getDate()).slice(-2) + "/" + ('0' + (fechaFactura.getMonth() + 1)).slice(-2) + "/" + fechaFactura.getFullYear();
        item[header[1]] = response[i].moneda;
        item[header[2]] = response[i].enSoles;
        item[header[3]] = response[i].scod;
        item[header[4]] = response[i].stype;
        item[header[5]] = response[i].sstatusname;
        item[header[6]] = response[i].sclientname;
        item[header[7]] = response[i].sdescription;
        item[header[8]] = "1";

        data.push(item);

      }

      //Create workbook and worksheet
      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet("Data Entry BI Ingresos");
      //Add Header Row
      let headerRow = worksheet.addRow(header);
      // Cell Style : Fill and Border
      headerRow.eachCell((cell, number) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
          bgColor: { argb: 'FF0000FF' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })

      // Add Data and Conditional Formatting
      data.forEach((element) => {
        let eachRow = [];
        header.forEach((headers) => {
          eachRow.push(element[headers])
        })
        // if (element.isDeleted === "Y") {
        //   let deletedRow = worksheet.addRow(eachRow);
        //   deletedRow.eachCell((cell, number) => {
        //     cell.font = { name: 'Calibri', family: 4, size: 11, bold: false, strike: true };
        //   })
        // } else {
        worksheet.addRow(eachRow);
        // }
      })

      worksheet.getColumn(1).width = 15;
      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 20;
      worksheet.getColumn(5).width = 20;
      worksheet.getColumn(7).width = 30;
      worksheet.getColumn(8).width = 30;
      worksheet.addRow([]);
      //Generate Excel File with given name
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: "xlsx" });
        fs.saveAs(blob, "Data Entry BI Datos Personal" + ".xlsx");
      })

    })
  }

  projectGastosList() {
    let FiltrosGastos: FilterProject = new FilterProject();
    FiltrosGastos.pagination.ItemsPerPage = 999;
    FiltrosGastos.pagination.TotalItems = 0;
    FiltrosGastos.pagination.CurrentPage = 1;

    FiltrosGastos.nid_manager = 0;
    FiltrosGastos.nid_status = 0;

    this.spinner.show();
    this.projectService.getprojectpagination(FiltrosGastos).subscribe({
      next: (res: any) => {
        let proyectos = res.data;
        this.obtenerListaHoras(proyectos);
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al Exportar los gastos',
          //text: 'Por favor, escríbenos a la siguiente dirección: ' +'comercial@crecerseguros.pe. Nuestro ejecutivo comercial se contactará contigo'
        });
      }
    }
    );
  }

  async obtenerListaHoras(proyectos: any[]) {

    let response: any[] = [];

    for (const proyecto of proyectos) {

      var projectStep1 = lastValueFrom(this.projectService.getproject(proyecto.scodproject));
      var projectStep2 = lastValueFrom(this.projectService.getprojectdtep2(proyecto.scodproject));

      // Devuelve el costo para cada integrante del proyecto  
      var costoIntegrantes = lastValueFrom(this.servicePerson.getPersonCostByScodproject(proyecto.scodproject));

      // Devuelve las horas registradas para el proyecto
      var horasRegistradas = lastValueFrom(this.projectService.getprojecthourslog(proyecto.scodproject));

      this.spinner.show('SpinnerProject');
      await Promise.all([projectStep1, projectStep2, costoIntegrantes, horasRegistradas]).then((value: any) => {
        this.spinner.hide('SpinnerProject');

        if (value[3] === null || value[3] === undefined) {
          return;
        }

        // Step 1
        let projectStep1 = value[0]


        // Step 2
        let projectStep2 = value[1];

        // Costo Integrante
        let listCost = value[2];
        if (listCost === null || listCost === undefined) {
          return;
        }

        listCost.forEach(element => {
          element.dcost_date = new Date(element.dcost_date);
        });

        let listProjectHoursLog = value[3].filter(x => x.sstate == "A");

        let costoReal = this.calcularCostoReal(listProjectHoursLog, listCost);

        if (costoReal <= 0) {
          return;
        }

        // let actualDate = new Date();
        // let stringActualDate = actualDate.getFullYear() + "-" + (actualDate.getMonth() + 1);
        // let ultimoDia = new Date(stringActualDate)
        // console.log("El ultimo día es", ultimoDia.getDate(), "Del mes" , ultimoDia);

        let nombreCliente = this.ClientDropDownList.find(x => x.nid_client == projectStep1.nid_client).sname
                            + ' - ' + this.ClientDropDownList.find(x => x.nid_client == projectStep1.nid_client).sbusinessname;

        console.log("PROYECTO", projectStep1)
        let objeto = {
          "fecha_D": "12/12/21",
          "tipoMoneda": projectStep2.ncurrency,
          "codigo": projectStep1.scodproject,
          "linea": projectStep1.nid_project_type,
          "estado": projectStep1.nid_status,
          "cliente": nombreCliente,
          "descripcion": projectStep1.sdescription,
          "gastos": costoReal
        }

        response.push(objeto);


      })
    }


    var data = [];
    var header = ["Fecha D.", "TIPO MONEDA", "Código", "Línea de Negocio", "Estado", "Cliente", "Descripción del servicio", "Gastos Incurridos"];


    for (var i = 0; i < response.length; i++) {
      let fechaFactura = new Date(response[i].fechaFactura)

      var item = {};
      item[header[0]] = response[i].fecha_D;
      item[header[1]] = response[i].tipoMoneda;
      item[header[2]] = response[i].codigo;
      item[header[3]] = response[i].linea;
      item[header[4]] = response[i].estado;
      item[header[5]] = response[i].cliente;
      item[header[6]] = response[i].descripcion;
      item[header[7]] = response[i].gastos;

      data.push(item);

    }

    //Create workbook and worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Data Entry BI GASTOS");
    //Add Header Row
    let headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    // Add Data and Conditional Formatting
    data.forEach((element) => {
      let eachRow = [];
      header.forEach((headers) => {
        eachRow.push(element[headers])
      })

      worksheet.addRow(eachRow);
    })

    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(3).width = 10;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(7).width = 30;
    worksheet.getColumn(8).width = 30;
    worksheet.addRow([]);
    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: "xlsx" });
      fs.saveAs(blob, "Data Entry BI Gastos" + ".xlsx");
    })


  }

  calcularCostoReal(listProjectHoursLog: any[], listCost) {
    let costoReal = 0;
    let fechaRegistro;
    let horas;
    let actualDate = new Date();

    for (let i = 0; i < listProjectHoursLog.length; i++) {
      fechaRegistro = new Date(listProjectHoursLog[i].dregistration_date);
      fechaRegistro.setDate(fechaRegistro.getDate() + 1);

      if (fechaRegistro.getFullYear() == actualDate.getFullYear() && fechaRegistro.getMonth() == actualDate.getMonth()) {
        let costoRealIntegrante = this.getCostoReal(listCost, listProjectHoursLog[i].nid_person, fechaRegistro);
        horas = listProjectHoursLog[i].nnumber_hours;
        costoReal += (Number(costoRealIntegrante) * Number(horas));
      }

    }
    return costoReal;
  }

  getCostoReal(listCost, nid_person, fechaRegistro) {
    // Number(this.listCost.find(x=>x.nid_person == nid_person).ncost)
    var histCost = listCost.filter(x => x.nid_person == nid_person);
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

  obtenerPermisos() {
    this.permisoService.getpermissionbyuser(10).subscribe((response: any) => {
      console.log("Permisos", response);
      response.forEach(element => {
        if (element.sname == "Consultar") {
          this.permisoConsultar = element.permission
        }
        if (element.sname == "Registrar_Pago_Tabla") {
          this.permisoRegistrarPago = element.permission
        }
        if (element.sname == "Permiso_Administrador") {
          this.permisoAdministrador = element.permission
        }
        if (element.sname == "Permiso_Jefe_Proyecto") {
          this.permisoJefeDeProyecto = element.permission
        }

      });

      // Despues de obtener permisos viene lo demas
      if (sessionStorage.getItem('Guard') !== null) {
        this.user = JSON.parse(sessionStorage.getItem('User'));
      }
      this.getClientDropDown();
      this.getPersonDropDown();
      this.getProjectTypeDropDown();
      this.getState();
      this.begin();
    }, (error) => {
      console.error(error);
    });
  }
  FormatDate(fec: any, type: string): string {
    const hdia = fec.day.toString().padStart(2, '0');
    const hmes = fec.month.toString().padStart(2, '0');
    const hanio = fec.year.toString();
    return hanio + '-' + hmes + '-' + hdia;
  }


  getState() {
    this.spinner.show('SpinnerProject');
    //let idFather=this.listCategory.find(x=>x.nid_mastertable_type==id).nid_mastertable;
    this.mastertableService.getmastertable(50).subscribe((response: any) => {
      this.listState = response;
      console.log("EstAdos:", this.listState);
      this.spinner.hide('SpinnerProject');

    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  search() {
    // this.showFormDetails = false;

    this.spinner.show();
    if (this.permisoAdministrador) {
      this.filterProject.nid_manager = Number(this.filterProject.nid_manager);
    } else {
      this.filterProject.nid_manager = this.user.nid_person;
    }
    this.filterProject.nid_project_type = Number(this.filterProject.nid_project_type);
    this.filterProject.nid_status = +this.filterProject.nid_status;
    this.filterProject.nid_client = Number(this.filterProject.nid_client);
    this.projectService.getprojectpagination(this.filterProject).subscribe(
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


          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    );

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
  getPersonDropDown() {

    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {

      if (response == null) {
        this.filterProject.nid_manager = 0;
        return;
      }
      this.PersonDropDownList = response;
      if (this.PersonDropDownList.length > 0) {
        this.filterProject.nid_manager = 0;
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

  RegistrarPago(scod, snameproject, ssname) {
    this.sstatusnameSeleccionado = ssname;
    this.scodprojectSeleccionado = scod;
    this.snameprojectSeleccionado = snameproject;
    this.titleProjectModal = 'Registrar pago';

    const dialogFacturacion = this.dialog.open(RegistroPagosComponent, {
      width: '1100px',
      height: '90%',
      autoFocus: false,
      data: {
        titleProjectModal: 'Registrar pago',
        scodproject: this.scodprojectSeleccionado,
        sstatusname: this.sstatusnameSeleccionado,
        snameproject: this.snameprojectSeleccionado
      },
      disableClose: false,
    });
    dialogFacturacion.afterClosed().subscribe(data => {
      // if (data != null){
      this.search();
      // }
    })
  }

  closeModal() {

    this.modalService.dismissAll();
  }
  begin() {
    this.spinner.show();
    this.filterProject.nid_manager = this.user.nid_person;
    if (this.permisoAdministrador) {
      this.filterProject.nid_manager = 0;
    }
    this.filterProject.nid_status = 1;
    this.projectService.getprojectpagination(this.filterProject).subscribe(
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


          this.totalItems = res.pagination.totalItems;
        } catch (e) {
          this.spinner.hide();
          this.projectList = null;
          this.totalItems = 0;
        }
      }
    );

  }
}
