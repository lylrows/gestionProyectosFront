import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoParametrosComponent } from './mantenimiento-parametros.component';

describe('MantenimientoParametrosComponent', () => {
  let component: MantenimientoParametrosComponent;
  let fixture: ComponentFixture<MantenimientoParametrosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MantenimientoParametrosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenimientoParametrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
