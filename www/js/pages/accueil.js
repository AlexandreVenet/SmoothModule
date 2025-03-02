// Web Component de la page d'accueil (considéré comme élément HTML)
// Utilisable en tant qu'objet et DOM element
class Accueil extends HTMLElement
{
	constructor()
	{
		super(); // Toujours appeler le constructeur parent
		
		// Changer le titre du document ? Alors, déclarer ceci (sinon, pas de changement)
		this.titre = 'Accueil';
		
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
		h1.textContent = 'Accueil';
		
		const bouton = document.createElement('button');
		bouton.type = 'button';
		bouton.textContent = 'Rubrique';
		bouton.classList.add('boutonRubrique');
		bouton.onclick = (e) =>
		{
			e.preventDefault();
			// console.log(e.target);
			main.chargerPage3(PAGES.rubrique);
		}
		
		const boutonSousPage = document.createElement('button');
		boutonSousPage.type = 'button';
		boutonSousPage.textContent = 'Lancer la sous-rubrique';
		// Par défaut, Web Component ne peut pas utiliser le CSS global.
		// Contournement possible avec '::part()' en CSS et cette instruction :
		boutonSousPage.part = 'youpi';
		boutonSousPage.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPage3(PAGES.sousRubrique);
		}
		
		const boutonAlerte = document.createElement('button');
		boutonAlerte.type = 'button';
		boutonAlerte.textContent = 'Lancer la page avec alerte';
		boutonAlerte.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPage3(PAGES.alerte);
		}
		
		const boutonAnalyseUrl = document.createElement('button');
		boutonAnalyseUrl.type = 'button';
		boutonAnalyseUrl.textContent = 'Analyse URL';
		boutonAnalyseUrl.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPage3(PAGES.analyseURL);
		}
		
		// Styles CSS 
		// v.1 : styles inline
		// const style = document.createElement('style');
		// style.textContent = `
		// .boutonRubrique
		// {
		// 	background-color: yellow;
		// }
		// `;
		// console.log(style.isConnected); // false
		// La CSP empêche les styles inline. 
		// v.2 : charger un fichier CSS externe
		const link = document.createElement('link');
		link.href = 'css/bouton.css';
		link.rel = 'stylesheet';
		// Même comportement que le HTML-CSS standard.
		
		// Ajouter les éléments au Shadow DOM
		// shadow.appendChild(style);
		shadow.appendChild(link);
		// console.log(style.isConnected); // true
		shadow.appendChild(h1);
		shadow.appendChild(bouton);
		shadow.appendChild(boutonSousPage);
		shadow.appendChild(boutonAlerte);
		shadow.appendChild(boutonAnalyseUrl);
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

export default Accueil;
