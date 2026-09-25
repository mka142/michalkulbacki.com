// This file containes logic for the golden-chord app.
// All of the calculations are done using frequencies in Hz from equal temperament tuning.
// The frequencies are calculated using the formula: f = f0 * 2^(n/12)

const A4 = new Decimal(440);

const TWO = new Decimal(2);
const C0 = A4.dividedBy(16).dividedBy(TWO.pow(9 / 12));

const ONE = new Decimal(1);
const TWELVE = new Decimal(12);

const semiTone = new Decimal(2).pow(ONE.dividedBy(12));

const NOTES = {
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  "B#": 12,
  Cb: 11,
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  "E#": 5,
  Fb: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
};

/**
 * Returns the frequency of a note in Hz.
 * @param {string} note - The note name (key of NOTES object).
 * @param {number} octave - The octave number.
 * @returns {number} The frequency of the note in Hz.
 */
function getFrequency(note, octave) {
  if (octave < 0 || octave > 8) {
    throw new Error("Invalid octave number. Must be between 0 and 8.");
  }
  const o = octave - 4;
  const n = NOTES[note] - 9;

  // using decimal.js
  return A4.times(TWO.pow((12 * o + n) / 12));
}

/**
 * Returns the note name and octave number from a frequency in Hz.
 * @param {string} octaveNote  - Full note string name (e.g. 'C#4', 'A4', 'Bb3')
 * @returns
 */
function getParsedNote(octaveNote) {
  // regex split by numbers
  const noteArr = octaveNote.split(/(\d+)/);

  if (noteArr.length < 2) {
    throw "Octave or note not specified";
  }

  return {
    note: noteArr[0],
    octave: parseInt(noteArr[1]),
  };
}

//Note class need to represent each note as a note reference object with approprieate added or substracted semitones.
class Note {
  constructor(noteString, root = A4) {
    this.NOTES = NOTES;
    this.noteString = noteString;
    this.root = A4;
    this._parse();
  }
  _parse() {
    const parsed = getParsedNote(this.noteString);
    this.note = parsed.note;
    this.octave = parsed.octave;
    this.noteIndex = this.NOTES[this.note];
  }
  addSemitones(semitones) {
    let current = this.NOTES[this.note];
    current += this.octave * 12;
    current += semitones;

    this.octave = Math.floor(current / 12);
    let octaveInterval = current % 12;
    this.note = Object.keys(this.NOTES).find(
      (e) => this.NOTES[e] === octaveInterval
    );

    this.noteString = `${this.note}${this.octave}`;
    this.noteIndex = this.NOTES[this.note];
    return this.noteString;
  }
  freq() {
    return getFrequency(this.note, this.octave);
  }
}

/**
 *
 * @param {Decimal} freq1
 * @param {Decimal} freq2
 */
function getGoldenDivisionFreq(freq1, freq2) {
  // assuming a < b
  const a = new Decimal(Math.min(freq1, freq2));
  const b = new Decimal(Math.max(freq1, freq2));
  // (b-a)/(x-a) = (x-a)/(b-x)
  // (x-a)^2 = (b-a)(b-x)
  // x^2-2ax+a^2 = b^2-bx-ab+ax
  // x^2+(-2a+b-a)x+a^2-b^2+ab = 0
  // x^2+(b-3a)x+a^2-b^2+ab = 0
  const eqA = new Decimal(1);
  const eqB = b.minus(a.times(3));
  const eqC = a.pow(2).minus(b.pow(2)).plus(a.times(b));
  const discriminant = eqB.pow(2).minus(eqA.times(4).times(eqC));

  if (discriminant.lt(0)) {
    throw new Error("No real solutions.");
  }

  const x1 = eqB.negated().plus(discriminant.sqrt()).dividedBy(eqA.times(2));

  const x2 = eqB.negated().minus(discriminant.sqrt()).dividedBy(eqA.times(2));

  if (x1.lt(a) || x1.gt(b)) {
    return x2;
  }
  return x1;
}

/**
 *
 * @param {Number} f - frequency
 * @returns {{note: string, octave: number, offset: number}} offset in cents
 */
function getNoteFromFreq(f) {
  const freq = new Decimal(f);

  // find the closest note to the frequency
  if (freq.lt(C0)) {
    throw new Error("Frequency is too low.");
  }
  // for sure it could be optimized...
  let compNote = new Note("C0");
  while (compNote.freq().lt(freq)) {
    compNote.addSemitones(1);
  }
  const upper = compNote.freq();
  const lower = compNote.freq().dividedBy(semiTone);

  if (freq.minus(lower).lt(upper.minus(freq))) {
    compNote.addSemitones(-1);
  }

  return {
    note: compNote,
    offset: freq.dividedBy(compNote.freq()).log(2).times(1200).toNumber(),
  };
}
