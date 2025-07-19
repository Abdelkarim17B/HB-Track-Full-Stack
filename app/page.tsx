import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HardHat } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <HardHat className="h-8 w-8" />
                <span className="text-xl font-bold">HBTRACK</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost" className="hover:bg-primary-foreground/10">
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  S&apos;inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Gestion de tâches sur chantier simplifiée
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              HBTRACK facilite la communication et le suivi des tâches entre l&apos;équipe d&apos;encadrement et l&apos;équipe de réalisation sur vos chantiers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer maintenant
                </Button>
              </Link>
              <Link href="/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Fonctionnalités principales
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Gestion des tâches</h3>
                <p className="text-muted-foreground">
                  Créez, attribuez et suivez les tâches quotidiennes par lot de travaux avec une interface intuitive.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Suivi en temps réel</h3>
                <p className="text-muted-foreground">
                  Recevez des mises à jour instantanées sur l&apos;avancement des tâches avec justifications et photos.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Traçabilité complète</h3>
                <p className="text-muted-foreground">
                  Conservez un historique détaillé de toutes les activités pour une meilleure gestion de projet.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Prêt à améliorer la gestion de vos chantiers ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Rejoignez les équipes qui utilisent HBTRACK pour optimiser leur communication et leur productivité.
            </p>
            <Link href="/register">
              <Button size="lg">
                Créer un compte gratuitement
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <HardHat className="h-6 w-6" />
                <span className="text-lg font-bold">HBTRACK</span>
              </div>
              <p className="text-sm mt-2 text-primary-foreground/70">
                &copy; {new Date().getFullYear()} HBTRACK. Tous droits réservés.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
                Conditions d&apos;utilisation
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
                Politique de confidentialité
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}