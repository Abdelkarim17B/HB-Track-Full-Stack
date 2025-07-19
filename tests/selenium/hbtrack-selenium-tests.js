const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

class HBTrackSeleniumTests {
  constructor() {
    this.driver = null;
    this.baseUrl = process.env.TEST_URL || 'http://localhost:3000';
  }

  async setUp() {
    const options = new firefox.Options();
    
    // Set Firefox binary path to actual snap binary
    options.setBinary('/snap/firefox/current/usr/lib/firefox/firefox');
    
    // Configuration pour CI/CD ou mode headless
    if (process.env.CI || process.env.HEADLESS) {
      options.addArguments('--headless');
      options.setPreference('browser.tabs.remote.autostart', false);
      options.setPreference('browser.tabs.remote.autostart.2', false);
      options.windowSize({ width: 1920, height: 1080 });
    }

    this.driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();

    await this.driver.manage().setTimeouts({ implicit: 10000 });
  }

  async tearDown() {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  // Test de la page de connexion
  async testSignInPage() {
    console.log('🧪 Test: Page de connexion');
    
    try {
      await this.driver.get(`${this.baseUrl}/signin`);
      
      // Wait for page to load
      await this.driver.sleep(2000);
      
      // Vérifier le titre
      const title = await this.driver.getTitle();
      console.log(`📋 Titre de la page: ${title}`);
      console.assert(title.includes('HBTRACK'), `Titre incorrect: ${title}`);
      
      // Vérifier les éléments de la page avec wait
      const { until } = require('selenium-webdriver');
      
      console.log('🔍 Recherche des éléments de connexion...');
      const emailInput = await this.driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
      const passwordInput = await this.driver.wait(until.elementLocated(By.css('input[type="password"]')), 10000);
      
      console.log('✅ Éléments de connexion trouvés');
      console.assert(emailInput && passwordInput, 'Éléments de connexion non trouvés');
      
      console.log('✅ Test de la page de connexion réussi');
    } catch (error) {
      console.error('❌ Erreur dans testSignInPage:', error.message);
      throw error;
    }
  }

  // Test de la page d'inscription
  async testRegisterPage() {
    console.log('🧪 Test: Page d\'inscription');
    
    try {
      await this.driver.get(`${this.baseUrl}/register`);
      await this.driver.sleep(2000);
      
      // Vérifier les champs du formulaire avec sélecteurs plus génériques
      const { until } = require('selenium-webdriver');
      
      console.log('🔍 Recherche des champs d\'inscription...');
      const nameInput = await this.driver.wait(until.elementLocated(By.css('input[name="name"], input[placeholder*="nom"], input[placeholder*="Nom"]')), 10000);
      const emailInput = await this.driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
      const passwordInput = await this.driver.wait(until.elementLocated(By.css('input[type="password"]')), 10000);
      
      console.log('✅ Champs d\'inscription trouvés');
      console.assert(await nameInput.isDisplayed(), 'Champ nom non visible');
      console.assert(await emailInput.isDisplayed(), 'Champ email non visible');
      console.assert(await passwordInput.isDisplayed(), 'Champ mot de passe non visible');
      
      console.log('✅ Test page d\'inscription réussi');
    } catch (error) {
      console.error('❌ Erreur dans testRegisterPage:', error.message);
      throw error;
    }
  }

  // Test de redirection pour utilisateur non authentifié
  async testUnauthorizedRedirect() {
    console.log('🧪 Test: Redirection utilisateur non authentifié');
    
    await this.driver.get(`${this.baseUrl}/dashboard`);
    
    // Attendre la redirection
    await this.driver.wait(until.urlContains('/signin'), 5000);
    
    const currentUrl = await this.driver.getCurrentUrl();
    console.assert(currentUrl.includes('/signin'), `Redirection échouée: ${currentUrl}`);
    
    console.log('✅ Test redirection non authentifié réussi');
  }

  // Test de validation du formulaire de connexion
  async testSignInFormValidation() {
    console.log('🧪 Test: Validation formulaire de connexion');
    
    await this.driver.get(`${this.baseUrl}/signin`);
    
    // Soumettre le formulaire vide
    const submitButton = await this.driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    // Attendre les messages d'erreur
    await this.driver.sleep(1000);
    
    // Vérifier la présence de messages d'erreur
    const errorMessages = await this.driver.findElements(By.css('[class*="text-destructive"]'));
    console.assert(errorMessages.length > 0, 'Aucun message d\'erreur affiché');
    
    console.log('✅ Test validation formulaire réussi');
  }

  // Test de responsivité mobile
  async testMobileResponsiveness() {
    console.log('🧪 Test: Responsivité mobile');
    
    // Simuler un écran mobile
    await this.driver.manage().window().setRect({ width: 375, height: 667 });
    
    await this.driver.get(`${this.baseUrl}/signin`);
    
    // Vérifier que les éléments sont toujours visibles
    const emailInput = await this.driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await this.driver.findElement(By.css('input[type="password"]'));
    
    console.assert(await emailInput.isDisplayed(), 'Champ email non visible sur mobile');
    console.assert(await passwordInput.isDisplayed(), 'Champ mot de passe non visible sur mobile');
    
    // Remettre la taille normale
    await this.driver.manage().window().setRect({ width: 1920, height: 1080 });
    
    console.log('✅ Test responsivité mobile réussi');
  }

  // Test de performance - temps de chargement
  async testPageLoadTime() {
    console.log('🧪 Test: Temps de chargement des pages');
    
    const startTime = Date.now();
    await this.driver.get(this.baseUrl);
    
    // Attendre que la page soit complètement chargée
    await this.driver.wait(until.elementLocated(By.css('body')), 10000);
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    
    // Vérifier que le temps de chargement est acceptable (< 3 secondes)
    console.assert(loadTime < 3000, `Temps de chargement trop long: ${loadTime}ms`);
    
    console.log('✅ Test temps de chargement réussi');
  }

  // Test d'accessibilité basique
  async testBasicAccessibility() {
    console.log('🧪 Test: Accessibilité basique');
    
    await this.driver.get(`${this.baseUrl}/signin`);
    
    // Vérifier la présence d'attributs alt pour les images
    const images = await this.driver.findElements(By.css('img'));
    for (let img of images) {
      const alt = await img.getAttribute('alt');
      console.assert(alt !== null, 'Image sans attribut alt trouvée');
    }
    
    // Vérifier la présence de labels pour les inputs
    const inputs = await this.driver.findElements(By.css('input'));
    for (let input of inputs) {
      const label = await input.getAttribute('aria-label') || 
                   await input.getAttribute('placeholder');
      console.assert(label !== null, 'Input sans label trouvé');
    }
    
    console.log('✅ Test accessibilité basique réussi');
  }

  // Exécuter tous les tests
  async runAllTests() {
    console.log('🚀 Démarrage des tests Selenium pour HBTRACK\n');
    
    try {
      await this.setUp();
      
      await this.testSignInPage();
      await this.testRegisterPage();
      await this.testUnauthorizedRedirect();
      await this.testSignInFormValidation();
      await this.testMobileResponsiveness();
      await this.testPageLoadTime();
      await this.testBasicAccessibility();
      
      console.log('\n🎉 Tous les tests Selenium ont réussi !');
      
    } catch (error) {
      console.error('\n❌ Erreur lors des tests:', error);
      throw error;
    } finally {
      await this.tearDown();
    }
  }
}

// Exécution des tests si ce fichier est lancé directement
if (require.main === module) {
  const tests = new HBTrackSeleniumTests();
  tests.runAllTests()
    .then(() => {
      console.log('Tests terminés avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Tests échoués:', error);
      process.exit(1);
    });
}

module.exports = HBTrackSeleniumTests;
