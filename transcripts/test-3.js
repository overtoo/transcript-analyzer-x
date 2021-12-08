// const a = [
//   { length: 20, fixed: 0, estTime: [0, 40] },
//   { length: 10, estTime: [40, 60] },
//   { length: 10, fixed: 60, estTime: [60, 80] },
//   { length: 10, estTime: [80, 100] },
//   { length: 0, fixed: 100, estTime: [100, 100] },
// ];

const a = [
  { length: 20, fixed: 0 },
  { length: 10 },
  { length: 10, fixed: 60 },
  { length: 10 },
  { length: 0 },
  { length: 30 },
  { length: 95, fixed: 100 },
  { length: 0, fixed: 150 },
];

const b = [
  { length: 20, fixed: 0, estTime: [0, 40] },
  { length: 10, estTime: [40, 60] },
  { length: 10, fixed: 60, estTime: [60, 80] },
  { length: 10, estTime: [80, 100] },
  { length: 0, fixed: 100, estTime: [100, 100] },
];

const c = [];
let nextFixed;
let lastFixed;
let nextFixedIndex;
let charAccum;
let charTotal;

for (let i = 0; i < a.length; i++) {
  c[i] = a[i];
  if (a[i].fixed > -1) {
    lastFixed = a[i].fixed;
    lastFixedIndex = i;
    charAccum = 0;
  }
  charAccum += c[i].length;
  c[i].lastFixed = lastFixed;
  c[i].charAccum = charAccum;
}
for (let i = a.length - 1; i > -1; i--) {
  if (i == a.length - 1) {
    nextFixed = a[i].fixed;
    nextFixedIndex = i;
  }
  if (a[i].fixed > -1) {
    c[i].nextFixed = nextFixed;
    c[i].nextFixedIndex = nextFixedIndex;
    nextFixed = a[i].fixed;
    nextFixedIndex = i;
    // charTotal = c[i].charAccum;
  } else {
    c[i].nextFixed = nextFixed;
    c[i].nextFixedIndex = nextFixedIndex;
  }
  //   c[i].charTotal = c[nextFixedIndex - 1].charAccum;
  c[i].charTotal = c[c[i].nextFixedIndex - 1].charAccum;
  c[i].start =
    ((c[i].charAccum - c[i].length) / c[i].charTotal) *
      (c[i].nextFixed - c[i].lastFixed) +
    c[i].lastFixed;
  c[i].end =
    (c[i].charAccum / c[i].charTotal) * (c[i].nextFixed - c[i].lastFixed) +
    c[i].lastFixed;
}

console.table(a);
console.table(b);
console.table(c);
