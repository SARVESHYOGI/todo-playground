import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../common/auth.guard";
import { CurrentUser } from "../common/current-user.decorator";
import { IdParamPipe } from "../common/id-param.pipe";
import { SchemaValidationPipe } from "../common/schema-validation.pipe";
import { todoCreateSchema, todoUpdateSchema, type TodoCreateBody, type TodoUpdateBody } from "./todo.schema";
import { TodoService } from "./todo.service";

@Controller("todos")
@UseGuards(AuthGuard)
export class TodoController {
  constructor(private readonly todos: TodoService) {}

  @Get()
  list(@CurrentUser() userId: number) {
    return this.todos.list(userId);
  }

  @Get(":id")
  async getbyId(@Param("id", new IdParamPipe()) id: number, @CurrentUser() userId: number) {
    const todo = await this.todos.getbyId(id, userId);
    if (!todo) throw new NotFoundException({ error: "Todo not found" });
    return todo;
  }

  // The siblings answer 200, not Nest's POST default of 201.
  @Post()
  @HttpCode(200)
  create(
    @Body(new SchemaValidationPipe(todoCreateSchema)) body: TodoCreateBody,
    @CurrentUser() userId: number
  ) {
    return this.todos.create({ ...body, authorId: userId });
  }

  @Put(":id")
  async update(
    @Param("id", new IdParamPipe()) id: number,
    @Body(new SchemaValidationPipe(todoUpdateSchema, { requireAtLeastOne: true })) body: TodoUpdateBody,
    @CurrentUser() userId: number
  ) {
    const todo = await this.todos.update(id, userId, body);
    if (!todo) throw new NotFoundException({ error: "Todo not found" });
    return todo;
  }

  @Delete(":id")
  async remove(@Param("id", new IdParamPipe()) id: number, @CurrentUser() userId: number) {
    const todo = await this.todos.remove(id, userId);
    if (!todo) throw new NotFoundException({ error: "Todo not found" });
    return todo;
  }
}
