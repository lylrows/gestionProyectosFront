import { PaginationModel } from "../pagination/pagination";

export class FilterProject {
    nid_project: number;
    scodproject : string="";
    nid_manager : number=0;
    nid_project_type: number=0;
    nid_client:number=0;
    nid_status:number=0;
    paginar:boolean=true;
    facturable:number = 1;
    pagination: PaginationModel = new PaginationModel()
  }
export class FilterProjectAssigned {

    nid_person : number = 0;  
    scodproject : string="";
    nid_manager : number=0;
    nid_project_type: number=0;
    nid_client:number=0;
    nid_status:number=0;
    paginar:boolean=true;
    facturable:number = 1;
    pagination: PaginationModel = new PaginationModel()
  }
  export class FilterProjectHoursLog {
    nid_person : number = 0; 
    nid_external : number = 0; 
    scodproject : string="";
    nid_hours_concept : number=0;
    paginar:boolean=true;
    pagination: PaginationModel = new PaginationModel()
  }