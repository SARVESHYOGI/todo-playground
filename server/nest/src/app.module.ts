import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { TodoModule } from "./todos/todo.module";
import { UserModule } from "./users/user.module";

@Module({
  controllers: [HealthController],
  imports: [TodoModule, UserModule],
})
export class AppModule {}
