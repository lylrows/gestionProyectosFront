import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoRolesComponent } from './mantenimiento-roles.component';

describe('MantenimientoRolesComponent', () => {
  let component: MantenimientoRolesComponent;
  let fixture: ComponentFixture<MantenimientoRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MantenimientoRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenimientoRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
