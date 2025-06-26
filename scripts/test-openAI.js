
import { generateText } from "../src/server/lib/openai.js";

async function main() {
    const sys = "You are a spanish teacher who corrects grammar. You concise answer is the json form: { \"response\": \"answer\" }";
    const user = "Is this correct: me suena mala. ??"
    try {
        const result = await generateText(sys,user);
        console.log(result);
        return result;
    } catch(err) {
        console.error('ew');
        return null;
    }
}

const result = await main();
console.log( 'done!')