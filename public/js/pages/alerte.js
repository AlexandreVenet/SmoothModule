class Alerte extends HTMLElement
{
	constructor()
	{
		super(); // Toujours appeler le constructeur parent
		
		// Changer le titre du document ? Alors, déclarer ceci (sinon, pas de changement)
		this.titre = 'Alerte';
		
		// L'alerte se déclenche après un délai : logique asynchrone.
		// Si le composant est déchargé, alors le déclenchement de l'alerte peut survenir.
		// Or, je veux que l'alerte ne se déclenche que si on est encore dans cette page.
		// Pour ça, utiliser une variable interrupteur :
		this.declencher = true;
		
		this.creerElement();
				
		console.log(`[${this.constructor.name}] Instance générée`);
	}
	
	creerElement = () =>
	{
		// Création de la racine du shadow DOM
		// 'open' : composant modifiable après ajout
		// 'closed' : composant non modifiable 
		const shadow = this.attachShadow({mode: 'open'});
		// open car on va l'explorer par la suite.
		
		// HTML
		const h1 = document.createElement('h1');
		h1.textContent = 'Alerte';
		
		const p = document.createElement('p');
		p.textContent = 'Cette page charge un fichier utilitaire JS après quelques secondes.';
		
		const pInfo = document.createElement('p');
		pInfo.textContent = '......';
		pInfo.id = 'pInfo';
		
		const bouton = document.createElement('button');
		bouton.textContent = 'Revenir à l\'accueil';
		bouton.onclick = (e) =>
		{
			e.preventDefault();
			// console.log(e.target);
			main.chargerPage3(PAGES.accueil);
		}
		
		// CSS : aucun
		
		// Ajouter les éléments au Shadow DOM
		shadow.appendChild(h1);
		shadow.appendChild(p);
		shadow.appendChild(pInfo);
		shadow.appendChild(bouton);
		
		// On veut maintenant charger un fichier JS utilitaire (composant ou non).
		// Pour intervenir sur le contenu du composant (son shadowRoot), il faut attendre que le composant soit défini.
		/*customElements.whenDefined('page-alerte').then(async()=>
		{
			this.gererUtilitaire();
		});*/
		// OK mais testons avec les méthodes héritées qui pourraient être pertinentes.
	}

	connectedCallback()
	{
		console.log(`[${this.constructor.name}] Elément connecté au DOM du document.`);
		
		this.gererUtilitaire();
	}
	
	disconnectedCallback()
	{
		console.log(`[${this.constructor.name}] Elément déconnecté du DOM du document.`);
		
		this.declencher = false;
	}
	
	adoptedCallback()
	{
		console.log(`[${this.constructor.name}] Elément déplacé vers un document.`);
	}
	
	attributeChangedCallback()
	{
		console.log(`[${this.constructor.name}] Un attribut a été ajouté, supprimé ou modifié.`);
	}
	
	gererUtilitaire = async () =>
	{
		const shadowRoot = document.querySelector('page-alerte').shadowRoot; // doit être 'open'
		const pInfo = shadowRoot.querySelector('#pInfo');
		
		const module = await main.importerJS('/js/utilitaires/alerte.js');
		await main.attendreMillisecondesAsync(1000); // simuler le temps de chargement
		if(!module)
		{
			pInfo.textContent = 'Echec du chargement.';
			return;
		}
		pInfo.textContent = 'Succès du chargement.'; 
		await main.attendreMillisecondesAsync(1000); // Et si on attendait ? ^^
		// Le comportement ne doit se déclencher que si c'est autorisé
		if(this.declencher)
		{
			module.alerter('Coucou !');
		}
	}
}

export default Alerte;
