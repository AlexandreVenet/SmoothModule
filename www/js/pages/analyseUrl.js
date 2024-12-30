class AnalyseURL extends HTMLElement
{
	constructor()
	{
		super(); // Toujours appeler le constructeur parent
		
		// Changer le titre du document ? Alors, déclarer ceci (sinon, pas de changement)
		this.titre = 'Analyse URL';
		
		this.creerElement();
				
		console.log(`[${this.constructor.name}] Instance générée`);
	}
	
	creerElement = () =>
	{
		// Analysons l'URL de cette page pour en tirer quelque-chose.
		const url = new URL(window.location.href);
		
		console.log(`[${this.constructor.name}] Analyse de l'URL actuelle :`);
		console.log(url);
		
		console.log(`[${this.constructor.name}] Analyse de la chaîne de requête :`);
		const searchParamsEntries = Array.from(url.searchParams.entries());
		console.table(searchParamsEntries);
		
		// De l'URL, récupérons deux paramètres attendus
		const params = url.searchParams;
		const toto = params.get('toto');
		const zut = params.get('zut');
		
		// Création de la racine du shadow DOM
		// 'open' : composant modifiable après ajout
		// 'closed' : composant non modifiable 
		const shadow = this.attachShadow({mode: 'closed'});
		
		const h1 = document.createElement('h1');
		h1.textContent = this.titre;
		
		// Créons des éléments en fonction de l'existence des paramètres reçus
		const infoToto = document.createElement('p');
		if(toto)
		{
			infoToto.textContent = `Le paramètre "toto" a été passé avec la valeur ${parseInt(toto)}.`;
		}
		
		const infoZut = document.createElement('p');
		if(zut)
		{
			infoZut.textContent = `Le paramètre "zut" a été passé avec la valeur ${zut}.`;
		}
						
		const lienQueryString = document.createElement('a');
		lienQueryString.href="/analyse-url?test=gné&toto=0";
		lienQueryString.textContent = "Relancer : /analyse-url?test=gné&toto=0";
		lienQueryString.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPageDepuisRoute3(e.target.href); 
		}
		
		const lienQueryString2 = document.createElement('a');
		lienQueryString2.href="/analyse-url?zut=blablabla&toto=0";
		lienQueryString2.textContent = "Relancer : /analyse-url?zut=blablabla&toto=0";
		lienQueryString2.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPageDepuisRoute3(e.target.href); 
		}
		
		const lienRetour = document.createElement('a');
		lienRetour.href="/";
		lienRetour.textContent = "Retour accueil";
		lienRetour.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPageDepuisRoute3(e.target.href); 
		}
		
		// Ajouts aux shadow DOM
		shadow.appendChild(h1);
		if(toto)
		{
			shadow.appendChild(infoToto);
		}
		if(zut)
		{
			shadow.appendChild(infoZut);
		}
		shadow.appendChild(lienQueryString);
		shadow.appendChild(document.createElement('br'));
		shadow.appendChild(lienQueryString2);
		shadow.appendChild(document.createElement('br'));
		shadow.appendChild(document.createElement('br'));
		shadow.appendChild(lienRetour);
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

export default AnalyseURL;
