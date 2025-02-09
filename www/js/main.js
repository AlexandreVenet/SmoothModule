class Main
{
	constructor()
	{
		this.conteneur =  document.querySelector('#conteneur');
		
		this.transitionDurationPrevueAjoutee = false;
		this.dureeTransition = 0; // En ms. Ici, valeur par défaut en attente de celle utilisée
		
		this.premierLancement = true;
		
		this.titrePageParDefaut = '[Pas de titre]';
			
		this.cheminFichiersPages = '/js/pages';
		this.cheminConstantes = '/js/constantes.js';
		
		this.cheminFichiersUtilitaires = '/js/utilitaires';
		
		this.tracer('Instance générée');
	}
	
	attendreMillisecondesAsync = async (temps) => 
	{
		return await new Promise(resolve => setTimeout(resolve, temps));	
	}
	
	chargerPageDepuisRoute3 = (route) =>
	{
		this.tracer('%cchargerPageDepuisRoute3() : route à analyser : ', 'color:Chocolate', route);
	
		// Ex de route (ou 'pathname') : /toto/transition, /toto/, /toto.xyz
		// Or, la chaîne d'entrée peut être une URL complète.
		// Ex d'URL : http://localhost:3000/rubrique?toto=youpi
		// Donc, il faut analyser la route pour n'en obtenir que le pathname.
		
		let routeAnalysee = route;
		
		const pattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
		if(pattern.test(routeAnalysee))
		{
			const url = new URL(routeAnalysee);
			routeAnalysee = url.pathname;
		}
		
		// Supprimer le slash de fin si existant et si la chaîne n'est pas qu'un slash
		routeAnalysee = routeAnalysee.endsWith('/') && routeAnalysee !== PAGES.accueil.route ? routeAnalysee.slice(0, -1) : routeAnalysee;
		this.tracer('%cchargerPageDepuisRoute3() : route analysée : ', 'color:Chocolate', routeAnalysee);
		
		// Déterminer la page correspondant à cette route
		let page;
		for (const prop in PAGES) 
		{
			if(PAGES[prop].route.toLocaleLowerCase() === routeAnalysee.toLocaleLowerCase())
			{
				page = PAGES[prop];
				break;
			}
		}
		
		if(!page)
		{
			page = PAGES.erreur;
		}
		
		this.tracer('%cchargerPageDepuisRoute3() : page et route analysée : ', 'color:Chocolate', page, routeAnalysee);
		
		this.chargerPage3(page, route);
	}
		
	importerJS = async (chemin) =>
	{
		try {
			// Créer une promesse qui sera rejetée après le délai spécifié
			const timeout = new Promise((_, reject) => 
			{
				setTimeout(() => reject(new Error("Timeout dépassé")), 30000);
			});
			// Lancer en parallèles l'importation du module et le timeout 
			const module = await Promise.race([
				import(chemin), 
				timeout
			]);
			this.tracer(`%cimporterJS() : module : `, 'color:CadetBlue', module);
			return module;
		} catch (erreur) {
			this.tracer(`%cimporterJS() : module : `, 'color:CadetBlue', erreur);
			return null;
		}
	}
	
	importerConstantesJS = async () =>
	{
		const module = await this.importerJS(this.cheminConstantes);
		return module;
	}
	
	chargerUtilitaire = async (reference) =>
	{
		const module = await main.importerJS(main.cheminFichiersUtilitaires + reference.chemin);
		
		if(!module) 
		{
			this.tracer(`%cchargerUtilitaire() : Echec du chargement d'utilitaire : `, 'color:DarkGreen', reference.chemin);
			return;
		}
		
		const moduleExistant = customElements.get(reference.nom);
		if(!moduleExistant)
		{
			customElements.define(reference.nom, module.default);
		}
	}
	
	chargerPage3 = async (page, routeDemandee) =>
	{				
		// Un *state* d'historique peut contenir quelques données.
		// Conservons-y la clé pour pouvoir réinstancier la page lorsqu'on navigue dans l'historique.
		let stateData = {cle:page.nom};
		
		// Jouer la transition vers une autre page
		this.transitionPageMasquer();
		// Si on est au premier lancement, rien ne se fait car la dureeTransition est à 0 et la classe CSS est déjà appliquée au body.
		// Si maintenant on navigue dans le site, alors on dispose de dureeTransition. Donc, il faut attendre ce temps avant de charger.
		if(this.transitionDurationPrevueAjoutee)
		{
			await this.attendreMillisecondesAsync(this.dureeTransition);
		}
		
		this.viderConteneur();
		
		let module = await this.importerJS(this.cheminFichiersPages + page.chemin);
		
		if(!module) 
		{
			this.tracer(`%cChargerPage3() : Echec du chargement de page : `, 'color:CadetBlue', page.chemin);
			this.afficherErreur();
		}
		else
		{
			// L'URL à conserver dans ce state d'historique et qui sera affichée en barre d'adresse
			// Elle peut être :
			// 	- celle demandée si fournie,
			//  - ou bien celle qui a été définie comme route pour tel composant de page.
			let urlBarreDAdresse;
			if(routeDemandee)
			{
				urlBarreDAdresse = routeDemandee; 
			}
			else
			{
				urlBarreDAdresse = page.route;
			}
			
			// Si on est en page d'erreur, ajouter des informations spécifiques aux données du state
			if (page.nom === PAGES.erreur.nom)
			{
				stateData.route = routeDemandee;
			}
			// Maintenant, ajouter ou remplacer une entrée dans l'historique.
			if(this.premierLancement)
			{
				window.history.replaceState(stateData, '', urlBarreDAdresse);
				this.premierLancement = false;
			}
			else
			{	
				window.history.pushState(stateData, '', urlBarreDAdresse);
			}
			
			// Gérer le contenu et le titre du document APRES la gestion de l'historique (sinon, confusion du titre et de l'entrée)
		
			const typeModule = module.default; // module.default contient la classe exportée
			this.tracer(`%cChargerPage3() : Type du module : `, 'color:CadetBlue', typeModule);
			// On définit ici le Web Component dans customElementsRegistry (et non pas dans les modules ; factorisation).
			// Pour ce faire, il faut d'abord tester si ce composant n'a pas déjà été défini (sinon, erreur car customElementRegistery refuse les doublons).
			const elementExistant = customElements.get(page.nom);
			if(!elementExistant)
			{
				customElements.define(page.nom, typeModule);
			}
			const instance = new typeModule(); 
			
			if(page.nom === PAGES.erreur.nom)
			{
				instance.definirPage(stateData.route);
			}
			
			this.changerDocumentTitre(instance.titre);
			
			this.ajouterElementAuConteneur(instance);
		}
		
		// Si la transition-duration prévue n'a pas encore été ajoutée, alors l'ajouter.
		// Du même coup, en récupérer la valeur qui nous est utile pour gérer des temps d'attente.
		if(!this.transitionDurationPrevueAjoutee)
		{
			document.body.classList.add('bodyTransitionDurationOK');
			this.dureeTransition = parseFloat(window.getComputedStyle(document.body).transitionDuration) * 1000;			
			this.transitionDurationPrevueAjoutee = true;
		}
		
		this.transitionPageAfficher();		
	}
	
	viderConteneur = () =>
	{
		while(this.conteneur.firstChild)
		{
			this.conteneur.removeChild(this.conteneur.firstChild);
		}
	}
	
	afficherErreur = () =>
	{
		const p = document.createElement('p');
		p.textContent = 'Oups, erreur de chargement ! 😊';
		
		const btn = document.createElement('button');
		// v.1
		btn.textContent = 'Accueil';
		btn.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPage3(PAGES.accueil);
		}
		// v.2
		/*btn.textContent = 'Page précédente';
		btn.onclick = (e) =>
		{
			e.preventDefault();
			window.history.back();
		}*/
		this.conteneur.appendChild(p);
		this.conteneur.appendChild(btn);
		
		// Ne pas changer le titre de la page car cela apparaît dans l'historique du navigateur et crée de la confusion.
	}
	
	afficherErreurConstantes = () =>
	{
		this.tracer('❌ Constantes non chargées.');
		
		this.viderConteneur();
		
		const p = document.createElement('p');
		p.textContent = '🤯 Constantes non chargées, programme ruiné.';
		
		this.ajouterElementAuConteneur(p);
		
		this.transitionPageAfficher();
	}
		
	ajouterElementAuConteneur = (element) =>
	{
		this.conteneur.appendChild(element);
	}
	
	transitionPageMasquer = () =>
	{
		document.body.classList.add('bodyInvisible');
	}
		
	transitionPageAfficher = () =>
	{
		document.body.classList.remove('bodyInvisible');
	}
		
	ecouterHistorique = () =>	
	{
		// Lorsque les boutons précédent et suivant du navigateur sont utilisés
		window.onpopstate = async (e) =>
		{
			if(e.state)
			{
				this.tracer(`%cwindow.onpopstate\nstate : ${JSON.stringify(e.state)}\nlocation : ${document.location}\n`, 'color:DarkSeaGreen');
								
				const typeInstance = customElements.get(e.state.cle);
				const instance = new typeInstance();

				if(e.state.cle === PAGES.erreur.nom)
				{
					instance.definirPage(e.state.route);
				}
				
				this.transitionPageMasquer();
				await this.attendreMillisecondesAsync(this.dureeTransition);
				this.viderConteneur();
				this.changerDocumentTitre(instance.titre);
				this.ajouterElementAuConteneur(instance);
				this.transitionPageAfficher();
			}
		};
	}
		
	changerDocumentTitre = (titre) =>
	{
		if(titre)
		{
			document.title = titre;
		}
		else
		{
			document.title = this.titrePageParDefaut;
		}
	}

	tracer = (message, ...donnees) =>
	{
		console.log(`%c[${this.constructor.name}] ${message}`, 'color:Orange', ...donnees);
	}
}

