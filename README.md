# Stingerloom

Modern TypeScript framework with decorators and dependency injection for Node.js

## Features

- Decorator-based routing, controllers, and middleware
- Built-in dependency injection and provider lifecycle
- Pluggable HTTP adapters (Loom, Fastify, Express)
- Integrated CLI for project scaffolding and development
- Optional ORM, template rendering, and validation modules

## Quick Start

```bash
npx create-stingerloom@latest --name <my-app>
```

## Example

```ts
@Controller("/hello")
export class HelloController {
  @Get()
  hello() {
    return { message: "Hello, Stingerloom" };
  }
}


More examples are available in the [sample](./sample/) directory.

```
