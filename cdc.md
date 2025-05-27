**Cahier des Charges - Site d'un artiste**

---

## 1. Contexte / Faisabilité
### Origine et Objectif Global
Luther, artiste indépendant, souhaite développer un site web officiel pour renforcer sa présence en ligne, valoriser sa discographie, et proposer un canal direct de vente de ses disques. Ce site servira à la fois de vitrine artistique et de boutique, offrant aux auditeurs un accès simple et complet à l’univers musical de Luther.

L’objectif est de créer une plateforme attractive, ergonomique et responsive, permettant de :
- Présenter les albums et morceaux disponibles, accompagnés d’informations détaillées (paroles, durée, date de sortie, crédits...).
- Faciliter l’achat des disques physiques.
- Centraliser les informations sur l’artiste et ses projets.
- Renforcer l’interaction avec le public fidèle.

### Quoi ?  
- Site vitrine et e-commerce autour de la musique de Luther.

### Qui ?  
- **Commanditaire** : Luther (artiste musical)
- **Développeur** : Web développeur
- **Utilisateurs finaux** : Auditeurs, fans, acheteurs potentiels

### Pourquoi ?  
- Offrir une plateforme officielle dédiée à l’univers artistique de Luther.
- Donner aux fans un accès direct à sa musique, à l’achat de ses disques, et à des contenus exclusifs.
- Maîtriser la vente et la présentation de son œuvre sans dépendre de plateformes tierces.

### Comment ?  
- Conception d’un site web responsive, moderne et accessible.
- Intégration d’un système de gestion de contenu pour l’ajout de disques et morceaux grâce a l'api spotify.
- Mise en place d’une boutique en ligne simple.

## 2. Objectifs SMART
- **Spécifique** : Offrir aux fans de Luther une plateforme unique pour découvrir sa musique et acheter ses disques directement auprès de lui.
- **Mesurable** : Générer au minimum 100 ventes via le site dans les 3 premiers mois suivant le lancement.
- **Atteignable** : En combinant visibilité sur les réseaux sociaux, simplicité d’utilisation du site et mise en avant des disques.
- **Réaliste** : Le site ne nécessite pas de fonctionnalités complexes, ce qui permet un développement rapide et efficace.
- **Temporel** : Le site doit être opérationnel dans un délai de 6 semaines après validation du design.

## 3. Cible Utilisateur
### Qui va utiliser l'interface ?
- **Auditeurs / Fans** : Naviguer sur le site pour écouter des extraits, consulter des informations sur les albums/tracks et acheter des disques.

### Fiche Persona
1) **Fan** : Jeanne, 25 ans, passionnée de musique indépendante, suit Luther depuis ses débuts sur les réseaux sociaux.  
Objectif : Être au courant des dernières sorties, acheter les albums physiques pour sa collection.  
Comportement numérique : Navigue surtout via son smartphone, très active sur Instagram.

2) **Acheteur** : Marc, 22 ans, amateur de rap, découvre Luther grâce à une recommandation.  
Objectif : Écouter des extraits et commander un disque physique.  
Comportement numérique : Utilise principalement un ordinateur pour effectuer ses achats.

### Analyse SWOT
- **Forces** : Site officiel avec lien direct à l’artiste, expérience authentique et personnalisée.
- **Faiblesses** : Public limité aux fans ou personnes découvrant l’artiste par bouche à oreille. Dépend de Spotify.
- **Opportunités** : Augmentation de la vente en ligne de musique indépendante, possibilité d’ajouter du merchandising ou des exclusivités.
- **Menaces** : Concurrence des plateformes de streaming qui centralisent l’écoute et les achats.

## 4. Fonctionnalités

### Cahier des charges fonctionnel

- **Must have** (Essentiel) :
  - Page d’accueil mettant en avant les dernières sorties.
  - Fiches détaillées pour chaque disque (titre, date, visuel, description, liste des morceaux, extraits audio).
  - Système d’achat en ligne (ajout au panier, paiement, confirmation de commande).
  - Interface d’administration pour ajouter ou modifier les disques.
  
