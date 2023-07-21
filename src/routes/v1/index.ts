import { useJson } from "../../lib/useJson";

const v1: FastifyFPHandler = async (_request, _reply) => {
    useJson(_reply).code(200);
    return {
        name: "v1",
    };
};

export default v1;
