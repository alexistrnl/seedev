'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import IntroGate from '@/components/IntroGate';
import HeroSection from '@/components/HeroSection';
import TopMenu from '@/components/TopMenu';
import '@/components/cards-section.css';
import '@/components/pricing-section.css';
import '@/components/project-cta.css';
import '@/components/project-cta.css';

function CardsSection() {
  const router = useRouter();

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Implémenter la vérification d'authentification avec la nouvelle base de données
    // Exemple: if (authService.isAuthenticated()) { router.push('/dashboard'); } else { router.push('/login'); }
    router.push('/login');
  };

  const cards = [
    {
      num: '01',
      title: 'Poses ton idée',
      description: (
        <>
          Tu nous partages ton idée,<br />
          <strong>même imparfaite</strong>.<br />
          On l'analyse, on identifie les <strong>points faibles</strong> et les <strong>axes d'amélioration</strong>.<br />
          On te fait des <strong>recommandations claires</strong>.<br />
          Tu valides ensuite si on lance<br />
          le <strong>développement</strong>.
        </>
      ),
      bgImage: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      tag: 'Écrire mon idée',
    },
    {
      num: '02',
      title: 'Développement',
      description: (
        <>
          Une fois validé, on prend le<br />
          <strong>relais en interne</strong>.<br />
          <strong>Cadrage</strong>, <strong>choix techniques</strong>, <strong>développement</strong> et <strong>mise en ligne</strong>.<br />
          On construit un <strong>MVP centré sur<br />
          l'essentiel</strong>, sans sur-ingénierie ni promesse inutile.
        </>
      ),
      bgImage: 'https://images.unsplash.com/photo-1719253480609-579ad1622c65?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      tag: 'Développement pris en charge',
    },
    {
      num: '03',
      title: 'Résultat',
      description: (
        <>
          Tu repars avec un <strong>projet réel</strong>, <strong>accessible en ligne</strong>.<br />
          Un <strong>MVP fonctionnel</strong> que tu peux <strong>tester</strong>, <strong>présenter</strong> ou <strong>faire évoluer</strong>.<br />
          Le projet est <strong>à toi</strong>. <strong>La suite</strong> aussi.
        </>
      ),
      bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
      tag: 'Découvrir le résultat',
    },
  ];

  return (
    <section className="bg-neutral-950 px-4 py-20 md:px-8 lg:px-10 lg:py-32">
      <div className="mx-auto w-full max-w-[1600px]">
        <h2 className="mb-16 text-center text-4xl font-black uppercase text-neutral-100 md:text-5xl lg:text-6xl">
          TON PROJET EN 3 ÉTAPES
        </h2>
        <div className="flex flex-col items-center justify-center gap-12 md:flex-row md:justify-center md:gap-6 lg:gap-8 xl:gap-10">
          {cards.map((card) => (
            <div key={card.num} className="relative">
              <div className="mb-6 ml-4 text-6xl font-bold text-neutral-100/20 md:text-8xl lg:text-9xl xl:text-[10rem]">
                {card.num}
              </div>
              <a
                href="#"
                onClick={handleCTAClick}
                className="card-hover relative block h-[500px] w-[320px] overflow-hidden rounded-2xl border-8 border-neutral-800 text-white shadow-[0_0_5em_-1em_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-neutral-700 md:h-[600px] md:w-[380px] lg:h-[650px] lg:w-[420px] xl:h-[700px] xl:w-[450px]"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${card.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="card-content flex h-full flex-col justify-end p-8 md:p-10 lg:p-12">
                  <div className="absolute right-0 top-0 p-6 text-sm opacity-80 md:p-8">
                    <div className="text-xs md:text-sm">SEEDDEV</div>
                  </div>
                  <h1 className="mb-3 text-center text-2xl font-bold uppercase leading-tight md:text-3xl lg:text-4xl">{card.title}</h1>
                  <p className="card-description text-base leading-relaxed md:text-lg lg:text-xl">{card.description}</p>
                  {card.tag && (
                    <div className="flex">
                      <div className="card-tag rounded-md bg-white/50 px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base">
                        {card.tag}
                      </div>
                    </div>
                  )}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SuccessStory() {
  return (
    <section className="bg-neutral-950 px-4 pb-20 pt-8 md:px-8 lg:px-10 lg:pb-32 lg:pt-12">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-16 text-center text-4xl font-black uppercase text-neutral-100 md:text-5xl lg:text-6xl">
          UN EXEMPLE CONCRET
        </h2>
        <div className="rounded-2xl border-8 border-neutral-800 bg-neutral-950 p-8 md:p-12 lg:p-16">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
            {/* Image/Capture du site */}
            <div className="flex-1">
              <div className="relative overflow-hidden rounded-xl border-4 border-neutral-800 bg-neutral-900 shadow-2xl">
                <div className="aspect-video relative w-full">
                  <img
                    src="/doue-ai-screenshot.png"
                    alt="Capture d'écran du site DOUE AI"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Contenu texte */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="mb-4 text-3xl font-black uppercase text-neutral-100 md:text-4xl">
                  De l'idée à la réalité
                </h3>
                <p className="text-lg leading-relaxed text-neutral-300 md:text-xl">
                  DOUE AI était juste une idée dans la tête du client. Nous l'avons analysée, développée et mise en ligne.
                  Aujourd'hui, <strong className="text-neutral-100">le site génère des revenus réguliers</strong>.
                </p>
              </div>

              <div className="space-y-4 border-t border-neutral-800 pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-100">Site en ligne et fonctionnel</p>
                    <p className="text-neutral-400">MVP développé et déployé</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-100">Revenus générés</p>
                    <p className="text-neutral-400">Le projet génère des revenus pour le client</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-100">Idée transformée en projet réel</p>
                    <p className="text-neutral-400">Du concept à l'exécution réussie</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-2 border-green-500/30 bg-green-500/10 p-4">
                <p className="text-center font-semibold text-green-400">
                  "Juste une idée dans sa tête, maintenant c'est un site qui génère des revenus."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<number | null>(null);

  const handleOpenModal = (offerNumber: number) => {
    setOpenModal(offerNumber);
    document.documentElement.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    document.documentElement.style.overflow = '';
  };

  const handleCTAClick = () => {
    // TODO: Implémenter la vérification d'authentification avec la nouvelle base de données
    // Exemple: if (authService.isAuthenticated()) { router.push('/dashboard'); } else { router.push('/login'); }
    router.push('/login');
  };

  return (
    <section id="pricing" className="border-y border-neutral-900 bg-neutral-950 px-4 py-28 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1600px]">
        <h2 className="mb-16 text-center text-4xl font-black uppercase text-neutral-100 md:text-5xl lg:text-6xl">
          TARIFS
        </h2>
        <div className="flex flex-col items-stretch justify-center gap-12 md:flex-row md:justify-center md:gap-6 lg:gap-8 xl:gap-10">
          <div className="pricing-card flex w-[320px] flex-col rounded-2xl border-8 border-neutral-800 bg-neutral-950 p-10 text-white md:w-[582px] lg:w-[646px] lg:p-12 xl:w-[695px]">
            <h3 className="mb-5 text-center text-4xl font-black uppercase">Analyse d'idée</h3>
            <div className="pricing-price mb-8 text-5xl font-bold text-center">2,49 €</div>
            
            <div className="pricing-description mb-8 flex-1 text-lg leading-relaxed">
              <span className="pricing-description-line block font-medium opacity-100">
                Tu soumets ton idée.
              </span>
              <span className="pricing-description-line block mt-3 opacity-80">
                On l'analyse et on te donne des recommandations claires pour décider de la suite.
              </span>
            </div>
            
            <button
              onClick={() => handleOpenModal(1)}
              className="pricing-button mt-auto w-fit rounded border border-neutral-600 bg-transparent px-4 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <span>Détails</span>
            </button>
          </div>
          
          <div
            className="pricing-card flex w-[320px] flex-col rounded-2xl border-8 border-neutral-800 p-10 text-white md:w-[582px] lg:w-[646px] lg:p-12 xl:w-[695px]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url(https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <h3 className="mb-5 text-center text-4xl font-black uppercase">MVP fonctionnel</h3>
            <div className="pricing-price mb-8 text-5xl font-bold text-center">Sur devis</div>
            
            <div className="pricing-description mb-8 flex-1 text-lg leading-relaxed">
              <span className="pricing-description-line block font-medium opacity-100">
                Après ta validation finale, on développe en interne un MVP fonctionnel.
              </span>
              <span className="pricing-description-line block mt-3 opacity-80">
                Un produit simple, en ligne, centré sur l'essentiel.
              </span>
            </div>
            
            <button
              onClick={() => handleOpenModal(2)}
              className="pricing-button mt-auto w-fit rounded border border-neutral-600 bg-transparent px-4 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <span>Détails</span>
            </button>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-neutral-500">
          Tu peux t'arrêter après l'analyse ou repartir avec ton projet, sans contrainte.
        </p>
        <div className="mt-12 flex justify-center">
          <button 
            onClick={handleCTAClick}
            className="pricing-cta-button rounded-2xl border-8 border-neutral-800 bg-neutral-950 px-8 py-3 text-base font-black uppercase text-white transition-colors hover:bg-neutral-900"
          >
            Lancer mon projet
          </button>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border-8 border-neutral-800 bg-neutral-950 p-8 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-3xl text-neutral-400 transition-colors hover:text-white"
            >
              ×
            </button>

            <div className="prose prose-invert max-w-none">
              {openModal === 1 ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-black uppercase">Offre 1 — Analyse d'idée (2,49 €)</h2>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Ce que tu paies</h3>
                    <p className="text-lg">2,49 € — paiement unique</p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Ce que tu fais</h3>
                    <p className="mb-2 text-lg">Tu remplis un formulaire simple :</p>
                    <ul className="ml-4 space-y-2 text-base">
                      <li>• le problème que tu veux résoudre</li>
                      <li>• l'idée de solution (haut niveau)</li>
                      <li>• la cible</li>
                      <li>• l'objectif du projet</li>
                    </ul>
                    <p className="mt-3 text-base opacity-90">Aucune compétence technique requise</p>
                    <p className="text-base opacity-90">Pas de cahier des charges</p>
                    <p className="text-base opacity-90">Pas de liste de fonctionnalités</p>
                    <p className="mt-2 text-base">Tu poses ton idée à plat, même si elle est floue.</p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Ce que nous faisons</h3>
                    <p className="mb-2 text-base">Analyse complète de ton idée</p>
                    <p className="mb-2 text-base">Identification :</p>
                    <ul className="ml-4 space-y-1 text-base">
                      <li>• des points bloquants</li>
                      <li>• des incohérences éventuelles</li>
                      <li>• des axes de simplification</li>
                    </ul>
                    <p className="mt-2 text-base">Recommandations écrites, structurées et actionnables</p>
                    <p className="mt-3 text-base text-yellow-500">Important :</p>
                    <p className="text-base">Ce n'est pas une validation</p>
                    <p className="text-base">Ce n'est pas une étude de marché</p>
                    <p className="text-base">Aucune promesse de succès n'est faite</p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Ce que tu reçois</h3>
                    <ul className="ml-4 space-y-2 text-base">
                      <li>• Un retour écrit clair</li>
                      <li>• Des pistes d'amélioration concrètes</li>
                      <li>• Une vision plus réaliste de ton idée</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold">Étape suivante : à toi de décider</h3>
                    <p className="mb-3 text-base">Après l'analyse, tu choisis :</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold">1 Tu t'arrêtes là</p>
                        <ul className="ml-4 space-y-1 text-base opacity-90">
                          <li>• Tu repars avec les recommandations</li>
                          <li>• Aucun engagement</li>
                          <li>• Tu peux proposer une autre idée plus tard</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold">2 Tu veux continuer</p>
                        <ul className="ml-4 space-y-1 text-base opacity-90">
                          <li>• Tu passes à la phase développement du MVP</li>
                          <li>• Un devis te sera proposé</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl font-black uppercase">Offre 2 — Développement du MVP (sur devis)</h2>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold">Quand cette offre s'applique</h3>
                    <p className="text-base">Uniquement si tu valides après l'analyse d'idée</p>
                    <p className="text-base opacity-90">Aucun développement n'est lancé sans ton accord.</p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Ce que tu paies</h3>
                    <p className="mb-2 text-base">Prix sur devis, selon :</p>
                    <ul className="ml-4 space-y-1 text-base">
                      <li>• la complexité du projet</li>
                      <li>• le périmètre défini</li>
                    </ul>
                    <p className="mt-2 text-base">Paiement avant le lancement du développement</p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Ce que tu fais</h3>
                    <p className="mb-2 text-base">Tu valides le périmètre du projet :</p>
                    <ul className="ml-4 space-y-1 text-base">
                      <li>• pages à développer</li>
                      <li>• logique générale</li>
                      <li>• besoins spécifiques</li>
                    </ul>
                    <p className="mt-3 text-base">Une fois validé, le périmètre est figé</p>
                    <p className="mt-2 text-base text-yellow-500">Pas de refonte majeure en cours de développement.</p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Ce que nous faisons</h3>
                    <ul className="ml-4 space-y-2 text-base">
                      <li>• Cadrage technique du projet</li>
                      <li>• Développement du MVP en interne</li>
                      <li>• Mise en ligne sur ton domaine</li>
                      <li>• Configuration technique de base</li>
                      <li>• Livraison d'un projet fonctionnel et accessible en ligne</li>
                    </ul>
                    <p className="mt-3 text-base">Le MVP est centré sur l'essentiel.</p>
                    <p className="text-base">Pas de sur-ingénierie.</p>
                    <p className="text-base">Pas de fonctionnalités inutiles.</p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Ce que tu reçois</h3>
                    <ul className="ml-4 space-y-2 text-base">
                      <li>• Un MVP fonctionnel</li>
                      <li>• Un accès complet au projet</li>
                      <li>• 1 mois de suivi technique inclus</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-green-500">Suivi inclus (1 mois)</h3>
                    <ul className="ml-4 space-y-1 text-base">
                      <li>• Corrections de bugs</li>
                      <li>• Ajustements techniques mineurs</li>
                      <li>• Aide au bon fonctionnement</li>
                    </ul>
                    <p className="mt-3 text-base text-red-500">Ce suivi n'inclut pas :</p>
                    <ul className="ml-4 space-y-1 text-base text-red-400">
                      <li>• nouvelles fonctionnalités</li>
                      <li>• refonte produit</li>
                      <li>• accompagnement stratégique long terme</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Et après que mon site soit développé ?",
      answer: (
        <>
          Une fois le MVP livré, un mois de suivi technique est inclus.<br />
          Il permet de corriger d'éventuels bugs et d'appliquer une mise à jour mineure si nécessaire.<br />
          <br />
          À l'issue de ce mois, tu as le choix :<br />
          • Récupérer l'ensemble du projet (code, accès, hébergement) et gérer la suite toi-même<br />
          • Souscrire à un abonnement pour continuer le suivi et ne pas gérer la partie technique<br />
          <br />
          Aucune obligation. Tu décides.
        </>
      ),
    },
    {
      question: "Est-ce compliqué de démarrer ?",
      answer: (
        <>
          Non.<br />
          Tu décris simplement ton idée, même imparfaite. On s'occupe du reste.
        </>
      ),
    },
    {
      question: "Est-ce que je peux commencer même si je ne suis pas technique ?",
      answer: (
        <>
          Oui.<br />
          SEEDEV est pensé pour les profils non-tech. Tu expliques ton idée, le développement est pris en charge.
        </>
      ),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-neutral-950 px-4 py-20 md:px-8 lg:px-10 lg:py-32">
      <div className="mx-auto w-full max-w-4xl">
        <h2 className="mb-16 text-center text-4xl font-black uppercase text-neutral-100 md:text-5xl lg:text-6xl">
          FAQ
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border-8 border-neutral-800 bg-neutral-950 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full pt-8 pb-6 px-8 md:pt-10 md:pb-8 md:px-10 lg:pt-12 lg:pb-10 lg:px-12 text-left transition-colors hover:bg-neutral-900/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-black uppercase text-neutral-100 md:text-2xl flex-1">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-6 h-6 text-neutral-400 flex-shrink-0 transition-transform duration-300 mt-1 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-8 pb-8 md:px-10 md:pb-10 lg:px-12 lg:pb-12">
                  <p className="text-base leading-relaxed text-neutral-300 md:text-lg">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 px-4 py-12 md:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-sm text-neutral-500">© 2026 SEEDEV</div>
        <div className="flex gap-6">
          <a href="#pricing" className="text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-100">
            Tarifs
          </a>
          <a href="#" className="text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-100">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const router = useRouter();
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const ctaSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ctaSectionRef.current) {
        const rect = ctaSectionRef.current.getBoundingClientRect();
        // Afficher le bouton flottant quand la section CTA est complètement dépassée
        setShowFloatingCTA(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Vérifier la position initiale

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCTAClick = () => {
    // TODO: Implémenter la vérification d'authentification avec la nouvelle base de données
    // Exemple: if (authService.isAuthenticated()) { router.push('/dashboard'); } else { router.push('/login'); }
    router.push('/login');
  };

  // Désactiver temporairement IntroGate
  useEffect(() => {
    // Déclencher l'événement pour HeroSection quand IntroGate est désactivé
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('introGateClosed'));
      }, 100);
    }
  }, []);

  return (
    <>
      {/* <IntroGate title="Donne vie à tes idées." /> */}
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <HeroSection />
        <section ref={ctaSectionRef} className="bg-neutral-950 px-4 py-16 md:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-16 text-center text-4xl font-black uppercase text-neutral-100 md:text-5xl lg:text-6xl">
              TOUT PART DE LÀ...
            </h2>
            <div className="flex flex-col gap-8">
              <div className="relative flex items-stretch rounded-2xl border-8 border-neutral-800 bg-neutral-950">
                <input
                  id="project-name"
                  type="text"
                  placeholder="Donne un nom à ton projet"
                  className="flex-1 border-0 bg-transparent px-6 py-4 text-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
                  style={{ caretColor: '#ffffff' }}
                />
                <div className="project-cta-wrapper-integrated">
                  <button 
                    onClick={handleCTAClick}
                    className="project-cta-btn-integrated" 
                    type="button"
                  >
                    <div className="project-cta-dot pulse"></div>
                  </button>
                </div>
              </div>
              <p className="-mt-5 text-xs text-neutral-500">* Tu pourras le changer plus tard si besoin</p>
            </div>
          </div>
        </section>
        <CardsSection />
        <SuccessStory />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
      <TopMenu />
      {showFloatingCTA && (
        <div className="fixed top-6 left-6 z-50">
          <button
            onClick={handleCTAClick}
            className="project-cta-btn-floating"
            type="button"
          >
            <div className="project-cta-dot pulse"></div>
          </button>
        </div>
      )}
    </>
  );
}
