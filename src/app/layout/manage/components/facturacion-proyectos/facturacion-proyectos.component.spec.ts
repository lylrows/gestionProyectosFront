import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturacionProyectosComponent } from './facturacion-proyectos.component';

describe('FacturacionProyectosComponent', () => {
  let component: FacturacionProyectosComponent;
  let fixture: ComponentFixture<FacturacionProyectosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacturacionProyectosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturacionProyectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
