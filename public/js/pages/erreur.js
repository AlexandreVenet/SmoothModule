class Erreur extends HTMLElement
{
	constructor()
	{
		super(); // Toujours appeler le constructeur parent
						
		console.log(`[${this.constructor.name}] Instance générée`);
	}
	
	definirPage = (route) =>
	{
		// Changer le titre du document ? Alors, déclarer ceci (sinon, pas de changement)
		this.titre = 'Erreur';
		if(route)
		{
			this.titre += ' ' + route;
		}
		
		// Création de la racine du shadow DOM
		// 'open' : composant modifiable après ajout
		// 'closed' : composant non modifiable 
		const shadow = this.attachShadow({mode: 'closed'});
		
		// HTML
		
		const h1 = document.createElement('h1');
		h1.textContent = 'Erreur';
		
		const p = document.createElement('p');
		p.id = 'messageTexte';
		if(route && route !== '/erreur')
		{
			p.textContent = 'La page demandée est introuvable : ' + route;
		}
		else
		{
			p.textContent = 'Vous avez demandé la page d\'erreur. 😊';
		}
		
		const bouton = document.createElement('button');
		bouton.textContent = 'Accueil';
		bouton.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPage3(PAGES.accueil); 
		}
		
		// CSS : aucun
		
		// Ajouter les éléments au Shadow DOM
		shadow.appendChild(h1);
		shadow.appendChild(p);
		shadow.appendChild(bouton);	
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

export default Erreur;
