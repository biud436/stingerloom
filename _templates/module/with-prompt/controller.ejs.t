---
to: packages/example/controllers/<%=name%>/<%=Name%>Controller.ts
---

import { Controller } from "@stingerloom/common/decorators/Controller";
import { <%=Name%>Service } from "./<%=Name%>Service";
import { Get } from "@stingerloom/common/decorators/Get";

@Controller("/<%=name%>")
export class <%=Name%>Controller {

  constructor(private readonly <%=name%>Service: <%=Name%>Service) {}

  @Get()
  public async get<%=Name%>() {
    return await this.<%=name%>Service.get<%=Name%>();
  }
}