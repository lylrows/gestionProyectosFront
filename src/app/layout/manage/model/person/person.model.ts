import { PaginationModel } from 'src/app/layout/manage/model/pagination/pagination';
export class Person {
    nid_person: number;
	scodperson: string;
	sfirstname: string;
	ssecondname: string;
	slastname: string;
	smotherlastname: string;
	nid_typeDocument: number;
	stypedocument: string;
	sdocumentNumber: string;
	sphone: string;
	sphone2: string;
	semail: string;
	semail2: string;
	nid_state: number=3;
	sstate: string;
	nid_position: number;
	sposition: string;
	ddateofadmission: Date;
	dterminationdate: Date; //= new Date();
	nsalary: number;
	suser : string="";
	spassword : string="";
	nid_category : number = 0;
	nid_job : number = 0;
	ncost : number = 0;
	dcost_date : Date;
}
 
export class FiltrosPerson {
    scodperson: string = "";
    sfullname: string = "";
    sdocumentnumber: string = "";
	isAdminOrRrhh: number = 1;
    nidperson: number = 1;
    nidstate: number = 0;
    pagination: PaginationModel = new PaginationModel()
 
}

export class ManagementPerson { /**/
	nid_person: number;
	sfirstname: string;
	ssecondname: string;
	slastname: string;
	smotherlastname: string;
	nid_typeDocument: number = 0;
	sdocumentNumber: string;
	sphone: string;
	sphone2: string;
	semail: string;
	semail2: string;
	nid_state: number = 0;
	nid_position: number = 0;
	ddateofadmission: Date;
	dterminationdate: Date; //= new Date();
	nsalary: number;
	isnew : number;
	scodperson: string;
	suser: string="";
	spassword: string = "";
	nid_category : number = 0;
	nid_job : number;
	saveCost : boolean = false;
	costHist : PersonCostHist= new PersonCostHist();
}

export class CesePerson {
	nid_person: number;
	nid: number;
	ddateofadmission: Date;
	dterminationdate: Date;
}

export class User {
	nid_user: number=0;
	suser: string="";
	spassword: string = "";
}

export class PersonCostHist {
	nid_person_cost_hist : number = 0;
	nid_person : number = 0;
	ncost : number = 0;//se modifico el date
	dcost_date : Date = new Date();
	sactive : string = "A";
	nuser : number = 0;
}