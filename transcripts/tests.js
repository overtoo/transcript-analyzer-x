const a = [
  {
    length: 0,
    guessTime: [0, 0],
    fixedTime: 0,
  },
  {
    length: 20,
    guessTime: [0, 0],
    fixedTime: 0,
  },
  {
    length: 4,
    guessTime: [0, 0],
  },
  {
    length: 10,
    guessTime: [0, 0],
  },
  {
    length: 20,
    guessTime: [0, 0],
  },
  {
    length: 20,
    guessTime: [0, 0],
    fixedTime: 60,
  },
  {
    length: 10,
    guessTime: [0, 0],
  },
  {
    length: 20,
    guessTime: [0, 0],
  },
  {
    length: 20,
    guessTime: [0, 0],
  },
  {
    length: 0,
    guessTime: [0, 0],
    fixedTime: 120,
  },
];

for (let i = 0; i < a.length; i++) {
  let accum = 0;
  let position = -1;
  if (a[i].fixedTime > -1) {
    accum += a[i].length;
    position++;
    a[i].accumLengthSinceFixed = accum;
    a[i].position = position;
  }
  for (let j = i + 1; j < a.length; j++) {
    accum += a[j].length;
    position++;
    if (!a[j].accumLengthSinceFixed) {
      a[j].accumLengthSinceFixed = accum;
      a[j].position = position;
    }
    if (a[j].fixedTime > -1) {
      console.log(j);
      a[i].nextFixedIndex = j;
      a[i].nextFixedTime = a[j].fixedTime;
      a[i].nextFixedCharLength = a[j - 1].accumLengthSinceFixed;
      break;
    }
  }
  if (a[i].nextFixedCharLength > -1) {
    if (i > 0) {
      a[i].firstStamp = `${a[i - 1].accumLengthSinceFixed} / ${
        a[i].nextFixedCharLength
      } = ${a[i - 1].accumLengthSinceFixed / a[i].nextFixedCharLength}`;
    }
    a[i].secondStamp = `${a[i].accumLengthSinceFixed} / ${
      a[i].nextFixedCharLength
    } = ${a[i].accumLengthSinceFixed / a[i].nextFixedCharLength}`;
  }
}

console.table(a);
