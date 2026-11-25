import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return { name: "quiz-builder", status: "ok" };
  }
}
