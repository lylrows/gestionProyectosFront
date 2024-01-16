import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAvanceComponent } from './registro-avance.component';

describe('RegistroAvanceComponent', () => {
  let component: RegistroAvanceComponent;
  let fixture: ComponentFixture<RegistroAvanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroAvanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
