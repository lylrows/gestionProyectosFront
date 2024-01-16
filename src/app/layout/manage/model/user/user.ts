
import { PaginationModel } from 'src/app/layout/manage/model/pagination/pagination';
export class User {
  niduser: number= 0;;
  nidprofile: number = 0;
  cprofiletype: string = '';
  suser: string;
  spassword: string;
  spassword_repeat: string;
  nresetpassword: number= 0;;
  nidcanal: number = 0;
  sfirstname: string;
  slastname: string;
  slastname2: string;
  ntypedoc: number = 0;
  sdoc: string;
  scellphone: string;
  semail: string;
  saddress: string;
  sstateuser: string;
  sdescprofile: string;
  sfullname: string;
  ruc: string;
  nombreclinica: string;
  ssex: string;
  sphone: string;
  sactive: string = '1';
  nuserregister: number= 0;
  nuserupdate: number= 0;
  suser_aux: string;
  nidchannel:number;
  ntypecanal:number;
  nunlockuser: number;
  sflag_validacion_informativa: string;
  nid_person:number;
  nid_position:number;
  nid_job:number;
  nid_category: number;
}

export class FiltrosUser {
  sactive: string = "";
  nidcanal: number = 0;
  sfullname: string = "";
  pagination: PaginationModel = new PaginationModel()

}