import ExampleModel from '../src/server/models/ExampleModel.js';

const data =
[
  {
    text: '¿Qué pasó con el partido de ayer?',
    source: 'openai',
    exampleId: '1ed6eb12-c627-4323-ad47-955a05251633',
    basedOn: [ 'pasó', 'ayer' ]
  },
  {
    text: '¿Dónde está el libro que te presté?',
    source: 'openai',
    exampleId: 'e3ad62bd-66aa-4794-8528-009bae987ab4',
    basedOn: [ 'presté', 'está' ]
  },
  {
    text: '¡No sé qué le pasó a Juan!',
    source: 'openai',
    exampleId: '2c190052-ee72-4fac-accd-8f825d175aad',
    basedOn: [ 'pasó', 'sé' ]
  },
  {
    text: 'Ayer llegué a la cima de la montaña.',
    source: 'openai',
    exampleId: '3bda8c6b-b1be-4e13-95bd-6d2105d5ec43',
    basedOn: [ 'llegué', 'ayer' ]
    
  },
  {
    text: '¿Dónde pasó la fiesta ayer?',
    source: 'openai',
    exampleId: '98c050cf-5dbd-4d90-ae96-378853da855b',
    basedOn: [ 'llegué', 'ayer' ],
  }
];

function main() {
    try {
        ((async function() {
            const model = new ExampleModel();
            for( let i = 0; i < data.length; i++ ) {
                const obj = data[i];
                const result = await model.update(obj.exampleId, obj);
                console.log('Updated: ', result.text );
            }
        })());
    } catch(err) {
        console.log( err )
    }
}

main();
