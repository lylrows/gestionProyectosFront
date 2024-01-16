import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteFacturacionComponent } from './reporte-facturacion.component';

describe('ReporteFacturacionComponent', () => {
  let component: ReporteFacturacionComponent;
  let fixture: ComponentFixture<ReporteFacturacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteFacturacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteFacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
