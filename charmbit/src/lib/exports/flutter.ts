import { readViewBox, parseSvg } from "../assets/svg.ts";
import { PALETTE } from "../assets/palette.ts";
import { BRAND } from "../brand.ts";
import { componentName } from "./naming.ts";
import type { ExportOptions, ExportSource } from "./types.ts";

function dartString(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\$/g, "\\$")}'`;
}

function dartColor(hex: string): string {
  return `Color(0xFF${hex.replace("#", "").toUpperCase()})`;
}

/** A StatelessWidget wrapping `SvgPicture.string` from flutter_svg. */
export function toFlutter(asset: ExportSource, options: ExportOptions = {}): string {
  const { attributes } = parseSvg(asset.sourceSvg);
  const { width } = readViewBox(attributes.viewBox ?? "0 0 24 24");
  const name = componentName(asset.slug, asset.family);

  return `// Requires the flutter_svg package:
//   flutter pub add flutter_svg

import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// ${asset.title} from ${BRAND.name}. Ink lines follow [color].
class ${name} extends StatelessWidget {
  const ${name}({
    super.key,
    this.size = ${width},
    this.color = const ${dartColor(options.ink ?? PALETTE.ink.hex)},
    this.semanticsLabel = ${dartString(asset.title)},
  });

  final double size;
  final Color color;
  final String? semanticsLabel;

  static const String svg = r'''${asset.sourceSvg}''';

  @override
  Widget build(BuildContext context) {
    return SvgPicture.string(
      svg,
      width: size,
      height: size,
      theme: SvgTheme(currentColor: color),
      semanticsLabel: semanticsLabel,
    );
  }
}
`;
}
