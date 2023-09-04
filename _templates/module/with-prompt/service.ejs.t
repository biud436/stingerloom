---
to: packages/example/controllers/<%=name%>/<%=Name%>Service.ts
---

import { Injectable } from "@stingerloom/common";

@Injectable()
export class <%=Name%>Service {
    public async get<%=Name%>() {
        return "hello";
    }
}