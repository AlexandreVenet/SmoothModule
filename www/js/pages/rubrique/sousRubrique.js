class SousRubrique extends HTMLElement
{
	constructor()
	{
		super(); // Toujours appeler le constructeur parent
		
		// Changer le titre du document ? Alors, déclarer ceci (sinon, pas de changement)
		this.titre = 'Sous-rubrique';
		
		this.creerElement();
				
		console.log(`[${this.constructor.name}] Instance générée`);
	}
	
	creerElement = () =>
	{
		// Création de la racine du shadow DOM
		// 'open' : composant modifiable après ajout
		// 'closed' : composant non modifiable 
		const shadow = this.attachShadow({mode: 'open'});
		// open car on va manipuler le contenu APRES son ajout au DOM
		
		// Créer le HTML en utilisant un template
		// Charger un autre fichier CSS.
		// Un tag <script> n'est PAS déclenché dans un template.
		// Sécurité : pas d'injection de données dans le innerHTML implique un usage sécurisé.
		// Sécurité : le gestionnaire onload="" inséré en attribut HTML est bloqué grâce à la CSP.
		const template = document.createElement('template');
		template.innerHTML = `
		<link rel="stylesheet" href="/css/bouton.css">
		<h1>Sous-rubrique</h1>
		<button id="boutonRetour" class="boutonRubrique" onload="alert('toto');">Revenir à l'accueil</button>
		<div>
			<h2>Image introuvable</h2>
			<img src="/img/imageXX.png" alt="Youpi !" width="320" height="240">
			<br>
			<h2>Image trouvée</h2>
			<img src="/img/image.png" alt="Image existante" width="320" height="240">
		</div>
			
		<div>
			<h2>Liens</h2>
			<p>Les liens ordinaires cassent la logique car ne sont pas contrôlés en JS. Il faut donc coder le comportement de ces liens.</p>
			<ul>
				<li><a href="fichier.xyz" id="lienFichierInexistant">fichier inexistant</a></li>
				<li><a href="/rubrique" id="lienRubrique">rubrique</a></li>
			</ul>
		</div>
		
		<div>
			<h2>Téléchargements</h2> 
			<p>Télécharger dans une nouvelle fenêtre pour afficher une erreur, ce n'est pas conseillé. Utiliser l'attribut <code>download</code> pour indiquer au navigateur qu'on souhaite télécharger et non pas consulter. Le serveur est codé de façon à forcer le téléchargement de ce qui se trouve dans le répertoire de téléchargements. L'attribut semble donc inutile... eh bien non, utile, car sans cet attribut, l'erreur de fichier introuvable s'affiche dans le navigateur (enfin, ne pas trouver le fichier devrait être une situation corrigée, n'est-ce pas...). Bon, ensuite, cet attribut ne fonctionne pas avec des ressources cross-origin, donc il est difficile de l'utiliser de façon générique... Finalement, il vaut mieux  contourner avec du JS, alors cet attribut sert simplement à cibler ces liens servant à télécharger des fichiers (on peut également cibler ces liens grâce à l'attribut pour leur appliquer un style).</p>
			<ul>
				<li><a href="/telechargement/texteXX.txt" title="Télécharger le fichier" download>TXT introuvable</a></li>
				<li><a href="/telechargement/texte.txt" title="Télécharger le fichier" download>TXT</a></li>
				<li><a href="/telechargement/exemple.pdf" title="Télécharger le fichier" download>PDF</a></li>
			</ul>
			<h2>Ressources</h2>
			<p>Ressources à lire dans le navigateur, dans un nouvel onglet</p>
			<ul>
				<li><a href="/ressources/texte.txt" target="_blank" title="Consulter le fichier">TXT</a></li>
				<li><a href="/ressources/exemple.pdf" target="_blank" title="Consulter le fichier">PDF</a></li>
			</ul>
		</div>
		<script>
			console.log('Le script dans un template ne s\'exécute pas.');
			alert('toto');
		</script>
		`;
		shadow.appendChild(template.content.cloneNode(true));
		
		// Tests : ajouter les comportements APRES avoir ajouté le composant au shadowDOM
		
		const bouton = shadow.querySelector('#boutonRetour'); // cibler shadow (et non pas document)
		bouton.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPage3(PAGES.accueil); 
		}
		
		const lienFichierInexistant = shadow.querySelector('#lienFichierInexistant');
		lienFichierInexistant.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPageDepuisRoute3(e.target.href); // utilisation du lien
		}
		
		const lienRubrique = shadow.querySelector('#lienRubrique');
		lienRubrique.onclick = (e) =>
		{
			e.preventDefault();
			main.chargerPageDepuisRoute3(e.target.href); // utilisation du lien
		}
		
		// Traiter les liens 'download'
		const liensDownload = shadow.querySelectorAll('a[download]');
		liensDownload.forEach(lien => 
		{
			lien.onclick = async (e) =>
			{
				e.preventDefault();
				const chemin = e.target.href;
				// Vérifier si le fichier existe avant téléchargement
				try {
					const reponse = await fetch(chemin, { method: 'HEAD' }); 
					if(!reponse.ok)
					{
						alert(reponse.status + ' ' + reponse.statusText);
					}
					else
					{
						// Pour effectuer un téléchargement, il faut recréer un lien et effectuer programmatiquement un clic dessus.
						const lienTemp = document.createElement('a');
						lienTemp.href = chemin;
						lienTemp.download = '';
						shadow.appendChild(lienTemp);
						lienTemp.click();
						shadow.removeChild(lienTemp);						
					}
				} catch (erreur) {
					console.log('Erreur : ', erreur);
				}
				
			}
		});
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

export default SousRubrique;