- **Should have** (Important) :
  - Lecteur audio pour écouter un extrait de chaque morceau.

- **Could have** (Optionnel) :
  - Intégration d’une newsletter.

- **Won’t have** (Non essentiel) :
  - Système d’abonnement payant ou contenu premium.

### User Stories

- **En tant que fan**, je veux pouvoir écouter un extrait avant d’acheter un disque pour me faire une idée.
- **En tant qu’administrateur**, je veux pouvoir ajouter un nouvel album depuis une interface simple.


## 5. Spécifications / Contraintes Techniques

### Technologies Utilisées

| Technologie      | Utilisation                  |
|------------------|------------------------------|
| React            | Frontend |
| PHP              | Backend |
| Mysql | Base de données |

### Sécurité

- Validation et sanitation des données côté serveur.
- Protection contre les injections SQL.
- Hashing des mots de passe si une authentification est utilisée.

## 6. Architecture et Arborescence

### Organisation des pages

- **Accueil** : Présentation de Luther, des albums.
- **album** : Présentation des albums et de ses tracks avec visuel, titre, date de sortie, description et posibilité d'acheter.
- **admin** : Interface d’administration pour gérer les disques/tracks (ajouter, modifier, supprimer).
- **admin/order** : Gestion des commandes (voir les commandes passées, état des commandes). Changer l'état des commandes (pending, completed, cancelled).


## 7. Charte Graphique et Identité Visuelle

- **Palette de couleurs** : Bleu et Rose
- **Icônes et illustrations** :
  - Icônes simples et élégantes (fontawesome).
  - Illustrations de Spotify.
- **Logo** :
  - Le site utilisera le logo officiel de Luther, fourni par l’artiste.
- **Ambiance générale** :
  - Mise en page aérée.
  - Éléments visuels centrés sur la musique et l’artiste.
  - Responsive design adapté aux mobiles et tablettes.

## 8. Planning, Budget et Ressources

### Roadmap et Estimation

| Phase                 | Tâches                         | Durée Estimée       |
|-----------------------|--------------------------------|---------------------|
| 1                     | Analyse des besoins et conception | 1 semaine           |
| 2                     | Réalisation des maquettes graphiques | 1 semaine        |
| 3                     | Développement frontend          | 2 semaines          |
| 4                     | Développement backend           | 2 semaines          |
| 6                     | Tests, corrections et déploiement | 1 semaine          |

### Budget estimé

- Coût de développement (heures x tarif développeur)
- Coût éventuel d’hébergement et nom de domaine

### Ressources

- Développeur web full-stack
- Graphiste (pour la création des visuels et la charte graphique)
- Luther (pour la validation des contenus et le suivi artistique)

## 9. Organisation des équipes et Rôles

| Tâche                  | Responsable (R)    | Accountable (A)     | Consulté (C)         | Informé (I)          |
|------------------------|--------------------|---------------------|----------------------|----------------------|
| Analyse des besoins     | Chef de projet     | Luther              | Développeur, Graphiste | Équipe marketing     |
| Conception graphique    | Graphiste          | Chef de projet      | Luther               | Développeur          |
| Développement frontend  | Développeur        | Chef de projet      | Graphiste             | Luther               |
| Développement backend   | Développeur        | Chef de projet      | Luther                | Équipe marketing     |
| Tests et validation     | Développeur, Testeurs | Chef de projet  | Luther                | Équipe marketing     |
| Déploiement            | Développeur        | Chef de projet      | Luther                | Équipe marketing     |
| Maintenance            | Développeur        | Chef de projet      | Luther                | Équipe marketing     |

## 10. Test / Validation / Maintenance
- Plan de maintenance et mises à jour régulières.


## 12. Légal / Contraintes Réglementaires
- Conformité RGPD.
- Conditions générales d’utilisation.

## 13. Annexes
- [Modèle logique de données](MLD.png)

**Conclusion** : Ce cahier des charges définit les bases du projet de blog technologique. Il assure une vision claire et une roadmap structurée pour le développement.