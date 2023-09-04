// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
// module.exports = [
//     {
//         type: "input",
//         name: "name",
//         message: "What is the name of the controller?",
//     },
// ];
module.exports = {
    prompt: ({ prompter, args }) => {
        return prompter.prompt({
            type: "input",
            name: "name",
            message: "What is the name of the controller?",
        });
    },
};
