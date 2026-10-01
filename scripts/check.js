// Έλεγχος δεδομένων της σελίδας Καριέρες Πληροφορικής.
// Εκτέλεση από τον φάκελο του project:  node scripts/check.js
// Ελέγχει: σύνταξη του script, διπλότυπες θέσεις, θέσεις χωρίς job description,
// job descriptions χωρίς θέση, και αν η διάταξη κρατά το κεντρικό ερώτημα στη μέση.

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

new Function(script); // πετάει σφάλμα αν η JavaScript δεν είναι έγκυρη

const dataPart = script.split('const esc')[0];
const [AREAS, JD] = new Function(dataPart + ';return [AREAS, JD]')();

const boxes = AREAS.filter(a => !a.hub);
const roles = boxes.flatMap(a => a.roles.map(r => r[0]));

const problems = [];
const dups = roles.filter((r, i) => roles.indexOf(r) !== i);
if (dups.length) problems.push('Διπλότυπες θέσεις: ' + dups.join(', '));
const missing = roles.filter(r => !JD[r]);
if (missing.length) problems.push('Θέσεις χωρίς job description: ' + missing.join(', '));
const orphan = Object.keys(JD).filter(k => !roles.includes(k));
if (orphan.length) problems.push('Job descriptions χωρίς θέση: ' + orphan.join(', '));
const ns = boxes.map(a => a.n);
const dupColors = ns.filter((n, i) => ns.indexOf(n) !== i);
if (dupColors.length) problems.push('Κουτιά με ίδιο χρώμα (n): ' + dupColors.join(', '));
for (const n of ns) if (!html.includes(`--c${n}:`)) problems.push(`Λείπει το χρώμα --c${n} από το CSS`);

// Διάταξη: 4 στήλες, το κεντρικό ερώτημα πιάνει 2x2. Για να είναι ακριβώς στη μέση,
// τα κουτιά + 4 πρέπει να γεμίζουν ζυγό αριθμό σειρών.
const cells = boxes.length + 4;
const rows = Math.ceil(cells / 4);
if (cells % 4 !== 0) problems.push(`Η διάταξη αφήνει κενά: ${boxes.length} κουτιά + 4 κελιά κέντρου δεν διαιρείται με το 4`);
else if (rows % 2 !== 0) problems.push(`Με ${rows} σειρές το κεντρικό ερώτημα δεν είναι ακριβώς στη μέση`);

console.log(`Κουτιά: ${boxes.length} · Θέσεις: ${roles.length} · Με links: ${roles.filter(r => JD[r] && JD[r].l.length).length}`);
if (problems.length) {
  console.log('\nΠροβλήματα:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Όλα εντάξει.');
