import { reportBug } from "../src/server/lib/github.js";

try {
    const result = await reportBug({title: 'bug1', body:'testing bug reporting'});
    console.log(result);
} catch(err) {
    console.error(err);
}

