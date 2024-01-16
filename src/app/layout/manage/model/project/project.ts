
export class Project {
   
   //Step1
   nid_project:number= 0;
   scodproject:   string = "";
   snameproject:  string = "";
   nid_projectmethodology: number =1;
   nid_project_type:number =0;
   nid_client:number =0;
   nid_manager:number =0;
   nid_status:number =1;
   sdescription:string = "";
   nid_user:number=0;
   nid_projectFather?:number = 0;
   /*ntypeproject:  number = 0;
   smethodology:  string = ""; 
   nresponsable:  number = 0;
   nclient:       number = 0
   sdescription:  string = "";
   // sid_client: string = "";
   // sid_manager: string = "";
   // sid_status  : string   ;
   
   sid_projecttype:string;
    
   methodology : string;
   //Step2   
   date_begin:Date;
   date_finish:Date;
   expected_income:number;
   currency:string;
   billing_milestone: string;
   total:number;
   //Step3
   resources:FileList;*/
  }

  export class ProjectStep2 {
   scodproject:   string = "";
   nid_project_step2 : number = 0;
   dbegin_date :   string = "";
   dfinish_date :   string = "";
   drealbegin_date :   string = "";
   drealfinish_date :   string = "";
   nexpected_income : number=0;
   ncurrency : number=0;
   ntotal_amount : number=0;
   nuser : number=0;
   nweeks: number = 0;
   nfrequency : number=0;
  }

  export class ProjectStep2History{
   nid_project_step2_history: number = 0;
   nid_project_step2: number = 0; 
   nid_project: number = 0; 
   dbegin_date :   string = ""; 
   dfinish_date :   string = ""; 
   nexpected_income: number = 0;  
   ncurrency: number = 0;  
   ntotal_amount: number = 0;  
   sactive :   string = "";
   dregister :   string = ""; 
   nuserregister: number = 0;  
  }

  export class ProjectStep2Detail {
      scodproject:   string = "";
      nid_project_step2 : number = 0;
      nid_project_step2_detail : number = 0;
      nmilestone:number=0;
      sdescription :   string = "";
      dplanned_date :   string = "";
      npercentage_invoice : number=0;
      namount : number=0;
      sactive : string = "";
      nuser : number=0;
   }

   export class ProjectStep3 {
      scodproject:   string = "";
      nid_project_step3 : number = 0;
      ntotal_hours :   number=0;
      ntotal_investment :   number=0;
      ntotal_external_cost : number=0;
      sactive : string = "";
      nuser : number=0;
      listInvestment :ProjectStep3Investment[]=[];
      listInvestment_area :ProjectStep3Investment_area[]=[];
      listCost :ProjectStep3Cost[]=[];
   }

   export class ProjectStep3Investment {
      nid_project_step3 : number = 0;
      nid_project_step3_investment : number = 0;
      nid_rol:number=0;
      snamerol : string="";
      npeople_quantity : number = 0;
      nhours_assgined : number = 0;
      ncost_per_hour : number = 0;
      ntotal_per_resource : number = 0;
      sactive : string = "";
      nuser : number=0;
   }
   export class ProjectStep3Investment_area {
      nid_project_step3_investment_area : number = 0;
      nid_project_step3 : number = 0;
      nid_area : number = 0;
      snamearea: string = "";
      investment_percentage:number=0;
      manager_area: boolean=false;
      sactive : string = "";
      nuser : number=0;
   }
   export class ProjectStep3Cost {
      nid_project_step3 : number = 0;
      nid_project_step3_cost : number = 0;
      sexternal_cost : string = "";
      namount : number = 0;
      sactive : string = "";
      nuser : number=0;
   }

   export class ProjectStep4 {
      scodproject:   string = "";
      nid_project_step4 : number = 0;
      sfilename :   string = "";
      spathfilename :   string = "";
      sactive : string = "";
      nuser : number=0;
   }
   export class ProjectStep5 {
      scodproject:   string = "";
      nid_project_step5 : number = 0;
      nexpected_income :   number=0;
      ntotal_investment :   number=0;
      ntotal_external_cost : number=0;
      nexpected_utility : number=0;
      nmargin : number=0;
      sactive : string = "A";
      nuser : number=0;
   }

   export class ProjectStep4Detail{
      name : string = "";
      duration : number = 0;
      start : Date = new Date;
      finish : Date = new Date;
      //nweek : number = 0;
   }

   export class ProjectInvoicing {
      nid_project_invoicing : number = 0;
      scodproject:   string = "";
      nid_project_step2_detail : number = 0;
      nmilestone :   number=0;
      sdescription :   string = "";
      dplanned_date : string = "";
      npercentage_invoice : number=0;
      namount : number=0;
      binvoiced : boolean = false;//Facturado
      bpaid : boolean = false;//Pagado
      nbilled_amount : number=0;
      dbilling_date : Date = new Date;
      dinvoice_payment_date : Date = new Date;
      sactive : string = "";
      nuser : number=0;
}
export class PersonalProject {

