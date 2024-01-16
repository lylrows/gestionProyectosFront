import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloControlHorasComponent } from './modulo-control-horas.component';

describe('ModuloControlHorasComponent', () => {
  let component: ModuloControlHorasComponent;
  let fixture: ComponentFixture<ModuloControlHorasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModuloControlHorasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuloControlHorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
