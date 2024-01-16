import { Component, OnInit } from '@angular/core';
import { DropDownList } from '../../model/dropdownlist/DropDownList';
import { NgxSpinnerService } from 'ngx-spinner';
import { PersonService } from '../../services/person/person.service';

import * as fs from 'file-saver';
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import { ProjectService } from '../../services/project/project.service';
let workbook: ExcelProper.Workbook = new Excel.Workbook();

@Component({
  selector: 'app-reporte-margen-contribucion-personal',
  templateUrl: './reporte-margen-contribucion-personal.component.html',
  styleUrls: ['./reporte-margen-contribucion-personal.component.css']
})
export class ReporteMargenContribucionPersonalComponent implements OnInit {

  PersonDropDownList: DropDownList[];
  public BreadLevel01 = 'Reportes';
  public Title = 'Reportes de margen de contribución personal';

  personalSelecionado: number;
  fechaSelecionada: any;

  listaMargenContribucion: any[] = [];
  listaTransMargenContribucion: any[] = [];


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

  constructor(
    private spinner: NgxSpinnerService,
    private personService: PersonService,
  ) { }

  ngOnInit(): void {
    this.getPersonDropDown();
  }

  getPersonDropDown() {
    this.spinner.show('SpinnerProject');
    this.personService.getDropdownlist().subscribe((response: any) => {
      this.PersonDropDownList = response;
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  search() {
    this.getMargenDeContribucionPersonal();
  }


  getMargenDeContribucionPersonal() {
    let  partes = this.fechaSelecionada.split("-");
    let anho = Number(partes[0]);
    let mes = Number(partes[1]);
    this.personalSelecionado = Number(this.personalSelecionado)
    
    this.personService.getcontribution(this.personalSelecionado, anho, mes).subscribe({
      next: (response) => {
        if(response != null) {
          this.listaMargenContribucion = response;
          this.transformarMargen();
        } else {
          this.listaMargenContribucion = [];
          this.listaTransMargenContribucion = [];
        }

      }
    })
  }

  transformarMargen() {
    this.listaTransMargenContribucion = [];

    this.listaMargenContribucion.forEach(mcp => {
      let existColaborador = this.listaTransMargenContribucion.find(x => x[0] == mcp.colaborador);

      let suma_horas = (mcp.total_hora_facturable + mcp.total_hora_no_facturable);

      let newObjectMargen = {
        nid_project: mcp.nid_project,
        scodproject: mcp.scodproject,
        snameproject: mcp.snameproject,
        horas_ingresadas: mcp.horas_ingresadas,
        horas_no_facturables: mcp.horas_no_facturables,
        horas_facturables: mcp.horas_facturables,
        costo_hora: mcp.costo_hora,
        ingreso_hora_proyecto: mcp.ingreso_hora_proyecto,
        margen: mcp.margen,
        total_hora_facturable: mcp.total_hora_facturable,
        total_hora_no_facturable: mcp.total_hora_no_facturable,
      }

      if (!existColaborador) {
        this.listaTransMargenContribucion.push([mcp.colaborador, [newObjectMargen], suma_horas]);
      } else {
        existColaborador[1].push(newObjectMargen);
        existColaborador[2] += suma_horas;
      }
    });


    this.listaTransMargenContribucion.sort((a, b) => b[2] - a[2]);

  }

  stringFechaSelecionada() {
    let  partes = this.fechaSelecionada.split("-");
    let anho = Number(partes[0]);
    let mes = Number(partes[1]);
    
    return this.let_mes.get(mes - 1) + '-' + anho;
  }

  ExportToExcel() {
    const worksheet = workbook.addWorksheet('ReportenMargen', {
      views: [{ showGridLines: false }]
    });

    worksheet.getCell("A1").value = "Reportes de margen de contribución personal";
    worksheet.getCell("A3").value = this.listaTransMargenContribucion[0][0];

    worksheet.getCell("C3").value = this.stringFechaSelecionada();

    worksheet.getColumn('G').style = {numFmt: '"S/."#,##0.00;[Red]\-"S/."#,##0.00'};
    worksheet.getColumn('H').style = {numFmt: '"S/."#,##0.00;[Red]\-"S/."#,##0.00'};
    worksheet.getColumn('I').style = {numFmt: '"S/."#,##0.00;[Red]\-"S/."#,##0.00'};
    worksheet.getColumn('J').style = {numFmt: '"S/."#,##0.00;[Red]\-"S/."#,##0.00'};
    worksheet.getColumn('K').style = {numFmt: '"S/."#,##0.00;[Red]\-"S/."#,##0.00'};
    worksheet.getColumn('L').style = {numFmt: '"S/."#,##0.00;[Red]\-"S/."#,##0.00;[Green]'};


    // Cabecera Tabla
    worksheet.getCell("B5").value = "Colaborador";
    this.getStyleCabecera(worksheet.getCell("B5"));
    worksheet.getColumn('B').width = 25;

    worksheet.getCell("C5").value = "Proyecto";
    this.getStyleCabecera(worksheet.getCell("C5"));
    worksheet.getColumn('C').width = 35;

    worksheet.getCell("D5").value = "Horas Ingresadas";
    this.getStyleCabecera(worksheet.getCell("D5"));
    worksheet.getColumn('D').width = 20;

    worksheet.getCell("E5").value = "Horas Facturables";
    this.getStyleCabecera(worksheet.getCell("E5"));
    worksheet.getColumn('E').width = 20;

    worksheet.getCell("F5").value = "Horas No Facturables";
    this.getStyleCabecera(worksheet.getCell("F5"));
    worksheet.getColumn('F').width = 20;

    worksheet.getCell("G5").value = "Costo Hora Trabajador";
    this.getStyleCabecera(worksheet.getCell("G5"));
    worksheet.getColumn('G').width = 20;

    worksheet.getCell("H5").value = "Ingreso Hora Proyecto";
    this.getStyleCabecera(worksheet.getCell("H5"));
    worksheet.getColumn('H').width = 20;

    worksheet.getCell("I5").value = "Margen";
    this.getStyleCabecera(worksheet.getCell("I5"));
    worksheet.getColumn('I').width = 20;

    worksheet.getCell("J5").value = "Total Hora Facturable";
    this.getStyleCabecera(worksheet.getCell("J5"));
    worksheet.getColumn('J').width = 22;

    worksheet.getCell("K5").value = "Total Hora No Facturable";
    this.getStyleCabecera(worksheet.getCell("K5"));
    worksheet.getColumn('K').width = 23;

    worksheet.getCell("L5").value = "Total Margen Contribución";
    this.getStyleCabecera(worksheet.getCell("L5"));
    worksheet.getColumn('L').width = 25;

    // Cuerpo Tabla
    let rowProjecto = 6;

    for (let j = 0; j < this.listaTransMargenContribucion.length; j++) {
      let rowInicialProjecto = rowProjecto;

      let startcellPerson = worksheet.getCell(rowProjecto, 2);
      startcellPerson.value = this.listaTransMargenContribucion[j][0];
      let finishtcellPerson = worksheet.getCell(this.listaTransMargenContribucion[j][1].length + rowInicialProjecto - 1, 2);
      this.getStyleColaborador(startcellPerson);
      startcellPerson.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
      worksheet.mergeCells(startcellPerson.address, finishtcellPerson.address);


      for (let i = 0; i < this.listaTransMargenContribucion[j][1].length; i++) {

        let cellProjecto = worksheet.getCell(rowProjecto, 3);
        cellProjecto.value = this.listaTransMargenContribucion[j][1][i].snameproject;
        this.getStyleColaborador(cellProjecto);
  
        let cellHorasIngresadas = worksheet.getCell(rowProjecto, 4);
        cellHorasIngresadas.value = this.listaTransMargenContribucion[j][1][i].horas_ingresadas;
        this.getStyleColaborador(cellHorasIngresadas);
  
        let cellHorasFacturables = worksheet.getCell(rowProjecto, 5);
        cellHorasFacturables.value = this.listaTransMargenContribucion[j][1][i].horas_facturables;
        this.getStyleColaborador(cellHorasFacturables);
  
        let cellHorasNoFacturables = worksheet.getCell(rowProjecto, 6);
        cellHorasNoFacturables.value = this.listaTransMargenContribucion[j][1][i].horas_no_facturables;
        this.getStyleColaborador(cellHorasNoFacturables);
  
        let cellCostoHora = worksheet.getCell(rowProjecto, 7);
        cellCostoHora.value = this.listaTransMargenContribucion[j][1][i].costo_hora;
        this.getStyleColaborador(cellCostoHora);
  
        let cellIngresoHoraProyecto = worksheet.getCell(rowProjecto, 8);
        cellIngresoHoraProyecto.value = this.listaTransMargenContribucion[j][1][i].ingreso_hora_proyecto;
        this.getStyleColaborador(cellIngresoHoraProyecto);
  
        let cellMargen = worksheet.getCell(rowProjecto, 9);
        cellMargen.value = this.listaTransMargenContribucion[j][1][i].margen;
        this.getStyleColaborador(cellMargen);
  
        let cellTotalHoraFacturable = worksheet.getCell(rowProjecto, 10);
        cellTotalHoraFacturable.value = this.listaTransMargenContribucion[j][1][i].total_hora_facturable;
        this.getStyleColaborador(cellTotalHoraFacturable);
  
        let cellTotalNoHoraFacturable = worksheet.getCell(rowProjecto, 11);
        cellTotalNoHoraFacturable.value = this.listaTransMargenContribucion[j][1][i].total_hora_no_facturable;
        this.getStyleColaborador(cellTotalNoHoraFacturable);
  
        rowProjecto++;
      }
  
      let startcellTotal = worksheet.getCell(rowInicialProjecto, 12);
      startcellTotal.value = this.listaTransMargenContribucion[j][2];
      let finishcellTotal = worksheet.getCell(this.listaTransMargenContribucion[j][1].length + rowInicialProjecto - 1, 12);
      this.getStyleColaborador(startcellTotal);
      startcellTotal.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
      worksheet.mergeCells(startcellTotal.address, finishcellTotal.address);
    }



    // Descargar archivo
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      workbook.removeWorksheet(worksheet.id);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'ReportenMargen.xlsx');
    });

  };

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

    if (!option) {
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

  getStyleColaborador(cell) {
    cell.border = {
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } }
    };
  }

  thereAreProjectsLoad() {
    return true;
  }
}
