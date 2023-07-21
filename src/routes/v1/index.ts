const v1: FastifyFPHandler = async (_request, _reply) => {
    _reply.header("Content-Type", "application/json").code(200);
    return {
        name: "v1",
    };
};

export default v1;
