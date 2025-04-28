class Rubrique extends HTMLElement
{
	constructor()
	{
		super(); // Toujours appeler le constructeur parent
		
		// Changer le titre du document ? Alors, déclarer ceci (sinon, valeur par défaut)
		// this.titre = 'Rubrique'; // en commentaire pour voir le fonctionnement ^^
		
		this.creerElement();
				
		console.log(`[${this.constructor.name}] Instance générée`);
	}
	
	creerElement = () =>
	{
		// Création de la racine du shadow DOM
		// 'open' : composant modifiable après ajout
		// 'closed' : composant non modifiable 
		const shadow = this.attachShadow({mode: 'closed'});
		
		const h1 = document.createElement('h1');
		h1.textContent = 'Rubrique';
		
		const bouton = document.createElement('button');
		bouton.type = 'button';
		bouton.textContent = 'Revenir à l\'accueil';
		// Par défaut, Web Component ne peut pas utiliser le CSS global.
		// On peut utiliser ::part() (voir accueil.js).
		// On peut aussi analyser les styles chargés dans le document. Ici, simplement ajouter le style ; puis voir plus bas.
		bouton.classList.add('boutonPourri'); // Utiliser simplement une règle 
		bouton.onclick = (e) =>
		{
			e.preventDefault();
			// console.log(e.target);
			main.chargerPage3(PAGES.accueil);
		}
		
		// Utiliser les CSS globaux
		
		// v.1 : prendre tout le CSS
		/*const adoptedStyles = [];
		for (let sheet of document.styleSheets) 
		{
			// console.log(sheet);
			const newSheet = new CSSStyleSheet();
			// const css = Array.from(sheet.cssRules).map(rule => rule.cssText).join(' '); // illisible !
			const cssRules = Array.from(sheet.cssRules); // Convertir les règles CSS en tableau
			const cssTexts = cssRules.map(rule => rule.cssText); // Extraire le texte CSS de chaque règle
			const css = cssTexts.join(' '); // Joindre les textes CSS avec un espace
			newSheet.replaceSync(css);
			adoptedStyles.push(newSheet);
		}
		shadow.adoptedStyleSheets = adoptedStyles;*/
		// Problème, on prend TOUTES LES FEUILLES CSS qui ont été chargée (dont CDN éventuels)
		
		// v.2 : ne prendre que les règles utiles dans toutes les feuilles trouvées
		/*const adoptedStyles = [];
		for (let sheet of document.styleSheets) 
		{
			console.log(sheet);
			const regleBoutonPourri = Array.from(sheet.cssRules).filter(regle => regle.cssText.includes('.boutonPourri'));
			// On peut modifier la règle globale
			for (const regle of regleBoutonPourri) 
			{
				// console.log(regle.selectorText);
				if(regle.selectorText === '.boutonPourri') // Seulement cette règle et pas la :hover
				{
					regle.style.borderRadius = '0.5rem';
					regle.style.padding = '0.5rem';
					break;
				}
			}
			// Extraire le texte CSS de chaque règle
			const cssTexts = regleBoutonPourri.map(rule => rule.cssText); 
			// Joindre les textes CSS avec un espace
			const css = cssTexts.join(' '); 
			// Créer la nouvelle feuille de style et y incorporer le CSS précédent
			const newSheet = new CSSStyleSheet();
			newSheet.replaceSync(css);
			// Ajouter cette feuille à adoptedStyles
			adoptedStyles.push(newSheet);
		}
		shadow.adoptedStyleSheets = adoptedStyles;*/
		// Problème : on itère sur TOUTES les feuilles de styles alors qu'on ne veut explorer qu'une seule
		
		// V.3a : cibler une feuille de style par un dataset 'id'
		// D'abord, en HTML ajouter un attribut aux tags <link> pour pouvoir les cibler individuellement.
		// Puis, ce qui suit.
		/*const mesStyles = Array.from(document.styleSheets).find(sheet => sheet.ownerNode.getAttribute('data-id') === 'MesStyles');
		// Ok, ça, ça doit être conservé qqe part dans Main pour que chaque composant puisse y chercher ce qui lui est nécessaire.
		// Maintenant, récupérons TOUTES les règles CSS nommées '.boutonPourri'
		// const reglesBoutonPourri = Array.from(mesStyles.cssRules).filter(regle => regle.cssText.includes('.boutonPourri'));
		// console.log(reglesBoutonPourri);
		// Je ne veux utiliser qu'une seule règle nommée '.boutonPourri'. Alors :
		const reglePrincipaleBoutonPourri = Array.from(mesStyles.cssRules).find(regle => regle.selectorText === '.boutonPourri');
		// Extraire le texte CSS 
		const cssTexts = reglePrincipaleBoutonPourri.cssText; 
		// Créer la nouvelle feuille de style et y incorporer le CSS précédent
		const newSheet = new CSSStyleSheet();
		newSheet.replaceSync(cssTexts);
		// On peut modifier les règles CSS de cette nouvelle feuille de ce composant
		const regleBoutonPourriModifie = Array.from(newSheet.cssRules).find(regle => regle.selectorText === '.boutonPourri');
		regleBoutonPourriModifie.style.borderRadius = '0.5rem';
		regleBoutonPourriModifie.style.padding = '0.5rem';
		// Ajouter au shadowDOM. La propriété attend un tableau de CSSStyleSheet.
		// shadow.adoptedStyleSheets = [newSheet];*/
		// Ok mais là on n'a pris qu'une seule règle. Le :hover de .boutonPourri est exclu. Or, on veut aussi cet :hover.
		
		// V.3b : cibler une feuille de style par dataset 'id', en récupérer les règles concernant un sélecteur (.boutonPourri), en modifier une seule (pas le :hover) pour ce composant seulement
		// D'abord, en HTML ajouter un attribut aux tags <link> pour pouvoir les cibler individuellement.
		/*const mesStyles = Array.from(document.styleSheets).find(sheet => sheet.ownerNode.getAttribute('data-id') === 'MesStyles');
		// Ok, ça, ça doit être conservé qqe part dans Main pour que chaque composant puisse y chercher ce qui lui est nécessaire.
		// Maintenant, récupérons TOUTES les règles CSS nommées '.boutonPourri'
		const reglesBoutonPourri = Array.from(mesStyles.cssRules).filter(regle => regle.cssText.includes('.boutonPourri'));
		// Extraire le texte CSS de chaque règle
		const cssTexts = reglesBoutonPourri.map(rule => rule.cssText); 
		// Joindre tous ces textes CSS (séparateur : l'espace)
		const css = cssTexts.join(' '); 
		// Avec cela, créer la nouvelle feuille de style
		const newSheet = new CSSStyleSheet();
		newSheet.replaceSync(css);	
		// On peut modifier les règles CSS de cette nouvelle feuille de ce composant.
		// Ici, je ne veux modifier que .boutonPourri (et pas le :hover)
		const regleBoutonPourriModifie = Array.from(newSheet.cssRules).find(regle => regle.selectorText === '.boutonPourri');		
		regleBoutonPourriModifie.style.borderRadius = '0.5rem';
		regleBoutonPourriModifie.style.padding = '0.5rem';
		// Ajouter au shadowDOM. La propriété attend un tableau de CSSStyleSheet.
		shadow.adoptedStyleSheets = [newSheet];*/
				
		// V.3c (factorisation) 
		// Cibler une feuille de style par dataset 'id', en récupérer UNE ou PLUSIEURS règles concernant un sélecteur (.boutonPourri), éventuellement en modifier une seule (pas le :hover), et tout cela pour ce composant seulement
		// const newSheet = main.obtenirRegleCSS('.boutonPourri');	// UNE seule règle
		// const newSheet = main.obtenirToutesReglesCSS('.boutonPourri'); // PLUSIEURS règles, version avec string 
		const newSheet = main.obtenirToutesReglesCSSDeListe(['.boutonPourri', '.yerk']); // PLUSIEURS règles, version avec array
		// On peut modifier les règles CSS de cette nouvelle feuille de ce composant.
		// Ici, je ne veux modifier que .boutonPourri (et pas le :hover)
		const regleBoutonPourriModifie = Array.from(newSheet.cssRules).find(regle => regle.selectorText === '.boutonPourri');
		regleBoutonPourriModifie.style.borderRadius = '0.5rem';
		regleBoutonPourriModifie.style.padding = '0.5rem';
		// Ajouter au shadowDOM. La propriété attend un tableau de CSSStyleSheet.
		shadow.adoptedStyleSheets = [newSheet];
		// Ou bien :
		// const adoptedStyles = [];
		// adoptedStyles.push(newSheet);
		// shadow.adoptedStyleSheets = adoptedStyles;
		// Ou bien encore, si le shadowDOM utilise déjà d'autres styles  :
		// shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, newSheet];
		// Noter qu'on peut faire la même chose avec le document HTML lui-même, en particulier si on n'utilise pas de shadowDOM :
		// document.adoptedStyleSheets = [...document.adoptedStyleSheets, newSheet];
		// On a récupéré .yerk ? Voir ça 
		const regleYerk = Array.from(newSheet.cssRules).find(regle => regle.selectorText === '.yerk');
		console.log(regleYerk);
		
		
		// Et on veut un truc !
		const truc = document.createElement(MODS.truc.nom);
		
		// Ajouter les éléments au Shadow DOM
		shadow.appendChild(h1);
		shadow.appendChild(bouton);
		shadow.appendChild(truc);
	}
	
	connectedCallback()
	{
		console.log(`[${this.constructor.name}] Elément connecté au DOM du document.`);
	}
	
	disconnectedCallback()
	{
		console.log(`[${this.constructor.name}] Elément déconnecté du DOM du document.`);
	}
	
	adoptedCallback()
	{
		console.log(`[${this.constructor.name}] Elément déplacé vers un document.`);
	}
	
	attributeChangedCallback()
	{
		console.log(`[${this.constructor.name}] Un attribut a été ajouté, supprimé ou modifié.`);
	}
}

export default Rubrique;
