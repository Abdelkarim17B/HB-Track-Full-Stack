#!/bin/bash

echo "🚀 HBTRACK CI/CD Pipeline Validation"
echo "===================================="

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
}

warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

info() {
  echo -e "ℹ️ $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  error "package.json not found. Please run this script from the project root."
  exit 1
fi

info "Starting validation for HBTRACK project..."

# 1. Check Node.js version
echo -e "\n1️⃣ Checking Node.js version..."
node_version=$(node -v)
if [[ $node_version == v22* ]]; then
  success "Node.js version: $node_version ✓"
else
  warning "Node.js version: $node_version (expected v22.x)"
fi

# 2. Check dependencies
echo -e "\n2️⃣ Checking dependencies..."
if npm list --depth=0 > /dev/null 2>&1; then
  success "Dependencies are installed correctly"
else
  warning "Some dependency issues detected"
fi

# 3. Run lint checks
echo -e "\n3️⃣ Running linting..."
if npm run lint > /dev/null 2>&1; then
  success "ESLint passed"
else
  warning "ESLint found issues"
fi

# 4. Run type checking
echo -e "\n4️⃣ Running type checking..."
if npx tsc --noEmit > /dev/null 2>&1; then
  success "TypeScript type checking passed"
else
  warning "TypeScript type checking found issues"
fi

# 5. Run Jest tests
echo -e "\n5️⃣ Running Jest tests..."
if npm test > /dev/null 2>&1; then
  success "Jest tests passed"
else
  error "Jest tests failed"
fi

# 6. Test build process
echo -e "\n6️⃣ Testing build process..."
if npm run build > /dev/null 2>&1; then
  success "Next.js build successful"
else
  error "Next.js build failed"
fi

# 7. Check Selenium tests
echo -e "\n7️⃣ Testing Selenium (requires running dev server)..."
if pgrep -f "next dev" > /dev/null; then
  if HEADLESS=true npm run test:selenium > /dev/null 2>&1; then
    success "Selenium tests passed"
  else
    warning "Selenium tests failed (server might not be ready)"
  fi
else
  warning "Dev server not running - skipping Selenium tests"
fi

# 8. Check Docker setup
echo -e "\n8️⃣ Checking Docker configuration..."
if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ]; then
  success "Docker configuration files present"
else
  error "Docker configuration files missing"
fi

# 9. Check CI/CD configuration
echo -e "\n9️⃣ Checking CI/CD configuration..."
if [ -f ".github/workflows/ci-cd.yml" ]; then
  success "GitHub Actions workflow present"
else
  error "GitHub Actions workflow missing"
fi

# 10. Check documentation
echo -e "\n🔟 Checking documentation..."
if [ -f "README.md" ] && [ -d "docs" ]; then
  success "Documentation present"
else
  warning "Documentation incomplete"
fi

echo -e "\n🎉 Validation complete!"
echo "Run this script regularly to ensure your CI/CD pipeline health."