    idrol: number;
    idperson: number = 0;
    rol: string;
    date_begin: Date;
    date_finish: Date;

}

export class ProjectEstimate {
   scodproject : string = "";
   nid_project_estimate : number = 0;
   nid_project: number = 0;
   nid_rol : number = 0;
   srol : string = "";
   nid_person : number = 0;
   sperson : string = "";
   npeople_quantity : number = 0;
   dstart_date : string = "";
   dend_date : string = "";
   isAuxiliary: boolean;
   sactive : string = "";
   nuser: number = 0;
   hours_week: WeeksProjectPerson[] = [];
}
export class ProjectHoursLog {
   nid_project_hours_log : number = 0;
   nid_project : number = 0;
   scodproject :string = "";
   nid_external: number= 0;
   edescription : string = "";
   nid_person : number = 0;
   sperson : string = "";
   dregistration_date : Date;
   dregistration_dateFin?:Date;
   nnumber_hours : number = 0;
   nid_phase : number = 0;
   sphase : string = "";
   nid_hours_concept : number = 0;
   sdescription : string = "";
   stype : number = 0;
   sstate: string = "P";
   sactive : string = "";
   nuser : number = 0;
   approv : number = 0;
}

export class GetReportHoursExt {
   option: number = 0;
   mes: number = 0;
   anio: number = 0;
   nid_area: number = 0;
}

export class ReportHoursExt {
   nid_person: number = 0;
   sname: string = "";
   nid_mastertable_type: number = 0;
   sshort_value: string = "";
   mes: string = "";
   num_mes: number = 0;
   nid_project: number = 0;
   scodproject: string = "";
   snameproject: string = "";
   anio: number = 0;
   sumahoras: number = 0;
}

export class PersonalExternal {
   nid_external:number = 0;
   edescription:string = "";
   nid_categoryhours:number = 0;
   sactive:string = "";
}

export class WeeksProjectPerson {

   nid_weekperson : number = 0;
   nid_project : number = 0;
   nid_weekproject : number = 0;
   nweeknumber : number = 0;
   ntotalhoursweek : number = 0;
   scodproject : string = "";
   nid_person : number = 0;
   nhours_asigned: number = 0;
   sactive : string = "";
   nuser : number = 0;
   
}
export class WeekAvance {
   nid_weekavance : number=0;
   scodproject: string="";
   nro_semana: number = 0;
   
   semaforo: string='red';

   progress_planificado: number=0;
   progress_real: number=0;
   
   costo_planificado: number=0;
   costo_planificado_real: number = 0;
   costo_real: number = 0;
}

export class Progress {
   nid_progress: number = 0;
   scodproject: string = "";
   registration_date: Date = new Date;
   listProgressDetail: ProgressDetail[] = [];
}

export class ProgressDetail {
   id_progress_detail: number = 0;
   id_progress: number = 0;
   name: string = "";
   planificado: number = 0;
   real: number = 0;
   last: number = 0;
   start: Date = new Date();
   finish: Date = new Date();
   
   // El last_registrated representa el ultimo registro diferente al dia de hoy
   // El last es el ultimo registro, osea contando si se registro uno, el día de hoy
   last_registrated: number = 0;

}