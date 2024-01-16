import { PaginationModel } from "../pagination/pagination";

export class FilterMassive {
    ntype: Number = 0;
    nmoney: Number = 0;
    fechaproceso_ini:string ="2022-01-01";
    fechaproceso_fin:  string ="2040-12-31";
    sserie: String = "";
    pagination: PaginationModel = new PaginationModel()
}

export class MassiveEntity {
  nid: Number = 0;
  sdescription_type: String = "";
  nyear: Number = 0;
  smonth: String = "";
  sdate: String = "";
  sserie_number: String = "";
  snumber_doc: String = "";
  sbusinnes_name: String = "";
  smoney: String = "";
  namount_soles: Number = 0;
  namount_dolars: Number = 0;
  sclient: String = "";
  sstate: String = "";
  sservice_description: String = "";
  sbusiness_line: String = "";
  ssub_category: String = "";
}