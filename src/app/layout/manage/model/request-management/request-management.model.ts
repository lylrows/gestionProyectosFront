import { PaginationModel } from 'src/app/layout/manage/model/pagination/pagination';

export class RequestManagement{
    nid_request: number=0;
    cod_request: string="";
    nid_project: number=0;
    scodproject: string="";
    snameproject: string="";
    sname_client: string="";
    sname_manager: string="";
    nid_state: number=1;
    name_state: string="";
    date_register: Date;
    nidresource: number=0;
    module: string="";
    obs: string="";
    nuser: number=0;
    //managementPermission: ManagementPermission = new ManagementPermission();
}

export class ManagementPermission {
    nid_permission: number=0; 
    nid_project: number=0; 
    nid_request: number=0;  
    nid_person: number =0;
    nidresource: number=0;
    datepermission: Date;
    numhours: number=0;  
    duser: number=0;  
}

export class GetManagementPermission{
    nid_project: number = 0;
    nid_request: number = 0;
    option: number = 0;
}

export class RequestManagementList{
    rownum: number=0;
    cod_request: string="";
    scodproject: string="";
    snameproject: string="";
    sclientname: string="";
    smanagername: string="";
    module: string="";
    nid_state: number=0;
    name_state: string="";
    date_register: Date;
    obs: string="";
}

export class RequestManagementFilter
{
    cod_request: string = "";
    scodproject: string = "";
    nid_manager: number = 0;
    paginar:boolean=true;
    pagination: PaginationModel = new PaginationModel();
}