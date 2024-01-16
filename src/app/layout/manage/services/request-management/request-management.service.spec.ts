import { TestBed } from '@angular/core/testing';

import { RequestManagementService } from './request-management.service';

describe('RequestManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RequestManagementService = TestBed.get(RequestManagementService);
    expect(service).toBeTruthy();
  });
});
