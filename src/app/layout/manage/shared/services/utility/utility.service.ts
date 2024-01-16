import { Injectable } from '@angular/core';
import { DatePipe } from '../../../../../../../node_modules/@angular/common';
import { Observable } from '../../../../../../../node_modules/rxjs';
import { Param } from '../../models/utility/param';
import { User } from '../../../model/user/user';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  month: Param[] = [];
  anios: string[] = [];

  keyPressNumber(event: any) {
    const pattern = /[0-9]$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  keyPressOnlyAlfhabets(event: any) {
    const pattern = /^[a-zA-Z\s\u00f1\u00d1\u00E0-\u00FC]*$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  keyPressExcludeCaracteresEspeciales(event: any) {
    const pattern = /^[^!@"#·¿?=ª><$%&\/()]*$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  getMonth() {
    this.month = [];
    this.month.push(new Param('1', 'Enero'));
    this.month.push(new Param('2', 'Febrero'));
    this.month.push(new Param('3', 'Marzo'));
    this.month.push(new Param('4', 'Abril'));
    this.month.push(new Param('5', 'Mayo'));
    this.month.push(new Param('6', 'Junio'));
    this.month.push(new Param('7', 'Julio'));
    this.month.push(new Param('8', 'Agosto'));
    this.month.push(new Param('9', 'Septiembre'));
    this.month.push(new Param('10', 'Octubre'));
    this.month.push(new Param('11', 'Noviembre'));
    this.month.push(new Param('12', 'Diciembre'));
    return this.month;
  }

  getYear() {
    const date = new Date().getFullYear();
    this.anios = [];
    for (let index = date - 1; index < date + 11; index++) {
      this.anios.push(index.toString());
    }
    return this.anios;
  }

  getUserId(): number {
    let user: User = new User();
    user = JSON.parse(sessionStorage.getItem('User'));
    return user.niduser;
  }

  getProfileId(): number {
    let user: User = new User();
    user = JSON.parse(sessionStorage.getItem('User'));
    return user.nidprofile;
  }

}
