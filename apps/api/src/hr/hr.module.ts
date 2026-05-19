import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';

import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';

import { EmployeesController } from './employees/employees.controller';
import { EmployeesService } from './employees/employees.service';

import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';

import { PayrollController } from './payroll/payroll.controller';
import { PayrollService } from './payroll/payroll.service';

import { SalaryAdvancesController } from './salary-advances/salary-advances.controller';
import { SalaryAdvancesService } from './salary-advances/salary-advances.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    DepartmentsController,
    EmployeesController,
    AttendanceController,
    PayrollController,
    SalaryAdvancesController,
  ],
  providers: [
    DepartmentsService,
    EmployeesService,
    AttendanceService,
    PayrollService,
    SalaryAdvancesService,
    AuditService,
  ],
  exports: [EmployeesService],
})
export class HrModule {}
