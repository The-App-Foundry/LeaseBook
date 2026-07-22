# LeaseBook

LeaseBook is a cross-platform property management application built with Tauri v2,
React 19, TypeScript, and Rust.

## Development

```bash
pnpm dev
pnpm tauri:dev
pnpm build
pnpm tauri:build
```

## Linux Build Dependencies

On Ubuntu/Debian systems, install the Tauri Linux dependencies before running
`pnpm tauri:build`:

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  librsvg2-dev \
  pkg-config
```

`librsvg2-dev` is required for AppImage bundling. Without it, linuxdeploy can fail
with:

```text
there is no 'libdir' variable for 'librsvg-2.0' library
Please check the 'librsvg-2.0.pc' file is present in $PKG_CONFIG_PATH
```

If AppImage output is not needed, build only the Debian/RPM bundles:

```bash
./node_modules/.bin/tauri build --bundles deb,rpm
```
