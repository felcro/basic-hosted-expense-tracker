// The app imports the `ApiRoutes` type from @basic-hosted-expense-tracker/server
// (src/lib/api.ts), which makes TypeScript check the server's source. That
// source legitimately uses Bun globals, but this project sets `"types": []` so
// the RN/Expo app is not typed against Bun's runtime surface.
//
// These minimal declarations let the server's Bun usages typecheck here without
// pulling @types/bun into the app. Nothing in the app calls Bun at runtime, so
// none of this is ever bundled. The server typechecks against the real
// @types/bun under its own tsconfig, which is what actually validates the calls.
declare namespace Bun {
  interface Server<_T = unknown> {
    timeout(request: Request, seconds: number): void
  }
}

declare const Bun: {
  file(path: string): {
    exists(): Promise<boolean>
    stream(): ReadableStream<Uint8Array>
  }
}
