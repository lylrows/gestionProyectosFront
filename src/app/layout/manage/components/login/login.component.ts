import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { UserParams } from '../../model/user/user-params';
import { environment } from '../../../../../environments/environment';
import { NgForm } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  flagLoginBtn: boolean;
  flagResetPassword: boolean;
  newPassword01: string;
  newPassword02: string;
  passwordsEquals: boolean;
  mensajeValidacionServidor: string;
  mensajeValidacionUsuario: string;
  mensajeValidacionPassword: string;
  mensajeValidacionReset: string;
  userParams: UserParams = new UserParams();
  flagSave01: boolean;
  flagSave02: boolean;
  bCaptchaValid = environment.flagCaptcha;
  siteKey = environment.CAPTCHA_KEY;
  isLogin = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) {
    sessionStorage.removeItem('User');
    sessionStorage.removeItem('Menu');
    sessionStorage.removeItem('Guard');
  }

  ngOnInit() {
    //if (sessionStorage.getItem('Guard') !== null) {
    if (sessionStorage.getItem('Guard') === null) {
      this.router.navigate(['/manage/inicio']);
    }
  }

  serviceLogin(f: NgForm) {
    
    this.mensajeValidacionServidor = '';
    if (this.validateForm() && f.valid && this.bCaptchaValid) {

      if (this.flagResetPassword && this.userParams.niduser > 0) {
        if (this.userParams.spassword === this.newPassword01) {
          this.mensajeValidacionServidor = 'La nueva contraseña debe ser diferente a la actual.';
          setTimeout(() => {
            this.mensajeValidacionServidor = '';
          }, 7000);
          return;
        }
        this.userParams.spassword = this.newPassword01;
      }

      // Cargar Spinner
      this.flagLoginBtn = true;
      this.loginService.logIn(this.userParams).subscribe(
        res => {
          //validar login correcto
          if (res.isLoginOk !== undefined) {
            if (!res.isLoginOk) {
              this.flagLoginBtn = false;
              this.mensajeValidacionServidor = 'Usuario o contraseña inválida';
              return;
            }
          }

          //validar usuario bloqueado
          if (res.isLocked !== undefined) {
            if (res.isLocked) {
              this.flagLoginBtn = false;
              this.mensajeValidacionServidor = `Se ha superado la cantidad de intentos permitidos. Por favor
                                                contacte con su Administrador`;
              return;
            }
          }
          if (res.menu.length > 0 && res.user !== null) {
            if (res.user.nresetpassword > 0) {
              this.flagResetPassword = true;
              this.mensajeValidacionReset = 'Debe crear una nueva contraseña';
              this.flagLoginBtn = false;
              this.userParams.niduser = res.user.niduser;
            } else {              
              sessionStorage.setItem('Guard', res.token);
              sessionStorage.setItem('Menu', JSON.stringify(res.menu));
              const usuario = {
                niduser: res.user.niduser,
                nidchannel: res.user.nidchannel,
                sfullname: res.user.sfullname,
                sdescprofile: res.user.sdescprofile,
                cprofiletype: res.user.cprofiletype,
                nidprofile: res.user.nidprofile,
                ntypecanal: res.user.ntypecanal,
                sdoc: res.user.sdoc,
		            sflagvalidacioninfo: res.user.sflag_validacion_informativa,
                nid_person:res.user.nid_person,
                nid_position:res.user.nid_position,
                nid_job:res.user.nid_job,
                nid_category:res.user.nid_category
              };
              this.isLogin = true;
              sessionStorage.setItem('User', JSON.stringify(usuario));
              window.location.href = environment.localUrl;
            }
          } else {
            this.flagLoginBtn = false;
            this.mensajeValidacionServidor = 'Usuario o contraseña inválida';
          }
        },
        err => {
          this.flagLoginBtn = false;
          this.mensajeValidacionServidor = 'Usuario o contraseña inválida';
        }
      );
    } else {
      this.flagLoginBtn = false;
    }
  }

  validateForm() {

    if ((this.userParams.suser === undefined || this.userParams.suser.length === 0)
      && (this.userParams.spassword === undefined || this.userParams.spassword.length === 0)) {
      this.mensajeValidacionUsuario = 'Ingrese usuario';
      this.mensajeValidacionPassword = 'Ingrese contraseña';
      return false;
    } else if (this.userParams.suser === undefined || this.userParams.suser.length === 0) {
      this.mensajeValidacionUsuario = 'Ingrese usuario';
      return false;
    } else if (this.userParams.spassword === undefined || this.userParams.spassword.length === 0) {
      this.mensajeValidacionPassword = 'Ingrese contraseña';
      return false;
    }
    return true;
  }

  clearMensaje(input: string) {
    switch (input) {
      case 'usuario':
        this.mensajeValidacionUsuario = '';
        break;
      case 'password':
        this.mensajeValidacionPassword = '';
        break;
      default:
        break;
    }
  }

  validPasswords(process) {
    this.flagSave01 = (process === 1 || this.flagSave01) && this.newPassword01.length > 0 ? true : false;
    this.flagSave02 = (process === 2 || this.flagSave02) && this.newPassword02.length > 0 ? true : false;
    this.passwordsEquals = false;
    if (this.newPassword01 !== undefined && this.newPassword02 !== undefined) {
      if (this.newPassword01 !== this.newPassword02) {
        this.passwordsEquals = true;
      }
    }
  }

  validateCaptcha(response: string) {
    if (response.length > 0) {
      this.bCaptchaValid = true;
    }
  }
}
