import { Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { ERole } from 'src/common'
import { BalanceResetService } from './balance-reset.service'

@Controller('balance-reset')
export class BalanceResetController {
  private readonly logger = new Logger(BalanceResetController.name)

  constructor(private readonly balanceResetService: BalanceResetService) {}

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(ERole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async resetAllUsersBalance() {
    this.logger.log('Received HTTP request for manual balance reset')
    return this.balanceResetService.enqueueManualBalanceReset()
  }
}
