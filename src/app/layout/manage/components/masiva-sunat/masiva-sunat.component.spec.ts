import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasivaSunatComponent } from './masiva-sunat.component';

describe('MasivaSunatComponent', () => {
  let component: MasivaSunatComponent;
  let fixture: ComponentFixture<MasivaSunatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasivaSunatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasivaSunatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
