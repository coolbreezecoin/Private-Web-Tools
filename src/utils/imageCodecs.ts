import { getOutputMime, type WasmImageOutputFormat } from "@/utils/image";

type AvifEncoderModule = {
  encode(data: Uint8Array, width: number, height: number, options: Record<string, unknown>): Uint8Array | null;
};

let avifEncoder: Promise<{ module: AvifEncoderModule; defaultOptions: Record<string, unknown> }> | null = null;

async function loadSingleThreadAvifEncoder() {
  avifEncoder ??= Promise.all([
    import("@jsquash/avif/codec/enc/avif_enc.js"),
    import("@jsquash/avif/utils.js"),
    import("@jsquash/avif/meta.js"),
  ]).then(async ([codec, utils, meta]) => ({
    module: (await utils.initEmscriptenModule(codec.default)) as AvifEncoderModule,
    defaultOptions: meta.defaultOptions as unknown as Record<string, unknown>,
  }));

  return avifEncoder;
}

function blobFromArrayBuffer(buffer: ArrayBuffer, type: string) {
  return new Blob([buffer], { type });
}

function arrayBufferFromBytes(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer as ArrayBuffer;
}

function encodeQuality(quality: number) {
  return Math.min(100, Math.max(1, Math.round(quality)));
}

async function encodeAvif(imageData: ImageData, quality: number) {
  const { module, defaultOptions } = await loadSingleThreadAvifEncoder();
  const options = {
    ...defaultOptions,
    quality: encodeQuality(quality),
    speed: 6,
    bitDepth: 8,
    lossless: false,
  };
  const output = module.encode(new Uint8Array(imageData.data.buffer), imageData.width, imageData.height, options);
  if (!output) throw new Error("AVIF encoding failed.");
  return blobFromArrayBuffer(arrayBufferFromBytes(output), getOutputMime("avif"));
}

async function encodeJpeg(imageData: ImageData, quality: number) {
  const { default: encode } = await import("@jsquash/jpeg/encode.js");
  const output = await encode(imageData, { quality: encodeQuality(quality), progressive: true });
  return blobFromArrayBuffer(output, getOutputMime("jpeg"));
}

async function encodePng(imageData: ImageData) {
  const { default: encode } = await import("@jsquash/png/encode.js");
  const output = await encode(imageData, { bitDepth: 8 });
  return blobFromArrayBuffer(output, getOutputMime("png"));
}

export async function encodeImageWithWasm(imageData: ImageData, format: WasmImageOutputFormat, quality: number): Promise<Blob> {
  if (format === "avif") return encodeAvif(imageData, quality);
  if (format === "jpeg") return encodeJpeg(imageData, quality);
  return encodePng(imageData);
}
