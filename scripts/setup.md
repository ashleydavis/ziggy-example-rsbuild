# setup.sh

Runs the setup scripts that apply to this machine: on a Mac the iOS and Android ones, on Linux the Android one and under Git Bash the Windows one. Linux needs nothing more than `mise install`. The Windows script fetches the pinned WebView2 SDK and WiX Toolset, and installs Microsoft's C++ toolchain and the Windows SDK when they are missing, see [setup-windows.md](setup-windows.md). No arguments. The root `bun run setup` reaches it through this package's `setup` script.
