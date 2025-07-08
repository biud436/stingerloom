import axios from "axios";
import { IsNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";
import {
  Controller,
  EntryModule,
  Get,
  Query,
  ServerBootstrapApplication,
} from "@stingerloom/core";

describe("Query 테스트", () => {
  let application: TestServerApplication;
  class Point {
    private x: number;
    private y: number;

    constructor(args: string) {
      const [x, y] = args.split(",");

      this.x = parseInt(x, 10);
      this.y = parseInt(y, 10);
    }

    getX() {
      return this.x;
    }

    getY() {
      return this.y;
    }
  }

  class Person {
    @IsString()
    id!: string;

    @IsString()
    name!: string;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    age!: number;
  }

  @Controller("/")
  class AppController {
    @Get("/blog")
    async resolveIdAndTitle(
      @Query("id") id: number,
      @Query("title") title: string,
    ) {
      return { id, title };
    }

    @Get("/point")
    async resolveNameAndTitle(@Query("point") point: Point) {
      return { x: point.getX(), y: point.getY() };
    }

    @Get("/person")
    async resolvePerson(@Query() person: Person) {
      return person;
    }
  }

  @EntryModule({
    controllers: [AppController],
    providers: [],
  })
  class AppModule {}

  class TestServerApplication extends ServerBootstrapApplication {
    override beforeStart(): void {}
  }

  beforeAll((done) => {
    application = new TestServerApplication(AppModule);
    application.on("start", () => {
      done();
    });

    application.start();
  });

  afterAll(async () => {
    await application.stop();
  });

  it("쿼리 매개변수를 정수형으로 변환하는가? -- 1", async () => {
    const { data } = await axios.get("http://localhost:3002/blog?id=1&title=2");
    expect(data).toEqual({ id: 1, title: "2" });
  });

  it("쿼리 매개변수를 객체형으로 변환하는가? -- 2", async () => {
    const { data } = await axios.get("http://localhost:3002/point?point=1,2");

    console.log(data);

    expect(data).toEqual({ x: 1, y: 2 });
  });

  it("쿼리 매개변수 생략 시, DTO 객체로 변환되는가?", async () => {
    const { data } = await axios.get(
      "http://localhost:3002/person?id=1&name=아저씨&age=10",
    );

    console.log(data);

    expect(data).toEqual({ id: "1", name: "아저씨", age: 10 });
  });
});
