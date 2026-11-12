import { SHAPES } from "../../../lib/content.ts";
import type { Beard, ShapeKey } from "../../../lib/content.ts";
import { classify, score3DMeasures, zScores } from "../../../lib/faceShape.ts";
import type { Measures, Ranked } from "../../../lib/faceShape.ts";
import { LEAN_RATIO, MP3D_NORM, SHAPE_OFFSET, SOFTMAX_T } from "../../../lib/faceShape.config.ts";

const SHAPE_KEYS = Object.keys(SHAPES) as ShapeKey[];
const MEASURE_KEYS = Object.keys(MP3D_NORM) as (keyof Measures)[];

export interface Participant {
  id: string;
  split: "fit" | "test";
  shapes: ShapeKey[];
  photos: { file: string; beard: Beard }[];
}

export interface MeasuredParticipant extends Participant {
  samples: { raw: Measures; beard: Beard }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseManifest(value: unknown): Participant[] {
  if (!Array.isArray(value) || !value.length) throw new Error("Use a JSON array of participants.");
  const ids = new Set<string>();
  const files = new Set<string>();
  return value.map((row: unknown, i): Participant => {
    if (!isRecord(row)) throw new Error(`Invalid participant on row ${i + 1}.`);
    const { id, split, shapes, photos } = row;
    if (typeof id !== "string" || !id.trim() || ids.has(id.trim()) || (split !== "fit" && split !== "test")) {
      throw new Error(`Give row ${i + 1} a unique participant ID and a fit or test split.`);
    }
    if (!Array.isArray(shapes) || shapes.length < 1 || shapes.length > 2 || new Set(shapes).size !== shapes.length ||
      !shapes.every(shape => SHAPE_KEYS.includes(shape))) {
      throw new Error(`Give ${id} one or two different face shapes from the six shape keys.`);
    }
    if (!Array.isArray(photos) || !photos.length) throw new Error(`Add photo filenames for ${id}.`);
    ids.add(id.trim());
    return {
      id: id.trim(), split, shapes,
      photos: photos.map((photo: unknown) => {
        if (!isRecord(photo)) throw new Error(`Invalid photo entry for ${id}.`);
        const { file, beard } = photo;
        if (typeof file !== "string" || !file.trim() || files.has(file) ||
          (beard !== "none" && beard !== "stubble" && beard !== "full")) {
          throw new Error(`Use a unique filename and none, stubble, or full for each photo of ${id}.`);
        }
        files.add(file);
        return { file, beard };
      }),
    };
  });
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fitNorms(people: MeasuredParticipant[]) {
  const norms = { ...MP3D_NORM };
  for (const key of MEASURE_KEYS) {
    const values = people.map(person => average(person.samples.map(sample => sample.raw[key])));
    const mean = average(values);
    const sd = Math.sqrt(average(values.map(value => (value - mean) ** 2)));
    // Keep the reference scale if the sample has too little variation to estimate it.
    if (sd >= MP3D_NORM[key][1] / 2) norms[key] = [mean, sd];
  }
  return norms;
}

function fitOffsets(people: MeasuredParticipant[], norms: typeof MP3D_NORM) {
  const offsets = { ...SHAPE_OFFSET };
  const fit = people.map(person => ({
    shapes: person.shapes,
    scores: person.samples.map(sample => zScores(score3DMeasures(sample.raw, norms), sample.beard)),
  }));
  for (let step = 0; step < 100; step++) {
    const gradients = Object.fromEntries(SHAPE_KEYS.map(key => [key, 0])) as Record<ShapeKey, number>;
    for (const { shapes, scores } of fit) {
      for (const z of scores) {
        for (const [key, value] of classify(z, offsets)) {
          const target = shapes.includes(key) ? 1 / shapes.length : 0;
          gradients[key] += (value - target) / (SOFTMAX_T * scores.length * fit.length);
        }
      }
    }
    for (const key of SHAPE_KEYS) {
      const prior = SHAPE_OFFSET[key];
      const next = offsets[key] - 0.1 * (gradients[key] + 0.1 * (offsets[key] - prior));
      offsets[key] = Math.max(prior - 1, Math.min(prior + 1, next));
    }
  }
  return offsets;
}

function assess(people: MeasuredParticipant[], predict: (sample: MeasuredParticipant["samples"][number]) => Ranked) {
  let repeatParticipants = 0;
  let consistent = 0;
  const scores = people.map(person => {
    const rankings = person.samples.map(predict);
    if (rankings.length >= 2) {
      repeatParticipants++;
      if (new Set(rankings.map(ranking => ranking[0][0])).size === 1) consistent++;
    }
    const top1 = average(rankings.map(ranking => Number(person.shapes.includes(ranking[0][0]))));
    const label = [...person.shapes].sort().join("/");
    const reportedPair = average(rankings.map(([[first, p1], [second, p2]]) => {
      const reported = p2 >= p1 * LEAN_RATIO ? [first, second] : [first];
      return Number(reported.sort().join("/") === label);
    }));
    return { top1, reportedPair };
  });
  return {
    top1: average(scores.map(score => score.top1)),
    exact: average(scores.map(score => score.reportedPair)),
    repeatParticipants,
    consistent,
  };
}

export function calibrate(people: MeasuredParticipant[]) {
  const usable = people.filter(person => person.samples.length);
  const fit = usable.filter(person => person.split === "fit");
  const test = usable.filter(person => person.split === "test");
  if (fit.length < 2 || !test.length) throw new Error("At least two fit participants and one test participant need a usable photo.");
  const norms = fitNorms(fit);
  const offsets = fitOffsets(fit, norms);
  return {
    fit: fit.length,
    test: test.length,
    missingFitShapes: SHAPE_KEYS.filter(key => !fit.some(person => person.shapes.includes(key))),
    missingTestShapes: SHAPE_KEYS.filter(key => !test.some(person => person.shapes.includes(key))),
    current: assess(test, sample => classify(zScores(score3DMeasures(sample.raw), sample.beard))),
    candidate: assess(test, sample => classify(zScores(score3DMeasures(sample.raw, norms), sample.beard), offsets)),
    config: { MP3D_NORM: norms, SHAPE_OFFSET: offsets },
  };
}
