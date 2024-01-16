import { Component, OnInit } from '@angular/core';
import { MasterTable } from '../../../model/common/mastertable';
import { MastertableService } from '../../../services/common/mastertable.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { EditParametroComponent } from './edit-parametro/edit-parametro.component';

@Component({
  selector: 'app-mantenimiento-parametros',
  templateUrl: './mantenimiento-parametros.component.html',
  styleUrls: ['./mantenimiento-parametros.component.css']
})
export class MantenimientoParametrosComponent implements OnInit {

  Title = "Mantenimiento de Parámetros"
  BreadLevel01 = "Mantenimiento"
  
  private modalReference: NgbModalRef;
  titleModal= ""
  listCategory : MasterTable[];

  parametroEditar: MasterTable = new MasterTable;
  opcionModal: number = 0;

  // Esta lista hijos deberia cambiar, solo se deberia almacenar su pk en la tabla que pertenece y su valor mostrado
  listHijos: MasterTable[];

  categoriaSeleccionada = 0;

  constructor(
    private mastertableService:MastertableService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getCategory();
  }

  changeCategoria() {
    this.getHijos();
  }

  // Esto solo se debe listar una vez al iniciar la vista
  getCategory() {
    this.mastertableService.getmastertable(-1).subscribe((response: any) => {
      this.listCategory = response;
    }, (error) => {
      console.error(error);
    });
  }

  // Esto se actualiza segun la categoria seleccionada
  getHijos() {
    this.mastertableService.getmastertable(this.categoriaSeleccionada).subscribe((response: any) => {
      this.listHijos = response;
    }, (error) => {
      console.error(error);
    });
  }


  abrirModalEditarParametro(item, opcion, _idPadre?) {
    if(opcion == 1) {
      this.opcionModal = 1;
      this.parametroEditar = new MasterTable();
      this.parametroEditar.nid_father = Number(_idPadre);

      if(_idPadre != null && _idPadre != undefined && _idPadre != 0) {
        this.titleModal = "Agregar Parámetro"
      } else {
        this.titleModal = "Agregar Categoría"
      }
    }
    if(opcion == 2) {
      this.opcionModal = 2;
      this.titleModal = "Editar Parámetro"
      this.parametroEditar = item;
    }

    const dialogMantenimientoParametro= this.dialog.open(EditParametroComponent, {
      width: '800px',
      height: '30%',
      autoFocus:false,
      data: {
        titleModal: this.titleModal,
        parametro: this.parametroEditar,
        opcion: this.opcionModal,
      },
      disableClose: false,
    });
    dialogMantenimientoParametro.afterClosed().subscribe(resp => {
      if(resp == 1) {
        this.getCategory();
      }
      if(resp == 2) {
        this.getHijos();
        this.getCategory();
      }
    })

  }

  delete(item) {
    Swal.fire({
      title: '¿Está seguro de eliminar el parámetro?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then(result => {
      if (result.value) {
        this.parametroEditar = item;
        this.parametroEditar.sactive = 'D'
        this.spinner.show('SpinnerProject');
        this.mastertableService.editmastertable(this.parametroEditar).subscribe(result => {
          this.spinner.hide('SpinnerProject');
          if(result.resultado == 1) {
            this.getHijos();
          }
        })
      }
    })
  }

}
