import { Component, Input, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MasterTable } from '../../../../model/common/mastertable';
import { MastertableService } from '../../../../services/common/mastertable.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-parametro',
  templateUrl: './edit-parametro.component.html',
  styleUrls: ['./edit-parametro.component.css']
})
export class EditParametroComponent implements OnInit {

  ultimaValorRegistrado = '';
  tituloBoton = '';

  constructor(
    private dialogRef: MatDialogRef<EditParametroComponent>,
    private mastertableService: MastertableService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    dialogRef.disableClose = true;
   }

  parametro = new MasterTable;
  opcion: number = 0;
  titleModal = "";
  

  ngOnInit() {
    this.parametro =this.data['parametro'];
    this.opcion= this.data['opcion'];
    this.titleModal = this.data['titleModal'];

    this.ultimaValorRegistrado = this.parametro.sshort_value;
    if(this.opcion == 1) {
      this.tituloBoton = 'Agregar';
    } else {
      this.tituloBoton = 'Actualizar';
    }
  }


  actualizarParametros() {
    this.parametro.saux01 = this.parametro.saux01.toString(); 
    if(this.parametro.nid_father==32){
      this.parametro.sdescription_value='Puestos-'+this.parametro.sshort_value;
      this.parametro.typeaux=1;
    }
    this.spinner.show('SpinnerProject');
    this.mastertableService.editmastertable(this.parametro).subscribe(data => {
      this.spinner.hide('SpinnerProject');
      if(data.resultado == 1) {
        
        this.dialogRef.close(this.retornarValor());
      }
    })
  }

  // Retorna 1 en caso se creo una categoria,
  // Retorna 2 en caso se creo un parametro,
  // Retorna nulo en caso se hizo una modificacion
  retornarValor() {
    if(this.opcion == 2) {
      return 1;//antes null
    } else {
      if(this.parametro.nid_father == 0) {
        return 1
      } else {
        return 2
      }
    } 
  }

  closeModal(){
    this.parametro.sshort_value = this.ultimaValorRegistrado;
    this.dialogRef.close(null);
  }

  currencyCheck(event, valor): boolean
  {
    let pattern = /^\d{0,9}\.?\d{0,2}$/;
    let result = pattern.test(event.key);
    if (valor == null)
      return result;
    else
      return pattern.test(valor.toString() + event.key);
  }
}
