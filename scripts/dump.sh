mkdir -p ../staging/query
node dump-examples.js > ../staging/query/examples.js
node dump-progress.js > ../staging/query/progress.js
node dump-idioms.js   > ../staging/query/idioms.js
ls -l ../staging/query
