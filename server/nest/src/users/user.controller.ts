import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../common/auth.guard";
import { CurrentUser } from "../common/current-user.decorator";
import { IdParamPipe } from "../common/id-param.pipe";
import { SchemaValidationPipe } from "../common/schema-validation.pipe";
import {
  loginSchema,
  registerSchema,
  userUpdateSchema,
  type LoginBody,
  type RegisterBody,
  type UserUpdateBody,
} from "./user.schema";
import { UserService } from "./user.service";

const NOT_OWN_ACCOUNT = { error: "You can only access your own account" };

@Controller("users")
export class UserController {
  constructor(private readonly users: UserService) {}

  // POST defaults to 201 in Nest, which is what the siblings answer here.
  @Post("register")
  async register(@Body(new SchemaValidationPipe(registerSchema)) body: RegisterBody) {
    const result = await this.users.register(body);
    if ("conflict" in result) {
      throw new ConflictException({ error: "Email is already registered" });
    }
    return result;
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body(new SchemaValidationPipe(loginSchema)) body: LoginBody) {
    const result = await this.users.login(body);
    if (!result) {
      throw new UnauthorizedException({ error: "Invalid email or password" });
    }
    return result;
  }

  // Declared before `:id` so the literal route wins.
  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentUser() userId: number) {
    return this.users.getbyId(userId);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async getbyId(@Param("id", new IdParamPipe()) id: number, @CurrentUser() userId: number) {
    if (id !== userId) throw new ForbiddenException(NOT_OWN_ACCOUNT);
    return this.users.getbyId(id);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  async update(
    @Param("id", new IdParamPipe()) id: number,
    @Body(new SchemaValidationPipe(userUpdateSchema, { requireAtLeastOne: true })) body: UserUpdateBody,
    @CurrentUser() userId: number
  ) {
    if (id !== userId) throw new ForbiddenException(NOT_OWN_ACCOUNT);
    return this.users.update(id, body);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async remove(@Param("id", new IdParamPipe()) id: number, @CurrentUser() userId: number) {
    if (id !== userId) throw new ForbiddenException(NOT_OWN_ACCOUNT);
    return this.users.remove(id);
  }
}
