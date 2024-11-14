import { HttpRoute } from "./HttpRoute";

export interface HttpRouteRegistry {
    register(route: HttpRoute): void;
}
