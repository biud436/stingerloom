type FastifyFPHandler = (
    _request: FastifyRequest,
    _reply: FastifyReply,
) => void;

// declare module "fastify" {
//     interface FastifyRequest {
//         /** Allows to access or modify the session data. */
//         session: Session;
//         /** A session store. */
//         sessionStore: FastifySessionPlugin.SessionStore;
//         /** Allows to destroy the session in the store. */
//         destroySession(callback: (err?: Error) => void): void;
//     }
// }
