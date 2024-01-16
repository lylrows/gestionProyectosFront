import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoPermisosComponent } from './mantenimiento-permisos.component';

describe('MantenimientoPermisosComponent', () => {
  let component: MantenimientoPermisosComponent;
  let fixture: ComponentFixture<MantenimientoPermisosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MantenimientoPermisosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenimientoPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
