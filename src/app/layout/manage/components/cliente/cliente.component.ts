import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientService } from '../../services/client/client.service';
import { Client } from '../../model/client/client';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {

  buttonTittle: string='Guardar';
  user: any;

  constructor(
    private dialogRef: MatDialogRef<ClienteComponent>,
    private clientService: ClientService,
    private spinner: NgxSpinnerService
  ) {
    dialogRef.disableClose = true;
  }

  ClientDropDownList:Client[];
  client: Client = new Client();
  clientItem: Client = new Client();

  ngOnInit(): void {
    this.user = JSON.parse(sessionStorage.getItem('User'));
    this.getClientDropDown();
  }

  getClientDropDown() {
    this.spinner.show('SpinnerProject');
    this.clientService.getDropdownlist(1).subscribe((response: any) => {
      this.ClientDropDownList = response;
      //console.log(response);
      this.spinner.hide('SpinnerProject');
    }, (error) => {
      console.error(error);
      this.spinner.hide('SpinnerProject');
    });
  }

  saveClient(){
    this.clientItem.sname = this.client.sname;
    this.clientItem.sbusinessname = this.client.sbusinessname;
    if(this.clientItem.nid_client==0){
      this.clientItem.nuserregister=this.user.niduser;
    }
    //console.log(this.clientItem);
    if(!this.validateClient()) return;
    this.clientService.insupclient(this.clientItem).subscribe(res => {
      console.log(res);
      this.client = new Client();
      this.clientItem = new Client();
      this.getClientDropDown();
    })
  }

  validateClient(): boolean{
    let _result=true;
    if(this.client.sname == "" ||
    this.client.sbusinessname == ""){
      Swal.fire('Error', 'Debe completar todos los campos obligatorios', 'info');
        _result = false;
    }
    return _result;
  }

  editClient(item){
    this.clientItem = new Client();
    this.clientItem = item;
    //console.log(this.clientItem);
    this.client.nid_client = this.clientItem.nid_client;
    this.client.sname = this.clientItem.sname;
    this.client.sbusinessname = this.clientItem.sbusinessname;
  }

  clean(){
    this.client = new Client();
    this.clientItem = new Client();
  }

  deleteClient(item){
    this.clientItem = new Client();
    this.clientItem = item;
    //console.log(this.clientItem);
    this.clientItem.sactive = 'D';
    this.clientService.insupclient(this.clientItem).subscribe(res => {
      console.log(res);
      this.getClientDropDown();
    })
  }

  closeModal(){
    this.dialogRef.close(null);
  }

}
