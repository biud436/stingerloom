import { Injectable } from "@stingerloom/common";

@Injectable()
export class TestService {
    public async getTest() {
        return "Hello World!";
    }
}
