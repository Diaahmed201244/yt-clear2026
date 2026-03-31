# GameChatConnect

## Getting Started

### Install dependencies

```sh
pnpm install
```

### Run in development

```sh
pnpm run dev
```

### Build for production

```sh
pnpm run build
```

### Start production server

```sh
pnpm run start
```

## Performance Features

- Uses [pnpm](https://pnpm.io/) for fast, efficient dependency management.
- Code-splitting and lazy loading for non-critical components (modals, chat, audio, pages) using React.lazy and Suspense.
- Bundle analysis: To analyze your production bundle, run:

```sh
ANALYZE=true pnpm run build
```

This will open an interactive visualization of your bundle using [vite-plugin-visualizer](https://github.com/btd/vite-plugin-visualizer).

## Additional Notes

- For best performance, always use pnpm for installing and managing dependencies.
- The project is optimized for fast load times and efficient resource usage. 