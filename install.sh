#!/bin/bash

# OpenCleaner Installer
# https://github.com/aitorevi/open-cleaner
#
# Usage:
#   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/aitorevi/open-cleaner/main/install.sh)"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/aitorevi/open-cleaner.git"
INSTALL_DIR="$HOME/.opencleaner"
BIN_DIR="/usr/local/bin"

print_banner() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                           ║${NC}"
    echo -e "${BLUE}║         ${GREEN}OpenCleaner Installer${BLUE}            ║${NC}"
    echo -e "${BLUE}║                                           ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_macos() {
    if [[ "$(uname)" != "Darwin" ]]; then
        print_error "OpenCleaner only works on macOS"
        exit 1
    fi
    print_success "macOS detected"
}

check_homebrew() {
    if ! command -v brew &> /dev/null; then
        print_step "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

        # Add Homebrew to PATH for Apple Silicon
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        print_success "Homebrew installed"
    else
        print_success "Homebrew is already installed"
    fi
}

check_node() {
    if ! command -v node &> /dev/null; then
        print_step "Installing Node.js..."
        brew install node
        print_success "Node.js installed"
    else
        NODE_VERSION=$(node --version)
        print_success "Node.js is already installed ($NODE_VERSION)"
    fi
}

check_git() {
    if ! command -v git &> /dev/null; then
        print_step "Installing Git..."
        brew install git
        print_success "Git installed"
    else
        print_success "Git is already installed"
    fi
}

clone_repo() {
    if [[ -d "$INSTALL_DIR" ]]; then
        print_step "Updating existing installation..."
        cd "$INSTALL_DIR"
        git pull --quiet
        print_success "Repository updated"
    else
        print_step "Cloning OpenCleaner..."
        git clone --quiet "$REPO_URL" "$INSTALL_DIR"
        print_success "Repository cloned"
    fi
}

install_dependencies() {
    print_step "Installing dependencies (this may take a minute)..."
    cd "$INSTALL_DIR"
    npm install --silent --no-fund --no-audit 2>/dev/null
    print_success "Dependencies installed"
}

create_launcher() {
    print_step "Creating launcher command..."

    # Create launcher script
    cat > "$INSTALL_DIR/opencleaner-launcher.sh" << 'LAUNCHER'
#!/bin/bash
cd "$HOME/.opencleaner"
npm run dev 2>/dev/null
LAUNCHER

    chmod +x "$INSTALL_DIR/opencleaner-launcher.sh"

    # Create symlink in /usr/local/bin (may need sudo)
    if [[ -w "$BIN_DIR" ]]; then
        ln -sf "$INSTALL_DIR/opencleaner-launcher.sh" "$BIN_DIR/opencleaner"
    else
        print_warning "Need administrator access to create global command..."
        sudo ln -sf "$INSTALL_DIR/opencleaner-launcher.sh" "$BIN_DIR/opencleaner"
    fi

    print_success "Launcher created: 'opencleaner'"
}

print_finish() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                           ║${NC}"
    echo -e "${GREEN}║     Installation complete! 🎉             ║${NC}"
    echo -e "${GREEN}║                                           ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "To launch OpenCleaner, run:"
    echo ""
    echo -e "    ${BLUE}opencleaner${NC}"
    echo ""
    echo -e "${YELLOW}Note:${NC} On first launch, you'll need to grant"
    echo -e "Full Disk Access in System Preferences."
    echo ""
}

uninstall() {
    print_banner
    print_step "Uninstalling OpenCleaner..."

    # Remove symlink
    if [[ -L "$BIN_DIR/opencleaner" ]]; then
        sudo rm -f "$BIN_DIR/opencleaner"
        print_success "Removed launcher command"
    fi

    # Remove installation directory
    if [[ -d "$INSTALL_DIR" ]]; then
        rm -rf "$INSTALL_DIR"
        print_success "Removed installation directory"
    fi

    echo ""
    print_success "OpenCleaner has been uninstalled"
    echo ""
}

# Main installation flow
main() {
    # Check for uninstall flag
    if [[ "$1" == "--uninstall" ]] || [[ "$1" == "-u" ]]; then
        uninstall
        exit 0
    fi

    print_banner

    print_step "Checking system requirements..."
    check_macos

    print_step "Checking dependencies..."
    check_homebrew
    check_node
    check_git

    echo ""
    clone_repo
    install_dependencies
    create_launcher

    print_finish
}

main "$@"
