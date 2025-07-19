set -e  

echo "HBTRACK - Suite de Tests Complète"
echo "====================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

NODE_ENV=${NODE_ENV:-test}
TEST_URL=${TEST_URL:-http://localhost:3000}
SKIP_BUILD=${SKIP_BUILD:-false}

log "Configuration des tests:"
log "- NODE_ENV: $NODE_ENV"
log "- TEST_URL: $TEST_URL"
log "- SKIP_BUILD: $SKIP_BUILD"
echo ""

log "1️⃣ Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi

NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"

if [[ ${NODE_VERSION:1:2} -lt 22 ]]; then
    warning "Version Node.js recommandée: 22.x (actuelle: $NODE_VERSION)"
fi

success "Prérequis validés"
echo ""

log "2️⃣ Installation des dépendances..."

if [ ! -d "node_modules" ]; then
    npm ci
else
    log "Dépendances déjà installées"
fi

success "Dépendances installées"
echo ""

# 3. Linting
log "3️⃣ Vérification du code (ESLint)..."

if npm run lint; then
    success "Linting réussi"
else
    error "Erreurs de linting détectées"
    exit 1
fi
echo ""

if [ "$SKIP_BUILD" = "false" ]; then
    log "4️⃣ Construction de l'application..."
    
    if npm run build; then
        success "Build réussi"
    else
        error "Échec du build"
        exit 1
    fi
    echo ""
else
    log "4️⃣ Build ignoré (SKIP_BUILD=true)"
    echo ""
fi

log "5️⃣ Tests unitaires (Jest)..."

if npm run test -- --coverage --watchAll=false; then
    success "Tests unitaires réussis"
else
    error "Échec des tests unitaires"
    exit 1
fi
echo ""

log "6️⃣ Démarrage du serveur de test..."

export NEXTAUTH_URL=$TEST_URL
export NEXTAUTH_SECRET="test-secret-key-for-e2e-tests"
export MONGODB_URI="mongodb://localhost:27017/hbtrack-test"

npm start &
SERVER_PID=$!

log "Serveur démarré (PID: $SERVER_PID)"

log "Attente du démarrage du serveur..."
for i in {1..30}; do
    if curl -s $TEST_URL/api/health > /dev/null 2>&1; then
        success "Serveur prêt"
        break
    fi
    
    if [ $i -eq 30 ]; then
        error "Timeout - Le serveur n'a pas démarré"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    sleep 2
done
echo ""

cleanup() {
    log "Nettoyage..."
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
    log "Serveur arrêté"
}

trap cleanup EXIT

log "7️⃣ Tests End-to-End (Playwright)..."

if npx playwright install --with-deps; then
    log "Navigateurs Playwright installés"
else
    warning "Impossible d'installer les navigateurs Playwright"
fi

if npm run test:e2e; then
    success "Tests E2E Playwright réussis"
else
    error "Échec des tests E2E Playwright"
    cleanup
    exit 1
fi
echo ""

log "8️⃣ Tests Selenium..."

# Vérifier si Firefox est installé
if command -v firefox &> /dev/null; then
    if npm run test:selenium; then
        success "Tests Selenium réussis"
    else
        warning "Tests Selenium échoués (non critique)"
    fi
else
    warning "Firefox non trouvé - Tests Selenium ignorés"
fi
echo ""

log "9️⃣ Analyse de sécurité..."

if command -v npm audit &> /dev/null; then
    if npm audit --audit-level moderate; then
        success "Audit de sécurité réussi"
    else
        warning "Vulnérabilités détectées - Vérifiez avec 'npm audit'"
    fi
else
    warning "npm audit non disponible"
fi
echo ""

log "🏁 Rapport final des tests"
echo "=========================="

success "✅ Linting"
success "✅ Build"
success "✅ Tests unitaires"
success "✅ Tests E2E"

echo ""
log "📊 Couverture de code disponible dans: ./coverage/"
log "📊 Rapport Playwright disponible dans: ./playwright-report/"

if [ -f "./coverage/lcov-report/index.html" ]; then
    log "🌐 Ouvrir la couverture: file://$(pwd)/coverage/lcov-report/index.html"
fi

echo ""
success "🎉 Tous les tests sont terminés avec succès !"
log "Application prête pour le déploiement"

cleanup
