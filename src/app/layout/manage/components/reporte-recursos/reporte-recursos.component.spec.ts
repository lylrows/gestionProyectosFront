import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteRecursosComponent } from './reporte-recursos.component';

describe('ReporteRecursosComponent', () => {
  let component: ReporteRecursosComponent;
  let fixture: ComponentFixture<ReporteRecursosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteRecursosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
