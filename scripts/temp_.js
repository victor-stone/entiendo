import { idiomQuery, exampleQuery } from './query.js';

var ids = [
                               
  '08620f4e-7295-4498-9598-5d079387edfa'   ,
  '0c1cdbae-cc92-4b70-8faa-6c448690e86b'   ,
  '347c9ee7-6428-41a8-8c1e-2708c85fb20d'   ,
  '3ad4c54c-a5fa-48e6-a6fd-700b684bfc74'   ,
  '3d1cedd3-cefa-4811-b159-2e59cb828bea'   ,
  '3e7940c7-8b69-462b-a355-61d930a110d7'   ,
  '4060727a-f2e3-41e7-bccb-5722775c8981'   ,
  '4892f6c6-1816-472e-849e-a4c33b956157'   ,
  '48d679cb-da80-4aba-bbc7-70b3261aa742'   ,
  '4c2b82be-3483-4993-9924-c715fea400e9'   ,
  '63d89c21-617a-40d5-89bb-e67206945864'   ,
  '6777986b-14b8-4e4e-bb91-167d218c7605'   ,
  '6b20ef1f-5e72-4b69-8fd1-b51bfde0a6c3'   ,
  '71bbcb94-a08d-4e01-81f8-4ac1e24ba58d'   ,
  '76ab7798-3fe9-4cf2-b300-768ae5056c2c'   ,
  '85ca7536-557f-4622-bd4f-0de3a3d126d9'   ,
  '89a58748-6fb9-4c41-a875-94aa1c25ef1c'   ,
  '8dc0ea24-679e-4a8d-8ac9-ae187ba445a5'   ,
  '995a589d-7bc9-4f5e-a59d-dfa9159151a1'   ,
  'a34293c2-1bce-4233-b03b-d96bb39b664b'   ,
  'a9f68138-7b6a-48b4-968b-4b05836c106a'   ,
  'b55a790b-93a7-47f4-a8d8-31c6fb273e99'   ,
  'bf357ca9-b0db-4ad2-97c5-ab1404603a18'   ,
  'd5aa0865-d94f-466f-9d81-80551cae8a2d'   ,
  'dd550b85-6f89-4563-abd2-d977fa1eb2aa'   ,
  'e66d1656-ccd7-40fc-bc0f-824f7ce453db'   ,
  'fbd0ea68-8221-4b1f-a1cb-968825ddad61'   ,
  'ff5ddc4a-74d4-4209-9250-e2e9e9ac0d11'   
]

const idioms = [];
const examples = [];

for( var i = 0; i < ids.length; i++ ) {

    const id = ids[i];
    const idiom = idiomQuery.idiom(id);
    if( idiom?.assigned?.audio?.publicUrl ) {
        idioms.push(idiom)
    } else {
        const example = exampleQuery.queryOne( '..{.audio.publicUrl *= $id', { id });
        examples.push(example)
    }
}

console.log("const idioms = [ \n"   + JSON.stringify(idioms) + " ]\n;",null,2);
console.log("const examples = [ \n" + JSON.stringify(examples) + " ]\n;",null,2);