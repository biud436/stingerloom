---
to: packages/example/controllers/<%=name%>/<%=Name%>Controller.ts
---

import { Controller } from "@stingerloom/common/decorators/Controller";
import { Get } from "@stingerloom/common/decorators/Get";

@Controller("/<%=name%>")
export class <%=Name%>Controller {
    @Get()
    public async get<%=Name%>() {
        return "hello";
    }
}