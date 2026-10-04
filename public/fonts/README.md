# Fonts

Self-hosted, Latin subsets (woff2), variable axes pinned to what the site uses.

- `Archivo-Variable.woff2`: Archivo (SIL OFL 1.1, see `OFL-Archivo.txt`). `wdth` pinned to 100, `wght` 500..900.
- `HankenGrotesk-Variable.woff2`: Hanken Grotesk (SIL OFL 1.1, see `OFL-HankenGrotesk.txt`). `wght` 400..700.

Source: the variable TTFs bundled with the StumpNote app (same families, same licence). Rebuild:

```bash
python3 -m fontTools.varLib.instancer Archivo.ttf wdth=100 wght=500:900 -o Archivo-i.ttf
python3 -m fontTools.varLib.instancer Hanken.ttf wght=400:700 -o Hanken-i.ttf
pyftsubset X-i.ttf --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2193,U+2197,U+2212,U+2215,U+FEFF,U+FFFD" --layout-features='*' --flavor=woff2 --output-file=X.woff2
```