let procedure = async () =>
{
	const infos = {};
	infos.href = window.location.href; // URL complète
	infos.host = window.location.host; // Nom de l'hôte et port
	infos.hostname = window.location.hostname; // idem
	infos.port = window.location.port; // port
	infos.protocol = window.location.protocol;  // protocole HTTP (sans SSL) ou HTTPS (avec SSL)
	infos.pathname = window.location.pathname; // le chemin (après le nom de domaine)
	infos.hash = window.location.hash; // la partie concernant l'ancre ('#')
	infos.search = window.location.search; // la chaîne de requête ('?')
	infos.racineDuSite = window.location.protocol + '//' + window.location.host + '/'; 	
	console.table(infos);
	/*
		Exemple : http://localhost:3000/toto?a=1
		
		href           http://localhost:3000/toto?a=1
		host           localhost:3000 
		hostname       localhost 
		port           3000 
		protocol       http: 
		pathname       /toto 
		hashpathname   <empty string>
		search         ?a=1
		racineDuSite   http://localhost:3000/
	*/	
	console.log('%cdocument.location', 'color:Violet', document.location);
	console.log('%cdocument', 'color:Violet', document);
	console.log('-'.repeat(25));
	
	const main = new Main();
	window.main = main; // Rendre cet objet global (même si chargé comme un module)
	
	const constantes = await main.importerConstantesJS();
	// Si les constantes ne sont pas chargées, c'est tout le programme qui est ruiné !
	if(!constantes)
	{
		main.afficherErreurConstantes();		
		return;
	}
	window.PAGES = constantes.PAGES; // objet global aussi
	window.MODS = constantes.MODS; // idem
	
	// Chargeons ce module utilitaire très important.
	await main.chargerUtilitaire(MODS.truc);
	// Il n'est pas utilisé tout de suite... Suspense !
	
	main.ecouterHistorique();
	
	await main.chargerPageDepuisRoute3(window.location.href.toLocaleLowerCase());
}
	
procedure();
