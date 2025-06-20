import { exampleQuery } from './query.js';

const texts = [
"Cuando dijiste que iba a llover hoy, diste en el clavo.",
"Terminé temprano, de modo que pude ir al cine.",
"Para entonces ya habíamos terminado de cenar.",
"Esa campera de cuero me costó un ojo de la cara.",
"Voy al parque seguido a despejarme un poco.",
"No te pongas frío, estábamos charlando bien.",
"Ayer fui al cine y, por cierto, me encontré con Juan.",
"Pasé un mal rato cuando se cortó la luz en pleno partido.",
"Después de la noticia, quedé triste todo el día.",
"En la clase de hoy, no paré de sacar apuntes porque el tema estaba interesante.",
"Cuando vi la noticia, me puse triste al instante.",
"Su historia me puso a pensar",
"Si querés, te puedo poner en contacto con el diseñador que te conté.",
"¿Qué hora es? Se hizo tardísimo",
"Uy, se me hizo re tarde",
"Podés gritar todo lo que quieras, pero no sirve de nada si no estás dispuesto a escuchar."
];
const goodIds = [
"e5ee9e60-67bc-4bae-99aa-3ae068e1c66b",
"bc69431b-0d95-4310-b975-2a395776a773",
"31e0ff24-a34d-430f-9d90-c7d711344639",
"73d0f5a1-3985-4b0a-b026-365597ef50ce",
"50778694-122c-4d88-a557-55962258a28a",
"7cd09932-d5d7-415d-983b-5db4f36f8534",
"eb86a617-a78a-421c-aef5-2083b49ebbde",
"cd7bb6c1-eea6-4a14-8116-c41437f79a67",
"023ad008-cf30-4f2f-b93e-bbfd09cc1459",
"e486d1e5-2a14-42ae-9c3d-4b64c39266d6",
"b63cde05-7a1a-4f1f-8309-e97a7f8f717c",
"33e9c399-2173-4fcd-87cd-6d22ab3f4e7d",
"2d0c1338-8976-453a-b2e8-f1caa3f6b307",
"39431d2c-13d2-4fba-b50c-24884c27c990",
"63b0d098-1f5c-4b36-a8a8-bb901db413f3",
"b84a1435-d64f-471f-a752-88343243e9c8",  
]
const exIds = [
"9338137f-27cd-41ca-a3d7-0e16214d6cd8", 
"b7fe6ac8-e638-429e-b4c3-33afef709f97", 
"607536fc-007c-4c4a-a4ba-4c1704a8e820", 
"91a23448-3981-4e53-96e1-d8f58d700b04", 
"d42b3980-2dc8-4c2a-a2fd-035609eea9cb", 
"0506fe5c-0f27-4872-a1ee-4a79de368db2", 
"ac4ae0a8-7c1b-4e81-b9ec-a589814d1af2", 
"d552809e-92ae-43f3-9600-fe54730d0768", 
"20e1ec5d-44ac-425a-bce0-cf34b473f9d3", 
"5684cdc7-7f46-44fb-ba97-5c94e4f2ec46", 
"59dade84-8566-4916-b90c-b9a78876eba5", 
"13745549-0103-4bd4-ab59-95eb30e9dc21", 
"80580ba1-a5b4-491f-a1c3-1abf74723c48", 
"bd7157a3-6678-4a26-a772-a6d63479d090", 
"843c39d7-db02-4842-95be-bcb1b1381f08", 
"8dcc6477-7e19-49c3-9d6d-d6b34efc39b1" 
];
// const deletes = [];
// const updates = [];
// for( var i = 0; i < texts.length; i++ ) {
//     const [good, bad] = exampleQuery.q('..{.text == $text}', { text: texts[i] } ).sort( (a,b) => a.createdAt - b.createdAt );
//     deletes.push(bad.exampleId);
//     updates.push([good.exampleId, { publicUrl: bad.audio.publicUrl, voice: bad.audio.voice }]);;
// }
// console.log(JSON.stringify(deletes, null, 2));
// console.log(JSON.stringify(updates, null, 2));

for( var i = 0; i < texts.length; i++ ) {
    const got = exampleQuery.q('..{.text == $text}', { text: texts[i] } ).sort( (a,b) => a.createdAt - b.createdAt );
    console.log(JSON.stringify(got, null, 2));
}

