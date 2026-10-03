import Image, { type ImageProps } from "next/image";
import manifest from "@/content/images.json";

const sizes = manifest as Record<string, { w: number; h: number }>;

export function dims(src: string) {
  return sizes[src] ?? { w: 1200, h: 1200 };
}

type Props = Omit<ImageProps, "src" | "width" | "height"> & { src: string; fill?: boolean };

/** next/image with intrinsic sizes looked up from the generated manifest. */
export default function Img({ src, fill, alt, ...rest }: Props) {
  if (fill) return <Image src={src} alt={alt} fill {...rest} />;
  const d = dims(src);
  return <Image src={src} alt={alt} width={d.w} height={d.h} {...rest} />;
}
