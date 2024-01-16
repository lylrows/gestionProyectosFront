import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteExportablePdfComponent } from './reporte-exportable-pdf.component';

describe('ReporteExportablePdfComponent', () => {
  let component: ReporteExportablePdfComponent;
  let fixture: ComponentFixture<ReporteExportablePdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteExportablePdfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteExportablePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
